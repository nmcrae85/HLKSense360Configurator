# HLK2450 mmWave Sensor Configurator

This is the main add-on for the HLK2450 Sense360 Configurator repository.

## Overview

Advanced ESPHome add-on for HLK2450 mmWave sensor configuration with real-time visualization, polygon zone creation, and Sense360 project integration. Built with React, TypeScript, Express.js, and WebSocket for real-time sensor communication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

- **Frontend**: React 18 with TypeScript, Vite build system
- **Backend**: Express.js with WebSocket support  
- **Database**: PostgreSQL with Drizzle ORM (in-memory fallback)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Real-time**: WebSocket bidirectional sensor communication

## Key Features

- Real-time mmWave sensor visualization
- Interactive polygon zone creation
- ESPHome YAML export (basic + advanced)
- Statistics dashboard and performance monitoring
- Home Assistant add-on integration
- Multi-architecture Docker support

## Final Repository Structure

The repository is now properly structured for Home Assistant add-on compliance:

```
HLKSense360Configurator/
├── README.md                    # Repository overview
├── repository.yaml              # HA repository config
├── LICENSE                      # MIT license
└── hlk2450-configurator/       # Main add-on directory
    ├── config.yaml             # Add-on configuration
    ├── Dockerfile              # Multi-arch container
    ├── build.yaml              # Build configuration
    ├── README.md               # Add-on documentation
    ├── CHANGELOG.md            # Version history
    ├── package.json            # Dependencies
    ├── client/                 # React frontend
    ├── server/                 # Express backend
    ├── shared/                 # Type definitions
    └── scripts/                # Build scripts
```

## Deployment Status

✅ **Repository Structure**: Compliant with Home Assistant add-on standards
✅ **Container Configuration**: Multi-architecture Docker support
✅ **Documentation**: Complete README and installation guides
✅ **Build System**: Production-ready build configuration
✅ **GitHub Integration**: Repository URL configured for wifispray/HLKSense360Configurator

The add-on is ready for installation via Home Assistant add-on store using:
`https://github.com/wifispray/HLKSense360Configurator`