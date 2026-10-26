#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Source backend/.env if present
if [ -f "$DIR/backend/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    source "$DIR/backend/.env"
    set +a
fi

if [ -z "$MONGODB_URI" ]; then
    echo "Error: MONGODB_URI is not set. Please configure backend/.env."
    exit 1
fi

echo "=== Testing MongoDB Atlas Cloud Connectivity ==="
echo "Target Cluster: $MONGODB_CLUSTER"
echo "Target Database: $MONGODB_DATABASE"

cd "$DIR/backend"
mvn test -pl post-writer-service -Dtest=MongoAtlasHealthCheckTest -q
echo "=== Atlas Connectivity Test Completed Successfully ==="
