variable "project_name" {
  description = "Name of the project for naming resources"
  type        = string
}


variable "s3_bucket_arns" {
  description = "List of S3 bucket ARNs to grant access to"
  type        = list(string)
  default     = []
}

variable "ses_domain_arns" {
  description = "List of SES domain ARNs to grant access to"
  type        = list(string)
  default     = []
}

variable "additional_policies" {
  description = "Additional IAM policy documents to attach"
  type        = list(string)
  default     = []
}

variable "create_deployment_user" {
  description = "Whether to create an IAM user for deployments"
  type        = bool
  default     = false
}

variable "deployment_user_name" {
  description = "Name for the deployment user"
  type        = string
  default     = ""
}

variable "enable_cloudwatch_logs" {
  description = "Whether to enable CloudWatch Logs permissions"
  type        = bool
  default     = true
}

variable "enable_systems_manager" {
  description = "Whether to enable Systems Manager permissions"
  type        = bool
  default     = true
}

variable "custom_policy_statements" {
  description = "Additional IAM policy statements"
  type = list(object({
    effect    = string
    actions   = list(string)
    resources = list(string)
    condition = optional(map(map(string)), {})
  }))
  default = []
}