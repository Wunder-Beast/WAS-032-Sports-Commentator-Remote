# Project information
output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "domain_name" {
  description = "Domain name"
  value       = var.domain_name
}

output "aws_region" {
  description = "AWS region"
  value       = var.aws_region
}


# Route53 Outputs
output "zone_id" {
  description = "Route53 zone ID"
  value       = module.route53.zone_id
}

output "name_servers" {
  description = "Name servers for the domain"
  value       = module.route53.name_servers
}


# EC2 Outputs
output "ec2_instance_id" {
  description = "ID of the EC2 instance"
  value       = module.ec2.instance_id
}

output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = module.ec2.instance_public_ip
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = module.ec2.ssh_command
}

# IAM Outputs
output "iam_env_vars" {
  description = "IAM environment variables"
  value       = module.iam.env_vars
  sensitive   = true
}

output "deployment_access_key_id" {
  description = "Deployment user access key ID"
  value       = module.iam.deployment_access_key_id
  sensitive   = true
}

output "deployment_secret_access_key" {
  description = "Deployment user secret access key"
  value       = module.iam.deployment_secret_access_key
  sensitive   = true
}


# S3 Outputs
output "s3_buckets" {
  description = "S3 bucket names"
  value       = module.s3.bucket_names
}


# SES Outputs
output "ses_info" {
  description = "SES configuration info"
  value       = module.ses.env_vars
  sensitive   = true
}

output "smtp_username" {
  description = "SMTP username for sending emails"
  value       = module.ses.smtp_access_key_id
  sensitive   = true
}

output "smtp_password" {
  description = "SMTP password for sending emails"
  value       = module.ses.smtp_password
  sensitive   = true
}
