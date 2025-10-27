variable "project_name" {
  description = "Name of the project for tagging"
  type        = string
}


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

variable "ssh_public_key" {
  description = "SSH public key content"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID to launch instance in"
  type        = string
  default     = null
}

variable "subnet_id" {
  description = "Subnet ID to launch instance in"
  type        = string
  default     = null
}

variable "additional_security_group_ids" {
  description = "Additional security group IDs to attach"
  type        = list(string)
  default     = []
}

variable "instance_profile_name" {
  description = "IAM instance profile name"
  type        = string
  default     = null
}