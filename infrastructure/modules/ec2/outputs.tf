output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.main.id
}

output "instance_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.main.public_ip
}

output "instance_private_ip" {
  description = "Private IP address of the EC2 instance"
  value       = aws_instance.main.private_ip
}

output "instance_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.main.public_dns
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.main.id
}

output "key_name" {
  description = "Name of the key pair"
  value       = aws_key_pair.main.key_name
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ./keys/id_ed25519 ubuntu@${aws_eip.main.public_ip}"
}