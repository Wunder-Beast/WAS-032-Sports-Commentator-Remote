#!/bin/bash
set -e

# Update system
apt-get update
apt-get upgrade -y

# Install essential packages
apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    fail2ban \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    debian-keyring \
    debian-archive-keyring

# Create project directories with symlink structure
mkdir -p /srv/www/staging/releases
mkdir -p /srv/www/production/releases

# Set permissions
chown -R ubuntu:ubuntu /srv/www
chmod 755 /srv/www

# Create logs directory
mkdir -p /var/log/${project_name}
chown ubuntu:ubuntu /var/log/${project_name}

# Setup SSH hardening
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# Install bun for ubuntu user
# Pinned to 1.2.5 due to bug in 1.2.6+ that sends duplicate Transfer-Encoding: chunked headers
# causing 502 errors with reverse proxies. See: https://github.com/oven-sh/bun/issues/21201
echo "Installing bun..."
sudo -u ubuntu bash -c 'curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.5"'

# Add bun to PATH for all users via profile.d
cat > /etc/profile.d/bun.sh << 'EOF'
export PATH="/home/ubuntu/.bun/bin:$PATH"
EOF
chmod +x /etc/profile.d/bun.sh

# Verify bun installation
sudo -u ubuntu /home/ubuntu/.bun/bin/bun --version
echo "✅ Bun installed successfully"

# Install Caddy web server
echo "Installing Caddy..."
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install caddy -y

# Enable and start Caddy service
systemctl enable caddy
systemctl start caddy
echo "✅ Caddy installed and started successfully"

# Install deployment script
echo "Installing deployment system..."
cat > /usr/local/bin/deploy.sh << 'DEPLOY_SCRIPT_EOF'
${deploy_script}
DEPLOY_SCRIPT_EOF

chmod +x /usr/local/bin/deploy.sh
chown ubuntu:ubuntu /usr/local/bin/deploy.sh

# Install systemd service files
echo "Installing systemd services..."
cat > /etc/systemd/system/nextjs-staging.service << 'STAGING_SERVICE_EOF'
${staging_service_file}
STAGING_SERVICE_EOF

cat > /etc/systemd/system/nextjs-production.service << 'PRODUCTION_SERVICE_EOF'
${production_service_file}
PRODUCTION_SERVICE_EOF

# Reload systemd (but don't enable services yet - they'll be enabled on first deployment)
systemctl daemon-reload

echo "Deployment system installed successfully"
echo "Services will be enabled on first deployment when symlinks exist"

# Log completion
echo "$(date): User data script completed for ${project_name}" >> /var/log/user-data.log