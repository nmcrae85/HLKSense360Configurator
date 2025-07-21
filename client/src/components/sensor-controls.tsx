import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Settings, 
  Wifi, 
  WifiOff,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Radio,
  Database
} from 'lucide-react';
import { SensorConfiguration, SensorStatus, SensorData } from '@/types/sensor';
import { SensorUtils } from '@/lib/sensor-utils';

interface SensorControlsProps {
  sensorStatus: SensorStatus | null;
  configuration: SensorConfiguration;
  onConfigurationChange: (config: Partial<SensorConfiguration>) => void;
  statistics: {
    totalTargets: number;
    movingTargets: number;
    stillTargets: number;
    averageDistance: number;
    averageSpeed: number;
    updateRate: number;
    packetCount: number;
    lastUpdate: number;
  };
  onConnect: () => void;
  onDisconnect: () => void;
  onCalibrate: () => void;
  onFactoryReset: () => void;
  isConnecting?: boolean;
}

export function SensorControls({
  sensorStatus,
  configuration,
  onConfigurationChange,
  statistics,
  onConnect,
  onDisconnect,
  onCalibrate,
  onFactoryReset,
  isConnecting = false,
}: SensorControlsProps) {
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleConnect = async () => {
    try {
      await onConnect();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  };

  const handleCalibrate = async () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);
    
    // Simulate calibration progress
    const interval = setInterval(() => {
      setCalibrationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    try {
      await onCalibrate();
    } catch (error) {
      clearInterval(interval);
      setIsCalibrating(false);
      setCalibrationProgress(0);
    }
  };

  const connectionStatusColor = sensorStatus?.connected 
    ? 'text-emerald-400' 
    : 'text-red-400';

  const connectionIcon = sensorStatus?.connected ? Wifi : WifiOff;
  const ConnectionIcon = connectionIcon;

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <ConnectionIcon className={`w-5 h-5 ${connectionStatusColor}`} />
            <span>Sensor Connection</span>
            <Badge 
              variant={sensorStatus?.connected ? 'default' : 'destructive'}
              className="ml-auto"
            >
              {sensorStatus?.connected ? 'Connected' : 'Disconnected'}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Connection Details */}
          {sensorStatus && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Device ID</div>
                <div className="font-mono text-slate-200 truncate">
                  {configuration.deviceId}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Firmware</div>
                <div className="font-mono text-slate-200">
                  {sensorStatus.firmwareVersion || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Baud Rate</div>
                <div className="font-mono text-slate-200">
                  {configuration.baudRate}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Last Update</div>
                <div className="font-mono text-slate-200">
                  {sensorStatus.lastUpdate 
                    ? `${((Date.now() - sensorStatus.lastUpdate) / 1000).toFixed(1)}s ago`
                    : 'Never'
                  }
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Connection Controls */}
          <div className="flex space-x-2">
            {sensorStatus?.connected ? (
              <Button
                variant="outline"
                onClick={onDisconnect}
                className="flex-1 border-red-600/30 text-red-400 hover:bg-red-600/10"
              >
                <WifiOff className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex-1 bg-primary-600 hover:bg-primary-700"
              >
                <Wifi className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleCalibrate}
              disabled={!sensorStatus?.connected || isCalibrating}
              className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              {isCalibrating ? 'Calibrating...' : 'Calibrate'}
            </Button>
          </div>

          {/* Calibration Progress */}
          {isCalibrating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Calibration Progress</span>
                <span className="text-slate-200">{calibrationProgress}%</span>
              </div>
              <Progress value={calibrationProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-time Statistics */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Live Statistics</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="targets" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="targets">Targets</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <TabsContent value="targets" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-slate-400 text-sm">Total Targets</div>
                  <div className="text-2xl font-mono text-slate-200">
                    {statistics.totalTargets}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 text-sm">Moving</div>
                  <div className="text-2xl font-mono text-emerald-400">
                    {statistics.movingTargets}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 text-sm">Still</div>
                  <div className="text-2xl font-mono text-blue-400">
                    {statistics.stillTargets}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 text-sm">Avg Distance</div>
                  <div className="text-2xl font-mono text-slate-200">
                    {SensorUtils.formatDistance(statistics.averageDistance)}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-slate-400 text-sm">Average Speed</div>
                <div className="text-lg font-mono text-slate-200">
                  {SensorUtils.formatSpeed(statistics.averageSpeed)}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-slate-400 text-sm">Update Rate</div>
                  <div className="text-2xl font-mono text-slate-200">
                    {statistics.updateRate}Hz
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-400 text-sm">Packets</div>
                  <div className="text-2xl font-mono text-slate-200">
                    {statistics.packetCount.toLocaleString()}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-slate-400 text-sm">Last Update</div>
                <div className="text-lg font-mono text-slate-200">
                  {statistics.lastUpdate 
                    ? `${((Date.now() - statistics.lastUpdate) / 1000).toFixed(2)}s ago`
                    : 'Never'
                  }
                </div>
              </div>

              {/* Performance indicators */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Signal Quality</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={85} className="w-16 h-2" />
                    <span className="text-sm text-slate-200">85%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Processing Load</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={statistics.updateRate > 15 ? 90 : 45} className="w-16 h-2" />
                    <span className="text-sm text-slate-200">
                      {statistics.updateRate > 15 ? 'High' : 'Normal'}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">WebSocket Status</span>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Connected</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Data Throughput</span>
                  <span className="text-sm font-mono text-slate-200">
                    {(statistics.packetCount * 32 / 1024).toFixed(1)} KB/s
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Latency</span>
                  <span className="text-sm font-mono text-slate-200">
                    ~{(1000 / Math.max(statistics.updateRate, 1)).toFixed(0)}ms
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-slate-400 text-sm">Connection Health</div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm text-emerald-400">Excellent</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Sensor Configuration */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Quick Configuration</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baudRate" className="text-sm">Baud Rate</Label>
              <Select 
                value={configuration.baudRate.toString()} 
                onValueChange={(value) => 
                  onConfigurationChange({ baudRate: parseInt(value) })
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="9600">9600</SelectItem>
                  <SelectItem value="19200">19200</SelectItem>
                  <SelectItem value="38400">38400</SelectItem>
                  <SelectItem value="57600">57600</SelectItem>
                  <SelectItem value="115200">115200</SelectItem>
                  <SelectItem value="230400">230400</SelectItem>
                  <SelectItem value="256000">256000</SelectItem>
                  <SelectItem value="460800">460800</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deviceId" className="text-sm">Device ID</Label>
              <Input
                id="deviceId"
                value={configuration.deviceId}
                onChange={(e) => onConfigurationChange({ deviceId: e.target.value })}
                className="bg-slate-700 border-slate-600"
              />
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Danger Zone</span>
            </div>
            
            <Button
              variant="outline"
              onClick={onFactoryReset}
              disabled={!sensorStatus?.connected}
              className="w-full border-red-600/30 text-red-400 hover:bg-red-600/10"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Factory Reset Sensor
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
