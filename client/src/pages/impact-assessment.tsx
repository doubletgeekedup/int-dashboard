import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Search, AlertTriangle, Eye, Filter, Activity } from "lucide-react";

interface ImpactAssessmentItem {
  id: string;
  qname: string;
  sourceCode: string;
  threadId: string;
  properties: Record<string, any>;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedSystems: string[];
  lastUpdated: string;
}

interface ImpactAssessmentData {
  items: ImpactAssessmentItem[];
  totalCount: number;
  filters: {
    impactLevels: string[];
    sources: string[];
  };
}

export default function ImpactAssessment() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedImpactLevel, setSelectedImpactLevel] = useState<string>("");
  const [selectedSource, setSelectedSource] = useState<string>("");

  // Simulate API call for impact assessment items
  const { data: assessmentData, isLoading, error } = useQuery<ImpactAssessmentData>({
    queryKey: ['/api/impact-assessment', searchTerm, selectedImpactLevel, selectedSource],
    queryFn: async () => {
      // Simulate fetching impact assessment items with qname containing "ImpactAssessment"
      const mockData: ImpactAssessmentData = {
        items: [
          {
            id: "IA_001",
            qname: "SCR_mb.SCR_mb.ImpactAssessment.SecurityUpdate",
            sourceCode: "SCR",
            threadId: "thread_001",
            properties: {
              severity: "HIGH",
              category: "Security",
              estimatedDowntime: "4 hours",
              affectedServices: ["API Gateway", "Authentication Service"]
            },
            impactLevel: "HIGH",
            description: "Security update requiring system restart",
            affectedSystems: ["SCR", "CAAS"],
            lastUpdated: "2025-01-29T14:30:00Z"
          },
          {
            id: "IA_002", 
            qname: "PAExchange_mb.ImpactAssessment.DatabaseMigration",
            sourceCode: "Capital",
            threadId: "thread_002",
            properties: {
              severity: "MEDIUM",
              category: "Database",
              estimatedDowntime: "2 hours",
              dataVolume: "500GB"
            },
            impactLevel: "MEDIUM",
            description: "Database schema migration for Capital system",
            affectedSystems: ["Capital"],
            lastUpdated: "2025-01-29T13:15:00Z"
          },
          {
            id: "IA_003",
            qname: "TeamcenterEbomPart_mb.ImpactAssessment.PartDataSync",
            sourceCode: "Teamcenter",
            threadId: "thread_003",
            properties: {
              severity: "LOW",
              category: "Data Sync",
              estimatedDowntime: "30 minutes",
              recordCount: 15000
            },
            impactLevel: "LOW",
            description: "Part data synchronization between systems",
            affectedSystems: ["Teamcenter", "Slicwave"],
            lastUpdated: "2025-01-29T12:00:00Z"
          },
          {
            id: "IA_004",
            qname: "Teamcenter_HWVerification_mb.ImpactAssessment.HardwareValidation",
            sourceCode: "Teamcenter",
            threadId: "thread_004",
            properties: {
              severity: "CRITICAL",
              category: "Hardware",
              estimatedDowntime: "8 hours",
              systemsAffected: 12
            },
            impactLevel: "CRITICAL",
            description: "Critical hardware validation process update",
            affectedSystems: ["Teamcenter", "Navrel", "Slicwave"],
            lastUpdated: "2025-01-29T10:45:00Z"
          }
        ],
        totalCount: 4,
        filters: {
          impactLevels: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
          sources: ["SCR", "Capital", "Teamcenter", "CAAS", "Slicwave", "Navrel"]
        }
      };

      // Apply filters
      let filteredItems = mockData.items;
      
      if (searchTerm) {
        filteredItems = filteredItems.filter(item => 
          item.qname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (selectedImpactLevel) {
        filteredItems = filteredItems.filter(item => item.impactLevel === selectedImpactLevel);
      }
      
      if (selectedSource) {
        filteredItems = filteredItems.filter(item => item.sourceCode === selectedSource);
      }

      return {
        ...mockData,
        items: filteredItems,
        totalCount: filteredItems.length
      };
    }
  });

  const ItemDetailsDialog = ({ item }: { item: ImpactAssessmentItem }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          <Eye className="w-3 h-3 mr-1" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Impact Assessment Details: {item.id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-muted-foreground">QName:</span>
              <p className="font-mono bg-gray-50 p-2 rounded mt-1 text-xs break-all">{item.qname}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Source:</span>
              <p className="font-mono bg-gray-50 p-2 rounded mt-1">{item.sourceCode}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Thread ID:</span>
              <p className="font-mono bg-gray-50 p-2 rounded mt-1">{item.threadId}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Impact Level:</span>
              <div className="mt-1">
                <Badge variant={
                  item.impactLevel === 'CRITICAL' ? 'destructive' :
                  item.impactLevel === 'HIGH' ? 'destructive' :
                  item.impactLevel === 'MEDIUM' ? 'secondary' : 'outline'
                }>
                  {item.impactLevel}
                </Badge>
              </div>
            </div>
          </div>
          
          <div>
            <span className="font-semibold text-muted-foreground">Description:</span>
            <p className="bg-gray-50 p-3 rounded mt-1">{item.description}</p>
          </div>

          <div>
            <span className="font-semibold text-muted-foreground">Affected Systems:</span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {item.affectedSystems.map(system => (
                <Badge key={system} variant="outline">{system}</Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-muted-foreground mb-2">Properties ({Object.keys(item.properties).length})</h4>
            <div className="space-y-2 max-h-64 overflow-auto">
              {Object.entries(item.properties).map(([key, value]) => (
                <div key={key} className="flex flex-col gap-1 p-3 bg-gray-50 rounded">
                  <span className="font-semibold text-sm">{key}</span>
                  <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap break-words">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const getImpactLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Impact Assessment Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Monitor and analyze items with qname containing "ImpactAssessment"
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end mb-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Search QName or Description</label>
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search impact assessments..."
                className="w-full"
              />
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Impact Level</label>
              <select 
                value={selectedImpactLevel} 
                onChange={(e) => setSelectedImpactLevel(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">All Levels</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
            <div className="w-48">
              <label className="text-sm font-medium mb-2 block">Source</label>
              <select 
                value={selectedSource} 
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md text-sm"
              >
                <option value="">All Sources</option>
                <option value="SCR">SCR</option>
                <option value="Capital">Capital</option>
                <option value="Teamcenter">Teamcenter</option>
                <option value="CAAS">CAAS</option>
                <option value="Slicwave">Slicwave</option>
                <option value="Navrel">Navrel</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load impact assessment data. Please try again.
          </AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading impact assessments...
            </div>
          </CardContent>
        </Card>
      )}

      {assessmentData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Impact Assessment Items ({assessmentData.totalCount})
              </CardTitle>
              <div className="flex gap-2">
                {assessmentData.filters.impactLevels.map(level => {
                  const count = assessmentData.items.filter(item => item.impactLevel === level).length;
                  return count > 0 ? (
                    <Badge key={level} variant="outline" className={getImpactLevelColor(level)}>
                      {level}: {count}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {assessmentData.items.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No impact assessment items found matching your criteria.</p>
                <p className="text-sm">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assessmentData.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {item.sourceCode}
                          </Badge>
                          <Badge className={`text-xs ${getImpactLevelColor(item.impactLevel)}`}>
                            {item.impactLevel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ID: {item.id}
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm mb-1">{item.description}</h4>
                        <p className="text-xs text-muted-foreground font-mono mb-2 break-all">
                          {item.qname}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Thread: {item.threadId}</span>
                          <span>Updated: {new Date(item.lastUpdated).toLocaleString()}</span>
                          <span>Affects: {item.affectedSystems.join(", ")}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <ItemDetailsDialog item={item} />
                      </div>
                    </div>
                    
                    {Object.keys(item.properties).length > 0 && (
                      <div className="border-t pt-3 mt-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {Object.entries(item.properties).slice(0, 4).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium text-muted-foreground">{key}:</span>
                              <p className="truncate">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                        {Object.keys(item.properties).length > 4 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            +{Object.keys(item.properties).length - 4} more properties
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}