variable "project_name" {
  description = "Name of the project for tagging and naming resources"
  type        = string
}

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Domain name for the project"
  type        = string
}

variable "environments" {
  description = "List of environments for S3 buckets and DNS subdomains"
  type        = list(string)
  default     = ["staging", "production"]
}


# Route53 Configuration
variable "create_hosted_zone" {
  description = "Whether to create a new hosted zone"
  type        = bool
  default     = true
}

variable "existing_zone_id" {
  description = "Existing Route53 zone ID (if not creating new)"
  type        = string
  default     = ""
}


# EC2 Configuration
variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "volume_size" {
  description = "Root volume size in GB"
  type        = number
  default     = 30
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file"
  type        = string
  default     = "./keys/id_ed25519.pub"
}

# Deployment Configuration
variable "create_deployment_user" {
  description = "Whether to create an IAM user for CI/CD deployments"
  type        = bool
  default     = false
}


# SES Configuration
variable "ses_domain" {
  description = "Domain for SES (uses domain_name if not specified)"
  type        = string
  default     = ""
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
