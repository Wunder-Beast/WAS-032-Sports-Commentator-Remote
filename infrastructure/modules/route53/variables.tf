variable "domain_name" {
  description = "Domain name to manage"
  type        = string
}

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

variable "ec2_public_ip" {
  description = "Public IP of EC2 instance for A records"
  type        = string
  default     = ""
}

variable "project_name" {
  description = "Name of the project for tagging"
  type        = string
}


variable "create_records" {
  description = "Whether to create DNS records pointing to EC2"
  type        = bool
  default     = true
}

variable "additional_records" {
  description = "Additional DNS records to create"
  type = list(object({
    name  = string
    type  = string
    value = string
    ttl   = optional(number, 300)
  }))
  default = []
}