# Infrastructure Template

This directory contains a reusable infrastructure template for Next.js projects using OpenTofu.

## 🏗️ Architecture

- **EC2 Instance**: Ubuntu 24.04 LTS server with security groups
- **Route53 DNS**: Manages custom domain with staging/production subdomains
- **S3 Buckets**: Separate buckets for staging and production file storage  
- **SES Email**: Domain-verified email sending with DKIM
- **IAM Roles**: Secure access for EC2 and GitHub Actions deployment
- **1Password**: SSH key management for team access

## 🚀 Quick Start

### Prerequisites
- [OpenTofu](https://opentofu.org/docs/intro/install/) installed
- [Just](https://github.com/casey/just) command runner
- [1Password CLI](https://developer.1password.com/docs/cli/get-started/) (optional but recommended)
- AWS CLI configured with appropriate permissions
- GitHub CLI (`gh`) for automated GitHub setup

### Setup for New Project

1. **Create repository from GitHub template:**
   - Go to https://github.com/your-org/nextjs-template
   - Click "Use this template" → "Create a new repository"
   - Clone your new repository locally

2. **Initialize project with your details:**
   ```bash
   cd your-new-project
   # Example: For a project
   just init-project "abc-123-clientname" "ABC - 123 - Client Name" "clientdomain.com"
   
   # This will update:
   # - package.json: name field
   # - infrastructure/terraform.tfvars: project names and domain
   # - infrastructure/justfile: PROJECT_DISPLAY_NAME for 1Password
   ```

3. **Update Route53 configuration:**
   - Edit `existing_zone_id` in `infrastructure/terraform.tfvars` if using existing hosted zone
   - Or set `create_hosted_zone = true` for new zone

4. **Deploy infrastructure:**
   ```bash
   # Generate SSH keys (stored in 1Password if available)  
   just generate-keys

   # Initialize OpenTofu
   just tofu-init

   # Review deployment plan
   just plan

   # Deploy infrastructure  
   just apply

   # Set up GitHub Actions
   just setup-github-actions
   ```

### Daily Usage

```bash
# Check status
just status

# View infrastructure outputs
just output

# Connect to server
just connect

# Update infrastructure
just plan
just apply
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `just init-project CODE NAME DOMAIN` | Initialize project with custom names (run first!) |
| `just generate-keys` | Create SSH key pair for server access |
| `just tofu-init` | Initialize OpenTofu |
| `just plan` | Show planned infrastructure changes |
| `just apply` | Deploy infrastructure changes |
| `just output` | Show infrastructure outputs |
| `just connect` | SSH to EC2 instance |
| `just setup-github-actions` | Configure GitHub CI/CD automatically (idempotent) |
| `just regenerate-github-secrets` | Force regeneration of GitHub secrets |
| `just env` | Generate local environment variables |
| `just status` | Show project status |
| `just destroy` | Destroy all infrastructure (with confirmation) |

## 🔧 Configuration

### terraform.tfvars
```hcl
project_name = "abc-123-clientname"
domain_name  = "clientdomain.com" 
existing_zone_id = "YOUR_ZONE_ID_HERE"  # Get from Route53 console
create_hosted_zone = false                  # Use existing zone
create_s3_buckets = true                    # Enable S3 for file uploads
create_ses = true                           # Enable email functionality
create_deployment_user = true              # Enable GitHub Actions
```

## 🌐 DNS Configuration

The infrastructure manages these DNS records:
- `clientdomain.com` → EC2 instance
- `www.clientdomain.com` → EC2 instance  
- `staging.clientdomain.com` → EC2 instance

All point to the same server, with applications differentiated by:
- Production: `/var/www/production/` (port 3000)
- Staging: `/var/www/staging/` (port 3001)

## 📦 S3 Buckets

Two buckets are created for file storage:
- `{project-name}-staging-{suffix}`
- `{project-name}-production-{suffix}`

Features:
- Versioning enabled
- Server-side encryption
- Public access blocked
- CORS configured for web uploads

## 📧 SES Configuration

Email sending configured for your domain:
- Domain verification via Route53 TXT records
- DKIM authentication
- Bounce/complaint handling
- Configuration set for tracking

## 🔐 Security

### SSH Keys
- ed25519 keys generated locally
- Private key stored in `./keys/` (gitignored)  
- Public key deployed to EC2

### IAM Permissions
- EC2 instance role: S3 + SES access
- Deployment user: Same permissions for GitHub Actions
- Least-privilege policies

### Network Security  
- UFW firewall enabled
- SSH hardened (no root, no passwords)
- Security groups restrict access

## 🚀 GitHub Actions Integration

The `setup-github-actions` command automatically configures your GitHub repository with all necessary secrets and variables for CI/CD deployment.

### Features
- **Idempotent**: Safe to run multiple times without side effects
- **Secret Generation**: Automatically generates NEXTAUTH_SECRET for each environment
- **Secret Persistence**: Saves generated secrets to `.env.github.secrets` (gitignored)
- **Regeneration Support**: Use `just regenerate-github-secrets` to force new secret generation

### Repository Secrets (Shared)
Automatically set from infrastructure outputs:
- `SSH_PRIVATE_KEY`: For server deployment
- `DEPLOY_AWS_ACCESS_KEY_ID`: AWS credentials
- `DEPLOY_AWS_SECRET_ACCESS_KEY`: AWS credentials  
- `EC2_HOST`: Server IP address

### Environment Variables

**Staging Environment:**
- `S3_BUCKET_NAME`: Staging S3 bucket
- `NEXTAUTH_URL`: https://staging.clientdomain.com
- `AWS_REGION`: us-east-1
- `SES_DOMAIN`: clientdomain.com
- `SES_REGION`: us-east-1

**Production Environment:**
- `S3_BUCKET_NAME`: Production S3 bucket  
- `NEXTAUTH_URL`: https://clientdomain.com
- `AWS_REGION`: us-east-1
- `SES_DOMAIN`: clientdomain.com
- `SES_REGION`: us-east-1

### Automatically Generated Secrets
For each environment (staging/production):
- `NEXTAUTH_SECRET`: Cryptographically secure random token (auto-generated)
- `DATABASE_URL`: Default SQLite path (can be overridden for external databases)

### Optional Manual Secrets
You may want to add additional secrets for:
- `API_KEY`: Third-party API keys
- `OAUTH_CLIENT_SECRET`: OAuth provider secrets
- `PAYMENT_SECRET`: Payment gateway keys
- External database URLs (to replace SQLite)

## 🔄 Deployment Workflow

1. **Infrastructure changes**: Run locally with `just apply`
2. **Application deployments**: Automatic via GitHub Actions
   - Push to `release/staging` → Deploy to staging
   - Push to `release/production` → Deploy to production

## 🗂️ File Structure

```
infrastructure/
├── modules/          # OpenTofu modules
├── keys/            # SSH keys (gitignored)
├── terraform.tfvars # Project configuration
├── main.tf          # Infrastructure definition
├── outputs.tf       # Infrastructure outputs
├── versions.tf      # Provider versions
├── variables.tf     # Variable definitions
└── justfile         # Command shortcuts
```

## 💰 Cost Estimate

| Resource | Monthly Cost |
|----------|-------------|
| EC2 t3.micro | ~$8.50 |
| Route53 queries | ~$0.50 |
| S3 storage | ~$0.023/GB |
| SES emails | $0.10/1000 |
| **Total** | **~$9/month** |

## 🆘 Troubleshooting

### Infrastructure Issues
```bash
# Check OpenTofu state
just state

# Validate configuration
just validate

# Force refresh state
tofu refresh
```

### SSH Connection Issues
```bash
# Regenerate SSH keys
rm -rf ./keys/
just generate-keys
just apply

# Test connectivity
just connect
```

### GitHub Actions Issues
```bash
# Re-run setup
just setup-github-actions

# Check repository settings
gh repo view --web
```

### DNS Issues
```bash
# Check DNS records
dig clientdomain.com
dig staging.clientdomain.com

# Verify Route53 configuration
aws route53 list-resource-record-sets --hosted-zone-id YOUR_ZONE_ID_HERE
```

## 🔄 Migration from Manual Setup

If migrating from manual AWS setup:

1. **Import existing resources**:
   ```bash
   # Already configured for existing Route53 zone
   just import-zone  # (This is a no-op for existing zone)
   ```

2. **Deploy new infrastructure**:
   ```bash
   just apply
   ```

3. **Update GitHub repository**:
   ```bash
   just setup-github-actions
   ```

4. **Test deployments**:
   ```bash
   # Push to test branches
   git checkout -b release/staging
   git push origin release/staging
   ```

## 📚 Related Documentation

- [AWS Infrastructure Template](../../../aws-infrastructure-template/README.md)
- [SSH Key Management](../../../aws-infrastructure-template/docs/SSH_KEY_MANAGEMENT.md)
- [GitHub Actions Setup](../../../aws-infrastructure-template/docs/GITHUB_ACTIONS_SETUP.md)