# Changelog

All notable changes to the HLK2450 mmWave Sensor Configurator add-on will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.10] - 2025-01-29
### Fixed
- Removed non-existent client/public directory from Dockerfile
- Build now completes successfully without cache key error
- Public assets are already included in dist folder from vite build

## [1.0.9] - 2025-01-29
### Fixed
- **CRITICAL FIX**: Set ENV PATH permanently in builder stage to include node_modules/.bin
- Previously PATH export was only temporary within single RUN command
- Now vite/esbuild are always found by npm run build
- Added comprehensive verification steps before build

### Root Cause Analysis
- Docker RUN commands with `export PATH` only affect that specific command
- Solution: Use `ENV PATH="/app/node_modules/.bin:$PATH"` to persist across all RUN commands
- This ensures the shell (/bin/sh in Alpine) always finds vite/esbuild

### Technical Changes
- Added ENV PATH directive after WORKDIR /app
- Added version checks for vite and esbuild before build
- Added `which vite` test to confirm PATH resolution
- Improved debug output for troubleshooting

## [1.0.8] - 2025-01-29
### Fixed
- Resolved exit code 127 by adding proper binary permissions and verification
- Added comprehensive debugging and error checking in Docker build
- Fixed missing system dependencies (python3, make, g++) for native modules
- Ensured binaries are executable with chmod +x
- Added build output verification to catch failures early

### Changed
- Enhanced Dockerfile with debugging steps and verification checks
- Build scripts now use explicit ./node_modules/.bin/ paths
- Added system packages required for building native Node.js modules

### Technical Details
- Exit code 127 was caused by non-executable binaries in Alpine Linux
- Added chmod +x for vite and esbuild before execution
- Verified dist/index.production.js exists after build

## [1.0.7] - 2025-01-29
### Fixed
- Properly implemented multi-stage Docker build with local binaries
- Fixed ERR_MODULE_NOT_FOUND by using ./node_modules/.bin/ paths
- Removed npx dependency, using direct local binaries instead
- Optimized healthcheck timeout for faster startup

### Changed
- Dockerfile now uses local vite/esbuild binaries from node_modules
- Reduced image size by properly separating build and runtime stages
- Added .dockerignore for cleaner build context

## [1.0.6] - 2025-01-29
### Fixed
- Implemented multi-stage Docker build to properly handle devDependencies
- Fixed "vite: not found" error in GitHub Actions build
- Added explicit npx commands to ensure local binaries are used
- Separated builder stage (with devDependencies) from runner stage (production only)

### Changed
- Dockerfile now uses multi-stage build pattern for optimal image size
- Build scripts use npx to ensure local vite and esbuild binaries are found
- Production runtime only includes necessary dependencies

## [1.0.5] - 2025-01-29
### Fixed
- Completely rewrote Dockerfile to eliminate all build errors
- Removed all npm install and build steps for test server
- Test server now runs directly without any dependencies

## [1.0.4] - 2025-01-28
### Added
- Test server for debugging ingress connectivity issues
- Enhanced network debugging in run.sh startup script
- Nginx ingress configuration file for better proxy handling
- Comprehensive troubleshooting guide (CRITICAL_FIX.md)

### Changed
- Temporarily using test server to diagnose blank screen issue
- Version bump to force rebuild in Home Assistant
- Temporarily disabled npm build step to run test server

### Fixed
- Attempting to resolve ingress proxy not reaching add-on
- Fixed build error by temporarily skipping build for test server

## [1.0.3] - 2025-01-21
### Fixed
- Fixed blank page issue in Home Assistant ingress by using relative asset paths
- Changed Vite base configuration to use relative paths (./)
- Improved static file serving for Home Assistant ingress compatibility
- Removed Replit development banner from production builds
- Fixed 404 error in Home Assistant ingress by configuring router with dynamic base path detection
- Updated server to properly serve SPA for ingress URLs (/hassio/ingress/*)
- Fixed deep route navigation with custom location hook that properly strips ingress base path
- Added interval-based location monitoring to handle all navigation scenarios
- Added health check endpoint (/health) for ingress diagnostics
- Added run.sh startup script with enhanced logging for troubleshooting
- Set proper NODE_ENV and PORT environment variables in Dockerfile
- Added ingress_entry configuration to config.yaml

## [1.0.2] - 2025-07-21
### Added
- Automated version synchronization in GitHub Actions workflow
- Release process documentation
- Version automatically read from config.yaml for Docker builds

## [1.0.2] - 2025-01-21
### Fixed
- Fixed ES module error by removing __dirname usage in production build
- Production server now successfully starts in Docker containers
- Simplified static file path resolution to only check valid paths
- Tested and confirmed working in production environment

## [1.0.1] - 2025-01-21

### Fixed
- Fixed production build error where Vite was being imported in production environment
- Created separate production entry point (index.production.ts) to exclude development dependencies
- Updated build process to use production-specific entry point
- Fixed Docker container startup errors related to missing Vite package
- Fixed path resolution error in production build (import.meta.dirname undefined)
- Updated Dockerfile to directly run index.production.js instead of npm start
- Fixed GitHub Actions workflow to build correct version tag (1.0.1)

### Changed
- Repository owner updated from 'wifispray' to 'nmcrae85' in all configuration files
- Updated GitHub Actions workflow to use Personal Access Token (CR_PAT) for authentication
- Improved WebSocket error handling to reduce connection spam in logs
- Modified package.json scripts to use production-specific entry point
- Changed Dockerfile CMD to bypass npm start and run production file directly

### Added
- Created dedicated logger module for consistent logging across environments
- Added production-specific server configuration without development dependencies
- Added __dirname workaround for ES modules in production environment

## [1.0.0] - 2025-01-20

### Added
- Initial release of HLK2450 mmWave Sensor Configurator
- Real-time sensor visualization with WebSocket support
- Interactive polygon zone creation and management
- ESPHome YAML export functionality (basic and advanced modes)
- Statistics dashboard for performance monitoring
- Multi-architecture Docker support (armv7, arm64, amd64)
- Home Assistant add-on integration
- React 18 frontend with TypeScript
- Express.js backend with WebSocket support
- PostgreSQL database with Drizzle ORM (in-memory fallback)
- Tailwind CSS with shadcn/ui components

### Features
- Live sensor data visualization
- Dynamic zone configuration with polygon drawing
- Preset room configurations
- Export to ESPHome-compatible YAML format
- Real-time WebSocket communication
- Responsive web interface
- Dark mode support