#!/usr/bin/env bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}Checking prerequisites for Notes Application...${NC}"
echo ""

ALL_OK=true

# Check Docker
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "${GREEN}Docker is installed: $DOCKER_VERSION${NC}"
else
    echo -e "${RED}Docker is NOT installed${NC}"
    echo "  Please install Docker from: https://docs.docker.com/get-docker/"
    ALL_OK=false
fi

# Check Docker Compose
COMPOSE_AVAILABLE=false
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "${GREEN}Docker Compose is installed: $COMPOSE_VERSION${NC}"
    COMPOSE_AVAILABLE=true
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_VERSION=$(docker compose version)
    echo -e "${GREEN}Docker Compose is installed: $COMPOSE_VERSION${NC}"
    COMPOSE_AVAILABLE=true
else
    echo -e "${RED}Docker Compose is NOT installed${NC}"
    echo "  Please install Docker Compose from: https://docs.docker.com/compose/install/"
    ALL_OK=false
fi

# Check if Docker daemon is running (only if Docker is installed)
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        echo -e "${GREEN}Docker daemon is running${NC}"
    else
        echo -e "${RED}Docker daemon is NOT running${NC}"
        echo "  Please start Docker Desktop or Docker daemon"
        ALL_OK=false
    fi
fi

# Check ports availability
echo ""
echo -e "${CYAN}Checking port availability...${NC}"

check_port() {
    local port=$1
    # Try lsof first, fallback to ss or netstat
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
            echo -e "${YELLOW}Port $port is already in use${NC}"
            lsof -Pi :$port -sTCP:LISTEN 2>/dev/null | head -n 2
            return 1
        else
            echo -e "${GREEN}Port $port is available${NC}"
            return 0
        fi
    elif command -v ss &> /dev/null; then
        if ss -lnt | grep -q ":$port "; then
            echo -e "${YELLOW}Port $port is already in use${NC}"
            ss -lntp | grep ":$port " 2>/dev/null || echo "  (process info unavailable)"
            return 1
        else
            echo -e "${GREEN}Port $port is available${NC}"
            return 0
        fi
    else
        echo -e "${YELLOW}Cannot check port $port (lsof/ss not available)${NC}"
        return 0
    fi
}

PORTS_OK=true

check_port 4200 || PORTS_OK=false
check_port 3000 || PORTS_OK=false
check_port 5432 || PORTS_OK=false

echo ""
if [ "$ALL_OK" = true ]; then
    if [ "$PORTS_OK" = true ]; then
        echo -e "${GREEN}All prerequisites met! You can run the application.${NC}"
    else
        echo -e "${YELLOW}Some ports are in use, but continuing anyway...${NC}"
        echo -e "   Docker will handle port conflicts or the application may fail to start."
    fi
    echo ""
    echo "To start the application, run:"
    echo "  ./start.sh"
    exit 0
else
    echo -e "${RED}Some prerequisites are missing. Please install them first.${NC}"
    exit 1
fi
