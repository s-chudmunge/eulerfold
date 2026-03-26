#!/bin/bash

# Production CI/CD Safe Startup - Preserves All User Data

echo "Starting EulerFold Backend - Production Mode..."

# Direct database connection - no proxy needed
export PYTHONPATH=${PYTHONPATH:-$(pwd)/app}

# Start FastAPI in production mode
echo "Starting FastAPI application..."
# Use PORT environment variable from Cloud Run (defaults to 8080 for local testing)
export PORT=${PORT:-8080}
echo "Starting server on port $PORT"
exec python -m uvicorn main:app --host 0.0.0.0 --port $PORT