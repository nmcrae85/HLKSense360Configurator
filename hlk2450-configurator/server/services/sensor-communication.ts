import { EventEmitter } from 'events';
import { Target, WebSocketMessage } from '@shared/schema';

export interface SensorStatus {
  deviceId: string;
  connected: boolean;
  firmwareVersion?: string;
  lastUpdate: number;
}

export class SensorCommunicationService extends EventEmitter {
  private connectedSensors: Map<string, SensorStatus> = new Map();
  private simulationInterval?: NodeJS.Timeout;
  private isSimulating: boolean = false;

  constructor() {
    super();
    // Start simulation for development
    this.startSimulation();
  }

  private startSimulation() {
    if (this.isSimulating) return;
    
    this.isSimulating = true;
    
    // Simulate a connected sensor
    const mockDeviceId = 'hlk2450_dev_001';
    this.connectedSensors.set(mockDeviceId, {
      deviceId: mockDeviceId,
      connected: true,
      firmwareVersion: 'V2.02.23090617',
      lastUpdate: Date.now(),
    });

    // Emit sensor status
    this.emit('sensor_status', {
      type: 'sensor_status',
      data: this.connectedSensors.get(mockDeviceId)!,
    } as WebSocketMessage);

    // Simulate real-time sensor data
    this.simulationInterval = setInterval(() => {
      this.simulateSensorData(mockDeviceId);
    }, 100); // 10Hz update rate
  }

  private simulateSensorData(deviceId: string) {
    const now = Date.now();
    const targets: Target[] = [];
    
    // Simulate 0-3 targets with realistic movement
    const targetCount = Math.random() > 0.7 ? 0 : Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < targetCount; i++) {
      const baseAngle = (i * 120) + (Math.sin(now / 2000) * 30); // Slow movement
      const distance = 1500 + Math.sin(now / 3000 + i) * 800; // 0.7m to 2.3m
      const speed = Math.abs(Math.sin(now / 1000 + i)) * 50; // 0-50 cm/s
      
      const x = Math.cos(baseAngle * Math.PI / 180) * distance;
      const y = Math.sin(baseAngle * Math.PI / 180) * distance + 1000; // Offset from sensor
      
      targets.push({
        id: i + 1,
        x: Math.round(x),
        y: Math.round(Math.abs(y)), // Ensure positive Y
        speed: Math.round(speed),
        angle: Math.round(baseAngle),
        distance: Math.round(distance),
        resolution: Math.round(50 + Math.random() * 50),
        isMoving: speed > 5,
      });
    }

    const hasTarget = targets.length > 0;
    const hasMovingTarget = targets.some(t => t.isMoving);
    const hasStillTarget = targets.some(t => !t.isMoving);

    // Update sensor status
    const status = this.connectedSensors.get(deviceId);
    if (status) {
      status.lastUpdate = now;
      this.connectedSensors.set(deviceId, status);
    }

    // Emit sensor data
    this.emit('sensor_data', {
      type: 'sensor_data',
      data: {
        deviceId,
        targets,
        hasTarget,
        hasMovingTarget,
        hasStillTarget,
        timestamp: now,
      },
    } as WebSocketMessage);
  }

  public getConnectedSensors(): SensorStatus[] {
    return Array.from(this.connectedSensors.values());
  }

  public getSensorStatus(deviceId: string): SensorStatus | undefined {
    return this.connectedSensors.get(deviceId);
  }

  public async connectToSensor(deviceId: string, baudRate: number = 256000): Promise<boolean> {
    // In a real implementation, this would establish UART connection
    // For now, simulate connection
    
    this.connectedSensors.set(deviceId, {
      deviceId,
      connected: true,
      firmwareVersion: 'V2.02.23090617',
      lastUpdate: Date.now(),
    });

    this.emit('sensor_status', {
      type: 'sensor_status',
      data: this.connectedSensors.get(deviceId)!,
    } as WebSocketMessage);

    return true;
  }

  public async disconnectSensor(deviceId: string): Promise<void> {
    this.connectedSensors.delete(deviceId);
    
    this.emit('sensor_status', {
      type: 'sensor_status',
      data: {
        deviceId,
        connected: false,
        lastUpdate: Date.now(),
      },
    } as WebSocketMessage);
  }

  public async configureSensor(deviceId: string, config: any): Promise<boolean> {
    // In a real implementation, this would send configuration commands to the sensor
    // For now, just emit a configuration update
    
    this.emit('configuration_update', {
      type: 'configuration_update',
      data: config,
    } as WebSocketMessage);

    return true;
  }

  public stopSimulation(): void {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = undefined;
    }
    this.isSimulating = false;
  }

  public destroy(): void {
    this.stopSimulation();
    this.removeAllListeners();
    this.connectedSensors.clear();
  }
}

export const sensorService = new SensorCommunicationService();
