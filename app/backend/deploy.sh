#!/bin/bash

# Deployment Script for CaelumX API
echo "🚀 Deploying CaelumX API to api.caelum-x.com..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Set working directory
cd /home/ubuntu/CaelumX/app/backend

print_header "Pre-deployment Checks"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check if Yarn is installed
if ! command -v yarn &> /dev/null; then
    print_error "Yarn is not installed"
    exit 1
fi

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_status "Installing PM2..."
    npm install -g pm2
fi

print_header "Building Application"

# Install dependencies
print_status "Installing dependencies..."
yarn install --production=false

# Build the application
print_status "Building TypeScript..."
yarn build

if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not found"
    exit 1
fi

print_header "Database Setup"

# Run Prisma migrations
print_status "Running database migrations..."
npx prisma migrate deploy

# Generate Prisma client
print_status "Generating Prisma client..."
npx prisma generate

print_header "Nginx Configuration"

# Copy nginx configuration
print_status "Setting up Nginx configuration..."
sudo cp nginx-api.conf /etc/nginx/sites-available/api.caelum-x.com
sudo ln -sf /etc/nginx/sites-available/api.caelum-x.com /etc/nginx/sites-enabled/

# Test nginx configuration
print_status "Testing Nginx configuration..."
sudo nginx -t

if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed"
    exit 1
fi

print_header "Process Management"

# Stop existing PM2 process if running
print_status "Stopping existing processes..."
pm2 stop caelumx-api 2>/dev/null || true
pm2 delete caelumx-api 2>/dev/null || true

# Start the application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu

print_header "Service Restart"

# Reload Nginx
print_status "Reloading Nginx..."
sudo systemctl reload nginx

# Check if services are running
print_status "Checking service status..."
pm2 status
sudo systemctl status nginx --no-pager -l

print_header "Deployment Complete"

print_status "🎉 Deployment successful!"
print_status "API is now available at: https://api.caelum-x.com"
print_status ""
print_status "Useful commands:"
print_status "  - View logs: pm2 logs caelumx-api"
print_status "  - Restart app: pm2 restart caelumx-api"
print_status "  - Monitor: pm2 monit"
print_status "  - Nginx logs: sudo tail -f /var/log/nginx/api.caelum-x.com.access.log"
