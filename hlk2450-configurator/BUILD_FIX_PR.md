# GitHub Actions Build Fix - v1.0.6

## Problem
The GitHub Actions build was failing with:
```
sh: vite: not found
ERROR: process "/bin/sh -c npm run build" did not complete successfully: exit code: 127
```

## Root Cause
The previous Dockerfile wasn't installing devDependencies during the build stage, so `vite` and `esbuild` were not available when running `npm run build`.

## Solution
Implemented a multi-stage Docker build:
1. **Builder stage**: Installs all dependencies (including devDependencies) and runs the build
2. **Runner stage**: Only includes production dependencies for a smaller final image

## Changes Made
1. **Dockerfile**: Complete rewrite with multi-stage build pattern
   - Builder stage uses `npm ci --include=dev` to ensure vite/esbuild are available
   - Runner stage uses `npm ci --omit=dev` for production-only deps
   - Added `npx` prefix to ensure local binaries are used

2. **package.json**: Updated build scripts to use `npx vite` and `npx esbuild`

3. **Version**: Bumped to 1.0.6

## Commit Message
```
fix: v1.0.6 - Fix GitHub Actions build failure with multi-stage Dockerfile

- Implement multi-stage Docker build to properly handle devDependencies
- Fix "vite: not found" error by ensuring devDeps are installed during build
- Use npx to ensure local binaries are found
- Optimize final image size by excluding devDeps from runtime

Fixes #build-error
```

## Testing
The build will now:
1. Install all dependencies (including vite/esbuild) in builder stage
2. Run the build successfully
3. Create a smaller runtime image with only production deps
4. Push to GHCR with tags: main, latest, 1.0.6