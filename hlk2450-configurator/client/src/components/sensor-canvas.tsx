import { useRef, useEffect, useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Zone, SensorStatus, ViewMode } from '@/types/sensor';
import { SensorUtils } from '@/lib/sensor-utils';

interface SensorCanvasProps {
  targets: Target[];
  zones: Zone[];
  onZonesChange: (zones: Zone[]) => void;
  viewMode: ViewMode['mode'];
  sensorStatus: SensorStatus | null;
  maxDetectionDistance: number;
}

interface CanvasState {
  scale: number;
  centerX: number;
  centerY: number;
  cursorPos: { x: number; y: number; sensorX: number; sensorY: number };
  isDragging: boolean;
  selectedZone: string | null;
  dragHandle: string | null;
  isCreatingZone: boolean;
  newZonePoints: { x: number; y: number }[];
  newZoneType: 'detection' | 'filter';
}

export function SensorCanvas({
  targets,
  zones,
  onZonesChange,
  viewMode,
  sensorStatus,
  maxDetectionDistance,
}: SensorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  const [canvasState, setCanvasState] = useState<CanvasState>({
    scale: 0.1, // 1px = 10mm
    centerX: 0,
    centerY: 0,
    cursorPos: { x: 0, y: 0, sensorX: 0, sensorY: 0 },
    isDragging: false,
    selectedZone: null,
    dragHandle: null,
    isCreatingZone: false,
    newZonePoints: [],
    newZoneType: 'detection',
  });

  // Initialize canvas dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && canvasRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = rect.width;
        canvasRef.current.height = rect.height;
        
        setCanvasState(prev => ({
          ...prev,
          centerX: rect.width / 2,
          centerY: rect.height / 2,
        }));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw canvas content
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const { scale, centerX, centerY } = canvasState;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 100 * scale; // 100mm grid
    const startX = centerX % gridSize;
    const startY = centerY % gridSize;
    
    for (let x = startX; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = startY; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw detection range circle
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maxDetectionDistance * scale, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw sensor origin
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Draw sensor status indicator
    if (sensorStatus?.connected) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw zones
    zones.forEach((zone) => {
      if (!zone.enabled || zone.points.length < 3) return;

      ctx.fillStyle = zone.color + '20';
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      const firstPoint = SensorUtils.sensorToScreen(
        zone.points[0].x,
        zone.points[0].y,
        width,
        height,
        scale
      );
      ctx.moveTo(firstPoint.x, firstPoint.y);

      zone.points.slice(1).forEach((point) => {
        const screenPoint = SensorUtils.sensorToScreen(
          point.x,
          point.y,
          width,
          height,
          scale
        );
        ctx.lineTo(screenPoint.x, screenPoint.y);
      });

      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw zone handles if selected
      if (canvasState.selectedZone === zone.id) {
        zone.points.forEach((point, index) => {
          const screenPoint = SensorUtils.sensorToScreen(
            point.x,
            point.y,
            width,
            height,
            scale
          );
          
          ctx.fillStyle = zone.color;
          ctx.beginPath();
          ctx.arc(screenPoint.x, screenPoint.y, 6, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
    });

    // Draw targets
    targets.forEach((target) => {
      const screenPos = SensorUtils.sensorToScreen(
        target.x,
        target.y,
        width,
        height,
        scale
      );

      // Target indicator
      const color = target.isMoving ? '#10b981' : '#3b82f6';
      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, 6, 0, 2 * Math.PI);
      ctx.fill();

      // Ping animation
      const time = Date.now() / 1000;
      const pingRadius = 6 + Math.sin(time * 2) * 4;
      ctx.globalAlpha = 0.5 - Math.sin(time * 2) * 0.3;
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y, pingRadius, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw new zone being created
    if (canvasState.isCreatingZone && canvasState.newZonePoints.length > 0) {
      ctx.strokeStyle = canvasState.newZoneType === 'detection' ? '#3b82f6' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      const firstPoint = SensorUtils.sensorToScreen(
        canvasState.newZonePoints[0].x,
        canvasState.newZonePoints[0].y,
        width,
        height,
        scale
      );
      ctx.moveTo(firstPoint.x, firstPoint.y);

      canvasState.newZonePoints.slice(1).forEach((point) => {
        const screenPoint = SensorUtils.sensorToScreen(
          point.x,
          point.y,
          width,
          height,
          scale
        );
        ctx.lineTo(screenPoint.x, screenPoint.y);
      });

      // Draw line to cursor
      ctx.lineTo(canvasState.cursorPos.x, canvasState.cursorPos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw points
      canvasState.newZonePoints.forEach((point) => {
        const screenPoint = SensorUtils.sensorToScreen(
          point.x,
          point.y,
          width,
          height,
          scale
        );
        
        ctx.fillStyle = canvasState.newZoneType === 'detection' ? '#3b82f6' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(screenPoint.x, screenPoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }
  }, [
    canvasState,
    targets,
    zones,
    maxDetectionDistance,
    sensorStatus,
  ]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      drawCanvas();
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [drawCanvas]);

  // Mouse event handlers
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const sensorCoords = SensorUtils.screenToSensor(
      x,
      y,
      canvas.width,
      canvas.height,
      canvasState.scale
    );

    setCanvasState(prev => ({
      ...prev,
      cursorPos: { x, y, sensorX: sensorCoords.x, sensorY: sensorCoords.y },
    }));
  }, [canvasState.scale]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const { cursorPos } = canvasState;
    
    if (e.shiftKey) {
      // Start creating filter zone
      setCanvasState(prev => ({
        ...prev,
        isCreatingZone: true,
        newZoneType: 'filter',
        newZonePoints: [{ x: cursorPos.sensorX, y: cursorPos.sensorY }],
      }));
    } else if (e.ctrlKey || e.metaKey) {
      // Start creating detection zone
      setCanvasState(prev => ({
        ...prev,
        isCreatingZone: true,
        newZoneType: 'detection',
        newZonePoints: [{ x: cursorPos.sensorX, y: cursorPos.sensorY }],
      }));
    }
  }, [canvasState]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (canvasState.isCreatingZone) {
      const { cursorPos, newZonePoints, newZoneType } = canvasState;
      
      if (e.detail === 2) { // Double click to finish zone
        if (newZonePoints.length >= 3) {
          const newZone: Zone = {
            id: `zone_${Date.now()}`,
            name: `${newZoneType === 'detection' ? 'Detection' : 'Filter'} Zone ${zones.length + 1}`,
            type: newZoneType,
            color: SensorUtils.getZoneColor(newZoneType, zones.length),
            points: newZonePoints,
            enabled: true,
          };
          
          onZonesChange([...zones, newZone]);
        }
        
        setCanvasState(prev => ({
          ...prev,
          isCreatingZone: false,
          newZonePoints: [],
        }));
      } else {
        // Add point to current zone
        setCanvasState(prev => ({
          ...prev,
          newZonePoints: [...prev.newZonePoints, { x: cursorPos.sensorX, y: cursorPos.sensorY }],
        }));
      }
    }
  }, [canvasState, zones, onZonesChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && canvasState.isCreatingZone) {
      setCanvasState(prev => ({
        ...prev,
        isCreatingZone: false,
        newZonePoints: [],
      }));
    }
  }, [canvasState.isCreatingZone]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      />

      {/* Coordinate Display */}
      <Card className="absolute bottom-4 left-4 bg-slate-800/90 border-slate-600 p-3">
        <div className="text-xs space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Cursor:</span>
            <span className="font-mono text-slate-200">
              X: {canvasState.cursorPos.sensorX}mm, Y: {canvasState.cursorPos.sensorY}mm
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Scale:</span>
            <span className="font-mono text-slate-200">1px = {Math.round(1/canvasState.scale)}mm</span>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="absolute top-4 right-4 bg-slate-800/90 border-slate-600 p-3 max-w-xs">
        <div className="text-xs">
          <div className="text-slate-200 font-medium mb-1">Zone Creation</div>
          <div className="text-slate-400 space-y-1">
            <div>Ctrl+Click: Create detection zone</div>
            <div>Shift+Click: Create filter zone</div>
            <div>Double-click: Finish zone</div>
            <div>Esc: Cancel zone creation</div>
          </div>
        </div>
      </Card>

      {/* Target Info Overlay */}
      {targets.map((target) => {
        const screenPos = SensorUtils.sensorToScreen(
          target.x,
          target.y,
          canvasRef.current?.width || 0,
          canvasRef.current?.height || 0,
          canvasState.scale
        );

        return (
          <div
            key={target.id}
            className="absolute pointer-events-none"
            style={{
              left: screenPos.x + 10,
              top: screenPos.y - 30,
            }}
          >
            <Badge 
              variant={target.isMoving ? "default" : "secondary"}
              className="bg-slate-800/90 border-slate-600 text-xs"
            >
              T{target.id}: {SensorUtils.formatDistance(target.distance)}
            </Badge>
          </div>
        );
      })}

      {/* Zone Creation Status */}
      {canvasState.isCreatingZone && (
        <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800/95 border-slate-600 p-4">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">
              Creating {canvasState.newZoneType} zone
            </div>
            <div className="text-sm text-slate-400 mb-3">
              Points: {canvasState.newZonePoints.length}
            </div>
            <div className="text-xs text-slate-500">
              Double-click to finish (minimum 3 points)
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
