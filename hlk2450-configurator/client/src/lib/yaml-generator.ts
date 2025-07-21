import { SensorConfiguration, Zone } from "@/types/sensor";

export class YAMLGenerator {
  static generateBasicConfig(config: SensorConfiguration): string {
    const yaml = `# ESPHome Configuration for Sense360 HLK2450 mmWave Sensor
# Generated on ${new Date().toISOString()}

esphome:
  name: ${this.sanitizeName(config.name)}
  friendly_name: "${config.name}"

esp32:
  board: esp32dev

# WiFi Configuration
wifi:
  ssid: "Your_WiFi_SSID"
  password: "Your_WiFi_Password"
  
  # Enable fallback hotspot (captive portal) in case wifi connection fails
  ap:
    ssid: "${this.sanitizeName(config.name)} Fallback Hotspot"
    password: "ConfigMe123"

captive_portal:

# Enable logging
logger:
  level: INFO

# Enable Home Assistant API
api:
  encryption:
    key: "your-32-char-encryption-key-here=="

# Enable Over-The-Air updates
ota:
  password: "your-ota-password-here"

# Web server for diagnostics
web_server:
  port: 80

# UART Configuration for HLK-LD2450
uart:
  id: uart_ld2450
  tx_pin: GPIO17
  rx_pin: GPIO16
  baud_rate: ${config.baudRate}
  parity: NONE
  stop_bits: 1
  data_bits: 8

# HLK-LD2450 mmWave Sensor Configuration
ld2450:
  id: ld2450_radar
  uart_id: uart_ld2450
  throttle: 1000ms

# Binary Sensors
binary_sensor:
  - platform: ld2450
    ld2450_id: ld2450_radar
    has_target:
      name: "Presence Detected"
      device_class: occupancy
    has_moving_target:
      name: "Moving Target"
      device_class: motion
    has_still_target:
      name: "Still Target"
      device_class: occupancy

# Sensor Data
sensor:
  # WiFi Signal Strength
  - platform: wifi_signal
    name: "WiFi Signal Strength"
    update_interval: 60s

  # Device Uptime
  - platform: uptime
    name: "Uptime"

  # Target Tracking Sensors
  - platform: ld2450
    ld2450_id: ld2450_radar
${this.generateTargetSensors()}

# Configuration Numbers
number:
  - platform: ld2450
    ld2450_id: ld2450_radar
    presence_timeout:
      name: "Presence Timeout"
      initial_value: ${config.presenceTimeout}
      min_value: 1
      max_value: 30
      unit_of_measurement: "s"
      mode: box
      step: 1
${this.generateZoneNumbers(config.zones)}

# Switches
switch:
  - platform: ld2450
    ld2450_id: ld2450_radar
    bluetooth:
      name: "Bluetooth"
      initial_value: ${config.bluetoothEnabled}
    multi_target:
      name: "Multi Target Tracking"
      initial_value: ${config.multiTargetEnabled}

# Select Controls
select:
  - platform: ld2450
    ld2450_id: ld2450_radar
    baud_rate:
      name: "Baud Rate"
      options:
        - "9600"
        - "19200"
        - "38400"
        - "57600"
        - "115200"
        - "230400"
        - "256000"
        - "460800"
      initial_option: "${config.baudRate}"
    zone_type:
      name: "Zone Type"
      options:
        - "Disabled"
        - "Detection"
        - "Filter"

# Diagnostic Sensors
text_sensor:
  - platform: wifi_info
    ip_address:
      name: "IP Address"
    ssid:
      name: "Connected SSID"
    bssid:
      name: "Connected BSSID"
    mac_address:
      name: "Mac Address"

# Device Status LED (Optional)
status_led:
  pin:
    number: GPIO2
    inverted: false

# Restart Button
button:
  - platform: restart
    name: "Restart Device"
`;

    return yaml;
  }

  static generateAdvancedConfig(config: SensorConfiguration): string {
    const yaml = `# Advanced ESPHome Configuration with Polygon Zone Support
# Using TillFleisch/ESPHome-HLK-LD2450 external component
# Generated on ${new Date().toISOString()}

esphome:
  name: ${this.sanitizeName(config.name)}
  friendly_name: "${config.name}"

esp32:
  board: esp32dev

# External Components for Advanced Features
external_components:
  - source: github://TillFleisch/ESPHome-HLK-LD2450@main
    components: [ ld2450 ]

# WiFi Configuration
wifi:
  ssid: "Your_WiFi_SSID"
  password: "Your_WiFi_Password"

# API & OTA
api:
  encryption:
    key: "your-32-char-encryption-key-here=="

ota:
  password: "your-ota-password-here"

logger:
  level: INFO

web_server:
  port: 80

# UART Configuration
uart:
  id: uart_ld2450
  tx_pin: GPIO17
  rx_pin: GPIO16
  baud_rate: ${config.baudRate}

# Advanced LD2450 Configuration
ld2450:
  id: ld2450_radar
  uart_id: uart_ld2450
  flip_x_axis: false
  fast_off_detection: true
  max_detection_distance:
    name: "Max Detection Distance"
    initial_value: ${config.maxDetectionDistance / 1000}m
  max_distance_margin: 30cm
  
  # Advanced controls
  restart_button:
    name: "Restart Sensor"
  factory_reset_button:
    name: "Factory Reset Sensor"
  
  occupancy:
    name: "Room Occupancy"
  target_count:
    name: "Active Target Count"
  
  tracking_mode_switch:
    name: "Multiple Target Tracking"
    initial_value: ${config.multiTargetEnabled}
  bluetooth_switch:
    name: "Sensor Bluetooth"
    initial_value: ${config.bluetoothEnabled}

# Polygon Zone Definitions
${this.generatePolygonZones(config.zones)}

# Binary Sensors
binary_sensor:
  - platform: ld2450
    ld2450_id: ld2450_radar
    has_target:
      name: "Presence Detected"
    has_moving_target:
      name: "Moving Target"
    has_still_target:
      name: "Still Target"

# Advanced Sensor Data
sensor:
  - platform: ld2450
    ld2450_id: ld2450_radar
${this.generateAdvancedTargetSensors()}
`;

    return yaml;
  }

