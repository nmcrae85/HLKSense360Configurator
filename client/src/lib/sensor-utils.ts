import { Point, Zone, Target, CanvasCoordinates } from "@/types/sensor";

export class SensorUtils {
  // Convert screen coordinates to sensor coordinates
  static screenToSensor(
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number,
    scale: number = 0.1 // 1px = 10mm default
  ): Point {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const sensorX = (screenX - centerX) / scale;
    const sensorY = (centerY - screenY) / scale; // Y axis flipped
    
    return {
      x: Math.round(Math.max(-3000, Math.min(3000, sensorX))),
      y: Math.round(Math.max(0, Math.min(6000, Math.abs(sensorY))))
    };
  }

  // Convert sensor coordinates to screen coordinates
  static sensorToScreen(
    sensorX: number,
    sensorY: number,
    canvasWidth: number,
    canvasHeight: number,
    scale: number = 0.1
  ): Point {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    const screenX = centerX + (sensorX * scale);
    const screenY = centerY - (sensorY * scale); // Y axis flipped
    
    return { x: screenX, y: screenY };
  }

  // Check if a point is inside a polygon zone
  static isPointInPolygon(point: Point, zone: Zone): boolean {
    if (zone.points.length < 3) return false;
    
    let inside = false;
    for (let i = 0, j = zone.points.length - 1; i < zone.points.length; j = i++) {
      const xi = zone.points[i].x;
      const yi = zone.points[i].y;
      const xj = zone.points[j].x;
      const yj = zone.points[j].y;
      
      if (((yi > point.y) !== (yj > point.y)) && 
          (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  // Calculate distance between two points
  static calculateDistance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  // Calculate angle from sensor origin to target
  static calculateAngle(target: Point): number {
    return Math.atan2(target.y, target.x) * (180 / Math.PI);
  }

  // Format distance for display
  static formatDistance(distance: number): string {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}m`;
    }
    return `${Math.round(distance)}mm`;
  }

  // Format speed for display
  static formatSpeed(speed: number): string {
    return `${speed.toFixed(1)} cm/s`;
  }

  // Generate zone color based on type
  static getZoneColor(type: "detection" | "filter", index: number): string {
    const detectionColors = [
      "#3b82f6", // Blue
      "#8b5cf6", // Purple
      "#06d6a0", // Green
      "#f59e0b", // Yellow
      "#ef4444", // Red
    ];
    
    const filterColors = [
      "#f59e0b", // Orange
      "#ef4444", // Red
      "#ec4899", // Pink
      "#84cc16", // Lime
      "#06b6d4", // Cyan
    ];
    
    const colors = type === "detection" ? detectionColors : filterColors;
    return colors[index % colors.length];
  }

  // Validate zone points
  static validateZone(zone: Zone): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (zone.points.length < 3) {
      errors.push("Zone must have at least 3 points");
    }
    
    if (!zone.name.trim()) {
      errors.push("Zone name is required");
    }
    
    // Check if points are within sensor range
    for (const point of zone.points) {
      if (point.x < -3000 || point.x > 3000) {
        errors.push(`Point X coordinate must be between -3000 and 3000mm (found: ${point.x})`);
      }
      if (point.y < 0 || point.y > 6000) {
        errors.push(`Point Y coordinate must be between 0 and 6000mm (found: ${point.y})`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  // Calculate zone area
  static calculateZoneArea(zone: Zone): number {
    if (zone.points.length < 3) return 0;
    
    let area = 0;
    for (let i = 0; i < zone.points.length; i++) {
      const j = (i + 1) % zone.points.length;
      area += zone.points[i].x * zone.points[j].y;
      area -= zone.points[j].x * zone.points[i].y;
    }
    return Math.abs(area) / 2;
  }

  // Get zone bounds for rectangular representation
  static getZoneBounds(zone: Zone): { minX: number; maxX: number; minY: number; maxY: number } {
    if (zone.points.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }
    
    const xs = zone.points.map(p => p.x);
    const ys = zone.points.map(p => p.y);
    
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys)
    };
  }

  // Snap point to grid
  static snapToGrid(point: Point, gridSize: number = 50): Point {
    return {
      x: Math.round(point.x / gridSize) * gridSize,
      y: Math.round(point.y / gridSize) * gridSize
    };
  }

  // Check if two zones overlap
  static zonesOverlap(zone1: Zone, zone2: Zone): boolean {
    // Simple bounding box check first
    const bounds1 = this.getZoneBounds(zone1);
    const bounds2 = this.getZoneBounds(zone2);
    
    if (bounds1.maxX < bounds2.minX || bounds2.maxX < bounds1.minX ||
        bounds1.maxY < bounds2.minY || bounds2.maxY < bounds1.minY) {
      return false;
    }
    
    // Check if any points of zone1 are inside zone2
    for (const point of zone1.points) {
      if (this.isPointInPolygon(point, zone2)) {
        return true;
      }
    }
    
    // Check if any points of zone2 are inside zone1
    for (const point of zone2.points) {
      if (this.isPointInPolygon(point, zone1)) {
        return true;
      }
    }
    
    return false;
  }
}
