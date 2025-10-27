# Infrastructure Template - Main Configuration
# This file contains the base infrastructure configuration
# Additional modules are added based on selected features


# Route53 module (conditional)
module "route53" {
  source = "./modules/route53"

  domain_name         = var.domain_name
  create_hosted_zone  = var.create_hosted_zone
  existing_zone_id    = var.existing_zone_id
  project_name        = var.project_name

  # Don't create records until EC2 is created
  create_records = false
}


# IAM module (must be first to create instance profile)
# Note: EC2 instance doesn't need S3/SES permissions - application uses IAM user credentials via ENV
module "iam" {
  source = "./modules/iam"

  project_name    = var.project_name
  s3_bucket_arns  = []
  ses_domain_arns = []

  create_deployment_user = var.create_deployment_user
  enable_cloudwatch_logs = true
  enable_systems_manager = true
}

# EC2 module
module "ec2" {
  source = "./modules/ec2"

  project_name          = var.project_name
  instance_type         = var.instance_type
  volume_size          = var.volume_size
  ssh_public_key       = file(var.ssh_public_key_path)
  instance_profile_name = module.iam.instance_profile_name
}


# S3 module
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environments = var.environments

  enable_versioning       = true
  enable_encryption      = true
  block_public_access    = true
}


# SES module (standalone - no automatic DNS records)
# When used alone, you'll need to manually create DNS records with your DNS provider
# When used with Route53, DNS records are created automatically via combination fragment
module "ses" {
  source = "./modules/ses"

  domain_name       = var.ses_domain != "" ? var.ses_domain : var.domain_name
  project_name      = var.project_name
  route53_zone_id   = ""  # No Route53 integration by default

  create_dkim_records         = false  # DNS records created manually or via combination
  create_verification_records = false
  enable_configuration_set    = true
  wait_for_verification       = false  # Can take up to 72 hours

  # SMTP Configuration
  create_smtp_user = var.create_smtp_user
  smtp_user_name   = var.smtp_user_name
}


# DNS records for EC2 instance (requires both EC2 and Route53)
# Root domain (always points to production)
resource "aws_route53_record" "root" {
  count = var.create_hosted_zone || var.existing_zone_id != "" ? 1 : 0

  zone_id = var.create_hosted_zone ? module.route53.zone_id : var.existing_zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [module.ec2.instance_public_ip]
}

# www subdomain (always points to production)
resource "aws_route53_record" "www" {
  count = var.create_hosted_zone || var.existing_zone_id != "" ? 1 : 0

  zone_id = var.create_hosted_zone ? module.route53.zone_id : var.existing_zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [module.ec2.instance_public_ip]
}

# Environment-specific subdomains (staging.domain, etc.)
resource "aws_route53_record" "environments" {
  for_each = var.create_hosted_zone || var.existing_zone_id != "" ? {
    for env in var.environments : env => env if env != "production"
  } : {}

  zone_id = var.create_hosted_zone ? module.route53.zone_id : var.existing_zone_id
  name    = "${each.value}.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [module.ec2.instance_public_ip]
}


# SES + Route53 DNS records (automatic verification)
# Creates all required DNS records for SES domain verification and DKIM

# Current AWS region for SES endpoints
data "aws_region" "ses_current" {}

# Domain verification TXT record
resource "aws_route53_record" "ses_verification" {
  zone_id = var.create_hosted_zone ? module.route53.zone_id : var.existing_zone_id
  name    = "_amazonses.${var.ses_domain != "" ? var.ses_domain : var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [module.ses.domain_identity_verification_token]
}

# DKIM CNAME records (3 records for email authentication)
resource "aws_route53_record" "ses_dkim" {
  count   = 3
  zone_id = var.create_hosted_zone ? module.route53.zone_id : var.existing_zone_id
  name    = "${element(module.ses.dkim_tokens, count.index)}._domainkey.${var.ses_domain != "" ? var.ses_domain : var.domain_name}"
  type    = "CNAME"
  ttl     = 600
  records = ["${element(module.ses.dkim_tokens, count.index)}.dkim.amazonses.com"]
}

# MX record for MAIL FROM domain
resource "aws_route53_record" "ses_mx" {
  zone_id = var.create_hosted_zone ? module.route53.zone_id : var.existing_zone_id
  name    = module.ses.mail_from_domain
  type    = "MX"
  ttl     = 600
  records = ["10 feedback-smtp.${data.aws_region.ses_current.name}.amazonses.com"]
}

# SPF TXT record for MAIL FROM domain
resource "aws_route53_record" "ses_spf" {
  zone_id = var.create_hosted_zone ? module.route53.zone_id : var.existing_zone_id
  name    = module.ses.mail_from_domain
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}
