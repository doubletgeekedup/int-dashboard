import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LLMChat } from "@/components/chat/llm-chat";
import { PerformanceChart } from "@/components/charts/performance-chart";
import { DataTable } from "@/components/data/data-table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Database, 
  FolderSync, 
  Stethoscope, 
  FileText, 
  Download,
  TrendingUp,
  Activity,
  Clock,
  Server,
  Eye,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import type { Source, KnowledgeLink, PerformanceMetric } from "@shared/schema";

// Work Item interface based on the provided structure
interface WorkItem {
  csWorkItemDetails: {
    csWorkItemType: string;
    qName: string;
    tid: string;
  };
  csWorkItemProcessInfo: {
    csWorkItemProcessDetail: string;
    csWorkItemProcessSatus: string;
  };
  createDate: number;
  id: string;
  lastModified: number;
}

// ASOT Work Item interface
interface AsotWorkItem {
  description: string;
  threadId: string;
  status: string;
  type: string;
  results: string;
  startTime: number | null;
  endTime: number | null;
}

const sourceIcons = {
  SCR: Database,
  PAEXCHANGE: Server,
  SLICWAVE: Activity,
  TEAMCENTER: TrendingUp,
  GTS: Server,
  "IMPACT ASSESSMENT": Activity,
};

const sourceColors = {
  SCR: "bg-blue-500",
  PAEXCHANGE: "bg-green-500", 
  SLICWAVE: "bg-purple-500",
  TEAMCENTER: "bg-orange-500",
  GTS: "bg-red-500",
  "IMPACT ASSESSMENT": "bg-indigo-500",
};

