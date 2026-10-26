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

echo "=== Seeding Demo Data on MongoDB Atlas ==="
echo "Target Database: $MONGODB_DATABASE"

export FORCE_RESEED=true
cd "$DIR/backend"
mvn test -pl post-writer-service -Dtest=MongoAtlasDatabaseSeederTest -q
echo "=== Atlas Data Seeding Completed Successfully ==="
