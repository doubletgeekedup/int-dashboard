#!/bin/bash

# Build script for Integration Dashboard Docker deployment
# Use this script if docker-compose is not available

set -e

echo "Building Integration Dashboard Docker deployment..."

# Build the application image
echo "Building application image..."
docker build -t integration-dashboard:latest .

# Create a network for the containers
echo "Creating Docker network..."
docker network create integration-dashboard-network 2>/dev/null || echo "Network already exists"

# Run PostgreSQL database
echo "Starting PostgreSQL database..."
docker run -d \
  --name integration-dashboard-db \
  --network integration-dashboard-network \
  -e POSTGRES_DB=integration_dashboard \
  -e POSTGRES_USER=dashboard_user \
  -e POSTGRES_PASSWORD=dashboard_password \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  --restart unless-stopped \
  postgres:15-alpine

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

# Check if database is responding
timeout=60
while ! docker exec integration-dashboard-db pg_isready -U dashboard_user -d integration_dashboard >/dev/null 2>&1; do
    timeout=$((timeout - 1))
    if [ $timeout -eq 0 ]; then
        echo "Database connection timeout"
        exit 1
    fi
    echo "Database not ready, waiting..."
    sleep 1
done

echo "Database is ready!"

# Run the application
echo "Starting application..."
docker run -d \
  --name integration-dashboard-app \
  --network integration-dashboard-network \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://dashboard_user:dashboard_password@integration-dashboard-db:5432/integration_dashboard" \
  -e PGHOST=integration-dashboard-db \
  -e PGPORT=5432 \
  -e PGUSER=dashboard_user \
  -e PGPASSWORD=dashboard_password \
  -e PGDATABASE=integration_dashboard \
  -e NODE_ENV=production \
  -e AI_CHAT_ENABLED=false \
  --restart unless-stopped \
  integration-dashboard:latest

echo "Deployment complete!"
echo ""
echo "Services:"
echo "- Application: http://localhost:5000"
echo "- Database: localhost:5432"
echo ""
echo "To stop the deployment:"
echo "  docker stop integration-dashboard-app integration-dashboard-db"
echo ""
echo "To remove the deployment:"
echo "  docker rm integration-dashboard-app integration-dashboard-db"
echo "  docker network rm integration-dashboard-network"
echo "  docker volume rm postgres_data"