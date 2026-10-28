#!/usr/bin/env bash
set -e

DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDFILE="$DIR/scripts/.backend.pids"

mkdir -p "$DIR/scripts"
rm -f "$PIDFILE"

echo "=== Starting Social Media Backend Microservices (Java 21) ==="
echo "Memory cap: 128MB per service"

# Load environment variables from backend/.env or root .env if present
if [ -f "$DIR/backend/.env" ]; then
    echo "Loading environment from backend/.env..."
    set -a
    # shellcheck disable=SC1091
    source "$DIR/backend/.env"
    set +a
elif [ -f "$DIR/.env" ]; then
    echo "Loading environment from .env..."
    set -a
    # shellcheck disable=SC1091
    source "$DIR/.env"
    set +a
fi

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
    nohup java -Xms64m -Xmx128m -Dserver.port=$port -DMONGODB_URI="$MONGODB_URI" -Dspring.data.mongodb.uri="$MONGODB_URI" -Dazure.storage.connection-string="$AZURE_STORAGE_CONNECTION_STRING" -jar "$jar" > "$logfile" 2>&1 &
    local pid=$!
    disown "$pid" 2>/dev/null || true
    echo "$pid" >> "$PIDFILE"
    echo "  -> PID $pid (logging to $logfile)"
}

start_service "api-gateway" 8080
sleep 2
start_service "presigned-url-service" 8082
sleep 2
start_service "post-writer-service" 8081
sleep 2
start_service "like-unlike-service" 8083
sleep 2
start_service "follow-service" 8084
sleep 2
start_service "comment-service" 8085
sleep 2
start_service "newsfeed-generator-service" 8086
sleep 2
start_service "newsfeed-reader-service" 8087

echo "=== All 8 Microservices Started ==="
echo "Gateway: http://localhost:8080"
echo "To stop all services: ./scripts/stop-backend.sh"
