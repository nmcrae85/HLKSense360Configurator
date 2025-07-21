# HLK2450 mmWave Sensor Configurator

## Overview

This is a comprehensive Home Assistant add-on for configuring and managing HLK-LD2450 mmWave presence sensors. The application provides a sophisticated web interface with real-time sensor visualization, polygon zone creation, and ESPHome integration capabilities. Built as part of the Sense360 project, it offers advanced features beyond standard sensor configuration tools.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern React features
- **Build System**: Vite for fast development and optimized production builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent, modern design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Canvas Rendering**: HTML5 Canvas for real-time sensor visualization and zone drawing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Real-time Communication**: WebSocket server for live sensor data streaming
- **API Design**: RESTful endpoints with WebSocket enhancement for real-time features
- **Development Integration**: Vite middleware integration for seamless development experience

### Database and Storage
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Development Fallback**: In-memory storage implementation for development without database setup
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Session Storage**: PostgreSQL-backed session storage using connect-pg-simple

## Key Components

### Real-time Sensor Communication
- WebSocket server handles live sensor data streaming at 10Hz update rate
- Simulation service provides development-time sensor data for testing
- Multi-device support with device-specific data filtering
- Connection status monitoring and automatic reconnection handling

### Interactive Canvas System
- Real-time target visualization with position, speed, and distance tracking
- Interactive polygon zone creation and editing with precision controls
- Coordinate system conversion between screen and sensor coordinates
- Zone validation with area calculation and overlap detection
- Support for detection and filter zones with visual differentiation

### Configuration Management
- Comprehensive sensor parameter configuration (baud rate, sensitivity, timeouts)
- Preset configuration system for common room types and use cases
- Zone management with create, edit, delete, and validation capabilities
- Import/export functionality for configuration backup and sharing

### ESPHome Integration
- YAML configuration generator for both basic and advanced ESPHome setups
- Home Assistant entity creation with proper device classes and attributes
- Multi-target tracking support with individual entity creation
- Zone-based binary sensors for presence detection

## Data Flow

1. **Sensor Data Ingestion**: Real sensor data flows through UART to ESP32, then via WiFi to the web interface
2. **WebSocket Communication**: Live data streams to connected web clients for real-time visualization
3. **Configuration Updates**: User configuration changes are validated, stored, and can be exported to ESPHome YAML
4. **Zone Processing**: Interactive zone creation updates are validated and stored with geometric calculations
5. **Statistics Aggregation**: Real-time performance metrics are calculated and displayed for monitoring

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React 18, React DOM, React Query for frontend functionality
- **UI Components**: Radix UI primitives, Lucide React icons, class-variance-authority for styling
- **Backend**: Express.js, WebSocket (ws), Drizzle ORM for database operations
- **Database**: PostgreSQL via @neondatabase/serverless with connection pooling
- **Validation**: Zod for runtime type validation and schema definition

### Development Dependencies
- **Build Tools**: Vite, esbuild, TypeScript compiler
- **Code Quality**: ESLint, Prettier (implied by project structure)
- **Replit Integration**: Replit-specific plugins for development environment integration

### Home Assistant Integration
- **Add-on Framework**: Compatible with Home Assistant supervisor architecture
- **Multi-architecture Support**: Docker images for amd64, aarch64, armv7, armhf, i386
- **ESPHome Integration**: Generates compatible YAML configurations for seamless integration

## Deployment Strategy

### Container Architecture
- **Multi-stage Docker Build**: Separate build and runtime stages for optimal image size
- **Architecture Support**: Multi-platform builds supporting ARM and x86 architectures
- **Home Assistant Add-on**: Packaged as Home Assistant Supervisor add-on with proper metadata

### Development Workflow
- **Hot Reload**: Vite development server with hot module replacement
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Database Flexibility**: Automatic fallback to in-memory storage when PostgreSQL unavailable
- **WebSocket Simulation**: Built-in sensor simulation for development without hardware

### Production Considerations
- **Database Requirement**: PostgreSQL database required for production deployment
- **Session Management**: Secure session handling with proper cookie configuration
- **Error Handling**: Comprehensive error boundaries and graceful degradation
- **Performance Optimization**: Build-time optimizations and efficient bundle splitting