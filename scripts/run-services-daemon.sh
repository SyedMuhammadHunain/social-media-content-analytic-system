#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -f "$DIR/backend/.env" ]; then
    set -a
    source "$DIR/backend/.env"
    set +a
fi

export MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/SocialMediaContentAnalysisSystem}"

start_svc() {
    local name=$1
    local port=$2
    local jar="$DIR/backend/$name/target/$name-1.0.0-SNAPSHOT.jar"
    local logfile="$DIR/scripts/$name.log"

    echo "Launching $name on port $port..."
    java -Xms48m -Xmx96m \
        -Dserver.port=$port \
        -DMONGODB_URI="$MONGODB_URI" \
        -Dspring.data.mongodb.uri="$MONGODB_URI" \
        -jar "$jar" > "$logfile" 2>&1 &
}

start_svc "api-gateway" 8080
start_svc "post-writer-service" 8081
start_svc "presigned-url-service" 8082
start_svc "like-unlike-service" 8083
start_svc "follow-service" 8084
start_svc "comment-service" 8085
start_svc "newsfeed-generator-service" 8086
start_svc "newsfeed-reader-service" 8087

echo "All 8 microservices launched. Gateway on port 8080. Holding process..."
wait
