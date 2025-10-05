#!/bin/bash

# Quick deployment script for EC2 server
# Run this on your EC2 server after uploading all files

echo "🚀 CaelumX API Quick Deployment"
echo "================================"

# Make scripts executable
chmod +x setup-server.sh deploy.sh

echo "✅ Scripts made executable"

# Check if this is the first run
if ! command -v nginx &> /dev/null; then
    echo "🔧 First time setup detected. Running server setup..."
    ./setup-server.sh
    
    if [ $? -ne 0 ]; then
        echo "❌ Server setup failed. Please check the output above."
        exit 1
    fi
    
    echo "✅ Server setup completed!"
fi

echo "🚀 Running deployment..."
./deploy.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Deployment successful!"
    echo "📱 Your API is now available at: https://api.caelum-x.com"
    echo ""
    echo "🔧 Useful commands:"
    echo "  pm2 logs caelumx-api    # View logs"
    echo "  pm2 restart caelumx-api # Restart app"
    echo "  pm2 monit               # Monitor app"
else
    echo "❌ Deployment failed. Please check the output above."
    exit 1
fi
