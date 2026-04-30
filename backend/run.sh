#!/bin/bash
# Simple backend startup script for development

# Navigate to the backend directory if not already there
cd "$(dirname "$0")"

# Activate virtual environment
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "Error: Virtual environment 'venv' not found. Please create it first."
    exit 1
fi

# Set required environment variables
export PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python

# Run the server
echo "Starting EulerFold Backend on http://localhost:8080..."
uvicorn app.main:app --host 0.0.0.0 --port 8080 --reload
