#!/bin/bash

echo "🔍 CaelumX Backend Health Check"
echo "================================"

# Check if backend is running
echo "📡 Checking backend status..."
curl -f http://localhost:3000/health || echo "❌ Backend not responding"

# Check database connection
echo "🗄️ Checking database..."
sudo -u postgres psql -d caelumx -c "SELECT 1;" > /dev/null && echo "✅ Database OK" || echo "❌ Database issue"

# Check Redis
echo "📦 Checking Redis..."
redis-cli ping > /dev/null && echo "✅ Redis OK" || echo "❌ Redis issue"

# Check disk space
echo "💾 Checking disk space..."
df -h

# Check memory
echo "🧠 Checking memory..."
free -h

echo "================================"
echo "Health check completed!"
