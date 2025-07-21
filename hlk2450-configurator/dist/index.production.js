// server/index.production.ts
import express from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
var MemStorage = class {
  sensorConfigs;
  sensorDataMap;
  presets;
  currentConfigId;
  currentDataId;
  currentPresetId;
  constructor() {
    this.sensorConfigs = /* @__PURE__ */ new Map();
    this.sensorDataMap = /* @__PURE__ */ new Map();
    this.presets = /* @__PURE__ */ new Map();
    this.currentConfigId = 1;
    this.currentDataId = 1;
    this.currentPresetId = 1;
    this.initializeDefaultPresets();
  }
  initializeDefaultPresets() {
    const defaultPresets = [
      {
        name: "Living Room",
        roomType: "living_room",
        description: "Standard living room configuration with seating area detection",
        configuration: {
          name: "Living Room Sensor",
          deviceId: "living_room_001",
          baudRate: 256e3,
          presenceTimeout: 5,
          maxDetectionDistance: 4e3,
          sensitivity: 7,
          multiTargetEnabled: true,
          bluetoothEnabled: false,
          zones: [
            {
              id: "zone_1",
              name: "Seating Area",
              type: "detection",
              color: "#3b82f6",
              points: [
                { x: -1500, y: 1e3 },
                { x: 1500, y: 1e3 },
                { x: 1500, y: 3e3 },
                { x: -1500, y: 3e3 }
              ],
              enabled: true
            }
          ]
        },
        isDefault: true
      },
      {
        name: "Bedroom",
        roomType: "bedroom",
        description: "Bedroom configuration optimized for sleep detection",
        configuration: {
          name: "Bedroom Sensor",
          deviceId: "bedroom_001",
          baudRate: 256e3,
          presenceTimeout: 10,
          maxDetectionDistance: 3e3,
          sensitivity: 6,
          multiTargetEnabled: false,
          bluetoothEnabled: false,
          zones: [
            {
              id: "zone_1",
              name: "Bed Area",
              type: "detection",
              color: "#8b5cf6",
              points: [
                { x: -800, y: 800 },
                { x: 800, y: 800 },
                { x: 800, y: 2e3 },
                { x: -800, y: 2e3 }
              ],
              enabled: true
            }
          ]
        },
        isDefault: true
      },
      {
        name: "Kitchen",
        roomType: "kitchen",
        description: "Kitchen configuration with cooking area detection",
        configuration: {
          name: "Kitchen Sensor",
          deviceId: "kitchen_001",
          baudRate: 256e3,
          presenceTimeout: 3,
          maxDetectionDistance: 3500,
          sensitivity: 8,
          multiTargetEnabled: true,
          bluetoothEnabled: false,
          zones: [
            {
              id: "zone_1",
              name: "Cooking Area",
              type: "detection",
              color: "#f59e0b",
              points: [
                { x: -1e3, y: 500 },
                { x: 1e3, y: 500 },
                { x: 1e3, y: 2e3 },
                { x: -1e3, y: 2e3 }
              ],
              enabled: true
            }
          ]
        },
        isDefault: true
      }
    ];
    defaultPresets.forEach((preset) => {
      const id = this.currentPresetId++;
      this.presets.set(id, { ...preset, id });
    });
  }
  async getSensorConfiguration(deviceId) {
    return this.sensorConfigs.get(deviceId);
  }
  async createSensorConfiguration(config) {
    const id = this.currentConfigId++;
    const now = /* @__PURE__ */ new Date();
    const record = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.sensorConfigs.set(config.deviceId, record);
    return record;
  }
  async updateSensorConfiguration(deviceId, config) {
    const existing = this.sensorConfigs.get(deviceId);
    if (!existing) {
      throw new Error(`Sensor configuration not found for device: ${deviceId}`);
    }
    const updated = {
      ...existing,
      ...config,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.sensorConfigs.set(deviceId, updated);
    return updated;
  }
  async deleteSensorConfiguration(deviceId) {
    this.sensorConfigs.delete(deviceId);
    this.sensorDataMap.delete(deviceId);
  }
  async getAllSensorConfigurations() {
    return Array.from(this.sensorConfigs.values());
  }
  async getLatestSensorData(deviceId) {
    const dataArray = this.sensorDataMap.get(deviceId);
    if (!dataArray || dataArray.length === 0) return void 0;
    return dataArray[dataArray.length - 1];
  }
  async createSensorData(data) {
    const id = this.currentDataId++;
    const record = {
      ...data,
      id,
      timestamp: /* @__PURE__ */ new Date()
    };
    const existingData = this.sensorDataMap.get(data.deviceId) || [];
    existingData.push(record);
    if (existingData.length > 1e3) {
      existingData.splice(0, existingData.length - 1e3);
    }
    this.sensorDataMap.set(data.deviceId, existingData);
    return record;
  }
  async getSensorDataHistory(deviceId, limit = 100) {
    const dataArray = this.sensorDataMap.get(deviceId) || [];
    return dataArray.slice(-limit);
  }
  async getAllPresets() {
    return Array.from(this.presets.values());
  }
  async getPreset(id) {
    return this.presets.get(id);
  }
  async createPreset(preset) {
    const id = this.currentPresetId++;
    const record = {
      ...preset,
      id
    };
    this.presets.set(id, record);
    return record;
  }
  async deletePreset(id) {
    this.presets.delete(id);
  }
};
var storage = new MemStorage();

// server/services/sensor-communication.ts
import { EventEmitter } from "events";
var SensorCommunicationService = class extends EventEmitter {
  connectedSensors = /* @__PURE__ */ new Map();
  simulationInterval;
  isSimulating = false;
  constructor() {
    super();
    this.startSimulation();
  }
  startSimulation() {
    if (this.isSimulating) return;
    this.isSimulating = true;
    const mockDeviceId = "hlk2450_dev_001";
    this.connectedSensors.set(mockDeviceId, {
      deviceId: mockDeviceId,
      connected: true,
      firmwareVersion: "V2.02.23090617",
      lastUpdate: Date.now()
    });
    this.emit("sensor_status", {
      type: "sensor_status",
      data: this.connectedSensors.get(mockDeviceId)
    });
    this.simulationInterval = setInterval(() => {
      this.simulateSensorData(mockDeviceId);
    }, 100);
  }
  simulateSensorData(deviceId) {
    const now = Date.now();
    const targets = [];
    const targetCount = Math.random() > 0.7 ? 0 : Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < targetCount; i++) {
      const baseAngle = i * 120 + Math.sin(now / 2e3) * 30;
      const distance = 1500 + Math.sin(now / 3e3 + i) * 800;
      const speed = Math.abs(Math.sin(now / 1e3 + i)) * 50;
      const x = Math.cos(baseAngle * Math.PI / 180) * distance;
      const y = Math.sin(baseAngle * Math.PI / 180) * distance + 1e3;
      targets.push({
        id: i + 1,
        x: Math.round(x),
        y: Math.round(Math.abs(y)),
        // Ensure positive Y
        speed: Math.round(speed),
        angle: Math.round(baseAngle),
        distance: Math.round(distance),
        resolution: Math.round(50 + Math.random() * 50),
        isMoving: speed > 5
      });
    }
    const hasTarget = targets.length > 0;
    const hasMovingTarget = targets.some((t) => t.isMoving);
    const hasStillTarget = targets.some((t) => !t.isMoving);
    const status = this.connectedSensors.get(deviceId);
    if (status) {
      status.lastUpdate = now;
      this.connectedSensors.set(deviceId, status);
    }
    this.emit("sensor_data", {
      type: "sensor_data",
      data: {
        deviceId,
        targets,
        hasTarget,
        hasMovingTarget,
        hasStillTarget,
        timestamp: now
      }
    });
  }
  getConnectedSensors() {
    return Array.from(this.connectedSensors.values());
  }
  getSensorStatus(deviceId) {
    return this.connectedSensors.get(deviceId);
  }
  async connectToSensor(deviceId, baudRate = 256e3) {
    this.connectedSensors.set(deviceId, {
      deviceId,
      connected: true,
      firmwareVersion: "V2.02.23090617",
      lastUpdate: Date.now()
    });
    this.emit("sensor_status", {
      type: "sensor_status",
      data: this.connectedSensors.get(deviceId)
    });
    return true;
  }
  async disconnectSensor(deviceId) {
    this.connectedSensors.delete(deviceId);
    this.emit("sensor_status", {
      type: "sensor_status",
      data: {
        deviceId,
        connected: false,
        lastUpdate: Date.now()
      }
    });
  }
  async configureSensor(deviceId, config) {
    this.emit("configuration_update", {
      type: "configuration_update",
      data: config
    });
    return true;
  }
  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = void 0;
    }
    this.isSimulating = false;
  }
  destroy() {
    this.stopSimulation();
    this.removeAllListeners();
    this.connectedSensors.clear();
  }
};
var sensorService = new SensorCommunicationService();

