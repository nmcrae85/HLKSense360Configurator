# Docker Build Test Commands

## Test the Docker build locally:

```bash
# Build the image
docker build -t hlk2450-test ./hlk2450-configurator/

# Run the container
docker run -p 5000:5000 hlk2450-test

# Test health endpoint
curl http://localhost:5000/health
```

## What was fixed in v1.0.8:

1. **Exit code 127 root cause**: Alpine Linux doesn't mark npm-installed binaries as executable by default
2. **Solution**: Added `chmod +x` for binaries and proper PATH export
3. **Added system packages**: python3, make, g++ for native Node.js modules
4. **Build verification**: Added checks to ensure dist/index.production.js exists
5. **Debugging output**: Added verbose logging to diagnose issues

## Build process now:
1. Installs all devDependencies with `npm ci --include=dev`
2. Makes binaries executable with `chmod +x`
3. Exports PATH to include node_modules/.bin
4. Runs build with sh -c for proper shell interpretation
5. Verifies output exists before proceeding

## Runtime:
- Only production dependencies
- Copies built artifacts from builder stage
- Runs from dist/index.production.js