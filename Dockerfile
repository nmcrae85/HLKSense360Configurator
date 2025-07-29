# TEMPORARY: Simple test Dockerfile to debug ingress
FROM node:18-alpine

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Copy only the test server (no npm install needed)
COPY test-server.js .

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Labels for Home Assistant
LABEL \
    io.hass.name="HLK2450 mmWave Sensor Configurator" \
    io.hass.description="Test server for debugging ingress" \
    io.hass.arch="armhf|armv7|aarch64|amd64|i386" \
    io.hass.type="addon" \
    io.hass.version="1.0.4"

# Run test server directly
CMD ["node", "test-server.js"]
