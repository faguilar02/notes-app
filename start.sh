#!/usr/bin/env bash

set -euo pipefail

echo "Starting Notes Application..."
echo ""

# Run prerequisites check if available
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/check-prerequisites.sh" ]; then
    echo "Running prerequisites check..."
    if ! "$SCRIPT_DIR/check-prerequisites.sh"; then
        echo ""
        echo "Prerequisites check failed. Please fix the issues above and try again."
        exit 1
    fi
    echo ""
fi

# Determine which Docker Compose command to use
COMPOSE_CMD="docker compose"
if ! $COMPOSE_CMD version &> /dev/null 2>&1; then
    if command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        echo "Docker Compose is not installed. Please install Docker Compose first."
        echo "   Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
fi

echo "Using: $COMPOSE_CMD"
echo ""

# Check if .env file exists
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo ".env file not found!"
    echo ""
    echo "Please create it from the template:"
    echo "  cp .env.example .env"
    echo ""
    echo "Then edit .env and set your own credentials."
    exit 1
fi

# Stop any running containers
echo "Stopping any running containers..."
$COMPOSE_CMD down

# Build and start all services
echo "Building and starting services..."
$COMPOSE_CMD up --build -d

# Wait for database to be healthy
echo "Waiting for database to be ready..."
MAX_WAIT=60
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    DB_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' notes-db 2>/dev/null || echo "starting")
    if [ "$DB_HEALTH" = "healthy" ]; then
        echo "Database is healthy"
        break
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

if [ "$DB_HEALTH" != "healthy" ]; then
    echo "Database healthcheck timeout, but continuing..."
fi

# Wait for backend to respond
echo "Waiting for backend to be ready..."
MAX_WAIT=60
ELAPSED=0
while [ $ELAPSED -lt $MAX_WAIT ]; do
    if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
        echo "Backend is responding"
        break
    fi
    sleep 2
    ELAPSED=$((ELAPSED + 2))
done

# Show status
echo ""
echo "Application is ready!"
echo ""
echo "Services Status:"
$COMPOSE_CMD ps
echo ""
echo "Access the application at:"
echo "   - Frontend: http://localhost:4200"
echo "   - Backend:  http://localhost:3000"
echo "   - Database: localhost:5432"
echo ""
echo "To view logs, run: $COMPOSE_CMD logs -f"
echo "To stop the application, run: $COMPOSE_CMD down"
echo ""
