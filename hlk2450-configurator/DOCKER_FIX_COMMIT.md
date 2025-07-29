# Docker Build Fix - Version 1.0.7

## Changes Made

1. **Dockerfile** - Complete rewrite with proper multi-stage build:
   - Builder stage: Uses `npm ci --include=dev` and local binaries (`./node_modules/.bin/`)
   - Runtime stage: Uses `npm ci --omit=dev` for production-only deps
   - Fixed ERR_MODULE_NOT_FOUND by using local vite/esbuild binaries

2. **package.json** - Removed npx from build script

3. **.dockerignore** - Added to exclude unnecessary files from build context

4. **Version** - Bumped to 1.0.7

5. **CHANGELOG.md** - Added entry for v1.0.7

## Commit Message
```
fix(docker): proper multi-stage build; use local vite/esbuild; slim runtime image (v1.0.7)

- Fix ERR_MODULE_NOT_FOUND by using ./node_modules/.bin/ paths
- Properly separate builder (with devDeps) and runtime (prod only) stages
- Remove npx dependency for more reliable builds
- Add .dockerignore for cleaner build context
- Optimize healthcheck timeout

Fixes GitHub Actions build failure
```

## Git Commands
```bash
git add .
git commit -m "fix(docker): proper multi-stage build; use local vite/esbuild; slim runtime image (v1.0.7)"
git push origin main
```

## Expected Result
- GitHub Actions will build successfully
- Image will be pushed to GHCR with tags: main, latest, 1.0.7
- No more "vite: not found" errors