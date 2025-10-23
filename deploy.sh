#!/bin/bash

echo "🔧 Fixing SQLite Database Error..."
echo "=================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required variables"
    exit 1
fi

# Stop existing container
echo "📦 Stopping existing containers..."
docker-compose down

# Rebuild image
echo "🏗️  Building Docker image..."
docker build -t kyc-app:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

# Start services
echo "🚀 Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "❌ Failed to start services!"
    exit 1
fi

# Wait for container to be ready
echo "⏳ Waiting for container to start..."
sleep 5

# Check if container is running
if [ "$(docker-compose ps -q app)" ]; then
    echo "✅ Container is running!"
    
    # Show logs
    echo ""
    echo "📋 Recent logs:"
    docker-compose logs --tail=20 app
    
    echo ""
    echo "✅ Deployment complete!"
    echo "📊 Check status: docker-compose ps"
    echo "📋 View logs: docker-compose logs -f app"
    echo "🔍 Check database: docker-compose exec app ls -la /app/data/"
else
    echo "❌ Container failed to start!"
    echo "📋 Checking logs..."
    docker-compose logs app
    exit 1
fi
