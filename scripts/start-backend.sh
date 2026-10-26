#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDFILE="$DIR/scripts/.backend.pids"

mkdir -p "$DIR/scripts"
rm -f "$PIDFILE"

echo "=== Starting Social Media Backend Microservices (Java 21) ==="
echo "Memory cap: 128MB per service"

# Export local defaults if not already present
export MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/social_db}"
export AZURE_STORAGE_CONNECTION_STRING="${AZURE_STORAGE_CONNECTION_STRING:-}"

start_service() {
    local name=$1
    local port=$2
    local jar="$DIR/backend/$name/target/$name-1.0.0-SNAPSHOT.jar"
    local logfile="$DIR/scripts/$name.log"

    if [ ! -f "$jar" ]; then
        echo "Error: $jar not found. Run 'mvn package -DskipTests' first."
        exit 1
    fi

    echo "Starting $name on port $port..."
    java -Xms64m -Xmx128m -Dserver.port=$port -jar "$jar" > "$logfile" 2>&1 &
    local pid=$!
    echo "$pid" >> "$PIDFILE"
    echo "  -> PID $pid (logging to $logfile)"
}

start_service "api-gateway" 8080
start_service "post-writer-service" 8081
start_service "presigned-url-service" 8082
start_service "like-unlike-service" 8083
start_service "follow-service" 8084
start_service "comment-service" 8085
start_service "newsfeed-generator-service" 8086
start_service "newsfeed-reader-service" 8087

echo "=== All 8 Microservices Started ==="
echo "Gateway: http://localhost:8080"
echo "To stop all services: ./scripts/stop-backend.sh"
