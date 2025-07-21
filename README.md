# HLK2450 Sense360 Configurator Repository

[![GitHub Release][releases-shield]][releases]
[![GitHub Activity][commits-shield]][commits]
[![License][license-shield]](LICENSE)

_Home Assistant add-on repository for HLK2450 mmWave sensor configuration tools._

This repository contains Home Assistant add-ons for configuring and managing HLK-LD2450 mmWave presence sensors, specifically designed for the Sense360 project.

## Add-ons

This repository contains the following add-ons:

### [HLK2450 mmWave Sensor Configurator](./hlk2450-configurator)

![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Supports armhf Architecture][armhf-shield]
![Supports armv7 Architecture][armv7-shield]
![Supports i386 Architecture][i386-shield]

Advanced ESPHome add-on for HLK2450 mmWave sensor configuration with real-time visualization and polygon zone creation.

**Features:**
- 🎯 Real-time sensor visualization with interactive canvas
- 🔧 Interactive polygon zone creation and editing
- 📊 Advanced statistics and performance monitoring  
- 🌐 WebSocket communication for live sensor data
- 📝 ESPHome YAML export (basic and advanced modes)
- 🎨 Modern dark UI optimized for sensor configuration
- 🏠 Seamless Home Assistant integration

<!-- Screenshot will be added after deployment -->

## About

This repository provides Home Assistant add-ons for configuring and managing HLK-LD2450 mmWave presence sensors. Built specifically for the Sense360 project, it offers advanced features beyond standard ESPHome implementations.

## Repository Structure

```
HLKSense360Configurator/
├── README.md                    # This file
├── repository.yaml              # Repository configuration
├── hlk2450-configurator/       # Main add-on
│   ├── config.yaml             # Add-on configuration
│   ├── Dockerfile              # Container definition
│   ├── README.md               # Add-on documentation
│   └── (application files)     # Web app source code
└── LICENSE                     # MIT license
```

## Installation

### Method 1: Add-on Store (Recommended)

1. Navigate in your Home Assistant frontend to **Settings** → **Add-ons** → **Add-on Store**
2. Click the 3-dots menu at top right and select **Repositories**
3. Add this repository URL: `https://github.com/nmcrae85/HLKSense360Configurator`
4. Find "HLK2450 mmWave Sensor Configurator" and click **Install**
5. Start the add-on

### Method 2: Manual Installation

1. Clone this repository
2. Copy the add-on folder to your Home Assistant `addons` directory
3. Restart Home Assistant
4. Install the add-on from the **Local Add-ons** section

## Configuration

### Hardware Setup

Connect your HLK-LD2450 sensor to an ESP32:

```
HLK-LD2450    ESP32
VCC    →      5V
GND    →      GND
TX     →      GPIO17 (RX)
RX     →      GPIO16 (TX)
```

### Add-on Options

```yaml
ssl: false
certfile: fullchain.pem
keyfile: privkey.pem
```

#### Option: `ssl`

Enable SSL/HTTPS for the web interface.

#### Option: `certfile`

SSL certificate file (when SSL is enabled).

#### Option: `keyfile`

SSL private key file (when SSL is enabled).

## Usage

### Getting Started

1. **Connect Sensor**: Use the connection panel to establish communication with your HLK2450 sensor
2. **Configure Zones**: Create detection and filter zones using the interactive canvas
3. **Monitor Live Data**: View real-time target tracking and sensor statistics
4. **Export Configuration**: Generate ESPHome YAML for your Home Assistant setup

### Zone Configuration

- **Detection Zones**: Areas where presence should be detected
- **Filter Zones**: Areas to ignore (e.g., outside windows, moving objects)
- **Polygon Support**: Create custom shaped zones with multiple points
- **Real-time Preview**: See zone effects immediately on live sensor data

### ESPHome Integration

The configurator supports two ESPHome integration modes:

#### Basic Mode
- Uses standard ESPHome LD2450 component
- Rectangular zones only
- Compatible with official ESPHome releases

#### Advanced Mode
- Uses TillFleisch external component
- Full polygon zone support
- Enhanced sensor features

## Technical Specifications

### Sensor Capabilities
- **Detection Range**: Up to 6 meters
- **Detection Angle**: 120° field of view
- **Target Tracking**: Up to 3 simultaneous targets
- **Update Rate**: ~20Hz real-time updates
- **Zones**: Up to 3 configurable zones

### Communication
- **Baud Rate**: 256000 (default), configurable
- **Protocol**: Custom HLK binary protocol
- **Connection**: UART over ESP32

## Troubleshooting

### Common Issues

**Sensor Not Connecting**
- Check wiring connections
- Verify baud rate settings
- Ensure ESP32 is powered and running ESPHome

**WebSocket Errors**
- Refresh the web interface
- Check Home Assistant logs
- Restart the add-on

**Zone Creation Issues**
- Ensure zones have at least 3 points
- Check coordinate ranges (-3000 to 3000mm X, 0 to 6000mm Y)
- Verify zone names are unique

## Support

If you find this add-on useful, please consider:

- ⭐ **Starring** this repository
- 🐛 **Reporting issues** you encounter
- 💡 **Contributing** improvements
- 📝 **Sharing** your configurations

## Contributing

This is an active open-source project. We welcome contributions!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Built for the **Sense360** project
- Inspired by **Everything Smart Home** community
- Uses **HLK-LD2450** mmWave sensor technology
- Powered by **ESPHome** and **Home Assistant**

---

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[armhf-shield]: https://img.shields.io/badge/armhf-yes-green.svg
[armv7-shield]: https://img.shields.io/badge/armv7-yes-green.svg
[commits-shield]: https://img.shields.io/github/commit-activity/y/nmcrae85/HLKSense360Configurator.svg
[commits]: https://github.com/nmcrae85/HLKSense360Configurator/commits/main
[i386-shield]: https://img.shields.io/badge/i386-yes-green.svg
[license-shield]: https://img.shields.io/github/license/nmcrae85/HLKSense360Configurator.svg
[releases-shield]: https://img.shields.io/github/release/nmcrae85/HLKSense360Configurator.svg
[releases]: https://github.com/nmcrae85/HLKSense360Configurator/releases