  private static generateTargetSensors(): string {
    let yaml = '';
    
    for (let i = 1; i <= 3; i++) {
      yaml += `    target_${i}:
      x:
        name: "Target ${i} X Coordinate"
        unit_of_measurement: "mm"
        device_class: distance
      y:
        name: "Target ${i} Y Coordinate"
        unit_of_measurement: "mm"
        device_class: distance
      speed:
        name: "Target ${i} Speed"
        unit_of_measurement: "cm/s"
      angle:
        name: "Target ${i} Angle"
        unit_of_measurement: "°"
      distance:
        name: "Target ${i} Distance"
        unit_of_measurement: "mm"
        device_class: distance
`;
      
      if (i < 3) yaml += '\n';
    }
    
    return yaml;
  }

  private static generateZoneNumbers(zones: Zone[]): string {
    let yaml = '';
    
    // Generate zone configurations for up to 3 zones (HLK2450 limitation)
    for (let i = 1; i <= Math.min(3, zones.length); i++) {
      const zone = zones[i - 1];
      
      // For rectangular zones, use the bounding box
      const bounds = this.getZoneBounds(zone);
      
      yaml += `    zone_${i}:
      x1:
        name: "${zone.name} X1"
        initial_value: ${bounds.x1}
        min_value: -3000
        max_value: 3000
        unit_of_measurement: "mm"
        mode: box
        step: 10
      y1:
        name: "${zone.name} Y1"
        initial_value: ${bounds.y1}
        min_value: 0
        max_value: 6000
        unit_of_measurement: "mm"
        mode: box
        step: 10
      x2:
        name: "${zone.name} X2"
        initial_value: ${bounds.x2}
        min_value: -3000
        max_value: 3000
        unit_of_measurement: "mm"
        mode: box
        step: 10
      y2:
        name: "${zone.name} Y2"
        initial_value: ${bounds.y2}
        min_value: 0
        max_value: 6000
        unit_of_measurement: "mm"
        mode: box
        step: 10
`;
      
      if (i < Math.min(3, zones.length)) yaml += '\n';
    }
    
    return yaml;
  }

  private static generatePolygonZones(zones: Zone[]): string {
    let yaml = '# Polygon Zones Configuration\n';
    
    zones.forEach((zone, index) => {
      yaml += `# Zone ${index + 1}: ${zone.name} (${zone.type})\n`;
      yaml += `polygon:\n`;
      yaml += `  - name: "${zone.name}"\n`;
      yaml += `    points:\n`;
      
      zone.points.forEach(point => {
        yaml += `      - [${point.x}, ${point.y}]\n`;
      });
      
      yaml += `    detection_mode: ${zone.type === 'detection' ? 'include' : 'exclude'}\n`;
      yaml += `    enabled: ${zone.enabled}\n\n`;
    });
    
    return yaml;
  }

  private static generateAdvancedTargetSensors(): string {
    let yaml = '';
    
    for (let i = 1; i <= 3; i++) {
      yaml += `    target_${i}:
      x:
        name: "Target ${i} X"
        filters:
          - filter_out: nan
          - throttle: 100ms
      y:
        name: "Target ${i} Y"
        filters:
          - filter_out: nan
          - throttle: 100ms
      speed:
        name: "Target ${i} Speed"
        filters:
          - filter_out: nan
      angle:
        name: "Target ${i} Angle"
        filters:
          - filter_out: nan
      distance:
        name: "Target ${i} Distance"
        filters:
          - filter_out: nan
      resolution:
        name: "Target ${i} Resolution"
        filters:
          - filter_out: nan
`;
      
      if (i < 3) yaml += '\n';
    }
    
    return yaml;
  }

  private static getZoneBounds(zone: Zone): { x1: number, y1: number, x2: number, y2: number } {
    if (zone.points.length === 0) {
      return { x1: 0, y1: 0, x2: 1000, y2: 1000 };
    }
    
    const xs = zone.points.map(p => p.x);
    const ys = zone.points.map(p => p.y);
    
    return {
      x1: Math.min(...xs),
      y1: Math.min(...ys),
      x2: Math.max(...xs),
      y2: Math.max(...ys),
    };
  }

  private static sanitizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }
}
