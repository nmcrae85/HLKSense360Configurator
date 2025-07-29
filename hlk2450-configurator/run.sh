#!/usr/bin/env bash
set -e

# This script is used by Home Assistant to start the add-on
echo "Starting HLK2450 Configurator..."
echo "Environment:"
echo "  NODE_ENV=${NODE_ENV}"
echo "  PORT=${PORT}"
echo "  PWD=$(pwd)"
echo "  Ingress path: ${SUPERVISOR_INGRESS_PATH:-not set}"
echo "  Ingress port: ${SUPERVISOR_INGRESS_PORT:-not set}"

# Debug network
echo "Network configuration:"
ip addr show 2>/dev/null || echo "ip command not available"
echo "Listening on all interfaces (0.0.0.0:5000)"

# Check if built files exist
if [ ! -f "dist/index.production.js" ]; then
    echo "Error: Built files not found. Building now..."
    npm run build
fi

if [ ! -d "dist/public" ]; then
    echo "Error: Static files not found in dist/public"
    exit 1
fi

echo "Starting server on 0.0.0.0:5000..."
exec node dist/index.production.js