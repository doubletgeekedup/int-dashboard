import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Activity, BarChart3, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface GrafanaStatus {
  connected: boolean;
  url: string;
  configured: boolean;
}

interface GrafanaDashboard {
  id?: number;
  uid?: string;
  title: string;
  tags: string[];
  panels: any[];
  time: {
    from: string;
    to: string;
  };
  refresh: string;
}

interface DashboardResponse {
  dashboard: GrafanaDashboard;
  url: string;
  message: string;
}

export default function GrafanaDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Query Grafana status
  const { data: status } = useQuery<GrafanaStatus>({
    queryKey: ['grafana', 'status'],
    queryFn: () => fetch('/api/grafana/status').then(res => res.json()),
    refetchInterval: 30000 // Check status every 30 seconds
  });

  // Create integration dashboard mutation
  const createDashboardMutation = useMutation({
    mutationFn: () => apiRequest('/api/grafana/dashboard/create', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['grafana']);
    }
  });

  // Create similarity analytics dashboard mutation
  const createSimilarityDashboardMutation = useMutation({
    mutationFn: () => apiRequest('/api/grafana/dashboard/similarity', { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['grafana']);
    }
  });

  // Query metrics mutation
  const queryMetricsMutation = useMutation({
    mutationFn: (payload: { queries: any[]; timeRange?: any }) => 
      apiRequest('/api/grafana/metrics/query', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
      })
  });

  const handleCreateDashboard = async () => {
    try {
      const result = await createDashboardMutation.mutateAsync() as DashboardResponse;
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to create dashboard:', error);
    }
  };

  const handleCreateSimilarityDashboard = async () => {
    try {
      const result = await createSimilarityDashboardMutation.mutateAsync() as DashboardResponse;
      if (result.url) {
        window.open(result.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to create similarity dashboard:', error);
    }
  };

  const handleQueryMetrics = async () => {
    const queries = [
      {
        query: 'avg_response_time_ms{source=~"STC|CPT|SLC|TMC|CAS|NVL"}',
        datasource: 'Prometheus'
      },
      {
        query: 'record_count{source=~"STC|CPT|SLC|TMC|CAS|NVL"}',
        datasource: 'Prometheus'
      }
    ];

    try {
      await queryMetricsMutation.mutateAsync({ queries });
    } catch (error) {
      console.error('Failed to query metrics:', error);
    }
  };

  const getStatusColor = (status: GrafanaStatus | undefined) => {
    if (!status) return 'secondary';
    if (status.connected) return 'default';
    if (status.configured) return 'outline';
    return 'destructive';
  };

  const getStatusIcon = (status: GrafanaStatus | undefined) => {
    if (!status) return <Clock className="h-4 w-4" />;
    if (status.connected) return <CheckCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getStatusText = (status: GrafanaStatus | undefined) => {
    if (!status) return 'Checking...';
    if (status.connected) return 'Connected';
    if (status.configured) return 'Configured (Not Connected)';
    return 'Not Configured';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Metrics</h1>
          <p className="text-muted-foreground">
            Visualize integration dashboard metrics with Grafana
          </p>
        </div>
        <Badge variant={getStatusColor(status)} className="flex items-center gap-2">
          {getStatusIcon(status)}
          {getStatusText(status)}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Grafana Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {status?.connected ? 'Online' : 'Offline'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {status?.url || 'No URL configured'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dashboard Count</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">
                  Available dashboard templates
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Sources</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-muted-foreground">
                  Integration sources monitored
                </p>
              </CardContent>
            </Card>
          </div>

          {!status?.configured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Grafana is not configured. To enable performance metrics visualization, 
                add your Grafana URL and API key to the environment configuration.
                Dashboard features will work in simulation mode for development.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Performance metrics and visualization capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-semibold">Integration Monitoring</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Source response times</li>
                    <li>• Record count tracking</li>
                    <li>• System uptime metrics</li>
                    <li>• Error rate monitoring</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Advanced Analytics</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Similarity score distribution</li>
                    <li>• Relationship discovery</li>
                    <li>• Cluster analysis results</li>
                    <li>• Graph query performance</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Integration Dashboard
                </CardTitle>
                <CardDescription>
                  Monitor performance metrics for all sources of truth
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Panels Include:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Source Response Times</li>
                    <li>• Record Count by Source</li>
                    <li>• System Uptime</li>
                    <li>• Error Rate</li>
                    <li>• Transaction Throughput</li>
                    <li>• JanusGraph Performance</li>
                  </ul>
                </div>
                <Separator />
                <Button 
                  onClick={handleCreateDashboard}
                  disabled={createDashboardMutation.isPending}
                  className="w-full"
                >
                  {createDashboardMutation.isPending ? 'Creating...' : 'Create Dashboard'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Similarity Analytics
                </CardTitle>
                <CardDescription>
                  Visualize relationship analysis and similarity detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Panels Include:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Similarity Score Distribution</li>
                    <li>• Relationship Discovery Count</li>
                    <li>• Cluster Analysis Results</li>
                    <li>• Graph Query Performance</li>
                  </ul>
                </div>
                <Separator />
                <Button 
                  onClick={handleCreateSimilarityDashboard}
                  disabled={createSimilarityDashboardMutation.isPending}
                  className="w-full"
                >
                  {createSimilarityDashboardMutation.isPending ? 'Creating...' : 'Create Dashboard'}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {(createDashboardMutation.isSuccess || createSimilarityDashboardMutation.isSuccess) && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Dashboard created successfully! The dashboard has been opened in a new tab.
                {!status?.connected && ' (Running in simulation mode for development)'}
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Query Metrics</CardTitle>
              <CardDescription>
                Execute custom metric queries and view results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Available Metrics:</h4>
                <div className="grid gap-2 md:grid-cols-2 text-sm">
                  <div className="space-y-1">
                    <p className="font-medium">Performance Metrics:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• avg_response_time_ms</li>
                      <li>• record_count</li>
                      <li>• uptime_percentage</li>
                      <li>• error_total</li>
                    </ul>
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">Graph Metrics:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• similarity_score_bucket</li>
                      <li>• relationship_discoveries_total</li>
                      <li>• janusgraph_query_duration_ms</li>
                      <li>• cluster_membership_count</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Separator />
              <Button 
                onClick={handleQueryMetrics}
                disabled={queryMetricsMutation.isPending}
                className="w-full"
              >
                {queryMetricsMutation.isPending ? 'Querying...' : 'Execute Sample Queries'}
              </Button>
              
              {queryMetricsMutation.data && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">Query Results:</h4>
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(queryMetricsMutation.data, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {!status?.connected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Metrics are simulated for development. Connect to Grafana to query real performance data.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}