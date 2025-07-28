import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LLMChat } from "@/components/chat/llm-chat";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { 
  Activity, 
  Database, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FolderSync,
  Stethoscope,
  FileText,
  ChartGantt
} from "lucide-react";
import type { DashboardStats, Source, Transaction } from "@shared/schema";

interface AIStatus {
  enabled: boolean;
  available: boolean;
  hasApiKey: boolean;
}

function MyAssistantStatusIndicator() {
  const { data: aiStatus } = useQuery<AIStatus>({
    queryKey: ["/api/chat/ai-status"],
  });

  const isAvailable = aiStatus?.available ?? false;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        isAvailable ? 'bg-green-400' : 'bg-yellow-400'
      }`} />
      <span className={isAvailable ? 'text-green-600' : 'text-yellow-600'}>
        {isAvailable ? "AI Assistant Active" : "Direct Mode"}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: sources = [], isLoading: sourcesLoading } = useQuery<Source[]>({
    queryKey: ["/api/sources"],
  });

  const { data: recentActivity = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    queryFn: async () => {
      const response = await fetch("/api/transactions?limit=5");
      return response.json();
    },
  });

  const handleRefresh = async () => {
    // Refresh all data
    window.location.reload();
  };

  const handleQuickAction = (action: string) => {
    console.log("Quick action:", action);
    // Implement specific actions
  };

  if (statsLoading || sourcesLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
        <div className="h-96 bg-muted rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark dark:text-foreground">
            Dashboard Overview
          </h1>
          <p className="text-brand-brown dark:text-muted-foreground">
            Integration hub for all development team sources of truth
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Input 
            placeholder="Search integrations..." 
            className="w-64"
          />
          <Button onClick={handleRefresh} variant="outline">
            <FolderSync className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-brown dark:text-muted-foreground">
                  Total Integrations
                </p>
                <p className="text-3xl font-bold text-brand-dark dark:text-foreground">
                  {String(stats?.totalIntegrations || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-cream dark:bg-brand-brown rounded-lg flex items-center justify-center">
                <ChartGantt className="w-6 h-6 text-brand-orange dark:text-brand-orange" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-brand-brown dark:text-muted-foreground ml-2">
                from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-brown dark:text-muted-foreground">
                  Active Sources
                </p>
                <p className="text-3xl font-bold text-brand-dark dark:text-foreground">
                  {String(stats?.activeSources || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">100%</span>
              <span className="text-brand-brown dark:text-muted-foreground ml-2">
                uptime
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-brown dark:text-muted-foreground">
                  Data Points
                </p>
                <p className="text-3xl font-bold text-brand-dark dark:text-foreground">
                  {String(stats?.dataPoints || "0 threads")}
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-cream dark:bg-brand-brown rounded-lg flex items-center justify-center">
                <Database className="w-6 h-6 text-brand-orange dark:text-brand-orange" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+5.2%</span>
              <span className="text-brand-brown dark:text-muted-foreground ml-2">
                this week
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-brown dark:text-muted-foreground">
                  Query Response
                </p>
                <p className="text-3xl font-bold text-brand-dark dark:text-foreground">
                  {String(stats?.avgResponseTime || "0ms")}
                </p>
              </div>
              <div className="w-12 h-12 bg-brand-cream dark:bg-brand-brown rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-brand-orange dark:text-brand-orange" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">-8ms</span>
              <span className="text-brand-brown dark:text-muted-foreground ml-2">
                from average
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Integration Status */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Integration Status</CardTitle>
                <Button variant="link" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sources.slice(0, 6).map((source) => (
                  <div key={source.id} className="flex items-center justify-between p-4 bg-muted rounded-lg" style={{backgroundColor: 'hsl(var(--muted) / 0.5)'}}>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-github-blue rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-github-gray-dark dark:text-foreground">
                          {String(source.code)} - {String(source.name)}
                        </h4>
                        <p className="text-sm text-github-gray-medium dark:text-muted-foreground">
                          {String(source.description)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          source.status === 'active' ? 'bg-green-400' :
                          source.status === 'syncing' ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                          {String(source.status)}
                        </Badge>
                      </div>
                      <span className="text-sm text-github-gray-medium dark:text-muted-foreground">
                        {source.lastSync ? new Date(source.lastSync).toLocaleTimeString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <PerformanceChart />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('diagnostics')}
                >
                  <Stethoscope className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">Run Diagnostics</p>
                    <p className="text-sm text-muted-foreground">Check all integrations</p>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('sync')}
                >
                  <FolderSync className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">FolderSync All Sources</p>
                    <p className="text-sm text-muted-foreground">Refresh all data</p>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('logs')}
                >
                  <FileText className="w-4 h-4 mr-3" />
                  <div className="text-left">
                    <p className="font-medium">View Logs</p>
                    <p className="text-sm text-muted-foreground">Integration activity</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* My Assistant */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Assistant</CardTitle>
                <MyAssistantStatusIndicator />
              </div>
            </CardHeader>
            <CardContent>
              <LLMChat />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 py-3 border-b border-border last:border-b-0">
                <div className="w-2 h-2 bg-github-blue rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-github-gray-dark dark:text-foreground">
                    <span className="font-medium">{String(activity.sourceCode)} Integration</span>{" "}
                    {String(activity.type)} - {String(activity.transactionId)}
                  </p>
                  <p className="text-xs text-github-gray-medium dark:text-muted-foreground mt-1">
                    {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : '--'}
                  </p>
                </div>
                <Badge variant={activity.status === 'success' ? 'default' : 'secondary'}>
                  {String(activity.status)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
