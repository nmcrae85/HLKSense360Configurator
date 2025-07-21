import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Copy, 
  Check, 
  FileText, 
  Settings, 
  Zap,
  X 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SensorConfiguration } from '@/types/sensor';
import { YAMLGenerator } from '@/lib/yaml-generator';

interface YAMLExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  configuration: SensorConfiguration;
  onExport: (advanced: boolean) => void;
  isExporting?: boolean;
}

export function YAMLExportModal({
  isOpen,
  onClose,
  configuration,
  onExport,
  isExporting = false,
}: YAMLExportModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const basicYAML = YAMLGenerator.generateBasicConfig(configuration);
  const advancedYAML = YAMLGenerator.generateAdvancedConfig(configuration);

  const handleCopy = async (content: string, section: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
      
      toast({
        title: "Copied to Clipboard",
        description: "YAML configuration copied successfully",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (advanced: boolean) => {
    const content = advanced ? advancedYAML : basicYAML;
    const filename = `${configuration.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${advanced ? 'advanced' : 'basic'}.yaml`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: `${advanced ? 'Advanced' : 'Basic'} YAML configuration downloaded`,
    });
  };

  const configurationSummary = {
    zones: configuration.zones.length,
    detectionZones: configuration.zones.filter(z => z.type === 'detection').length,
    filterZones: configuration.zones.filter(z => z.type === 'filter').length,
    maxDistance: configuration.maxDetectionDistance,
    sensitivity: configuration.sensitivity,
    multiTarget: configuration.multiTargetEnabled,
    bluetooth: configuration.bluetoothEnabled,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-800 border-slate-600">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg">ESPHome Configuration Export</DialogTitle>
                <p className="text-sm text-slate-400">
                  Export YAML configuration for {configuration.name}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Configuration Summary */}
          <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
            <h3 className="text-sm font-medium mb-3">Configuration Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-slate-400">Total Zones</div>
                <div className="font-mono text-slate-200">{configurationSummary.zones}</div>
              </div>
              <div>
                <div className="text-slate-400">Detection Zones</div>
                <div className="font-mono text-emerald-400">{configurationSummary.detectionZones}</div>
              </div>
              <div>
                <div className="text-slate-400">Filter Zones</div>
                <div className="font-mono text-amber-400">{configurationSummary.filterZones}</div>
              </div>
              <div>
                <div className="text-slate-400">Max Distance</div>
                <div className="font-mono text-slate-200">
                  {(configurationSummary.maxDistance / 1000).toFixed(1)}m
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={configurationSummary.multiTarget ? "default" : "secondary"}>
                Multi-Target: {configurationSummary.multiTarget ? 'On' : 'Off'}
              </Badge>
              <Badge variant={configurationSummary.bluetooth ? "default" : "secondary"}>
                Bluetooth: {configurationSummary.bluetooth ? 'On' : 'Off'}
              </Badge>
              <Badge variant="outline">
                Sensitivity: {configurationSummary.sensitivity}/10
              </Badge>
            </div>
          </div>

          {/* YAML Configuration Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'basic' | 'advanced')}>
            <div className="flex items-center justify-between">
              <TabsList className="grid w-auto grid-cols-2">
                <TabsTrigger value="basic" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Basic Configuration</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Advanced Configuration</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(activeTab === 'basic' ? basicYAML : advancedYAML, activeTab)}
                  className="border-slate-600"
                >
                  {copiedSection === activeTab ? (
                    <Check className="w-4 h-4 mr-1 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  Copy
                </Button>
                <Button
                  onClick={() => handleDownload(activeTab === 'advanced')}
                  disabled={isExporting}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Download'}
                </Button>
              </div>
            </div>

            <TabsContent value="basic" className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center space-x-2 mb-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Basic ESPHome Configuration</span>
                </div>
                <p className="text-xs text-slate-400">
                  Standard ESPHome configuration with basic zone support (rectangular zones only).
                  Compatible with the official ESPHome LD2450 component.
                </p>
              </div>

              <ScrollArea className="h-96 bg-slate-900 rounded-lg border border-slate-600">
                <pre className="p-4 text-sm font-mono text-slate-200 whitespace-pre-wrap">
                  <code>{basicYAML}</code>
                </pre>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium">Advanced ESPHome Configuration</span>
                </div>
                <p className="text-xs text-slate-400">
                  Advanced configuration using TillFleisch external component with support for 
                  custom polygon zones and enhanced features.
                </p>
              </div>

              <ScrollArea className="h-96 bg-slate-900 rounded-lg border border-slate-600">
                <pre className="p-4 text-sm font-mono text-slate-200 whitespace-pre-wrap">
                  <code>{advancedYAML}</code>
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Installation Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Installation Instructions</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div className="font-medium text-slate-300">1. Hardware Connection</div>
                <div className="text-slate-400">
                  Connect HLK-LD2450 to ESP32:<br />
                  • TX → GPIO17<br />
                  • RX → GPIO16<br />
                  • VCC → 5V<br />
                  • GND → GND
                </div>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-slate-300">2. ESPHome Setup</div>
                <div className="text-slate-400">
                  1. Save the YAML file<br />
                  2. Update WiFi credentials<br />
                  3. Flash to ESP32<br />
                  4. Add to Home Assistant
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-600">
            <Button variant="outline" onClick={onClose} className="border-slate-600">
              Close
            </Button>
            <Button
              onClick={() => onExport(activeTab === 'advanced')}
              disabled={isExporting}
              className="bg-primary-600 hover:bg-primary-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : `Export ${activeTab === 'advanced' ? 'Advanced' : 'Basic'} Config`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
