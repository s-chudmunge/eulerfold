# Production Dockerfile optimized for fast builds
FROM python:3.10-slim

WORKDIR /app

# Environment variables
ENV PYTHONPATH=/app/app \
    PORT=8080 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies (this layer is cached unless system deps change)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy and install Python dependencies FIRST (this layer is cached unless requirements change)
COPY requirements.prod.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code (this changes frequently, so it's last)
COPY app/ ./app/
COPY alembic.ini ./
COPY alembic/ ./alembic/
COPY start_production.sh ./start_production.sh

# Make start script executable
RUN chmod +x ./start_production.sh

# Use fast production startup
CMD ["./start_production.sh"]
