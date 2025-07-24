import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Clock, 
  Palette,
  Monitor,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface EmbedOptions {
  from: string;
  to: string;
  refresh: string;
  theme: 'light' | 'dark';
  kiosk: boolean;
}

interface EmbedResponse {
  embedUrl: string;
  embedToken?: string;
  iframe: string;
}

interface PanelEmbedResponse extends EmbedResponse {
  panelId: number;
}

interface EmbeddedDashboardProps {
  dashboardUid: string;
  title: string;
  height?: number;
  panelId?: number;
  autoRefresh?: boolean;
  defaultTimeRange?: { from: string; to: string };
}

export default function EmbeddedDashboard({
  dashboardUid,
  title,
  height = 500,
  panelId,
  autoRefresh = true,
  defaultTimeRange = { from: 'now-1h', to: 'now' }
}: EmbeddedDashboardProps) {
  const [embedOptions, setEmbedOptions] = useState<EmbedOptions>({
    from: defaultTimeRange.from,
    to: defaultTimeRange.to,
    refresh: '30s',
    theme: 'light',
    kiosk: false
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const queryClient = useQueryClient();

  // Generate embed URL and token
  const { data: embedData, isLoading, error, refetch } = useQuery<EmbedResponse | PanelEmbedResponse>({
    queryKey: ['grafana', 'embed', dashboardUid, panelId, embedOptions],
    queryFn: () => {
      const params = new URLSearchParams({
        from: embedOptions.from,
        to: embedOptions.to,
        refresh: embedOptions.refresh,
        theme: embedOptions.theme,
        kiosk: embedOptions.kiosk.toString(),
        autofitpanels: 'true'
      });

      const endpoint = panelId 
        ? `/api/grafana/embed/panel/${dashboardUid}/${panelId}?${params}`
        : `/api/grafana/embed/dashboard/${dashboardUid}?${params}`;

      return fetch(endpoint).then(res => res.json());
    },
    refetchInterval: autoRefresh ? 300000 : false, // Refresh every 5 minutes
    staleTime: 60000 // Consider fresh for 1 minute
  });

  // Refresh embed token mutation
  const refreshTokenMutation = useMutation({
    mutationFn: () => apiRequest('/api/grafana/embed/refresh-token', {
      method: 'POST',
      body: JSON.stringify({ dashboardUid, panelId })
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['grafana', 'embed', dashboardUid]);
      setLastRefresh(new Date());
    }
  });

  // Auto-refresh iframe content
  useEffect(() => {
    if (autoRefresh && iframeRef.current) {
      const interval = setInterval(() => {
        if (iframeRef.current) {
          // Refresh iframe by updating src
          const currentSrc = iframeRef.current.src;
          iframeRef.current.src = '';
          setTimeout(() => {
            if (iframeRef.current) {
              iframeRef.current.src = currentSrc;
            }
          }, 100);
          setLastRefresh(new Date());
        }
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const handleTimeRangeChange = (range: string) => {
    const timeRanges: Record<string, { from: string; to: string }> = {
      '5m': { from: 'now-5m', to: 'now' },
      '15m': { from: 'now-15m', to: 'now' },
      '1h': { from: 'now-1h', to: 'now' },
      '6h': { from: 'now-6h', to: 'now' },
      '24h': { from: 'now-24h', to: 'now' },
      '7d': { from: 'now-7d', to: 'now' }
    };

    setEmbedOptions(prev => ({
      ...prev,
      ...timeRanges[range]
    }));
  };

  const handleRefreshIntervalChange = (interval: string) => {
    setEmbedOptions(prev => ({
      ...prev,
      refresh: interval
    }));
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    setEmbedOptions(prev => ({
      ...prev,
      theme
    }));
  };

  const handleKioskToggle = (enabled: boolean) => {
    setEmbedOptions(prev => ({
      ...prev,
      kiosk: enabled
    }));
  };

  const handleManualRefresh = () => {
    refetch();
    refreshTokenMutation.mutate();
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleOpenInGrafana = () => {
    if (embedData) {
      const baseUrl = embedData.embedUrl.split('/d-solo/')[0];
      const newUrl = panelId 
        ? `${baseUrl}/d/${dashboardUid}?viewPanel=${panelId}`
        : `${baseUrl}/d/${dashboardUid}`;
      window.open(newUrl, '_blank');
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Grafana Dashboard Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Failed to load Grafana dashboard. Please check your Grafana configuration and try again.
            </AlertDescription>
          </Alert>
          <Button onClick={handleManualRefresh} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                {title}
                {panelId && <Badge variant="outline">Panel {panelId}</Badge>}
              </CardTitle>
              <CardDescription>
                Last updated: {lastRefresh.toLocaleTimeString()}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={embedData ? 'default' : 'secondary'} className="flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : embedData ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <AlertCircle className="h-3 w-3" />
                )}
                {isLoading ? 'Loading...' : embedData ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="controls" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="controls">Controls</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="controls" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time-range">Time Range</Label>
                  <Select onValueChange={handleTimeRangeChange} defaultValue="1h">
                    <SelectTrigger>
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5m">Last 5 minutes</SelectItem>
                      <SelectItem value="15m">Last 15 minutes</SelectItem>
                      <SelectItem value="1h">Last hour</SelectItem>
                      <SelectItem value="6h">Last 6 hours</SelectItem>
                      <SelectItem value="24h">Last 24 hours</SelectItem>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="refresh-interval">Refresh</Label>
                  <Select onValueChange={handleRefreshIntervalChange} defaultValue="30s">
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5s">5 seconds</SelectItem>
                      <SelectItem value="10s">10 seconds</SelectItem>
                      <SelectItem value="30s">30 seconds</SelectItem>
                      <SelectItem value="1m">1 minute</SelectItem>
                      <SelectItem value="5m">5 minutes</SelectItem>
                      <SelectItem value="15m">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select onValueChange={(value) => handleThemeChange(value as 'light' | 'dark')} defaultValue="light">
                    <SelectTrigger>
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Actions</Label>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleManualRefresh} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleFullscreenToggle}>
                      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleOpenInGrafana}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="kiosk-mode"
                      checked={embedOptions.kiosk}
                      onCheckedChange={handleKioskToggle}
                    />
                    <Label htmlFor="kiosk-mode">Kiosk Mode</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hide Grafana navigation and controls for a clean embed experience
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <Label>Auto Refresh</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Dashboard refreshes automatically every 30 seconds when enabled
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Embedded Dashboard */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
              <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground">Loading dashboard...</p>
              </div>
            </div>
          ) : embedData ? (
            <iframe
              ref={iframeRef}
              src={embedData.embedUrl}
              width="100%"
              height={isFullscreen ? 'calc(100vh - 200px)' : height}
              frameBorder="0"
              className="rounded-b-lg"
              title={title}
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center" style={{ height: `${height}px` }}>
              <div className="text-center space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Dashboard not available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}