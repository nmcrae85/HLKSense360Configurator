# Changelog

All notable changes to the HLK2450 mmWave Sensor Configurator add-on will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
