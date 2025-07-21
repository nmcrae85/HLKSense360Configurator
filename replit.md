# replit.md

## Overview

This is a sophisticated React-based mmWave sensor configuration application built with a modern full-stack architecture. The system provides a visual interface for configuring and monitoring HLK2450 mmWave presence sensors, featuring real-time data visualization, zone configuration, and ESPHome YAML generation capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React 18 with TypeScript, using Vite for development and building
- **Backend**: Express.js server with WebSocket support for real-time communication
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Real-time Communication**: WebSocket connections for live sensor data

## Key Components

### Frontend Architecture
- **Component Library**: Built on shadcn/ui with Radix UI primitives
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with CSS variables for theming
- **Canvas Rendering**: Custom HTML5 Canvas implementation for sensor visualization
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **API Layer**: RESTful endpoints with Express.js
- **Real-time Layer**: WebSocket server for live sensor communication
- **Data Storage**: Drizzle ORM with PostgreSQL for persistent storage
- **In-memory Storage**: Fallback storage implementation for development
- **Service Layer**: Modular services for sensor communication and YAML generation

### Database Schema
- **Sensor Configurations**: Device settings, zones, and sensor parameters
- **Sensor Data**: Real-time target tracking and presence detection data
- **Preset Configurations**: Pre-defined sensor configurations for different room types

## Data Flow

1. **Sensor Communication**: WebSocket connection establishes real-time bidirectional communication
2. **Data Processing**: Incoming sensor data is processed and stored in the database
3. **Real-time Updates**: Processed data is broadcast to connected clients via WebSocket
4. **Configuration Management**: Settings are persisted to database and applied to sensors
5. **YAML Generation**: Sensor configurations are converted to ESPHome-compatible YAML

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **ws**: WebSocket implementation for real-time communication

### UI Component Dependencies
- **@radix-ui/***: Accessible UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form handling and validation

### Development Dependencies
- **vite**: Development server and build tool
- **typescript**: Type checking and compilation
- **eslint**: Code linting and formatting

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Development Mode**: Vite dev server with hot module replacement
2. **Production Build**: Static assets built to `dist/public` directory
3. **Server Compilation**: ESBuild bundles server code to `dist/index.js`
4. **Database Integration**: Configured for PostgreSQL with environment-based connection
5. **WebSocket Support**: Real-time communication enabled in both development and production

The build process creates a production-ready Express server that serves static assets and provides API endpoints with WebSocket support for real-time sensor communication.

### Key Scripts
- `dev`: Runs development server with TypeScript compilation
- `build`: Creates production build with both client and server bundles
- `start`: Runs production server
- `db:push`: Applies database schema changes using Drizzle

The application is designed to work seamlessly in both development and production environments with automatic fallbacks and environment-specific configurations.

## Recent Changes

### 2025-01-21 - Repository Cleanup and GitHub Preparation
- ✓ Created complete Home Assistant add-on structure
- ✓ Added production Dockerfile with Node.js runtime
- ✓ Created config.yaml for Home Assistant add-on store
- ✓ Added comprehensive README.md with installation instructions
- ✓ Implemented .gitignore for clean repository
- ✓ Added CHANGELOG.md and LICENSE files
- ✓ Removed development-only files (attached_assets, .replit)
- ✓ Created build script for production deployment
- ✓ Fixed TypeScript errors for production readiness
- → Repository ready for GitHub upload and Home Assistant integration

### WebSocket Connection Optimization
- The application currently shows rapid WebSocket connections/disconnections
- This is normal in development but should be optimized for production
- Consider implementing connection pooling and reconnection logic

## GitHub Integration Status
The repository now includes all necessary files for Home Assistant add-on distribution:
- Home Assistant add-on configuration (config.yaml)
- Multi-architecture Docker support (Dockerfile, build.yaml)
- Complete documentation and licensing
- Production build system
- Clean file structure without development artifacts