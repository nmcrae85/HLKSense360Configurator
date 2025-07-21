import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Edit, 
  Trash2, 
  Copy, 
  Save, 
  X, 
  Plus,
  Move,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { Zone, Point } from '@/types/sensor';
import { SensorUtils } from '@/lib/sensor-utils';

interface ZoneConfiguratorProps {
  zones: Zone[];
  onZonesChange: (zones: Zone[]) => void;
  selectedZone: string | null;
  onZoneSelect: (zoneId: string | null) => void;
}

interface ZoneEditorProps {
  zone: Zone;
  onUpdate: (updates: Partial<Zone>) => void;
  onCancel: () => void;
  onSave: () => void;
}

function ZoneEditor({ zone, onUpdate, onCancel, onSave }: ZoneEditorProps) {
  const [editedZone, setEditedZone] = useState<Zone>(zone);

  const handleUpdate = (updates: Partial<Zone>) => {
    const newZone = { ...editedZone, ...updates };
    setEditedZone(newZone);
    onUpdate(updates);
  };

  const handlePointUpdate = (index: number, point: Point) => {
    const newPoints = [...editedZone.points];
    newPoints[index] = point;
    handleUpdate({ points: newPoints });
  };

  const handleAddPoint = () => {
    const newPoint: Point = { x: 0, y: 1000 };
    handleUpdate({ points: [...editedZone.points, newPoint] });
  };

  const handleRemovePoint = (index: number) => {
    if (editedZone.points.length <= 3) return;
    const newPoints = editedZone.points.filter((_, i) => i !== index);
    handleUpdate({ points: newPoints });
  };

  const validation = SensorUtils.validateZone(editedZone);

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Edit Zone: {editedZone.name}</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-1" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={onSave}
              disabled={!validation.valid}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Validation Errors */}
        {!validation.valid && (
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3">
            <div className="text-red-400 text-sm font-medium mb-1">Validation Errors:</div>
            <ul className="text-red-300 text-xs space-y-1">
              {validation.errors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="points">Points</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zoneName" className="text-sm">Zone Name</Label>
                <Input
                  id="zoneName"
                  value={editedZone.name}
                  onChange={(e) => handleUpdate({ name: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="zoneType" className="text-sm">Zone Type</Label>
                <Select 
                  value={editedZone.type} 
                  onValueChange={(value: 'detection' | 'filter') => 
                    handleUpdate({ type: value })
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detection">Detection Zone</SelectItem>
                    <SelectItem value="filter">Filter Zone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="zoneColor" className="text-sm">Zone Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <input
                  type="color"
                  value={editedZone.color}
                  onChange={(e) => handleUpdate({ color: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-600"
                />
                <Input
                  value={editedZone.color}
                  onChange={(e) => handleUpdate({ color: e.target.value })}
                  className="bg-slate-700 border-slate-600 flex-1"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="zoneEnabled" className="text-sm">Zone Enabled</Label>
              <Switch
                id="zoneEnabled"
                checked={editedZone.enabled}
                onCheckedChange={(enabled) => handleUpdate({ enabled })}
              />
            </div>

            {/* Zone Statistics */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-600">
              <div>
                <div className="text-xs text-slate-400">Area</div>
                <div className="text-sm font-mono">
                  {(SensorUtils.calculateZoneArea(editedZone) / 1000000).toFixed(2)}m²
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Points</div>
                <div className="text-sm font-mono">{editedZone.points.length}</div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="points" className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Zone Points</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddPoint}
                className="border-slate-600"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Point
              </Button>
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-3">
                {editedZone.points.map((point, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-slate-700/50 rounded border border-slate-600">
                    <Badge variant="outline" className="w-8 justify-center">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-slate-400">X (mm)</Label>
                        <Input
                          type="number"
                          value={point.x}
                          onChange={(e) => handlePointUpdate(index, { 
                            ...point, 
                            x: parseInt(e.target.value) || 0 
                          })}
                          className="bg-slate-700 border-slate-600 h-8 text-xs"
                          min={-3000}
                          max={3000}
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-slate-400">Y (mm)</Label>
                        <Input
                          type="number"
                          value={point.y}
                          onChange={(e) => handlePointUpdate(index, { 
                            ...point, 
                            y: parseInt(e.target.value) || 0 
                          })}
                          className="bg-slate-700 border-slate-600 h-8 text-xs"
                          min={0}
                          max={6000}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePoint(index)}
                      disabled={editedZone.points.length <= 3}
                      className="p-1 h-8 w-8 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Zone Operations</h4>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600"
                  onClick={() => {
                    // Center zone
                    const bounds = SensorUtils.getZoneBounds(editedZone);
                    const centerX = (bounds.minX + bounds.maxX) / 2;
                    const centerY = (bounds.minY + bounds.maxY) / 2;
                    
                    const centeredPoints = editedZone.points.map(point => ({
                      x: point.x - centerX,
                      y: point.y - centerY + 1500, // Move to center of sensor range
                    }));
                    
                    handleUpdate({ points: centeredPoints });
                  }}
                >
                  <Move className="w-3 h-3 mr-1" />
                  Center
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600"
                  onClick={() => {
                    // Reset to default rectangle
                    const defaultPoints: Point[] = [
                      { x: -500, y: 1000 },
                      { x: 500, y: 1000 },
                      { x: 500, y: 2000 },
                      { x: -500, y: 2000 }
                    ];
                    handleUpdate({ points: defaultPoints });
                  }}
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              </div>

              <Separator />

              <div>
                <h5 className="text-sm font-medium mb-2">Scale Zone</h5>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const scaledPoints = editedZone.points.map(point => ({
                        x: Math.round(point.x * 0.9),
                        y: Math.round(point.y * 0.9),
                      }));
                      handleUpdate({ points: scaledPoints });
                    }}
                    className="border-slate-600"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </Button>
                  <span className="text-xs text-slate-400 flex-1 text-center">Scale</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const scaledPoints = editedZone.points.map(point => ({
                        x: Math.round(point.x * 1.1),
                        y: Math.round(point.y * 1.1),
                      }));
                      handleUpdate({ points: scaledPoints });
                    }}
                    className="border-slate-600"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function ZoneConfigurator({
  zones,
  onZonesChange,
  selectedZone,
  onZoneSelect,
}: ZoneConfiguratorProps) {
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  const handleZoneUpdate = (zoneId: string, updates: Partial<Zone>) => {
    const updatedZones = zones.map(zone =>
      zone.id === zoneId ? { ...zone, ...updates } : zone
    );
    onZonesChange(updatedZones);
  };

  const handleZoneDelete = (zoneId: string) => {
    const updatedZones = zones.filter(zone => zone.id !== zoneId);
    onZonesChange(updatedZones);
    if (selectedZone === zoneId) {
      onZoneSelect(null);
    }
  };

  const handleZoneClone = (zone: Zone) => {
    const clonedZone: Zone = {
      ...zone,
      id: `zone_${Date.now()}`,
      name: `${zone.name} (Copy)`,
      points: zone.points.map(p => ({ x: p.x + 100, y: p.y + 100 })),
    };
    onZonesChange([...zones, clonedZone]);
  };

  const handleStartEdit = (zone: Zone) => {
    setEditingZone({ ...zone });
  };

  const handleSaveEdit = () => {
    if (editingZone) {
      handleZoneUpdate(editingZone.id, editingZone);
      setEditingZone(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingZone(null);
  };

  if (editingZone) {
    return (
      <ZoneEditor
        zone={editingZone}
        onUpdate={(updates) => setEditingZone({ ...editingZone, ...updates })}
        onCancel={handleCancelEdit}
        onSave={handleSaveEdit}
      />
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-600">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Zone Management</span>
          <Badge variant="outline">{zones.length} zones</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {zones.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <div className="text-sm">No zones configured</div>
            <div className="text-xs mt-1">
              Use Ctrl+Click on the canvas to create detection zones
            </div>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedZone === zone.id
                      ? 'border-primary bg-primary/10'
                      : 'border-slate-600 bg-slate-700/50 hover:bg-slate-700'
                  }`}
                  onClick={() => onZoneSelect(zone.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: zone.color, borderColor: zone.color }}
                      />
                      <span className="font-medium text-sm">{zone.name}</span>
                      <Badge
                        variant={zone.type === 'detection' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {zone.type}
                      </Badge>
                    </div>
                    <Switch
                      checked={zone.enabled}
                      onCheckedChange={(enabled) => handleZoneUpdate(zone.id, { enabled })}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-400 mb-3">
                    <div>
                      <span>Points: </span>
                      <span className="text-slate-200">{zone.points.length}</span>
                    </div>
                    <div>
                      <span>Area: </span>
                      <span className="text-slate-200">
                        {(SensorUtils.calculateZoneArea(zone) / 1000000).toFixed(1)}m²
                      </span>
                    </div>
                    <div>
                      <span>Status: </span>
                      <span className={zone.enabled ? 'text-emerald-400' : 'text-slate-400'}>
                        {zone.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(zone);
                      }}
                      className="p-1 h-6 text-slate-400 hover:text-slate-200"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoneClone(zone);
                      }}
                      className="p-1 h-6 text-slate-400 hover:text-slate-200"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoneDelete(zone.id);
                      }}
                      className="p-1 h-6 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
