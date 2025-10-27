# Create hosted zone if requested
resource "aws_route53_zone" "main" {
  count = var.create_hosted_zone ? 1 : 0
  
  name = var.domain_name

  tags = {
    Name        = "${var.project_name}-zone"
    Project     = var.project_name
  }
}

# Use existing zone if provided
data "aws_route53_zone" "existing" {
  count = var.create_hosted_zone ? 0 : 1
  
  zone_id = var.existing_zone_id
}

locals {
  zone_id = var.create_hosted_zone ? aws_route53_zone.main[0].zone_id : data.aws_route53_zone.existing[0].zone_id
}

# A record for root domain
resource "aws_route53_record" "root" {
  count = var.create_records && var.ec2_public_ip != "" ? 1 : 0
  
  zone_id = local.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [var.ec2_public_ip]
}

# A record for www subdomain
resource "aws_route53_record" "www" {
  count = var.create_records && var.ec2_public_ip != "" ? 1 : 0
  
  zone_id = local.zone_id
  name    = "www.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [var.ec2_public_ip]
}

# Staging subdomain
resource "aws_route53_record" "staging" {
  count = var.create_records && var.ec2_public_ip != "" ? 1 : 0
  
  zone_id = local.zone_id
  name    = "staging.${var.domain_name}"
  type    = "A"
  ttl     = 300
  records = [var.ec2_public_ip]
}

# Additional custom records
resource "aws_route53_record" "additional" {
  for_each = {
    for record in var.additional_records : record.name => record
  }
  
  zone_id = local.zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = each.value.ttl
  records = [each.value.value]
}