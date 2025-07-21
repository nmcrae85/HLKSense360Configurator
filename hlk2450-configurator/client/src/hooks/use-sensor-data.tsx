import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './use-websocket';
import { SensorData, SensorStatus, Target, WebSocketMessage } from '@/types/sensor';

export interface UseSensorDataOptions {
  deviceId?: string;
  onTargetUpdate?: (targets: Target[]) => void;
  onStatusChange?: (status: SensorStatus) => void;
}

export function useSensorData(options: UseSensorDataOptions = {}) {
  const { deviceId, onTargetUpdate, onStatusChange } = options;

  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [sensorStatus, setSensorStatus] = useState<SensorStatus | null>(null);
  const [targets, setTargets] = useState<Target[]>([]);
  const [isPresenceDetected, setIsPresenceDetected] = useState(false);
  const [hasMovingTarget, setHasMovingTarget] = useState(false);
  const [hasStillTarget, setHasStillTarget] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(0);
  const [packetCount, setPacketCount] = useState(0);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'sensor_data':
        const data = message.data as SensorData;
        
        // Filter by device ID if specified
        if (deviceId && data.deviceId !== deviceId) {
          return;
        }

        setSensorData(data);
        setTargets(data.targets);
        setIsPresenceDetected(data.hasTarget);
        setHasMovingTarget(data.hasMovingTarget);
        setHasStillTarget(data.hasStillTarget);
        setLastUpdate(data.timestamp);
        setPacketCount(prev => prev + 1);

        onTargetUpdate?.(data.targets);
        break;

      case 'sensor_status':
        const status = message.data as SensorStatus;
        
        // Filter by device ID if specified
        if (deviceId && status.deviceId !== deviceId) {
          return;
        }

        setSensorStatus(status);
        onStatusChange?.(status);
        break;

      case 'error':
        console.error('Sensor error:', message.data);
        break;
    }
  }, [deviceId, onTargetUpdate, onStatusChange]);

  const {
    connectionStatus,
    isConnected,
    lastMessage,
    messageHistory,
  } = useWebSocket({
    onMessage: handleWebSocketMessage,
    onConnect: () => console.log('Connected to sensor WebSocket'),
    onDisconnect: () => console.log('Disconnected from sensor WebSocket'),
    onError: (error) => console.error('WebSocket error:', error),
  });

  // Calculate update rate
  const [updateRate, setUpdateRate] = useState(0);
  const [lastPacketTime, setLastPacketTime] = useState(0);

  useEffect(() => {
    const now = Date.now();
    if (lastPacketTime > 0 && lastUpdate > lastPacketTime) {
      const timeDiff = (lastUpdate - lastPacketTime) / 1000;
      const rate = timeDiff > 0 ? 1 / timeDiff : 0;
      setUpdateRate(Math.round(rate));
    }
    setLastPacketTime(lastUpdate);
  }, [lastUpdate, lastPacketTime]);

  // Get targets in specific zones
  const getTargetsInZone = useCallback((zoneId: string, zones: any[]) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return [];

    return targets.filter(target => {
      // Simple polygon point-in-polygon check
      return isPointInPolygon({ x: target.x, y: target.y }, zone.points);
    });
  }, [targets]);

  // Helper function for point-in-polygon detection
  const isPointInPolygon = (point: { x: number; y: number }, polygon: { x: number; y: number }[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x;
      const yi = polygon[i].y;
      const xj = polygon[j].x;
      const yj = polygon[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) && 
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  // Get closest target to a point
  const getClosestTarget = useCallback((point: { x: number; y: number }) => {
    if (targets.length === 0) return null;

    let closestTarget = targets[0];
    let minDistance = Math.sqrt(
      Math.pow(closestTarget.x - point.x, 2) + 
      Math.pow(closestTarget.y - point.y, 2)
    );

    for (const target of targets.slice(1)) {
      const distance = Math.sqrt(
        Math.pow(target.x - point.x, 2) + 
        Math.pow(target.y - point.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestTarget = target;
      }
    }

    return { target: closestTarget, distance: minDistance };
  }, [targets]);

  // Calculate statistics
  const statistics = {
    totalTargets: targets.length,
    movingTargets: targets.filter(t => t.isMoving).length,
    stillTargets: targets.filter(t => !t.isMoving).length,
    averageDistance: targets.length > 0 
      ? targets.reduce((sum, t) => sum + t.distance, 0) / targets.length 
      : 0,
    averageSpeed: targets.length > 0 
      ? targets.reduce((sum, t) => sum + t.speed, 0) / targets.length 
      : 0,
    updateRate,
    packetCount,
    lastUpdate,
  };

  return {
    // Connection status
    connectionStatus,
    isConnected,
    
    // Sensor data
    sensorData,
    sensorStatus,
    targets,
    isPresenceDetected,
    hasMovingTarget,
    hasStillTarget,
    
    // Statistics
    statistics,
    
    // Utility functions
    getTargetsInZone,
    getClosestTarget,
    
    // Raw WebSocket data
    lastMessage,
    messageHistory,
  };
}
