import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  Settings, 
  Download,
  Save,
  Upload,
  RotateCcw,
  AlertTriangle,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';
import { SensorConfiguration, Zone, SensorStatus } from '@/types/sensor';
import { SensorUtils } from '@/lib/sensor-utils';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  sensorStatus: SensorStatus | null;
  configuration: SensorConfiguration;
  onConfigurationChange: (config: Partial<SensorConfiguration>) => void;
  zones: Zone[];
  onZonesChange: (zones: Zone[]) => void;
  onExportYAML: () => void;
  onSaveConfig: () => void;
  onLoadConfig: () => void;
  onCalibrate: () => void;
  onFactoryReset: () => void;
  onAddZone: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggle,
  sensorStatus,
  configuration,
  onConfigurationChange,
  zones,
  onZonesChange,
  onExportYAML,
  onSaveConfig,
  onLoadConfig,
  onCalibrate,
  onFactoryReset,
  onAddZone,
}: SidebarProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const presets = [
    { id: 'living_room', name: 'Living Room' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'office', name: 'Office' },
    { id: 'hallway', name: 'Hallway' },
  ];

  const handleZoneEdit = (zoneId: string) => {
    // Implementation for zone editing
    console.log('Edit zone:', zoneId);
  };

  const handleZoneDelete = (zoneId: string) => {
    const updatedZones = zones.filter(zone => zone.id !== zoneId);
    onZonesChange(updatedZones);
  };

  const handleZoneToggle = (zoneId: string, enabled: boolean) => {
    const updatedZones = zones.map(zone =>
      zone.id === zoneId ? { ...zone, enabled } : zone
    );
    onZonesChange(updatedZones);
  };

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-80'} 
      bg-slate-800 border-r border-slate-700 
      transition-all duration-300 ease-in-out 
      overflow-y-auto flex flex-col
    `}>
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Sense360</h1>
                <p className="text-xs text-slate-400">mmWave Configurator</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2 hover:bg-slate-700"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Sensor Status */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-200">Sensor Status</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  sensorStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className={`text-xs font-medium ${
                  sensorStatus?.connected ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {sensorStatus?.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            {sensorStatus && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Firmware</span>
                  <span className="font-mono text-slate-200">
                    {sensorStatus.firmwareVersion || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Baud Rate</span>
                  <span className="font-mono text-slate-200">
                    {configuration.baudRate}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Device ID</span>
                  <span className="font-mono text-slate-200 truncate">
                    {configuration.deviceId}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Last Update</span>
                  <span className="font-mono text-slate-200">
                    {sensorStatus.lastUpdate 
                      ? `${((Date.now() - sensorStatus.lastUpdate) / 1000).toFixed(1)}s ago`
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Zone Configuration */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-slate-200">Zone Configuration</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onAddZone}
                className="text-xs text-primary-400 hover:text-primary-300 p-1"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Zone
              </Button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {zones.map((zone, index) => (
                <Card key={zone.id} className="bg-slate-700/50 border-slate-600 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded border"
                        style={{ backgroundColor: zone.color, borderColor: zone.color }}
                      />
                      <span className="text-sm font-medium text-slate-200 truncate">
                        {zone.name}
                      </span>
                      <Badge 
                        variant={zone.type === 'detection' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {zone.type}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Switch
                        checked={zone.enabled}
                        onCheckedChange={(enabled) => handleZoneToggle(zone.id, enabled)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZoneEdit(zone.id)}
                        className="p-1 h-6 w-6"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleZoneDelete(zone.id)}
                        className="p-1 h-6 w-6 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Points:</span>
                      <span className="ml-1 text-slate-200">{zone.points.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Area:</span>
                      <span className="ml-1 text-slate-200">
                        {(SensorUtils.calculateZoneArea(zone) / 1000000).toFixed(1)}m²
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
              
              {zones.length === 0 && (
                <div className="text-center py-6 text-slate-400">
                  <p className="text-sm">No zones configured</p>
                  <p className="text-xs mt-1">Click "Add Zone" to create your first zone</p>
                </div>
              )}
            </div>
          </div>

          {/* Sensor Settings */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-medium text-slate-200 mb-3">Sensor Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Presence Timeout: {configuration.presenceTimeout}s
                </label>
                <Slider
                  value={[configuration.presenceTimeout]}
                  onValueChange={([value]) => 
                    onConfigurationChange({ presenceTimeout: value })
                  }
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Max Detection Distance: {SensorUtils.formatDistance(configuration.maxDetectionDistance)}
                </label>
                <Slider
                  value={[configuration.maxDetectionDistance]}
                  onValueChange={([value]) => 
                    onConfigurationChange({ maxDetectionDistance: value })
                  }
                  min={100}
                  max={6000}
                  step={100}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-xs text-slate-400 mb-2">
                  Sensitivity: {configuration.sensitivity}
                </label>
                <Slider
                  value={[configuration.sensitivity]}
                  onValueChange={([value]) => 
                    onConfigurationChange({ sensitivity: value })
                  }
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Multi-Target Tracking</label>
                <Switch
                  checked={configuration.multiTargetEnabled}
                  onCheckedChange={(checked) => 
                    onConfigurationChange({ multiTargetEnabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-400">Bluetooth</label>
                <Switch
                  checked={configuration.bluetoothEnabled}
                  onCheckedChange={(checked) => 
                    onConfigurationChange({ bluetoothEnabled: checked })
                  }
                />
              </div>
            </div>
          </div>

          {/* Room Presets */}
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-sm font-medium text-slate-200 mb-3">Room Presets</h3>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPreset(preset.id)}
                  className="text-xs border-slate-600 hover:border-slate-500"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 mt-auto">
            <div className="space-y-2">
              <Button
                onClick={onExportYAML}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export YAML
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onSaveConfig}
                  className="border-slate-600"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadConfig}
                  className="border-slate-600"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Load
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onCalibrate}
                className="w-full border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
              >
                <Settings className="w-4 h-4 mr-2" />
                Calibrate Sensor
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onFactoryReset}
                className="w-full border-red-600/30 text-red-400 hover:bg-red-600/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Factory Reset
              </Button>
            </div>
          </div>
        </>
      )}

      {isCollapsed && (
        <div className="p-2 space-y-2">
          <div className="flex justify-center">
            <div className={`w-3 h-3 rounded-full ${
              sensorStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onExportYAML}
            className="w-full p-2"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCalibrate}
            className="w-full p-2 text-amber-400"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
