# Generate random suffix for bucket names to ensure uniqueness
resource "random_string" "bucket_suffix" {
  length  = 8
  special = false
  upper   = false
}

locals {
  # Combine environment-based buckets and additional buckets
  all_bucket_names = concat(
    [for env in var.environments : "${var.project_name}-${env}"],
    [for name in var.additional_bucket_names : "${var.project_name}-${name}"]
  )
  
  # Create bucket names with random suffix
  buckets = {
    for name in local.all_bucket_names : name => "${name}-${random_string.bucket_suffix.result}"
  }
}

# S3 Buckets
resource "aws_s3_bucket" "buckets" {
  for_each = local.buckets
  
  bucket = each.value

  tags = {
    Name        = each.key
    Project     = var.project_name
    Environment = split("-", each.key)[length(split("-", each.key)) - 1]
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "buckets" {
  for_each = var.enable_versioning ? aws_s3_bucket.buckets : {}
  
  bucket = each.value.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Server Side Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "buckets" {
  for_each = var.enable_encryption ? aws_s3_bucket.buckets : {}
  
  bucket = each.value.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
    bucket_key_enabled = true
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "buckets" {
  for_each = var.block_public_access ? aws_s3_bucket.buckets : {}
  
  bucket = each.value.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket Lifecycle Configuration
resource "aws_s3_bucket_lifecycle_configuration" "buckets" {
  for_each = aws_s3_bucket.buckets
  
  bucket = each.value.id
  
  dynamic "rule" {
    for_each = var.lifecycle_rules
    content {
      id     = rule.value.id
      status = rule.value.enabled ? "Enabled" : "Disabled"

      filter {
        prefix = rule.value.prefix != "" ? rule.value.prefix : ""
      }
      
      dynamic "abort_incomplete_multipart_upload" {
        for_each = rule.value.abort_incomplete_multipart_upload_days != null ? [1] : []
        content {
          days_after_initiation = rule.value.abort_incomplete_multipart_upload_days
        }
      }
      
      dynamic "expiration" {
        for_each = rule.value.expiration_days != null ? [1] : []
        content {
          days = rule.value.expiration_days
        }
      }
      
      dynamic "noncurrent_version_expiration" {
        for_each = rule.value.noncurrent_version_expiration_days != null ? [1] : []
        content {
          noncurrent_days = rule.value.noncurrent_version_expiration_days
        }
      }
      
      dynamic "transition" {
        for_each = rule.value.transition_to_ia_days != null ? [1] : []
        content {
          days          = rule.value.transition_to_ia_days
          storage_class = "STANDARD_IA"
        }
      }
      
      dynamic "transition" {
        for_each = rule.value.transition_to_glacier_days != null ? [1] : []
        content {
          days          = rule.value.transition_to_glacier_days
          storage_class = "GLACIER"
        }
      }
    }
  }
  
  depends_on = [aws_s3_bucket_versioning.buckets]
}

# S3 Bucket CORS Configuration
resource "aws_s3_bucket_cors_configuration" "buckets" {
  for_each = length(var.cors_rules) > 0 ? aws_s3_bucket.buckets : {}
  
  bucket = each.value.id

  dynamic "cors_rule" {
    for_each = var.cors_rules
    content {
      allowed_headers = cors_rule.value.allowed_headers
      allowed_methods = cors_rule.value.allowed_methods
      allowed_origins = cors_rule.value.allowed_origins
      expose_headers  = cors_rule.value.expose_headers
      max_age_seconds = cors_rule.value.max_age_seconds
    }
  }
}