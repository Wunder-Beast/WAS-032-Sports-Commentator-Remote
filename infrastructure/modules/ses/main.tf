# SES Domain Identity
resource "aws_ses_domain_identity" "main" {
  domain = var.domain_name
}

# SES Domain Verification Record
resource "aws_route53_record" "ses_verification" {
  count = var.create_verification_records && var.route53_zone_id != "" ? 1 : 0
  
  zone_id = var.route53_zone_id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.main.verification_token]
}

# Wait for domain verification (optional - can take up to 72 hours)
resource "aws_ses_domain_identity_verification" "main" {
  count = var.create_verification_records && var.route53_zone_id != "" && var.wait_for_verification ? 1 : 0
  
  domain = aws_ses_domain_identity.main.id
  
  depends_on = [aws_route53_record.ses_verification]
}

# SES DKIM
resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}

# DKIM Records
resource "aws_route53_record" "dkim" {
  count = var.create_dkim_records && var.route53_zone_id != "" ? 3 : 0
  
  zone_id = var.route53_zone_id
  name    = "${element(aws_ses_domain_dkim.main.dkim_tokens, count.index)}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 600
  records = ["${element(aws_ses_domain_dkim.main.dkim_tokens, count.index)}.dkim.amazonses.com"]
}

# SES MAIL FROM Domain
resource "aws_ses_domain_mail_from" "main" {
  domain           = aws_ses_domain_identity.main.domain
  mail_from_domain = "${var.mail_from_subdomain}.${var.domain_name}"
}

# MX Record for MAIL FROM domain
resource "aws_route53_record" "mx" {
  count = var.route53_zone_id != "" ? 1 : 0
  
  zone_id = var.route53_zone_id
  name    = aws_ses_domain_mail_from.main.mail_from_domain
  type    = "MX"
  ttl     = 600
  records = ["10 feedback-smtp.${data.aws_region.current.name}.amazonses.com"]
}

# TXT Record for MAIL FROM domain (SPF)
resource "aws_route53_record" "spf" {
  count = var.route53_zone_id != "" ? 1 : 0
  
  zone_id = var.route53_zone_id
  name    = aws_ses_domain_mail_from.main.mail_from_domain
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

# Configuration Set
resource "aws_ses_configuration_set" "main" {
  count = var.enable_configuration_set ? 1 : 0
  
  name = "${var.project_name}"

  reputation_metrics_enabled = var.reputation_tracking_enabled
  sending_enabled            = true

  dynamic "delivery_options" {
    for_each = var.delivery_options != null ? [var.delivery_options] : []
    content {
      tls_policy = delivery_options.value.tls_policy
    }
  }

  # Note: Configuration sets don't support tags
}

# SNS Topics for Notifications
resource "aws_sns_topic" "bounce" {
  count = var.notification_email != "" ? 1 : 0
  
  name = var.bounce_topic_name != "" ? var.bounce_topic_name : "${var.project_name}-ses-bounces"

  tags = {
    Name        = "${var.project_name}-bounces"
    Project     = var.project_name
  }
}

resource "aws_sns_topic" "complaint" {
  count = var.notification_email != "" ? 1 : 0
  
  name = var.complaint_topic_name != "" ? var.complaint_topic_name : "${var.project_name}-ses-complaints"

  tags = {
    Name        = "${var.project_name}-complaints"
    Project     = var.project_name
  }
}

# SNS Topic Subscriptions
resource "aws_sns_topic_subscription" "bounce_email" {
  count = var.notification_email != "" ? 1 : 0
  
  topic_arn = aws_sns_topic.bounce[0].arn
  protocol  = "email"
  endpoint  = var.notification_email
}

resource "aws_sns_topic_subscription" "complaint_email" {
  count = var.notification_email != "" ? 1 : 0
  
  topic_arn = aws_sns_topic.complaint[0].arn
  protocol  = "email"
  endpoint  = var.notification_email
}

# Configuration Set Event Destinations
resource "aws_ses_event_destination" "bounce" {
  count = var.enable_configuration_set && var.notification_email != "" ? 1 : 0
  
  name                   = "bounce-destination"
  configuration_set_name = aws_ses_configuration_set.main[0].name
  enabled                = true
  matching_types         = ["bounce"]

  sns_destination {
    topic_arn = aws_sns_topic.bounce[0].arn
  }
}

resource "aws_ses_event_destination" "complaint" {
  count = var.enable_configuration_set && var.notification_email != "" ? 1 : 0
  
  name                   = "complaint-destination"
  configuration_set_name = aws_ses_configuration_set.main[0].name
  enabled                = true
  matching_types         = ["complaint"]

  sns_destination {
    topic_arn = aws_sns_topic.complaint[0].arn
  }
}

# Data source for current AWS region
data "aws_region" "current" {}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# IAM User for SMTP credentials
resource "aws_iam_user" "smtp_user" {
  count = var.create_smtp_user ? 1 : 0
  
  name = var.smtp_user_name != "" ? var.smtp_user_name : "${var.project_name}-smtp"

  tags = {
    Name        = "${var.project_name}-smtp-user"
    Project     = var.project_name
  }
}

# IAM Policy for SES SMTP access
resource "aws_iam_user_policy" "smtp_policy" {
  count = var.create_smtp_user ? 1 : 0
  
  name = "${var.project_name}-smtp-policy"
  user = aws_iam_user.smtp_user[0].name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      }
    ]
  })
}

# IAM Access Key for SMTP user
resource "aws_iam_access_key" "smtp_user_key" {
  count = var.create_smtp_user ? 1 : 0
  
  user = aws_iam_user.smtp_user[0].name
}