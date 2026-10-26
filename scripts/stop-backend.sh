#!/usr/bin/env bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDFILE="$DIR/scripts/.backend.pids"

if [ ! -f "$PIDFILE" ]; then
    echo "No running backend found (PID file missing: $PIDFILE)"
    exit 0
fi

echo "=== Stopping Social Media Backend Microservices ==="
while IFS= read -r pid; do
    if kill -0 "$pid" 2>/dev/null; then
        echo "Killing PID $pid..."
        kill "$pid" 2>/dev/null || true
    fi
done < "$PIDFILE"

rm -f "$PIDFILE"
echo "=== All Services Stopped ==="
