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

echo "=== Wiping and Initializing Schema on MongoDB Atlas ==="
echo "Target Database: $MONGODB_DATABASE"

export CONFIRM_ATLAS_WIPE=true
cd "$DIR/backend"
mvn test -pl post-writer-service -Dtest=MongoAtlasSchemaInitializerTest -q
echo "=== Schema Wipe & Index Initialization Finished Successfully ==="
