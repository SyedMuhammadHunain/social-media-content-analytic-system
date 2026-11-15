#!/usr/bin/env bash
set -e

DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== Building SMCAS Microservices JARs for Docker ==="
cd "$DIR/backend"
mvn clean package -DskipTests
cd "$DIR"

echo "=== Starting Docker Compose Microservices Cluster ==="
docker compose up -d --build

echo "=== SMCAS Microservices Running on Port 8080 ==="
echo "Health check: curl -I http://localhost:8080/actuator/health"
