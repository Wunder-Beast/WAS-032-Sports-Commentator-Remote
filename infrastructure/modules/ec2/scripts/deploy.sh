#!/bin/bash
set -e

# Symlink-based deployment script for Next.js applications
# Usage: deploy.sh <environment> <commit_sha>

ENVIRONMENT="$1"
COMMIT_SHA="$2"

if [[ -z "$ENVIRONMENT" || -z "$COMMIT_SHA" ]]; then
    echo "Usage: $0 <environment> <commit_sha>"
    echo "Example: $0 staging abc123def"
    exit 1
fi

if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo "Error: Environment must be 'staging' or 'production'"
    exit 1
fi

# Configuration
BASE_DIR="/srv/www/${ENVIRONMENT}"
RELEASES_DIR="${BASE_DIR}/releases"
CURRENT_LINK="${BASE_DIR}/current"
NEW_RELEASE_DIR="${RELEASES_DIR}/${COMMIT_SHA}"
ENV_FILE="${BASE_DIR}/.env"
DB_FILE="${BASE_DIR}/db.sqlite"
SERVICE_NAME="nextjs-${ENVIRONMENT}"

# Bun configuration
BUN_PATH="/home/ubuntu/.bun/bin/bun"
export PATH="/home/ubuntu/.bun/bin:$PATH"

echo "🚀 Starting deployment for ${ENVIRONMENT} environment"
echo "📦 Commit SHA: ${COMMIT_SHA}"
echo "📁 Release directory: ${NEW_RELEASE_DIR}"

# Create base directory structure if it doesn't exist
mkdir -p "${RELEASES_DIR}"

# Check if this release already exists and has content
if [[ -d "$NEW_RELEASE_DIR" ]] && [[ -f "$NEW_RELEASE_DIR/package.json" ]]; then
    echo "ℹ️  Release ${COMMIT_SHA} already exists with content - proceeding with activation"
elif [[ ! -d "$NEW_RELEASE_DIR" ]]; then
    echo "📂 Creating release directory..."
    mkdir -p "$NEW_RELEASE_DIR"
else
    echo "📂 Release directory exists but is empty - proceeding"
fi

# Create shared .env file if it doesn't exist
if [[ ! -f "$ENV_FILE" ]]; then
    echo "📝 Creating initial .env file..."
    cat > "$ENV_FILE" << EOF
# ${ENVIRONMENT^} Environment Configuration
# Generated on $(date)

# Drizzle
NEXT_PUBLIC_DB_ENV=${ENVIRONMENT}
DATABASE_URL=file:${DB_FILE}

# Next Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=https://${ENVIRONMENT}.domain.com

# API Key
API_KEY=

# Email Configuration
EMAIL_SERVER_HOST=
EMAIL_SERVER_USER=
EMAIL_SERVER_PASSWORD=
EMAIL_SERVER_PORT=587
EMAIL_FROM=noreply@domain.com

# S3 Configuration
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
S3_BUCKET_NAME=
EOF
    chown ubuntu:ubuntu "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    echo "⚠️  Please update ${ENV_FILE} with proper values"
fi

# Create empty database file if it doesn't exist
if [[ ! -f "$DB_FILE" ]]; then
    echo "🗄️  Creating initial database file..."
    touch "$DB_FILE"
    chown ubuntu:ubuntu "$DB_FILE"
    chmod 644 "$DB_FILE"
fi

echo "📥 Deployment will create application files in ${NEW_RELEASE_DIR}"
echo "🔗 Application should reference environment file: ${ENV_FILE}"
echo "🗄️  Application should reference database file: ${DB_FILE}"

# Wait for application files to be deployed by external process (rsync/etc)
echo "⏳ Waiting for application files to be deployed..."
echo "   (This script expects external deployment to populate ${NEW_RELEASE_DIR})"

# Simple check that files were deployed
MAX_WAIT=300  # 5 minutes
WAIT_COUNT=0
while [[ ! -f "${NEW_RELEASE_DIR}/package.json" && $WAIT_COUNT -lt $MAX_WAIT ]]; do
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    if [[ $((WAIT_COUNT % 30)) -eq 0 ]]; then
        echo "   Still waiting for deployment... (${WAIT_COUNT}s elapsed)"
    fi
