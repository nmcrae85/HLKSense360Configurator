# Docker Build Fix - Version 1.0.9

## Root Cause Analysis

The error `sh: vite: not found` occurred because:

1. **Docker RUN commands with `export PATH` are temporary** - The PATH export only affects that specific RUN command
2. **Alpine Linux's /bin/sh doesn't persist PATH changes** between RUN commands
3. **npm run build couldn't find vite/esbuild** because node_modules/.bin wasn't in PATH

## The Fix

### Before (v1.0.8) - BROKEN:
```dockerfile
RUN export PATH="./node_modules/.bin:$PATH" && \
    sh -c "vite build && ..."
# PATH change is lost here!
RUN npm run build  # <-- vite not found!
```

### After (v1.0.9) - FIXED:
```dockerfile
ENV PATH="/app/node_modules/.bin:$PATH"
# PATH is now permanent for all subsequent commands
RUN npm run build  # <-- vite found!
```

## What Changed

1. **Added ENV PATH directive** after WORKDIR to persist PATH changes
2. **Added verification steps** to test vite/esbuild before build
3. **Added debug output** with `which vite` to confirm PATH resolution
4. **Removed temporary export PATH** commands

## Verification Steps in Dockerfile

```dockerfile
# 1. Verify binaries exist after npm install
RUN ls -l ./node_modules/.bin/vite ./node_modules/.bin/esbuild

# 2. Make binaries executable (Alpine Linux requirement)
RUN chmod +x ./node_modules/.bin/*

# 3. Test binaries work
RUN ./node_modules/.bin/vite --version && ./node_modules/.bin/esbuild --version

# 4. Confirm PATH resolution
RUN which vite && vite --version

# 5. Run build
RUN npm run build
```

## Testing Commands

```bash
# Build the Docker image
docker build -t hlk2450-test:v1.0.9 ./hlk2450-configurator/

# Check build logs for verification steps
# You should see:
# - vite version output
# - esbuild version output  
# - "which vite" showing /app/node_modules/.bin/vite
# - Successful build completion

# Run the container
docker run -p 5000:5000 hlk2450-test:v1.0.9

# Test health endpoint
curl http://localhost:5000/health
```

## Commit Message
```
fix: ensure vite/esbuild binaries are always found during Docker build, resolve PATH issue, robust builder

- Set ENV PATH="/app/node_modules/.bin:$PATH" to persist across RUN commands
- Previous export PATH was only temporary within single RUN command
- Added comprehensive binary verification before build
- Added debug output to confirm PATH resolution
- Fixes "sh: vite: not found" error permanently

Root cause: Docker RUN export PATH is temporary, must use ENV for persistence
```

## Summary

The fix ensures that:
1. ✅ node_modules/.bin is permanently in PATH for all RUN commands
2. ✅ Binaries are verified to exist and be executable
3. ✅ npm run build can always find vite and esbuild
4. ✅ Build process is robust and debuggable