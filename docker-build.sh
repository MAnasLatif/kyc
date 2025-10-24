#!/bin/bash
set -e

echo "🐳 Building Docker image..."

# Load environment variables
export $(grep -v '^#' .env | xargs)

# Build the Docker image
docker build -t ${DOCKER_IMAGE:-kyc-app:test} .

echo "✅ Docker image built successfully!"
echo ""
echo "To run the container, execute:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the container:"
echo "  docker-compose down"
