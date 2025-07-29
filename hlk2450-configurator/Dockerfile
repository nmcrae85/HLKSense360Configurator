# ---------- builder ----------
FROM node:18-alpine AS builder

# Install required system packages
RUN apk add --no-cache bash curl git python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies including devDependencies
RUN npm ci --include=dev

# CRITICAL: Make binaries executable and add to PATH
RUN chmod +x ./node_modules/.bin/*
ENV PATH="/app/node_modules/.bin:$PATH"

# Verify binaries are accessible
RUN echo "Checking vite and esbuild installation:" && \
    ls -la ./node_modules/.bin/vite ./node_modules/.bin/esbuild && \
    ./node_modules/.bin/vite --version && \
    ./node_modules/.bin/esbuild --version

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Verify build output exists
RUN test -f dist/index.production.js || (echo "Build failed: dist/index.production.js not found" && exit 1)

# ---------- runtime ----------
FROM node:18-alpine AS runner
RUN apk add --no-cache curl
ENV NODE_ENV=production
ENV PORT=5000
WORKDIR /app

# Install ONLY production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/dist /app/dist

# If the app needs any non-built assets (e.g., public/), copy them too:
COPY --from=builder /app/client/public /app/public

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD curl -fsS http://localhost:5000/health || exit 1

# Labels for Home Assistant
LABEL \
    io.hass.name="HLK2450 mmWave Sensor Configurator" \
    io.hass.description="Advanced ESPHome add-on for HLK2450 mmWave sensor configuration" \
    io.hass.arch="armhf|armv7|aarch64|amd64|i386" \
    io.hass.type="addon" \
    io.hass.version="1.0.9"

# Start the server with the correct path
CMD ["node", "dist/index.production.js"]