export default function SourcePage() {
  const { code } = useParams<{ code: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create WorkItem dialog state
  const [isCreateWorkItemOpen, setIsCreateWorkItemOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  
  // Pagination and search states
  const [workItemsPage, setWorkItemsPage] = useState(1);
  const [workItemsSearch, setWorkItemsSearch] = useState("");
  const [asotPage, setAsotPage] = useState(1);
  const [asotSearch, setAsotSearch] = useState("");
  const itemsPerPage = 5;

  const { data: source, isLoading: sourceLoading } = useQuery<Source & { stats: any }>({
    queryKey: ["/api/sources", code],
    enabled: !!code,
  });

  // New work items endpoint that fetches the latest 100 items and filters by source
  const { data: workItems = [] } = useQuery({
    queryKey: ["/api/listitems", code],
    queryFn: async () => {
      const response = await fetch("/api/listitems/100");
      const allItems = await response.json();
      
      if (!code) return [];
      
      // Filter items by source based on qName prefix
      const sourceItems = allItems.filter((item: any) => 
        item.csWorkItemDetails.qName.startsWith(`${code}_`)
      );
      
      // Return only last 10 items
      return sourceItems.slice(-10);
    },
    enabled: !!code,
  });

  const { data: knowledgeLinks = [] } = useQuery<KnowledgeLink[]>({
    queryKey: ["/api/knowledge-links", code],
    queryFn: async () => {
      const response = await fetch(`/api/knowledge-links?sourceCode=${code}`);
      return response.json();
    },
    enabled: !!code,
  });

  const { data: metrics = [] } = useQuery<PerformanceMetric[]>({
    queryKey: ["/api/sources", code, "metrics"],
    queryFn: async () => {
      const response = await fetch(`/api/sources/${code}/metrics?limit=50`);
      return response.json();
    },
    enabled: !!code,
  });

  // Check if this source supports ASOT Work List
  const supportsAsotWorkList = code && ['GTS', 'PAEXCHANGE', 'TEAMCENTER', 'SCR'].includes(code.toUpperCase());

  // ASOT Work List query
  const { data: asotWorkItems = [], isLoading: asotLoading } = useQuery<AsotWorkItem[]>({
    queryKey: ["/api/asot-worklist", code],
    queryFn: async () => {
      const response = await fetch(`/api/asot-worklist/${code}?limit=10`);
      return response.json();
    },
    enabled: Boolean(code && supportsAsotWorkList),
  });

  // Filtered and paginated work items
  const filteredWorkItems = useMemo(() => {
    if (!workItems) return [];
    return workItems.filter((item: WorkItem) => 
      item.id.toLowerCase().includes(workItemsSearch.toLowerCase()) ||
      item.csWorkItemDetails.tid.toLowerCase().includes(workItemsSearch.toLowerCase()) ||
      new Date(item.createDate).toLocaleDateString().includes(workItemsSearch.toLowerCase())
    );
  }, [workItems, workItemsSearch]);

  const paginatedWorkItems = useMemo(() => {
    const startIndex = (workItemsPage - 1) * itemsPerPage;
    return filteredWorkItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredWorkItems, workItemsPage, itemsPerPage]);

  const workItemsPageCount = Math.ceil(filteredWorkItems.length / itemsPerPage);

  // Filtered and paginated ASOT work items
  const filteredAsotItems = useMemo(() => {
    if (!asotWorkItems) return [];
    return asotWorkItems.filter((item: AsotWorkItem) => 
      item.threadId.toLowerCase().includes(asotSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(asotSearch.toLowerCase()) ||
      (item.startTime && new Date(item.startTime).toLocaleDateString().includes(asotSearch.toLowerCase()))
    );
  }, [asotWorkItems, asotSearch]);

  const paginatedAsotItems = useMemo(() => {
    const startIndex = (asotPage - 1) * itemsPerPage;
    return filteredAsotItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAsotItems, asotPage, itemsPerPage]);

  const asotPageCount = Math.ceil(filteredAsotItems.length / itemsPerPage);

  const handleRefresh = async () => {
    if (!code) return;
    
    try {
      const response = await fetch(`/api/sources/${code}/refresh`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: "Source Refreshed",
          description: `${code} data has been refreshed successfully.`,
        });
      }
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh source data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    // Generate CSV export of work items
    const csv = [
      ['Transaction ID', 'Type', 'Status', 'Timestamp', 'Duration'].join(','),
      ...workItems.map((item: WorkItem) => [
        item.id,
        item.csWorkItemDetails.csWorkItemType,
        item.csWorkItemProcessInfo.csWorkItemProcessSatus,
        new Date(item.createDate).toISOString(),
        `${Math.round((item.lastModified - item.createDate) / 1000)}s`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${code}-transactions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleQuickAction = (action: string) => {
    toast({
      title: `${action} triggered`,
      description: `Running ${action} for ${code}...`,
    });
  };

  // Available projects for WorkItem creation
  const projects = [
    "Project Alpha",
    "Project Beta", 
    "Project Gamma",
    "Integration Suite",
    "Data Migration",
    "Security Audit",
    "Performance Optimization",
    "System Upgrade"
  ];

  // Create WorkItem mutation
  const createWorkItemMutation = useMutation({
    mutationFn: async (projectName: string) => {
      const response = await fetch('/api/workitems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceCode: code,
          projectName,
          workItemType: `${code}_task`,
          priority: 'medium'
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "WorkItem Created",
        description: `WorkItem created successfully for project: ${selectedProject}`,
      });
      setIsCreateWorkItemOpen(false);
      setSelectedProject("");
      // Refresh work items
      queryClient.invalidateQueries({ queryKey: ["/api/listitems", code] });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create WorkItem. Please try again.";
      toast({
        title: "Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleCreateWorkItem = () => {
    if (!selectedProject) {
      toast({
        title: "Project Required",
        description: "Please select a project before creating the WorkItem.",
        variant: "destructive",
      });
      return;
    }
    createWorkItemMutation.mutate(selectedProject);
  };

  if (sourceLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-48 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="text-center py-12">
        <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Source Not Found</h1>
        <p className="text-muted-foreground">The requested source could not be found.</p>
      </div>
    );
  }

  const IconComponent = sourceIcons[code as keyof typeof sourceIcons] || Database;
  const colorClass = sourceColors[code as keyof typeof sourceColors] || "bg-blue-500";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <div className={`w-12 h-12 ${colorClass} rounded-lg flex items-center justify-center`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-brand-dark dark:text-foreground">
            {source.code} - {source.name}
          </h1>
          <p className="text-brand-brown dark:text-muted-foreground">
            {source.description}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleRefresh} variant="outline">
            <FolderSync className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Status & Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                source.status === 'active' ? 'bg-green-400' :
                source.status === 'syncing' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                {source.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Uptime: {source.uptime}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">Version {source.version}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last Update: {source.updatedAt ? new Date(source.updatedAt).toLocaleDateString() : 'N/A'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">
              {((source as any).threadCount || source.recordCount || 0).toLocaleString()} {(source as any).threadCount ? 'Threads' : 'Records'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">+5.2% this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-medium">{source.avgResponseTime || 0}ms avg</p>
            <p className="text-xs text-muted-foreground mt-1">Response time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Data Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Performance Metrics</CardTitle>
                <Select defaultValue="7days">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 days</SelectItem>
                    <SelectItem value="30days">Last 30 days</SelectItem>
                    <SelectItem value="90days">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <PerformanceChart sourceCode={code} metrics={metrics} />
            </CardContent>
          </Card>

          {/* Work Items Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Work Items</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by ID or date..."
                      value={workItemsSearch}
                      onChange={(e) => setWorkItemsSearch(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="link" size="sm" onClick={handleExport}>
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-96 flex flex-col">
              {filteredWorkItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>{workItemsSearch ? 'No matching work items found' : 'No recent transactions found'}</p>
                    <p className="text-sm">{workItemsSearch ? 'Try adjusting your search terms' : "There haven't been any transactions in a while"}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    {paginatedWorkItems.map((item: WorkItem) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="link" className="p-0 h-auto text-brand-orange hover:text-brand-dark font-mono">
                                    {item.id}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Transaction Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Thread ID (TID)</label>
                                      <p className="font-mono text-sm mt-1">{item.csWorkItemDetails.tid}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Thread Assignment</label>
                                      <p className="text-sm mt-1">
                                        {(() => {
                                          // Determine source from TQName pattern
                                          const threadId = item.csWorkItemDetails.tid;
                                          const sourceMapping = {
                                            'b7a9c4e2-8f3d-4b1a-9e5c-2d7f8a1b3c6e': 'SCR Thread (SCR_yy.SCR_yy)',
                                            'a1d4f7b9-3e8c-4b2a-7f9d-1c5e8a4b7f2c': 'CPT Thread (CPT_config.CPT_config)',
                                            'f6c9d2a8-4b7e-4a1f-9d2c-8e5a1b4f7c9d': 'TMC Thread (TMC_transaction.TMC_transaction)',
                                            'e7f4a9b2-1d8c-4e5a-9f2b-7c4d1a8e5f9c': 'SLC Thread (SLC_service.SLC_service)',
                                            'c3a8f5d1-9b4e-4c7a-8f1d-5b9e2a7c4f8d': 'CAS Thread (CAS_auth.CAS_auth)',
                                            '9e3f7a2d-5c8b-4f1e-a7d3-8b5c2f9e7a1d': 'NVL Thread (NVL_network.NVL_network)'
                                          };
                                          return sourceMapping[threadId as keyof typeof sourceMapping] || `Thread ${threadId.substring(0, 8)}...`;
                                        })()}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-muted-foreground">Process Details</label>
                                      <p className="text-sm mt-1">{item.csWorkItemProcessInfo.csWorkItemProcessDetail}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Type</label>
                                        <p className="text-sm mt-1">{item.csWorkItemDetails.csWorkItemType}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                                        <p className="text-sm mt-1">{item.csWorkItemProcessInfo.csWorkItemProcessSatus}</p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Badge variant="outline" className="text-xs">
                                {item.csWorkItemDetails.csWorkItemType}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(item.createDate).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={
                                item.csWorkItemProcessInfo.csWorkItemProcessSatus === 'COMPLETED' ? 'default' :
                                item.csWorkItemProcessInfo.csWorkItemProcessSatus === 'FAILED' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {item.csWorkItemProcessInfo.csWorkItemProcessSatus}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {Math.round((item.lastModified - item.createDate) / 1000)}s duration
                            </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Pagination for Work Items */}
                  {workItemsPageCount > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Showing {((workItemsPage - 1) * itemsPerPage) + 1} to {Math.min(workItemsPage * itemsPerPage, filteredWorkItems.length)} of {filteredWorkItems.length} items
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWorkItemsPage(p => Math.max(1, p - 1))}
                          disabled={workItemsPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">
                          Page {workItemsPage} of {workItemsPageCount}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWorkItemsPage(p => Math.min(workItemsPageCount, p + 1))}
                          disabled={workItemsPage === workItemsPageCount}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* ASOT Work List (for supported sources) */}
          {supportsAsotWorkList && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ASOT Work List</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by thread ID or date..."
                        value={asotSearch}
                        onChange={(e) => setAsotSearch(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Active Source of Truth work items and thread extractions
                </p>
              </CardHeader>
              <CardContent className="h-96 flex flex-col">
                {asotLoading ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      Loading ASOT work items...
                    </div>
                  </div>
                ) : filteredAsotItems.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>{asotSearch ? 'No matching ASOT work items found' : 'No ASOT work items found'}</p>
                      <p className="text-sm">{asotSearch ? 'Try adjusting your search terms' : 'No recent thread extractions or work items'}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 space-y-3 overflow-y-auto">
                      {paginatedAsotItems.map((item: AsotWorkItem, index: number) => (
                    <div
                      key={`${item.threadId}-${index}`}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-sm text-brand-orange">{item.threadId}</span>
                              <Badge variant="outline" className="text-xs">
                                {item.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.results}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={
                                item.status === 'COMPLETED' ? 'default' :
                                item.status === 'FAILED' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {item.status}
                            </Badge>
                            {item.startTime && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(item.startTime).toLocaleString()}
                              </p>
                            )}
                            {item.startTime && item.endTime && (
                              <p className="text-xs text-muted-foreground">
                                {Math.round((item.endTime - item.startTime) / 1000)}s duration
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                      ))}
                    </div>
                    
                    {/* Pagination for ASOT Work Items */}
                    {asotPageCount > 1 && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Showing {((asotPage - 1) * itemsPerPage) + 1} to {Math.min(asotPage * itemsPerPage, filteredAsotItems.length)} of {filteredAsotItems.length} items
                        </p>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAsotPage(p => Math.max(1, p - 1))}
                            disabled={asotPage === 1}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">
                            Page {asotPage} of {asotPageCount}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAsotPage(p => Math.min(asotPageCount, p + 1))}
                            disabled={asotPage === asotPageCount}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* LLM Chat Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-github-purple" />
                <span>My Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LLMChat sourceCode={code} />
            </CardContent>
          </Card>

          {/* Knowledge Base Links */}
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {knowledgeLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <i className={`${link.icon} text-github-blue`} />
                      <div>
                        <p className="font-medium text-sm">{link.title}</p>
                        <p className="text-xs text-muted-foreground">{link.description}</p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Create WorkItem Dialog */}
                <Dialog open={isCreateWorkItemOpen} onOpenChange={setIsCreateWorkItemOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create WorkItem
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create WorkItem for {code}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="project">Project Name</Label>
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                          </SelectTrigger>
                          <SelectContent>
                            {projects.map((project) => (
                              <SelectItem key={project} value={project}>
                                {project}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateWorkItemOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateWorkItem}
                        disabled={!selectedProject || createWorkItemMutation.isPending}
                      >
                        {createWorkItemMutation.isPending ? "Creating..." : "Create WorkItem"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('refresh')}
                >
                  <FolderSync className="w-4 h-4 mr-2" />
                  Refresh Data
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('diagnostic')}
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Run Diagnostic
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => handleQuickAction('logs')}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Logs
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
