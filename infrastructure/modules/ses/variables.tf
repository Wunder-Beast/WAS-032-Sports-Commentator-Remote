variable "domain_name" {
  description = "Domain name to configure for SES"
  type        = string
}

variable "project_name" {
  description = "Name of the project for tagging"
  type        = string
}


variable "route53_zone_id" {
  description = "Route53 zone ID for domain verification"
  type        = string
  default     = ""
}

variable "create_dkim_records" {
  description = "Whether to create DKIM records in Route53"
  type        = bool
  default     = true
}

variable "create_verification_records" {
  description = "Whether to create domain verification records in Route53"
  type        = bool
  default     = true
}

variable "mail_from_subdomain" {
  description = "Subdomain to use for MAIL FROM (e.g., 'mail' for mail.example.com)"
  type        = string
  default     = "mail"
}

variable "bounce_topic_name" {
  description = "Name for the SNS topic for bounce notifications"
  type        = string
  default     = ""
}

variable "complaint_topic_name" {
  description = "Name for the SNS topic for complaint notifications"
  type        = string
  default     = ""
}

variable "notification_email" {
  description = "Email address to receive bounce and complaint notifications"
  type        = string
  default     = ""
}

variable "enable_configuration_set" {
  description = "Whether to create a configuration set for tracking"
  type        = bool
  default     = true
}

variable "reputation_tracking_enabled" {
  description = "Whether to enable reputation tracking"
  type        = bool
  default     = true
}

variable "delivery_options" {
  description = "Delivery options for the configuration set"
  type = object({
    tls_policy = optional(string, "Require")
  })
  default = {
    tls_policy = "Require"
  }
}

variable "wait_for_verification" {
  description = "Whether to wait for domain verification (can take up to 72 hours)"
  type        = bool
  default     = false
}

variable "create_smtp_user" {
  description = "Whether to create an IAM user for SMTP credentials"
  type        = bool
  default     = true
}

variable "smtp_user_name" {
  description = "Name for the SMTP IAM user (defaults to project-name-smtp)"
  type        = string
  default     = ""
}