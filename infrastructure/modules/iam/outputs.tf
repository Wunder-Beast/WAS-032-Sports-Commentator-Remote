output "ec2_role_arn" {
  description = "ARN of the EC2 IAM role"
  value       = aws_iam_role.ec2_role.arn
}

output "ec2_role_name" {
  description = "Name of the EC2 IAM role"
  value       = aws_iam_role.ec2_role.name
}

output "instance_profile_name" {
  description = "Name of the IAM instance profile"
  value       = aws_iam_instance_profile.ec2_profile.name
}

output "instance_profile_arn" {
  description = "ARN of the IAM instance profile"
  value       = aws_iam_instance_profile.ec2_profile.arn
}

output "deployment_user_name" {
  description = "Name of the deployment IAM user"
  value       = var.create_deployment_user ? aws_iam_user.deployment_user[0].name : ""
}

output "deployment_user_arn" {
  description = "ARN of the deployment IAM user"
  value       = var.create_deployment_user ? aws_iam_user.deployment_user[0].arn : ""
}

output "deployment_access_key_id" {
  description = "Access key ID for deployment user"
  value       = var.create_deployment_user ? aws_iam_access_key.deployment_user_key[0].id : ""
  sensitive   = true
}

output "deployment_secret_access_key" {
  description = "Secret access key for deployment user"
  value       = var.create_deployment_user ? aws_iam_access_key.deployment_user_key[0].secret : ""
  sensitive   = true
}

output "s3_policy_arn" {
  description = "ARN of the S3 access policy"
  value       = length(var.s3_bucket_arns) > 0 ? aws_iam_policy.s3_policy[0].arn : ""
}

output "ses_policy_arn" {
  description = "ARN of the SES access policy"
  value       = length(var.ses_domain_arns) > 0 ? aws_iam_policy.ses_policy[0].arn : ""
}

output "cloudwatch_logs_policy_arn" {
  description = "ARN of the CloudWatch Logs policy"
  value       = var.enable_cloudwatch_logs ? aws_iam_policy.cloudwatch_logs_policy[0].arn : ""
}

output "systems_manager_policy_arn" {
  description = "ARN of the Systems Manager policy"
  value       = var.enable_systems_manager ? aws_iam_policy.systems_manager_policy[0].arn : ""
}

# Environment variables for applications
output "env_vars" {
  description = "Environment variables for application IAM configuration"
  value = merge(
    var.create_deployment_user ? {
      AWS_ACCESS_KEY_ID     = aws_iam_access_key.deployment_user_key[0].id
      AWS_SECRET_ACCESS_KEY = aws_iam_access_key.deployment_user_key[0].secret
    } : {},
    {
      AWS_REGION = data.aws_region.current.name
    }
  )
  sensitive = true
}

# Complete IAM information for reference
output "iam_info" {
  description = "Complete IAM configuration information"
  value = {
    ec2_role = {
      name = aws_iam_role.ec2_role.name
      arn  = aws_iam_role.ec2_role.arn
    }
    instance_profile = {
      name = aws_iam_instance_profile.ec2_profile.name
      arn  = aws_iam_instance_profile.ec2_profile.arn
    }
    deployment_user = var.create_deployment_user ? {
      name = aws_iam_user.deployment_user[0].name
      arn  = aws_iam_user.deployment_user[0].arn
    } : null
    policies = {
      s3_policy_arn                = length(var.s3_bucket_arns) > 0 ? aws_iam_policy.s3_policy[0].arn : ""
      ses_policy_arn               = length(var.ses_domain_arns) > 0 ? aws_iam_policy.ses_policy[0].arn : ""
      cloudwatch_logs_policy_arn   = var.enable_cloudwatch_logs ? aws_iam_policy.cloudwatch_logs_policy[0].arn : ""
      systems_manager_policy_arn   = var.enable_systems_manager ? aws_iam_policy.systems_manager_policy[0].arn : ""
    }
  }
}