import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Menu, X } from 'lucide-react';
import { Sidebar } from '@/components/sidebar';
import { SensorCanvas } from '@/components/sensor-canvas';
import { YAMLExportModal } from '@/components/yaml-export-modal';
import { useSensorData } from '@/hooks/use-sensor-data';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { YAMLGenerator } from '@/lib/yaml-generator';
import { SensorUtils } from '@/lib/sensor-utils';
import { 
  SensorConfiguration, 
  Zone, 
  ViewMode, 
  Target,
} from '@/types/sensor';

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode['mode']>('live');
  const [yamlModalOpen, setYamlModalOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('hlk2450_dev_001');

  // Configuration State
  const [configuration, setConfiguration] = useState<SensorConfiguration>({
    name: 'Sense360 Sensor',
    deviceId: 'hlk2450_dev_001',
    baudRate: 256000,
    presenceTimeout: 5,
    maxDetectionDistance: 4000,
    sensitivity: 7,
    multiTargetEnabled: true,
    bluetoothEnabled: false,
    zones: [],
  });

  // Sensor Data Hook
  const {
    connectionStatus,
    isConnected,
    sensorData,
    sensorStatus,
    targets,
    isPresenceDetected,
    hasMovingTarget,
    hasStillTarget,
    statistics,
  } = useSensorData({
    deviceId: selectedDeviceId,
    onTargetUpdate: (newTargets: Target[]) => {
      // Handle target updates if needed
    },
    onStatusChange: (status) => {
      if (status.connected) {
        toast({
          title: "Sensor Connected",
          description: `${status.deviceId} is now online`,
        });
      }
    },
  });

  // Load sensor configurations
  const { data: sensorConfigs } = useQuery({
    queryKey: ['/api/sensors'],
    select: (data: SensorConfigurationRecord[]) => data,
  });

  // Load current configuration
  const { data: currentConfig } = useQuery({
    queryKey: ['/api/sensors', selectedDeviceId],
    enabled: !!selectedDeviceId,
    select: (data: SensorConfigurationRecord) => data,
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: async (updates: Partial<SensorConfiguration>) => {
      const response = await apiRequest(
        'PUT', 
        `/api/sensors/${selectedDeviceId}`, 
        updates
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sensors'] });
      toast({
        title: "Configuration Updated",
        description: "Sensor configuration has been saved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update sensor configuration",
        variant: "destructive",
      });
    },
  });

  // Create configuration mutation
  const createConfigMutation = useMutation({
    mutationFn: async (config: SensorConfiguration) => {
      const response = await apiRequest('POST', '/api/sensors', config);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sensors'] });
      toast({
        title: "Configuration Created",
        description: "New sensor configuration created successfully",
      });
    },
  });

  // Export YAML mutation
  const exportYAMLMutation = useMutation({
    mutationFn: async (advanced: boolean = false) => {
      const response = await apiRequest(
        'GET', 
        `/api/sensors/${selectedDeviceId}/yaml?advanced=${advanced}`
      );
      return response.text();
    },
    onSuccess: (yamlContent) => {
      const blob = new Blob([yamlContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${SensorUtils.sanitizeName(configuration.name)}.yaml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "YAML Exported",
        description: "ESPHome configuration downloaded successfully",
      });
    },
  });

  // Load presets
  const { data: presets } = useQuery({
    queryKey: ['/api/presets'],
  });

  // Sync configuration with current config data
  useEffect(() => {
    if (currentConfig) {
      setConfiguration({
        name: currentConfig.name,
        deviceId: currentConfig.deviceId,
        firmwareVersion: currentConfig.firmwareVersion,
        baudRate: currentConfig.baudRate,
        presenceTimeout: currentConfig.presenceTimeout,
        maxDetectionDistance: currentConfig.maxDetectionDistance,
        sensitivity: currentConfig.sensitivity,
        multiTargetEnabled: currentConfig.multiTargetEnabled,
        bluetoothEnabled: currentConfig.bluetoothEnabled,
        zones: currentConfig.zones as Zone[],
      });
    }
  }, [currentConfig]);

  // Event Handlers
  const handleConfigurationChange = useCallback((updates: Partial<SensorConfiguration>) => {
    const newConfig = { ...configuration, ...updates };
    setConfiguration(newConfig);
    
    // Auto-save configuration changes
    updateConfigMutation.mutate(updates);
  }, [configuration, updateConfigMutation]);

  const handleZonesChange = useCallback((zones: Zone[]) => {
    handleConfigurationChange({ zones });
  }, [handleConfigurationChange]);

  const handleAddZone = useCallback(() => {
    const newZone: Zone = {
      id: `zone_${Date.now()}`,
      name: `Zone ${configuration.zones.length + 1}`,
      type: 'detection',
      color: SensorUtils.getZoneColor('detection', configuration.zones.length),
      points: [
        { x: -500, y: 1000 },
        { x: 500, y: 1000 },
        { x: 500, y: 2000 },
        { x: -500, y: 2000 }
      ],
      enabled: true,
    };
    
    handleZonesChange([...configuration.zones, newZone]);
  }, [configuration.zones, handleZonesChange]);

  const handleExportYAML = useCallback(() => {
    setYamlModalOpen(true);
  }, []);

  const handleSaveConfig = useCallback(() => {
    const configData = JSON.stringify(configuration, null, 2);
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${SensorUtils.sanitizeName(configuration.name)}_config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Configuration Saved",
      description: "Configuration file downloaded successfully",
    });
  }, [configuration, toast]);

  const handleLoadConfig = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const loadedConfig = JSON.parse(text) as SensorConfiguration;
          setConfiguration(loadedConfig);
          updateConfigMutation.mutate(loadedConfig);
        } catch (error) {
          toast({
            title: "Load Failed",
            description: "Invalid configuration file format",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  }, [updateConfigMutation, toast]);

  const handleCalibrate = useCallback(async () => {
    try {
      await apiRequest('POST', `/api/sensors/${selectedDeviceId}/calibrate`, {});
      toast({
        title: "Calibration Started",
        description: "Sensor calibration has been initiated",
      });
    } catch (error) {
      toast({
        title: "Calibration Failed",
        description: "Failed to start sensor calibration",
        variant: "destructive",
      });
    }
  }, [selectedDeviceId, toast]);

  const handleFactoryReset = useCallback(async () => {
    try {
      await apiRequest('POST', `/api/sensors/${selectedDeviceId}/factory-reset`, {});
      toast({
        title: "Factory Reset Initiated",
        description: "Sensor will be reset to factory defaults",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to initiate factory reset",
        variant: "destructive",
      });
    }
  }, [selectedDeviceId, toast]);

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        sensorStatus={sensorStatus}
        configuration={configuration}
        onConfigurationChange={handleConfigurationChange}
        zones={configuration.zones}
        onZonesChange={handleZonesChange}
        onExportYAML={handleExportYAML}
        onSaveConfig={handleSaveConfig}
        onLoadConfig={handleLoadConfig}
        onCalibrate={handleCalibrate}
        onFactoryReset={handleFactoryReset}
        onAddZone={handleAddZone}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold">HLK2450 Configuration</h2>
                <p className="text-sm text-slate-400">
                  Real-time mmWave sensor visualization and control
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 bg-slate-700 px-3 py-1 rounded-full">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`} />
                <span className="text-sm text-slate-200">
                  WebSocket {connectionStatus}
                </span>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex bg-slate-700 rounded-lg p-1">
                {(['live', 'config', 'heatmap'] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-sm transition-colors ${
                      viewMode === mode 
                        ? 'bg-primary text-white' 
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {mode === 'live' ? 'Live View' : 
                     mode === 'config' ? 'Config Mode' : 'Heatmap'}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <SensorCanvas
            targets={targets}
            zones={configuration.zones}
            onZonesChange={handleZonesChange}
            viewMode={viewMode}
            sensorStatus={sensorStatus}
            maxDetectionDistance={configuration.maxDetectionDistance}
          />
        </div>

        {/* Status Bar */}
        <div className="bg-slate-800 border-t border-slate-700 px-6 py-3">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-slate-400">Targets:</span>
              <span className="font-mono text-slate-200">{statistics.totalTargets}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-slate-400">Moving:</span>
              <span className="font-mono text-slate-200">{statistics.movingTargets}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full" />
              <span className="text-slate-400">Still:</span>
              <span className="font-mono text-slate-200">{statistics.stillTargets}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-slate-400">Rate:</span>
              <span className="font-mono text-slate-200">{statistics.updateRate}Hz</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full" />
              <span className="text-slate-400">Range:</span>
              <span className="font-mono text-slate-200">
                {SensorUtils.formatDistance(configuration.maxDetectionDistance)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-500 rounded-full" />
              <span className="text-slate-400">Packets:</span>
              <span className="font-mono text-slate-200">{statistics.packetCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 lg:hidden">
          <div className="flex flex-col h-full">
            <div className="bg-slate-800 p-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sensor Configuration</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <h3 className="font-medium mb-3">Quick Settings</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={handleCalibrate}
                    className="w-full bg-primary-600 text-white"
                  >
                    Start Calibration
                  </Button>
                  <Button 
                    onClick={handleExportYAML}
                    variant="outline"
                    className="w-full border-slate-600"
                  >
                    Export Configuration
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* YAML Export Modal */}
      <YAMLExportModal
        isOpen={yamlModalOpen}
        onClose={() => setYamlModalOpen(false)}
        configuration={configuration}
        onExport={(advanced: boolean) => exportYAMLMutation.mutate(advanced)}
        isExporting={exportYAMLMutation.isPending}
      />
    </div>
  );
}
