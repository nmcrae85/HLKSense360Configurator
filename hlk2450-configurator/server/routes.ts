import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { sensorService } from "./services/sensor-communication";
import { yamlGenerator } from "./services/yaml-generator";
import { 
  insertSensorConfigurationSchema, 
  insertSensorDataSchema,
  insertPresetConfigurationSchema,
  webSocketMessageSchema,
  type WebSocketMessage 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time sensor communication
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  const connectedClients = new Set<WebSocket>();

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    connectedClients.add(ws);

    // Send initial sensor status to new client
    const sensors = sensorService.getConnectedSensors();
    sensors.forEach(sensor => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'sensor_status',
          data: sensor
        }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      connectedClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });
  });

  // Broadcast sensor events to all connected clients
  sensorService.on('sensor_data', (message: WebSocketMessage) => {
    // Store sensor data
    if (message.type === 'sensor_data') {
      storage.createSensorData({
        deviceId: message.data.deviceId,
        targets: message.data.targets,
        hasTarget: message.data.hasTarget,
        hasMovingTarget: message.data.hasMovingTarget,
        hasStillTarget: message.data.hasStillTarget,
      }).catch(console.error);
    }

    // Broadcast to clients
    const messageStr = JSON.stringify(message);
    connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  });

  sensorService.on('sensor_status', (message: WebSocketMessage) => {
    const messageStr = JSON.stringify(message);
    connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  });

  // REST API Routes

  // Get all sensor configurations
  app.get("/api/sensors", async (req, res) => {
    try {
      const configs = await storage.getAllSensorConfigurations();
      res.json(configs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensor configurations" });
    }
  });

  // Get specific sensor configuration
  app.get("/api/sensors/:deviceId", async (req, res) => {
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

  // Create new sensor configuration
  app.post("/api/sensors", async (req, res) => {
    try {
      const configData = insertSensorConfigurationSchema.parse(req.body);
      const config = await storage.createSensorConfiguration(configData);
      res.status(201).json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid configuration data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create sensor configuration" });
    }
  });

  // Update sensor configuration
  app.put("/api/sensors/:deviceId", async (req, res) => {
    try {
      const configData = insertSensorConfigurationSchema.partial().parse(req.body);
      const config = await storage.updateSensorConfiguration(req.params.deviceId, configData);
      
      // Send configuration to sensor
      await sensorService.configureSensor(req.params.deviceId, config);
      
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid configuration data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update sensor configuration" });
    }
  });

  // Delete sensor configuration
  app.delete("/api/sensors/:deviceId", async (req, res) => {
    try {
      await storage.deleteSensorConfiguration(req.params.deviceId);
      await sensorService.disconnectSensor(req.params.deviceId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sensor configuration" });
    }
  });

  // Get sensor data history
  app.get("/api/sensors/:deviceId/data", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const data = await storage.getSensorDataHistory(req.params.deviceId, limit);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sensor data" });
    }
  });

  // Get latest sensor data
  app.get("/api/sensors/:deviceId/data/latest", async (req, res) => {
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

  // Generate ESPHome YAML configuration
  app.get("/api/sensors/:deviceId/yaml", async (req, res) => {
    try {
      const config = await storage.getSensorConfiguration(req.params.deviceId);
      if (!config) {
        return res.status(404).json({ error: "Sensor configuration not found" });
      }

      const advanced = req.query.advanced === 'true';
      const yaml = advanced 
        ? yamlGenerator.generateAdvancedConfig(config)
        : yamlGenerator.generateESPHomeConfig(config);

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${config.name.replace(/[^a-zA-Z0-9]/g, '_')}.yaml"`);
      res.send(yaml);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate YAML configuration" });
    }
  });

  // Preset configurations
  app.get("/api/presets", async (req, res) => {
    try {
      const presets = await storage.getAllPresets();
      res.json(presets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch presets" });
    }
  });

  app.get("/api/presets/:id", async (req, res) => {
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

  app.post("/api/presets", async (req, res) => {
    try {
      const presetData = insertPresetConfigurationSchema.parse(req.body);
      const preset = await storage.createPreset(presetData);
      res.status(201).json(preset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid preset data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create preset" });
    }
  });

  app.delete("/api/presets/:id", async (req, res) => {
    try {
      await storage.deletePreset(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete preset" });
    }
  });

  // Sensor control endpoints
  app.post("/api/sensors/:deviceId/connect", async (req, res) => {
    try {
      const { baudRate } = req.body;
      const success = await sensorService.connectToSensor(req.params.deviceId, baudRate);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ error: "Failed to connect to sensor" });
    }
  });

  app.post("/api/sensors/:deviceId/disconnect", async (req, res) => {
    try {
      await sensorService.disconnectSensor(req.params.deviceId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to disconnect sensor" });
    }
  });

  app.post("/api/sensors/:deviceId/calibrate", async (req, res) => {
    try {
      // In a real implementation, this would trigger sensor calibration
      // For now, just return success
      res.json({ success: true, message: "Calibration started" });
    } catch (error) {
      res.status(500).json({ error: "Failed to start calibration" });
    }
  });

  app.post("/api/sensors/:deviceId/factory-reset", async (req, res) => {
    try {
      // In a real implementation, this would send factory reset command
      res.json({ success: true, message: "Factory reset initiated" });
    } catch (error) {
      res.status(500).json({ error: "Failed to initiate factory reset" });
    }
  });

  return httpServer;
}