// server/services/yaml-generator.ts
var YAMLGeneratorService = class {
  generateESPHomeConfig(config) {
    const yaml = `# ESPHome Configuration for Sense360 HLK2450 mmWave Sensor
# Generated on ${(/* @__PURE__ */ new Date()).toISOString()}

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
  generateTargetSensors() {
    let yaml = "";
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
        unit_of_measurement: "\xB0"
      distance:
        name: "Target ${i} Distance"
        unit_of_measurement: "mm"
        device_class: distance
`;
      if (i < 3) yaml += "\n";
    }
    return yaml;
  }
  generateZoneNumbers(zones) {
    let yaml = "";
    for (let i = 1; i <= Math.min(3, zones.length); i++) {
      const zone = zones[i - 1];
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
      if (i < Math.min(3, zones.length)) yaml += "\n";
    }
    return yaml;
  }
  getZoneBounds(zone) {
    if (zone.points.length === 0) {
      return { x1: 0, y1: 0, x2: 1e3, y2: 1e3 };
    }
    const xs = zone.points.map((p) => p.x);
    const ys = zone.points.map((p) => p.y);
    return {
      x1: Math.min(...xs),
      y1: Math.min(...ys),
      x2: Math.max(...xs),
      y2: Math.max(...ys)
    };
  }
  sanitizeName(name) {
    return name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
  }
  generateAdvancedConfig(config) {
    const yaml = `# Advanced ESPHome Configuration with Polygon Zone Support
# Using TillFleisch/ESPHome-HLK-LD2450 external component
# Generated on ${(/* @__PURE__ */ new Date()).toISOString()}

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
    initial_value: ${config.maxDetectionDistance / 1e3}m
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
  generatePolygonZones(zones) {
    let yaml = "# Polygon Zones Configuration\n";
    zones.forEach((zone, index) => {
      yaml += `# Zone ${index + 1}: ${zone.name} (${zone.type})
`;
      yaml += `polygon:
`;
      yaml += `  - name: "${zone.name}"
`;
      yaml += `    points:
`;
      zone.points.forEach((point) => {
        yaml += `      - [${point.x}, ${point.y}]
`;
      });
      yaml += `    detection_mode: ${zone.type === "detection" ? "include" : "exclude"}
`;
      yaml += `    enabled: ${zone.enabled}

`;
    });
    return yaml;
  }
  generateAdvancedTargetSensors() {
    let yaml = "";
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
      if (i < 3) yaml += "\n";
    }
    return yaml;
  }
};
var yamlGenerator = new YAMLGeneratorService();

// shared/schema.ts
import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var sensorConfigurations = pgTable("sensor_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  deviceId: text("device_id").notNull().unique(),
  firmwareVersion: text("firmware_version"),
  baudRate: integer("baud_rate").default(256e3),
  presenceTimeout: integer("presence_timeout").default(5),
  maxDetectionDistance: integer("max_detection_distance").default(4e3),
  sensitivity: integer("sensitivity").default(7),
  multiTargetEnabled: boolean("multi_target_enabled").default(true),
  bluetoothEnabled: boolean("bluetooth_enabled").default(false),
  zones: jsonb("zones").$type().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var sensorData = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  targets: jsonb("targets").$type().default([]),
  hasTarget: boolean("has_target").default(false),
  hasMovingTarget: boolean("has_moving_target").default(false),
  hasStillTarget: boolean("has_still_target").default(false),
  timestamp: timestamp("timestamp").defaultNow()
});
var presetConfigurations = pgTable("preset_configurations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  roomType: text("room_type").notNull(),
  description: text("description"),
  configuration: jsonb("configuration").$type(),
  isDefault: boolean("is_default").default(false)
});
var pointSchema = z.object({
  x: z.number().min(-3e3).max(3e3),
  y: z.number().min(0).max(6e3)
});
var zoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["detection", "filter"]),
  color: z.string(),
  points: z.array(pointSchema).min(3),
  // Polygon zones need at least 3 points
  enabled: z.boolean().default(true)
});
var targetSchema = z.object({
  id: z.number(),
  x: z.number(),
  y: z.number(),
  speed: z.number(),
  angle: z.number(),
  distance: z.number(),
  resolution: z.number().optional(),
  isMoving: z.boolean()
});
var sensorConfigurationSchema = z.object({
  name: z.string().min(1),
  deviceId: z.string().min(1),
  firmwareVersion: z.string().optional(),
  baudRate: z.number().default(256e3),
  presenceTimeout: z.number().min(1).max(30).default(5),
  maxDetectionDistance: z.number().min(100).max(6e3).default(4e3),
  sensitivity: z.number().min(1).max(10).default(7),
  multiTargetEnabled: z.boolean().default(true),
  bluetoothEnabled: z.boolean().default(false),
  zones: z.array(zoneSchema).default([])
});
var insertSensorConfigurationSchema = createInsertSchema(sensorConfigurations, {
  zones: zoneSchema.array()
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSensorDataSchema = createInsertSchema(sensorData, {
  targets: targetSchema.array()
}).omit({
  id: true,
  timestamp: true
});
var insertPresetConfigurationSchema = createInsertSchema(presetConfigurations, {
  configuration: sensorConfigurationSchema
}).omit({
  id: true
});
var webSocketMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("sensor_data"),
    data: z.object({
      deviceId: z.string(),
      targets: targetSchema.array(),
      hasTarget: z.boolean(),
      hasMovingTarget: z.boolean(),
      hasStillTarget: z.boolean(),
      timestamp: z.number()
    })
  }),
  z.object({
    type: z.literal("sensor_status"),
    data: z.object({
      deviceId: z.string(),
      connected: z.boolean(),
      firmwareVersion: z.string().optional(),
      lastUpdate: z.number()
    })
  }),
  z.object({
    type: z.literal("configuration_update"),
    data: sensorConfigurationSchema
  }),
  z.object({
    type: z.literal("error"),
    data: z.object({
      message: z.string(),
      code: z.string().optional()
    })
  })
]);

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  const wss2 = new WebSocketServer({
    server: httpServer,
    path: "/ws"
  });
  const connectedClients = /* @__PURE__ */ new Set();
  wss2.on("connection", (ws) => {
    console.log("WebSocket client connected");
    connectedClients.add(ws);
    let isAlive = true;
    ws.on("pong", () => {
      isAlive = true;
    });
    const pingInterval = setInterval(() => {
      if (!isAlive) {
        ws.terminate();
        return;
      }
      isAlive = false;
      ws.ping();
    }, 3e4);
    const sensors = sensorService.getConnectedSensors();
    sensors.forEach((sensor) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: "sensor_status",
          data: sensor
        }));
      }
    });
    ws.on("close", () => {
      console.log("WebSocket client disconnected");
      clearInterval(pingInterval);
      connectedClients.delete(ws);
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clearInterval(pingInterval);
      connectedClients.delete(ws);
    });
  });
  sensorService.on("sensor_data", (message) => {
    if (message.type === "sensor_data") {
      storage.createSensorData({
        deviceId: message.data.deviceId,
        targets: message.data.targets,
        hasTarget: message.data.hasTarget,
        hasMovingTarget: message.data.hasMovingTarget,
        hasStillTarget: message.data.hasStillTarget
      }).catch(console.error);
    }
    const messageStr = JSON.stringify(message);
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  });
  sensorService.on("sensor_status", (message) => {
    const messageStr = JSON.stringify(message);
    connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  });
  app2.get("/api/sensors", async (req, res) => {
    try {
      const configs = await storage.getAllSensorConfigurations();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensor configurations" });
    }
  });
  app2.get("/api/sensors/:deviceId", async (req, res) => {
    try {
      const config = await storage.getSensorConfiguration(req.params.deviceId);
      if (!config) {
        return res.status(404).json({ error: "Sensor configuration not found" });
      }
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensor configuration" });
    }
  });
  app2.post("/api/sensors", async (req, res) => {
    try {
      const configData = insertSensorConfigurationSchema.parse(req.body);
      const config = await storage.createSensorConfiguration(configData);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid configuration data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create sensor configuration" });
    }
  });
  app2.put("/api/sensors/:deviceId", async (req, res) => {
    try {
      const configData = insertSensorConfigurationSchema.partial().parse(req.body);
      const config = await storage.updateSensorConfiguration(req.params.deviceId, configData);
      await sensorService.configureSensor(req.params.deviceId, config);
      res.json(config);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid configuration data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update sensor configuration" });
    }
  });
  app2.delete("/api/sensors/:deviceId", async (req, res) => {
    try {
      await storage.deleteSensorConfiguration(req.params.deviceId);
      await sensorService.disconnectSensor(req.params.deviceId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sensor configuration" });
    }
  });
  app2.get("/api/sensors/:deviceId/data", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const data = await storage.getSensorDataHistory(req.params.deviceId, limit);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensor data" });
    }
  });
  app2.get("/api/sensors/:deviceId/data/latest", async (req, res) => {
    try {
      const data = await storage.getLatestSensorData(req.params.deviceId);
      if (!data) {
        return res.status(404).json({ error: "No sensor data found" });
      }
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest sensor data" });
    }
  });
  app2.get("/api/sensors/:deviceId/yaml", async (req, res) => {
    try {
      const config = await storage.getSensorConfiguration(req.params.deviceId);
      if (!config) {
        return res.status(404).json({ error: "Sensor configuration not found" });
      }
      const advanced = req.query.advanced === "true";
      const yaml = advanced ? yamlGenerator.generateAdvancedConfig(config) : yamlGenerator.generateESPHomeConfig(config);
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Content-Disposition", `attachment; filename="${config.name.replace(/[^a-zA-Z0-9]/g, "_")}.yaml"`);
      res.send(yaml);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate YAML configuration" });
    }
  });
  app2.get("/api/presets", async (req, res) => {
    try {
      const presets = await storage.getAllPresets();
      res.json(presets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presets" });
    }
  });
  app2.get("/api/presets/:id", async (req, res) => {
    try {
      const preset = await storage.getPreset(parseInt(req.params.id));
      if (!preset) {
        return res.status(404).json({ error: "Preset not found" });
      }
      res.json(preset);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch preset" });
    }
  });
  app2.post("/api/presets", async (req, res) => {
    try {
      const presetData = insertPresetConfigurationSchema.parse(req.body);
      const preset = await storage.createPreset(presetData);
      res.status(201).json(preset);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid preset data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create preset" });
    }
  });
  app2.delete("/api/presets/:id", async (req, res) => {
    try {
      await storage.deletePreset(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete preset" });
    }
  });
  app2.post("/api/sensors/:deviceId/connect", async (req, res) => {
    try {
      const { baudRate } = req.body;
      const success = await sensorService.connectToSensor(req.params.deviceId, baudRate);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to connect to sensor" });
    }
  });
  app2.post("/api/sensors/:deviceId/disconnect", async (req, res) => {
    try {
      await sensorService.disconnectSensor(req.params.deviceId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to disconnect sensor" });
    }
  });
  app2.post("/api/sensors/:deviceId/calibrate", async (req, res) => {
    try {
      res.json({ success: true, message: "Calibration started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start calibration" });
    }
  });
  app2.post("/api/sensors/:deviceId/factory-reset", async (req, res) => {
    try {
      res.json({ success: true, message: "Factory reset initiated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate factory reset" });
    }
  });
  return httpServer;
}

// server/index.production.ts
import path from "path";
import fs from "fs";
import { WebSocketServer as WebSocketServer2 } from "ws";
import http from "http";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "GET, PUT, PATCH, POST, DELETE");
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    }
    if (res.statusCode >= 500) {
      log(`${req.method} ${path2} ${res.statusCode} in ${duration}ms`, "error");
    }
  });
  next();
});
var server = http.createServer(app);
var wss = new WebSocketServer2({ server });
wss.on("connection", (ws) => {
  console.log("WebSocket client connected");
  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    ws.send(message.toString());
  });
  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
});
registerRoutes(app);
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${message}`, "error");
  res.status(status).json({ message });
  throw err;
});
var __dirname = path.dirname(new URL(import.meta.url).pathname);
var distPath = path.resolve(__dirname, "..", "..", "dist", "public");
if (!fs.existsSync(distPath)) {
  log(`Warning: Could not find build directory: ${distPath}`);
  const altPath = path.resolve(__dirname, "..", "client", "dist");
  if (fs.existsSync(altPath)) {
    app.use(express.static(altPath));
    app.use("*", (req, res) => {
      res.sendFile(path.join(altPath, "index.html"));
    });
  }
} else {
  app.use(express.static(distPath));
  app.use("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
var PORT = parseInt(process.env.PORT || "5000", 10);
server.listen(PORT, "0.0.0.0", () => {
  log(`serving on port ${PORT}`);
});
