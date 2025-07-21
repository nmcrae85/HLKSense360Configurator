ARG BUILD_FROM=ghcr.io/hassio-addons/base-nodejs:0.2.3
FROM $BUILD_FROM

# Set shell
SHELL ["/bin/bash", "-o", "pipefail", "-c"]

# Install additional dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    make \
    g++ \
    git

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Create start script
RUN echo '#!/bin/bash' > /app/run.sh && \
    echo 'echo "Starting HLK2450 Configurator..."' >> /app/run.sh && \
    echo 'cd /app' >> /app/run.sh && \
    echo 'npm start' >> /app/run.sh && \
    chmod +x /app/run.sh

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000 || exit 1

# Labels
LABEL \
    io.hass.name="HLK2450 mmWave Sensor Configurator" \
    io.hass.description="Advanced ESPHome add-on for HLK2450 mmWave sensor configuration" \
    io.hass.arch="armhf|armv7|aarch64|amd64|i386" \
    io.hass.type="addon" \
    io.hass.version="1.0.0"

# Start the application
CMD ["/app/run.sh"]