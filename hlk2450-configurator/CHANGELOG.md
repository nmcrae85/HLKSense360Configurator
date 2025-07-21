# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-01-21

### Added
- Initial release of HLK2450 mmWave Sensor Configurator
- Real-time sensor visualization with interactive canvas
- Polygon zone creation and editing capabilities
- WebSocket-based live sensor communication
- Comprehensive sensor statistics and performance monitoring
- ESPHome YAML export (basic and advanced modes)
- Dark theme optimized interface
- Home Assistant add-on integration
- Support for HLK-LD2450 sensor with 256000 baud rate
- Multi-target tracking (up to 3 targets)
- Zone validation and area calculation
- Preset configuration management
- Calibration and factory reset functions

### Features
- **Sensor Canvas**: Interactive visualization of detection zones and live targets
- **Zone Management**: Create, edit, and delete detection and filter zones
- **Real-time Data**: Live target tracking with position, speed, and distance
- **Statistics Dashboard**: Performance metrics and connection monitoring
- **Configuration Export**: Generate ESPHome YAML for Home Assistant integration
- **Responsive Design**: Optimized for desktop and mobile devices
- **WebSocket API**: Real-time bidirectional communication with sensors

### Technical
- Built with React 18 and TypeScript
- Express.js backend with WebSocket server
- Tailwind CSS with shadcn/ui components
- Drizzle ORM with PostgreSQL support
- In-memory storage fallback for development
- Vite build system with hot module replacement
- TanStack Query for state management

### Supported Architectures
- amd64
- aarch64
- armv7
- armhf
- i386

### Requirements
- Home Assistant 2023.1 or newer
- ESP32 with ESPHome
- HLK-LD2450 mmWave sensor
- Network connectivity for WebSocket communication