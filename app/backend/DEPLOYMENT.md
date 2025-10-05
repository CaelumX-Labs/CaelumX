# CaelumX API Deployment Guide

## 🚀 Quick Deployment Steps

### Step 1: Upload Files to EC2
From your local machine, copy all files to your EC2 server:

```bash
# Copy all deployment files
scp -i your-key.pem setup-server.sh ubuntu@ip-172-31-18-79:~/CaelumX/app/backend/
scp -i your-key.pem deploy.sh ubuntu@ip-172-31-18-79:~/CaelumX/app/backend/
scp -i your-key.pem nginx-api.conf ubuntu@ip-172-31-18-79:~/CaelumX/app/backend/
scp -i your-key.pem ecosystem.config.js ubuntu@ip-172-31-18-79:~/CaelumX/app/backend/
scp -i your-key.pem package.json ubuntu@ip-172-31-18-79:~/CaelumX/app/backend/
scp -i your-key.pem .env ubuntu@ip-172-31-18-79:~/CaelumX/app/backend/
```

### Step 2: SSH into EC2 and Setup Server
```bash
ssh -i your-key.pem ubuntu@ip-172-31-18-79

# Navigate to backend directory
cd ~/CaelumX/app/backend

# Make scripts executable
chmod +x setup-server.sh
chmod +x deploy.sh

# First, setup server dependencies
./setup-server.sh
```

### Step 3: Deploy Application
```bash
# Run the deployment
./deploy.sh
```

## 📋 What Each Script Does

### `setup-server.sh`
- Installs Nginx
- Installs Node.js and Yarn (if not present)
- Installs PM2 process manager
- Configures firewall rules
- Creates necessary directories

### `deploy.sh`
- Builds the TypeScript application
- Runs database migrations
- Configures Nginx reverse proxy
- Starts the app with PM2
- Sets up SSL with your existing certificates

## 🔧 File Structure After Deployment

```
~/CaelumX/app/backend/
├── src/                    # Source code
├── dist/                   # Compiled JavaScript
├── src/prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts            # Database seeding
├── logs/                   # Application logs
├── .env                    # Environment variables
├── package.json           # Updated with correct Prisma paths
├── ecosystem.config.js     # PM2 configuration
├── nginx-api.conf         # Nginx configuration
├── setup-server.sh        # Server setup script
└── deploy.sh              # Deployment script
```

## 🌐 SSL Certificate Requirements

Your SSL certificates should be located at:
- **Certificate**: `/etc/nginx/ssl/certificate.crt`
- **Private Key**: `/etc/nginx/ssl/private.key`

If they're in a different location, update the paths in `nginx-api.conf`.

## 📊 After Deployment

### API Access
- **Production URL**: `https://api.caelum-x.com`
- **Local URL**: `http://localhost:3000`

### Useful Commands
```bash
# View application logs
pm2 logs caelumx-api

# Restart application
pm2 restart caelumx-api

# Monitor application
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/api.caelum-x.com.access.log
sudo tail -f /var/log/nginx/api.caelum-x.com.error.log

# Check service status
pm2 status
sudo systemctl status nginx
```

### Database Management
```bash
# Check database migrations
npx prisma migrate status --schema=src/prisma/schema.prisma

# Run new migrations
npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Seed database (if needed)
npm run prisma:seed
```

## 🔄 Updating Your Application

For future updates:
```bash
# Stop the current application
pm2 stop caelumx-api

# Pull latest code
git pull origin main

# Install new dependencies
yarn install

# Build application
yarn build

# Run migrations (if any)
npx prisma migrate deploy --schema=src/prisma/schema.prisma

# Start application
pm2 start caelumx-api

# Or use the deploy script
./deploy.sh
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kill process on port 3000
   sudo fuser -k 3000/tcp
   ```

2. **Nginx configuration issues**
   ```bash
   # Test nginx config
   sudo nginx -t
   
   # Check nginx status
   sudo systemctl status nginx
   ```

3. **Database connection issues**
   - Check your `.env` file has correct DATABASE_URL
   - Ensure your Supabase database is accessible

4. **PM2 issues**
   ```bash
   # Restart PM2
   pm2 kill
   pm2 start ecosystem.config.js
   ```

### Log Locations
- **Application logs**: `~/CaelumX/app/backend/logs/`
- **PM2 logs**: `pm2 logs caelumx-api`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `sudo journalctl -u nginx`

## 🔐 Security Notes

- Your API will be accessible at `https://api.caelum-x.com`
- SSL/TLS encryption is enabled
- CORS is configured for API access
- Rate limiting is enabled (100 requests/minute)
- Security headers are configured
- Firewall rules allow only necessary ports (22, 80, 443, 3000)

## ✅ Verification

After deployment, test these endpoints:
```bash
# Health check
curl https://api.caelum-x.com/health

# API endpoints (replace with your actual endpoints)
curl https://api.caelum-x.com/api/users
curl https://api.caelum-x.com/api/projects
```
