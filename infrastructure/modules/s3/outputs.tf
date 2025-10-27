output "bucket_names" {
  description = "Map of logical names to actual S3 bucket names"
  value       = { for k, v in aws_s3_bucket.buckets : k => v.bucket }
}

output "bucket_arns" {
  description = "Map of logical names to S3 bucket ARNs"
  value       = { for k, v in aws_s3_bucket.buckets : k => v.arn }
}

output "bucket_domains" {
  description = "Map of logical names to S3 bucket domain names"
  value       = { for k, v in aws_s3_bucket.buckets : k => v.bucket_domain_name }
}

output "bucket_regional_domains" {
  description = "Map of logical names to S3 bucket regional domain names"
  value       = { for k, v in aws_s3_bucket.buckets : k => v.bucket_regional_domain_name }
}

output "bucket_hosted_zone_ids" {
  description = "Map of logical names to S3 bucket hosted zone IDs"
  value       = { for k, v in aws_s3_bucket.buckets : k => v.hosted_zone_id }
}

# Environment variables for applications
output "env_vars" {
  description = "Environment variables for application configuration"
  value = {
    for env in var.environments : "S3_BUCKET_${upper(env)}" => aws_s3_bucket.buckets["${var.project_name}-${env}"].bucket
  }
}

# Complete bucket information for reference
output "buckets_info" {
  description = "Complete information about all created buckets"
  value = {
    for k, v in aws_s3_bucket.buckets : k => {
      name                  = v.bucket
      arn                   = v.arn
      domain_name          = v.bucket_domain_name
      regional_domain_name = v.bucket_regional_domain_name
      hosted_zone_id       = v.hosted_zone_id
      region               = v.region
    }
  }
}