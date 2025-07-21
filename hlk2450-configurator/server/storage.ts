import { 
  sensorConfigurations, 
  sensorData, 
  presetConfigurations,
  type SensorConfigurationRecord,
  type SensorDataRecord,
  type PresetConfigurationRecord,
  type InsertSensorConfiguration,
  type InsertSensorData,
  type InsertPresetConfiguration,
  type Zone,
  type Target
} from "@shared/schema";

export interface IStorage {
  // Sensor Configurations
  getSensorConfiguration(deviceId: string): Promise<SensorConfigurationRecord | undefined>;
  createSensorConfiguration(config: InsertSensorConfiguration): Promise<SensorConfigurationRecord>;
  updateSensorConfiguration(deviceId: string, config: Partial<InsertSensorConfiguration>): Promise<SensorConfigurationRecord>;
  deleteSensorConfiguration(deviceId: string): Promise<void>;
  getAllSensorConfigurations(): Promise<SensorConfigurationRecord[]>;

  // Sensor Data
  getLatestSensorData(deviceId: string): Promise<SensorDataRecord | undefined>;
  createSensorData(data: InsertSensorData): Promise<SensorDataRecord>;
  getSensorDataHistory(deviceId: string, limit?: number): Promise<SensorDataRecord[]>;

  // Preset Configurations
  getAllPresets(): Promise<PresetConfigurationRecord[]>;
  getPreset(id: number): Promise<PresetConfigurationRecord | undefined>;
  createPreset(preset: InsertPresetConfiguration): Promise<PresetConfigurationRecord>;
  deletePreset(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private sensorConfigs: Map<string, SensorConfigurationRecord>;
  private sensorDataMap: Map<string, SensorDataRecord[]>;
  private presets: Map<number, PresetConfigurationRecord>;
  private currentConfigId: number;
  private currentDataId: number;
  private currentPresetId: number;

  constructor() {
    this.sensorConfigs = new Map();
    this.sensorDataMap = new Map();
    this.presets = new Map();
    this.currentConfigId = 1;
    this.currentDataId = 1;
    this.currentPresetId = 1;

    // Initialize with default presets
    this.initializeDefaultPresets();
  }

  private initializeDefaultPresets() {
    const defaultPresets: Omit<PresetConfigurationRecord, 'id'>[] = [
      {
        name: "Living Room",
        roomType: "living_room",
        description: "Standard living room configuration with seating area detection",
        configuration: {
          name: "Living Room Sensor",
          deviceId: "living_room_001",
          baudRate: 256000,
          presenceTimeout: 5,
          maxDetectionDistance: 4000,
          sensitivity: 7,
          multiTargetEnabled: true,
          bluetoothEnabled: false,
          zones: [
            {
              id: "zone_1",
              name: "Seating Area",
              type: "detection" as const,
              color: "#3b82f6",
              points: [
                { x: -1500, y: 1000 },
                { x: 1500, y: 1000 },
                { x: 1500, y: 3000 },
                { x: -1500, y: 3000 }
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
          baudRate: 256000,
          presenceTimeout: 10,
          maxDetectionDistance: 3000,
          sensitivity: 6,
          multiTargetEnabled: false,
          bluetoothEnabled: false,
          zones: [
            {
              id: "zone_1",
              name: "Bed Area",
              type: "detection" as const,
              color: "#8b5cf6",
              points: [
                { x: -800, y: 800 },
                { x: 800, y: 800 },
                { x: 800, y: 2000 },
                { x: -800, y: 2000 }
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
          baudRate: 256000,
          presenceTimeout: 3,
          maxDetectionDistance: 3500,
          sensitivity: 8,
          multiTargetEnabled: true,
          bluetoothEnabled: false,
          zones: [
            {
              id: "zone_1",
              name: "Cooking Area",
              type: "detection" as const,
              color: "#f59e0b",
              points: [
                { x: -1000, y: 500 },
                { x: 1000, y: 500 },
                { x: 1000, y: 2000 },
                { x: -1000, y: 2000 }
              ],
              enabled: true
            }
          ]
        },
        isDefault: true
      }
    ];

    defaultPresets.forEach(preset => {
      const id = this.currentPresetId++;
      this.presets.set(id, { ...preset, id });
    });
  }

  async getSensorConfiguration(deviceId: string): Promise<SensorConfigurationRecord | undefined> {
    return this.sensorConfigs.get(deviceId);
  }

  async createSensorConfiguration(config: InsertSensorConfiguration): Promise<SensorConfigurationRecord> {
    const id = this.currentConfigId++;
    const now = new Date();
    const record: SensorConfigurationRecord = {
      ...config,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.sensorConfigs.set(config.deviceId, record);
    return record;
  }

  async updateSensorConfiguration(deviceId: string, config: Partial<InsertSensorConfiguration>): Promise<SensorConfigurationRecord> {
    const existing = this.sensorConfigs.get(deviceId);
    if (!existing) {
      throw new Error(`Sensor configuration not found for device: ${deviceId}`);
    }

    const updated: SensorConfigurationRecord = {
      ...existing,
      ...config,
      updatedAt: new Date(),
    };
    this.sensorConfigs.set(deviceId, updated);
    return updated;
  }

  async deleteSensorConfiguration(deviceId: string): Promise<void> {
    this.sensorConfigs.delete(deviceId);
    this.sensorDataMap.delete(deviceId);
  }

  async getAllSensorConfigurations(): Promise<SensorConfigurationRecord[]> {
    return Array.from(this.sensorConfigs.values());
  }

  async getLatestSensorData(deviceId: string): Promise<SensorDataRecord | undefined> {
    const dataArray = this.sensorDataMap.get(deviceId);
    if (!dataArray || dataArray.length === 0) return undefined;
    return dataArray[dataArray.length - 1];
  }

  async createSensorData(data: InsertSensorData): Promise<SensorDataRecord> {
    const id = this.currentDataId++;
    const record: SensorDataRecord = {
      ...data,
      id,
      timestamp: new Date(),
    };

    const existingData = this.sensorDataMap.get(data.deviceId) || [];
    existingData.push(record);
    
    // Keep only last 1000 records per device
    if (existingData.length > 1000) {
      existingData.splice(0, existingData.length - 1000);
    }
    
    this.sensorDataMap.set(data.deviceId, existingData);
    return record;
  }

  async getSensorDataHistory(deviceId: string, limit: number = 100): Promise<SensorDataRecord[]> {
    const dataArray = this.sensorDataMap.get(deviceId) || [];
    return dataArray.slice(-limit);
  }

  async getAllPresets(): Promise<PresetConfigurationRecord[]> {
    return Array.from(this.presets.values());
  }

  async getPreset(id: number): Promise<PresetConfigurationRecord | undefined> {
    return this.presets.get(id);
  }

  async createPreset(preset: InsertPresetConfiguration): Promise<PresetConfigurationRecord> {
    const id = this.currentPresetId++;
    const record: PresetConfigurationRecord = {
      ...preset,
      id,
    };
    this.presets.set(id, record);
    return record;
  }

  async deletePreset(id: number): Promise<void> {
    this.presets.delete(id);
  }
}

export const storage = new MemStorage();
