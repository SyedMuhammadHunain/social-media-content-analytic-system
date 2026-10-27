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

if [ -z "$AZURE_STORAGE_CONNECTION_STRING" ]; then
    echo "Error: AZURE_STORAGE_CONNECTION_STRING is not set in backend/.env."
    exit 1
fi

CONTAINER="${AZURE_STORAGE_CONTAINER_NAME:-media-assets}"

echo "=== Testing Microsoft Azure Blob Storage Connectivity ==="
echo "Target Container: $CONTAINER"

cd "$DIR/backend"
mvn test -pl presigned-url-service -Dtest=AzureBlobIntegrationTest -Dazure.storage.connection-string="$AZURE_STORAGE_CONNECTION_STRING" -q

echo "=== Azure Blob Storage Connectivity & SAS Verified Successfully ==="
