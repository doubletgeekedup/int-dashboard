import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Search, GitBranch, Eye, ArrowDown, ArrowUp, ArrowRight, MousePointer } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  properties: Record<string, any>;
  type: string;
  sourceCode: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, any>;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  centerNode: GraphNode;
  levels: {
    up: GraphNode[];
    down: GraphNode[];
  };
}

const sources = [
  { code: "SCR", name: "Source Code Repository" },
  { code: "Capital", name: "Capital Management Tool" },
  { code: "Slicwave", name: "Service Layer Coordinator" },
  { code: "Teamcenter", name: "Transaction Management Center" },
  { code: "CAAS", name: "Central Authentication Service" },
  { code: "Navrel", name: "Network Validation Layer" }
];

export default function GremlinVisualizer() {
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [endpointId, setEndpointId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<{ sourceCode: string; endpointId: string } | null>(null);
  const [explorationHistory, setExplorationHistory] = useState<Array<{ sourceCode: string; endpointId: string; label: string }>>([]);

  const { data: graphData, isLoading, error } = useQuery<GraphData>({
    queryKey: ['/api/gremlin/visualize', searchQuery?.sourceCode, searchQuery?.endpointId],
    enabled: !!searchQuery?.sourceCode && !!searchQuery?.endpointId,
  });

  const handleSearch = () => {
    if (!selectedSource || !endpointId.trim()) return;
    setSearchQuery({ sourceCode: selectedSource, endpointId: endpointId.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleNodeExplore = (node: GraphNode) => {
    // Add current search to history
    if (searchQuery) {
      const currentEntry = {
        sourceCode: searchQuery.sourceCode,
        endpointId: searchQuery.endpointId,
        label: graphData?.centerNode.label || searchQuery.endpointId
      };
      
      setExplorationHistory(prev => {
        // Avoid duplicates
        const exists = prev.some(entry => 
          entry.sourceCode === currentEntry.sourceCode && 
          entry.endpointId === currentEntry.endpointId
        );
        return exists ? prev : [...prev, currentEntry];
      });
    }

    // Set new search query to the clicked node
    setSelectedSource(node.sourceCode);
    setEndpointId(node.id);
    setSearchQuery({ sourceCode: node.sourceCode, endpointId: node.id });
  };

  const handleHistoryNavigation = (historyItem: { sourceCode: string; endpointId: string; label: string }) => {
    setSelectedSource(historyItem.sourceCode);
    setEndpointId(historyItem.endpointId);
    setSearchQuery({ sourceCode: historyItem.sourceCode, endpointId: historyItem.endpointId });
  };

  const clearHistory = () => {
    setExplorationHistory([]);
  };

  const NodePropertiesDialog = ({ node }: { node: GraphNode }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
          <Eye className="w-3 h-3 mr-1" />
          +more
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Node Properties: {node.label}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-muted-foreground">ID:</span>
              <p className="font-mono bg-gray-50 p-2 rounded mt-1">{node.id}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Type:</span>
              <p className="font-mono bg-gray-50 p-2 rounded mt-1">{node.type}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Label:</span>
              <p className="font-mono bg-gray-50 p-2 rounded mt-1">{node.label}</p>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground">Source:</span>
              <p className="font-mono bg-gray-50 p-2 rounded mt-1">{node.sourceCode}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-muted-foreground mb-2">All Properties ({Object.keys(node.properties).length})</h4>
            <div className="space-y-2 max-h-96 overflow-auto">
              {Object.entries(node.properties).map(([key, value]) => (
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

  const renderNode = (node: GraphNode, level: 'up' | 'center' | 'down') => {
    const levelColors = {
      up: 'border-blue-200 bg-blue-50 hover:bg-blue-100',
      center: 'border-amber-300 bg-amber-50 ring-2 ring-amber-200',
      down: 'border-green-200 bg-green-50 hover:bg-green-100'
    };

    const isClickable = level !== 'center';

    return (
      <div
        key={node.id}
        className={`p-4 rounded-lg border-2 ${levelColors[level]} min-w-[200px] max-w-[300px] relative transition-all duration-200 ${
          isClickable ? 'cursor-pointer hover:shadow-md hover:scale-105' : ''
        }`}
        onClick={isClickable ? () => handleNodeExplore(node) : undefined}
        title={isClickable ? `Click to explore ${node.label}` : undefined}
      >
        {isClickable && (
          <div className="absolute top-2 right-2 opacity-50 hover:opacity-100">
            <MousePointer className="w-3 h-3 text-gray-500" />
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {node.type}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {node.sourceCode}
          </Badge>
        </div>
        <h4 className="font-semibold text-sm mb-2 truncate" title={node.label}>
          {node.label}
        </h4>
        <p className="text-xs text-muted-foreground mb-2">ID: {node.id}</p>
        {Object.entries(node.properties).length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium">Properties:</p>
            {Object.entries(node.properties).slice(0, 3).map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="font-medium">{key}:</span> {String(value).slice(0, 20)}
                {String(value).length > 20 && '...'}
              </div>
            ))}
            {Object.entries(node.properties).length > 3 && (
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  +{Object.entries(node.properties).length - 3} more
                </p>
                <NodePropertiesDialog node={node} />
              </div>
            )}
          </div>
        )}
        
        {isClickable && (
          <div className="mt-3 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MousePointer className="w-3 h-3" />
              Click to explore
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Gremlin Node Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Source of Truth</label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a source..." />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.code} value={source.code}>
                      {source.code} - {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Endpoint ID</label>
              <Input
                value={endpointId}
                onChange={(e) => setEndpointId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter endpoint ID..."
              />
            </div>
            <Button onClick={handleSearch} disabled={!selectedSource || !endpointId.trim() || isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Visualize
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exploration History */}
      {explorationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="h-4 w-4" />
                Exploration History
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearHistory}
                className="text-xs"
              >
                Clear History
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {explorationHistory.map((item, index) => (
                <Button
                  key={`${item.sourceCode}-${item.endpointId}-${index}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleHistoryNavigation(item)}
                  className="text-xs flex items-center gap-1 hover:bg-gray-100"
                >
                  <Badge variant="secondary" className="text-xs mr-1">
                    {item.sourceCode}
                  </Badge>
                  {item.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click any previous node to navigate back to its graph view
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load graph data. Please check the node ID and try again.
          </AlertDescription>
        </Alert>
      )}

      {graphData && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Graph Visualization</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing connections for node <span className="font-mono">{graphData.centerNode.id}</span> in {selectedSource}
              </p>
              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 <strong>One-click exploration:</strong> Click on any parent or child node to explore its connections deeper
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Visual Graph Layout */}
                <div className="relative p-8 bg-gray-50 rounded-lg overflow-hidden">
                  {/* Level Up Nodes */}
                  {graphData.levels.up.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <ArrowUp className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-blue-600">
                          Parent Nodes ({graphData.levels.up.length})
                        </h3>
                      </div>
                      <div className="flex gap-4 justify-center flex-wrap">
                        {graphData.levels.up.map((node: GraphNode) => renderNode(node, 'up'))}
                      </div>
                      {/* Connection lines from parent to center */}
                      <div className="flex justify-center mt-4 mb-2">
                        <div className="flex flex-col items-center">
                          {Array.from({ length: graphData.levels.up.length }).map((_, i) => (
                            <div key={i} className="w-px h-6 bg-blue-300"></div>
                          ))}
                          <ArrowDown className="w-4 h-4 text-blue-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Center Node */}
                  <div className="flex justify-center mb-8">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                        <h3 className="text-sm font-semibold text-amber-600">Target Node</h3>
                      </div>
                      {renderNode(graphData.centerNode, 'center')}
                    </div>
                  </div>

                  {/* Level Down Nodes */}
                  {graphData.levels.down.length > 0 && (
                    <div>
                      {/* Connection lines from center to children */}
                      <div className="flex justify-center mb-2 mt-4">
                        <div className="flex flex-col items-center">
                          <ArrowDown className="w-4 h-4 text-green-400" />
                          {Array.from({ length: graphData.levels.down.length }).map((_, i) => (
                            <div key={i} className="w-px h-6 bg-green-300"></div>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <ArrowDown className="w-4 h-4 text-green-600" />
                        <h3 className="text-sm font-semibold text-green-600">
                          Child Nodes ({graphData.levels.down.length})
                        </h3>
                      </div>
                      <div className="flex gap-4 justify-center flex-wrap">
                        {graphData.levels.down.map((node: GraphNode) => renderNode(node, 'down'))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Edges Summary */}
                {graphData.edges.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Relationships ({graphData.edges.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {graphData.edges.map((edge: GraphEdge) => (
                        <div key={edge.id} className="p-3 bg-gray-50 rounded-lg border">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                              {edge.source.slice(0, 12)}...
                            </span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                            <span className="font-mono text-xs bg-white px-2 py-1 rounded border">
                              {edge.target.slice(0, 12)}...
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 font-medium">{edge.label}</p>
                          {Object.keys(edge.properties).length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {Object.keys(edge.properties).length} properties
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {searchQuery && !isLoading && !graphData && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No graph data found for the specified node.</p>
              <p className="text-sm">Try a different node ID or source.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}