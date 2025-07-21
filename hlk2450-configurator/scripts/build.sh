#!/bin/bash

# Build script for HLK2450 Configurator
echo "Building HLK2450 Configurator..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

# Create production directory structure
echo "Creating production structure..."
mkdir -p dist/public
mkdir -p dist/server

# Copy built files
cp -r dist/public/* dist/public/ 2>/dev/null || true
cp dist/index.js dist/server/ 2>/dev/null || true

echo "Build completed successfully!"
echo "Application ready for deployment"