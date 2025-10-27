# Data source for current AWS account
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# IAM Role for EC2 Instance
resource "aws_iam_role" "ec2_role" {
  name = "${var.project_name}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ec2-role"
    Project     = var.project_name
  }
}

# IAM Policy for S3 Access
resource "aws_iam_policy" "s3_policy" {
  count = length(var.s3_bucket_arns) > 0 ? 1 : 0
  
  name        = "${var.project_name}-s3-policy"
  description = "S3 access policy for ${var.project_name}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObjectVersion",
          "s3:ListBucket",
          "s3:ListBucketVersions",
          "s3:GetBucketLocation",
          "s3:GetBucketVersioning"
        ]
        Resource = concat(
          var.s3_bucket_arns,
          [for arn in var.s3_bucket_arns : "${arn}/*"]
        )
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-s3-policy"
    Project     = var.project_name
  }
}

# IAM Policy for SES Access
resource "aws_iam_policy" "ses_policy" {
  count = length(var.ses_domain_arns) > 0 ? 1 : 0
  
  name        = "${var.project_name}-ses-policy"
  description = "SES access policy for ${var.project_name}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail",
          "ses:SendBulkTemplatedEmail",
          "ses:SendTemplatedEmail",
          "ses:GetSendQuota",
          "ses:GetSendStatistics",
          "ses:DescribeConfigurationSet",
          "ses:GetIdentityVerificationAttributes",
          "ses:GetIdentityDkimAttributes"
        ]
        Resource = var.ses_domain_arns
      },
      {
        Effect = "Allow"
        Action = [
          "ses:ListIdentities",
          "ses:ListConfigurationSets"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ses-policy"
    Project     = var.project_name
  }
}

# IAM Policy for CloudWatch Logs
resource "aws_iam_policy" "cloudwatch_logs_policy" {
  count = var.enable_cloudwatch_logs ? 1 : 0
  
  name        = "${var.project_name}-cloudwatch-logs-policy"
  description = "CloudWatch Logs access policy for ${var.project_name}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:DescribeLogStreams",
          "logs:DescribeLogGroups"
        ]
        Resource = "arn:aws:logs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:log-group:/aws/ec2/${var.project_name}/*"
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-cloudwatch-logs-policy"
    Project     = var.project_name
  }
}

# IAM Policy for Systems Manager
resource "aws_iam_policy" "systems_manager_policy" {
  count = var.enable_systems_manager ? 1 : 0
  
  name        = "${var.project_name}-ssm-policy"
  description = "Systems Manager access policy for ${var.project_name}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters",
          "ssm:GetParametersByPath",
          "ssm:PutParameter",
          "ssm:DeleteParameter",
          "ssm:DescribeParameters"
        ]
        Resource = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${var.project_name}/*"
      },
      {
        Effect = "Allow"
        Action = [
          "ssm:UpdateInstanceInformation",
          "ssm:SendCommand",
          "ssm:ListCommands",
          "ssm:ListCommandInvocations",
          "ssm:DescribeInstanceInformation"
        ]
        Resource = "*"
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-ssm-policy"
    Project     = var.project_name
  }
}

# Custom IAM Policy for additional permissions
resource "aws_iam_policy" "custom_policy" {
  count = length(var.custom_policy_statements) > 0 ? 1 : 0
  
  name        = "${var.project_name}-custom-policy"
  description = "Custom policy for ${var.project_name}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      for stmt in var.custom_policy_statements : {
        Effect    = stmt.effect
        Action    = stmt.actions
        Resource  = stmt.resources
        Condition = length(stmt.condition) > 0 ? stmt.condition : null
      }
    ]
  })

  tags = {
    Name        = "${var.project_name}-custom-policy"
    Project     = var.project_name
  }
}

# Attach policies to the EC2 role
resource "aws_iam_role_policy_attachment" "s3_policy_attachment" {
  count = length(var.s3_bucket_arns) > 0 ? 1 : 0
  
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.s3_policy[0].arn
}

resource "aws_iam_role_policy_attachment" "ses_policy_attachment" {
  count = length(var.ses_domain_arns) > 0 ? 1 : 0
  
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.ses_policy[0].arn
}

resource "aws_iam_role_policy_attachment" "cloudwatch_logs_policy_attachment" {
  count = var.enable_cloudwatch_logs ? 1 : 0
  
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.cloudwatch_logs_policy[0].arn
}

resource "aws_iam_role_policy_attachment" "systems_manager_policy_attachment" {
  count = var.enable_systems_manager ? 1 : 0
  
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.systems_manager_policy[0].arn
}

resource "aws_iam_role_policy_attachment" "custom_policy_attachment" {
  count = length(var.custom_policy_statements) > 0 ? 1 : 0
  
  role       = aws_iam_role.ec2_role.name
  policy_arn = aws_iam_policy.custom_policy[0].arn
}

# Attach additional policies
resource "aws_iam_role_policy_attachment" "additional_policies" {
  count = length(var.additional_policies)
  
  role       = aws_iam_role.ec2_role.name
  policy_arn = var.additional_policies[count.index]
}

# IAM Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "${var.project_name}-ec2-profile"
  role = aws_iam_role.ec2_role.name

  tags = {
    Name        = "${var.project_name}-ec2-profile"
    Project     = var.project_name
  }
}

# Optional: IAM User for Deployments
resource "aws_iam_user" "deployment_user" {
  count = var.create_deployment_user ? 1 : 0
  
  name = var.deployment_user_name != "" ? var.deployment_user_name : "${var.project_name}-deploy"

  tags = {
    Name        = "${var.project_name}-deploy-user"
    Project     = var.project_name
  }
}

# Attach same policies to deployment user
resource "aws_iam_user_policy_attachment" "deployment_s3_policy" {
  count = var.create_deployment_user && length(var.s3_bucket_arns) > 0 ? 1 : 0
  
  user       = aws_iam_user.deployment_user[0].name
  policy_arn = aws_iam_policy.s3_policy[0].arn
}

resource "aws_iam_user_policy_attachment" "deployment_ses_policy" {
  count = var.create_deployment_user && length(var.ses_domain_arns) > 0 ? 1 : 0
  
  user       = aws_iam_user.deployment_user[0].name
  policy_arn = aws_iam_policy.ses_policy[0].arn
}

# Access Keys for Deployment User
resource "aws_iam_access_key" "deployment_user_key" {
  count = var.create_deployment_user ? 1 : 0
  
  user = aws_iam_user.deployment_user[0].name
}