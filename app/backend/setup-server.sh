#!/bin/bash

# Server Setup Script for CaelumX API
echo "🔧 Setting up server dependencies for CaelumX API..."

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

# Check if running as root for system packages
check_sudo() {
    if ! sudo -n true 2>/dev/null; then
        print_error "This script requires sudo access. Please run with sudo or ensure passwordless sudo is configured."
        exit 1
    fi
}

print_header "System Dependencies Setup"

# Update system packages
print_status "Updating system packages..."
sudo apt update

# Install Nginx
print_status "Installing Nginx..."
sudo apt install -y nginx

# Install Node.js and npm if not present
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install Yarn if not present
if ! command -v yarn &> /dev/null; then
    print_status "Installing Yarn..."
    npm install -g yarn
fi

# Install PM2 globally
print_status "Installing PM2..."
sudo npm install -g pm2

print_header "Nginx Setup"

# Create nginx directories if they don't exist
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Enable nginx service
print_status "Enabling Nginx service..."
sudo systemctl enable nginx
sudo systemctl start nginx

# Check if SSL certificates exist
if [ ! -f "/etc/nginx/ssl/certificate.crt" ] || [ ! -f "/etc/nginx/ssl/private.key" ]; then
    print_warning "SSL certificates not found at expected locations:"
    print_warning "  - /etc/nginx/ssl/certificate.crt"
    print_warning "  - /etc/nginx/ssl/private.key"
    print_warning "Please ensure your SSL certificates are in the correct location."
fi

print_header "Firewall Configuration"

# Configure UFW firewall
print_status "Configuring firewall..."
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 3000    # Node.js app (for direct access if needed)

print_status "✅ Server setup completed!"
print_status "Now you can run the deployment script: ./deploy.sh"
