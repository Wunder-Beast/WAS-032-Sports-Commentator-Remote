# Get latest Ubuntu LTS AMI
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Get default VPC if none specified
data "aws_vpc" "default" {
  count   = var.vpc_id == null ? 1 : 0
  default = true
}

# Get default subnet if none specified
data "aws_subnets" "default" {
  count = var.subnet_id == null ? 1 : 0
  
  filter {
    name   = "vpc-id"
    values = [local.vpc_id]
  }
  
  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

locals {
  vpc_id    = var.vpc_id != null ? var.vpc_id : data.aws_vpc.default[0].id
  subnet_id = var.subnet_id != null ? var.subnet_id : data.aws_subnets.default[0].ids[1]
}

# Key pair for SSH access
resource "aws_key_pair" "main" {
  key_name   = "${var.project_name}"
  public_key = var.ssh_public_key

  tags = {
    Name = "${var.project_name}-key"
  }
}

# Security group
resource "aws_security_group" "main" {
  name        = "${var.project_name}-sg"
  description = "Security group for ${var.project_name}"
  vpc_id      = local.vpc_id

  # SSH access
  # This is way too open because GitHub Actions connect through here
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  # HTTP access
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTP access"
  }

  # HTTPS access
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS access"
  }

  # Custom ports for apps (3000-3010)
  # ingress {
  #   from_port   = 3000
  #   to_port     = 3010
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  #   description = "Application ports"
  # }

  # All outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = {
    Name = "${var.project_name}-sg"
  }
}

# EC2 Instance
resource "aws_instance" "main" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type
  key_name      = aws_key_pair.main.key_name
  # Let AWS pick the best available subnet automatically

  vpc_security_group_ids = concat(
    [aws_security_group.main.id],
    var.additional_security_group_ids
  )

  iam_instance_profile = var.instance_profile_name

  root_block_device {
    volume_type = "gp3"
    volume_size = var.volume_size
    encrypted   = true

    tags = {
      Name = "${var.project_name}-root"
    }
  }

  user_data = base64encode(templatefile("${path.module}/scripts/user_data.sh", {
    project_name            = var.project_name
    deploy_script           = file("${path.module}/scripts/deploy.sh")
    staging_service_file    = file("${path.module}/systemd/nextjs-staging.service")
    production_service_file = file("${path.module}/systemd/nextjs-production.service")
  }))

  tags = {
    Name = "${var.project_name}"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Elastic IP
resource "aws_eip" "main" {
  instance = aws_instance.main.id
  domain   = "vpc"

  tags = {
    Name = "${var.project_name}-eip"
  }

  depends_on = [aws_instance.main]
}