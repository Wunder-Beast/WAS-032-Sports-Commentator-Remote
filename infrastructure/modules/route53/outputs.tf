output "zone_id" {
  description = "The hosted zone ID"
  value       = local.zone_id
}

output "zone_name" {
  description = "The hosted zone name"
  value       = var.domain_name
}

output "name_servers" {
  description = "The name servers for the hosted zone"
  value       = var.create_hosted_zone ? aws_route53_zone.main[0].name_servers : []
}

output "root_domain_record" {
  description = "The root domain A record"
  value       = var.create_records && var.ec2_public_ip != "" ? aws_route53_record.root[0].fqdn : ""
}

output "www_domain_record" {
  description = "The www subdomain A record"
  value       = var.create_records && var.ec2_public_ip != "" ? aws_route53_record.www[0].fqdn : ""
}

output "staging_domain_record" {
  description = "The staging subdomain A record"
  value       = var.create_records && var.ec2_public_ip != "" ? aws_route53_record.staging[0].fqdn : ""
}