# Use Node.js official Alpine image
FROM node:18-alpine

# Install bash and other required packages
RUN apk add --no-cache bash curl

# Set working directory
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy all application files
COPY . .

# Build the application
RUN npm run build

# Remove devDependencies to reduce image size
RUN npm prune --production

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000 || exit 1

# Labels for Home Assistant
LABEL \
    io.hass.name="HLK2450 mmWave Sensor Configurator" \
    io.hass.description="Advanced ESPHome add-on for HLK2450 mmWave sensor configuration" \
    io.hass.arch="armhf|armv7|aarch64|amd64|i386" \
    io.hass.type="addon" \
    io.hass.version="1.0.0"

# Start the application with production script
CMD ["node", "dist/index.production.js"]