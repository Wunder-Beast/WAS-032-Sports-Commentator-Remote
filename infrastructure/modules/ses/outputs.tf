output "domain_identity_arn" {
  description = "ARN of the SES domain identity"
  value       = aws_ses_domain_identity.main.arn
}

output "domain_identity_verification_token" {
  description = "Verification token for the SES domain identity"
  value       = aws_ses_domain_identity.main.verification_token
}

output "dkim_tokens" {
  description = "DKIM tokens for the domain"
  value       = aws_ses_domain_dkim.main.dkim_tokens
}

output "mail_from_domain" {
  description = "MAIL FROM domain"
  value       = aws_ses_domain_mail_from.main.mail_from_domain
}

output "configuration_set_name" {
  description = "Name of the SES configuration set"
  value       = var.enable_configuration_set ? aws_ses_configuration_set.main[0].name : ""
}

output "configuration_set_arn" {
  description = "ARN of the SES configuration set"
  value       = var.enable_configuration_set ? aws_ses_configuration_set.main[0].arn : ""
}

output "bounce_topic_arn" {
  description = "ARN of the bounce notifications SNS topic"
  value       = var.notification_email != "" ? aws_sns_topic.bounce[0].arn : ""
}

output "complaint_topic_arn" {
  description = "ARN of the complaint notifications SNS topic"
  value       = var.notification_email != "" ? aws_sns_topic.complaint[0].arn : ""
}

# SMTP Credentials Outputs
output "smtp_user_name" {
  description = "Name of the SMTP IAM user"
  value       = var.create_smtp_user ? aws_iam_user.smtp_user[0].name : ""
}

output "smtp_access_key_id" {
  description = "Access key ID for SMTP user"
  value       = var.create_smtp_user ? aws_iam_access_key.smtp_user_key[0].id : ""
  sensitive   = true
}

output "smtp_secret_access_key" {
  description = "Secret access key for SMTP user (needs to be converted to SMTP password)"
  value       = var.create_smtp_user ? aws_iam_access_key.smtp_user_key[0].secret : ""
  sensitive   = true
}

output "smtp_password" {
  description = "SMTP password derived from secret access key"
  value       = var.create_smtp_user ? aws_iam_access_key.smtp_user_key[0].ses_smtp_password_v4 : ""
  sensitive   = true
}

# Environment variables for applications
output "env_vars" {
  description = "Environment variables for application SES configuration"
  value = merge(
    {
      SES_DOMAIN            = var.domain_name
      SES_MAIL_FROM_DOMAIN  = aws_ses_domain_mail_from.main.mail_from_domain
      SES_CONFIGURATION_SET = var.enable_configuration_set ? aws_ses_configuration_set.main[0].name : ""
      SES_REGION           = data.aws_region.current.name
    },
    var.create_smtp_user ? {
      SMTP_HOST     = "email-smtp.${data.aws_region.current.name}.amazonaws.com"
      SMTP_PORT     = "587"
      SMTP_USERNAME = aws_iam_access_key.smtp_user_key[0].id
      SMTP_PASSWORD = aws_iam_access_key.smtp_user_key[0].ses_smtp_password_v4
    } : {}
  )
}

# Complete SES information for reference
output "ses_info" {
  description = "Complete SES configuration information"
  value = {
    domain_identity = {
      arn                = aws_ses_domain_identity.main.arn
      domain            = aws_ses_domain_identity.main.domain
      verification_token = aws_ses_domain_identity.main.verification_token
    }
    dkim = {
      tokens = aws_ses_domain_dkim.main.dkim_tokens
    }
    mail_from = {
      domain = aws_ses_domain_mail_from.main.mail_from_domain
    }
    configuration_set = var.enable_configuration_set ? {
      name = aws_ses_configuration_set.main[0].name
      arn  = aws_ses_configuration_set.main[0].arn
    } : null
    region = data.aws_region.current.name
  }
}