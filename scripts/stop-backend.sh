#!/usr/bin/env bash

DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PIDFILE="$DIR/scripts/.backend.pids"

echo "=== Stopping Social Media Backend Microservices ==="
if [ -f "$PIDFILE" ]; then
    while IFS= read -r pid; do
        if kill -0 "$pid" 2>/dev/null; then
            echo "Killing PID $pid..."
            kill "$pid" 2>/dev/null || true
        fi
    done < "$PIDFILE"
    rm -f "$PIDFILE"
fi

for port in 8080 8081 8082 8083 8084 8085 8086 8087; do
    fuser -k "${port}/tcp" 2>/dev/null || true
done

echo "=== All Services Stopped ==="