done

if [[ ! -f "${NEW_RELEASE_DIR}/package.json" ]]; then
    echo "❌ Deployment failed: package.json not found after ${MAX_WAIT}s"
    rm -rf "$NEW_RELEASE_DIR"
    exit 1
fi

echo "✅ Application files detected"

# Change to release directory
cd "$NEW_RELEASE_DIR"

# Verify that the application was built (should have .next directory)
if [[ ! -d ".next" ]]; then
    echo "❌ Built application not found (.next directory missing)"
    echo "   Make sure GitHub Actions builds the app before deployment"
    rm -rf "$NEW_RELEASE_DIR"
    exit 1
fi

echo "✅ Built application detected"

# Create permanent symlink to shared .env file
echo "🔗 Creating symlink to shared .env file..."
ln -sf "$ENV_FILE" .env

# Basic smoke test - try to start the app briefly
echo "🧪 Running smoke test..."

# Export essential environment variables for smoke test
export NODE_ENV=production
export DATABASE_URL="file:${DB_FILE}"

# Start the app in background and check if it starts successfully
timeout 30s $BUN_PATH start &
APP_PID=$!
sleep 5

if kill -0 $APP_PID 2>/dev/null; then
    echo "✅ Smoke test passed - application starts successfully"
    kill $APP_PID 2>/dev/null || true
    wait $APP_PID 2>/dev/null || true
else
    echo "❌ Smoke test failed - application failed to start"
    # Clean up and exit
    rm -rf "$NEW_RELEASE_DIR"
    exit 1
fi

# Create or update symlink atomically
echo "🔗 Updating symlink..."
if [[ -L "$CURRENT_LINK" ]]; then
    PREVIOUS_RELEASE=$(readlink "$CURRENT_LINK")
    echo "📋 Previous release: $(basename "$PREVIOUS_RELEASE")"
elif [[ -e "$CURRENT_LINK" ]]; then
    echo "⚠️  Warning: ${CURRENT_LINK} exists but is not a symlink, removing..."
    rm -rf "$CURRENT_LINK"
fi

# Atomic symlink update
ln -sfn "$NEW_RELEASE_DIR" "${CURRENT_LINK}.tmp"
mv -T "${CURRENT_LINK}.tmp" "$CURRENT_LINK"

echo "✅ Symlink updated to point to ${COMMIT_SHA}"

# Handle systemd service
echo "🔄 Managing ${SERVICE_NAME} service..."

# Check if service is enabled, enable it if not
if ! sudo systemctl is-enabled --quiet "$SERVICE_NAME" 2>/dev/null; then
    echo "🔧 Enabling ${SERVICE_NAME} service for first time..."
    sudo systemctl enable "$SERVICE_NAME"
fi

if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
    echo "🔄 Restarting ${SERVICE_NAME} service..."
    sudo systemctl restart "$SERVICE_NAME"

    # Wait a moment and check if service is running
    sleep 3
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "✅ Service restarted successfully"
    else
        echo "❌ Service failed to restart, rolling back..."
        if [[ -n "${PREVIOUS_RELEASE:-}" ]]; then
            ln -sfn "$PREVIOUS_RELEASE" "$CURRENT_LINK"
            sudo systemctl restart "$SERVICE_NAME"
            echo "🔄 Rolled back to previous release"
        fi
        exit 1
    fi
else
    echo "🚀 Starting ${SERVICE_NAME} service..."
    sudo systemctl start "$SERVICE_NAME"
    sleep 3
    if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
        echo "✅ Service started successfully"
    else
        echo "❌ Service failed to start"
        exit 1
    fi
fi

# Clean up old releases (keep last 5)
echo "🧹 Cleaning up old releases..."
cd "$RELEASES_DIR"
ls -1t | tail -n +6 | xargs -r rm -rf
echo "✅ Cleanup completed"

echo ""
echo "🎉 Deployment completed successfully!"
echo "📍 Active release: ${COMMIT_SHA}"
echo "🔗 Symlink: ${CURRENT_LINK} -> ${NEW_RELEASE_DIR}"
echo "🔧 Service: ${SERVICE_NAME} is $(sudo systemctl is-active "$SERVICE_NAME")"
echo ""