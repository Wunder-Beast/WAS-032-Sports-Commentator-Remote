variable "project_name" {
  description = "Name of the project for naming buckets"
  type        = string
}

variable "environments" {
  description = "List of environments to create buckets for"
  type        = list(string)
  default     = ["staging", "production"]
}

variable "enable_versioning" {
  description = "Enable versioning on S3 buckets"
  type        = bool
  default     = true
}

variable "enable_encryption" {
  description = "Enable server-side encryption on S3 buckets"
  type        = bool
  default     = true
}

variable "block_public_access" {
  description = "Block all public access to S3 buckets"
  type        = bool
  default     = true
}

variable "lifecycle_rules" {
  description = "Lifecycle rules for S3 buckets"
  type = list(object({
    id                          = string
    enabled                     = bool
    prefix                      = optional(string, "")
    abort_incomplete_multipart_upload_days = optional(number, 7)
    expiration_days            = optional(number, null)
    noncurrent_version_expiration_days = optional(number, 30)
    transition_to_ia_days      = optional(number, 30)
    transition_to_glacier_days = optional(number, 90)
  }))
  default = [
    {
      id      = "default"
      enabled = true
      prefix  = ""
      abort_incomplete_multipart_upload_days = 7
      noncurrent_version_expiration_days = 30
      transition_to_ia_days = 30
      transition_to_glacier_days = 90
    }
  ]
}

variable "cors_rules" {
  description = "CORS rules for S3 buckets"
  type = list(object({
    allowed_headers = list(string)
    allowed_methods = list(string)
    allowed_origins = list(string)
    expose_headers  = optional(list(string), [])
    max_age_seconds = optional(number, 3000)
  }))
  default = [
    {
      allowed_headers = ["*"]
      allowed_methods = ["GET", "POST", "PUT", "DELETE", "HEAD"]
      allowed_origins = ["*"]
      expose_headers  = ["ETag"]
      max_age_seconds = 3000
    }
  ]
}

variable "additional_bucket_names" {
  description = "Additional bucket names to create (without project prefix)"
  type        = list(string)
  default     = []
}