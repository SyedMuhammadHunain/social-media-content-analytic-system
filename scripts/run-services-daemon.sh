#!/usr/bin/env bash
set -e

DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDFILE="$DIR/scripts/.backend.pids"
mkdir -p "$DIR/scripts"
rm -f "$PIDFILE"

if [ -f "$DIR/backend/.env" ]; then
    set -a
    source "$DIR/backend/.env"
    set +a
fi

export MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/SocialMediaContentAnalysisSystem}"
export AZURE_STORAGE_CONNECTION_STRING="${AZURE_STORAGE_CONNECTION_STRING:-}"

cleanup() {
    echo "Stopping all microservices..."
    if [ -f "$PIDFILE" ]; then
        while IFS= read -r pid; do
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
            fi
        done < "$PIDFILE"
        rm -f "$PIDFILE"
    fi
}
trap cleanup SIGINT SIGTERM

start_svc() {
    local name=$1
    local port=$2
    local jar="$DIR/backend/$name/target/$name-1.0.0-SNAPSHOT.jar"
    local logfile="$DIR/scripts/$name.log"

    echo "Launching $name on port $port..."
    java -Xms64m -Xmx256m \
        -Dserver.port=$port \
        -DMONGODB_URI="$MONGODB_URI" \
        -Dspring.data.mongodb.uri="$MONGODB_URI" \
        -Dazure.storage.connection-string="$AZURE_STORAGE_CONNECTION_STRING" \
        -jar "$jar" > "$logfile" 2>&1 &
    local pid=$!
    echo "$pid" >> "$PIDFILE"
}

start_svc "api-gateway" 8080
sleep 2
start_svc "presigned-url-service" 8082
sleep 2
start_svc "post-writer-service" 8081
sleep 2
start_svc "like-unlike-service" 8083
sleep 2
start_svc "follow-service" 8084
sleep 2
start_svc "comment-service" 8085
sleep 2
start_svc "newsfeed-generator-service" 8086
sleep 2
start_svc "newsfeed-reader-service" 8087

echo "All 8 microservices launched. Gateway on port 8080. Holding process..."
wait
