# IMMEDIATE FIX FOR PRODUCTION BUILD

## The Problem:
Your Docker container keeps failing because it's trying to load the OLD build file (dist/index.js) which has Vite imports.

## The Solution (Already Applied):
1. Created new production-only server file without Vite
2. Updated package.json to build from index.production.ts
3. Fixed Dockerfile to run the correct file
4. Fixed path resolution issue in production

## CRITICAL STEPS TO COMPLETE:

### 1. Push to GitHub NOW:
```bash
git add .
git commit -m "CRITICAL FIX: Production build without Vite v1.0.1"
git push
```

### 2. After GitHub Actions completes (5-10 min):
- Uninstall the add-on in Home Assistant
- Reload repositories (Settings → Add-ons → Three dots → Reload)
- Install fresh

## What Changed:
- `hlk2450-configurator/server/index.production.ts` - New production server
- `hlk2450-configurator/Dockerfile` - Now runs index.production.js directly
- `hlk2450-configurator/package.json` - Build creates index.production.js
- `.github/workflows/build.yml` - Builds version 1.0.1

The production build is now completely separate from development and has NO Vite dependencies.