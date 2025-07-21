export interface Point {
  x: number;
  y: number;
}

export interface Zone {
  id: string;
  name: string;
  type: "detection" | "filter";
  color: string;
  points: Point[];
  enabled: boolean;
}

export interface Target {
  id: number;
  x: number;
  y: number;
  speed: number;
  angle: number;
  distance: number;
  resolution?: number;
  isMoving: boolean;
}

export interface SensorConfiguration {
  name: string;
  deviceId: string;
  firmwareVersion?: string;
  baudRate: number;
  presenceTimeout: number;
  maxDetectionDistance: number;
  sensitivity: number;
  multiTargetEnabled: boolean;
  bluetoothEnabled: boolean;
  zones: Zone[];
}

export interface SensorStatus {
  deviceId: string;
  connected: boolean;
  firmwareVersion?: string;
  lastUpdate: number;
}

export interface SensorData {
  deviceId: string;
  targets: Target[];
  hasTarget: boolean;
  hasMovingTarget: boolean;
  hasStillTarget: boolean;
  timestamp: number;
}

export interface WebSocketMessage {
  type: "sensor_data" | "sensor_status" | "configuration_update" | "error";
  data: any;
}

export interface ViewMode {
  mode: "live" | "config" | "heatmap";
}

export interface CanvasCoordinates {
  x: number;
  y: number;
  sensorX: number;
  sensorY: number;
}

export interface ZoneCreation {
  isCreating: boolean;
  currentZone?: {
    points: Point[];
    type: "detection" | "filter";
  };
}
