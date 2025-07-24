import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, GitBranch } from "lucide-react";

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
  { code: "STC", name: "System Truth Cache" },
  { code: "CPT", name: "Configuration Processing Tool" },
  { code: "SLC", name: "Service Layer Coordinator" },
  { code: "TMC", name: "Transaction Management Center" },
  { code: "CAS", name: "Central Authentication Service" },
  { code: "NVL", name: "Network Validation Layer" }
];

export default function GremlinVisualizer() {
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [nodeId, setNodeId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<{ sourceCode: string; nodeId: string } | null>(null);

  const { data: graphData, isLoading, error } = useQuery<GraphData>({
    queryKey: ['/api/gremlin/visualize', searchQuery?.sourceCode, searchQuery?.nodeId],
    enabled: !!searchQuery?.sourceCode && !!searchQuery?.nodeId,
  });

  const handleSearch = () => {
    if (!selectedSource || !nodeId.trim()) return;
    setSearchQuery({ sourceCode: selectedSource, nodeId: nodeId.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const renderNode = (node: GraphNode, level: 'up' | 'center' | 'down') => {
    const levelColors = {
      up: 'border-blue-200 bg-blue-50',
      center: 'border-amber-300 bg-amber-50 ring-2 ring-amber-200',
      down: 'border-green-200 bg-green-50'
    };

    return (
      <div
        key={node.id}
        className={`p-4 rounded-lg border-2 ${levelColors[level]} min-w-[200px] max-w-[300px]`}
      >
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
              <p className="text-xs text-muted-foreground">
                +{Object.entries(node.properties).length - 3} more
              </p>
            )}
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
              <label className="text-sm font-medium mb-2 block">Node ID</label>
              <Input
                value={nodeId}
                onChange={(e) => setNodeId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter node ID..."
              />
            </div>
            <Button onClick={handleSearch} disabled={!selectedSource || !nodeId.trim() || isLoading}>
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
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Level Up Nodes */}
                {graphData.levels.up.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-200 rounded-full"></div>
                      Connected Nodes (Level Up) - {graphData.levels.up.length}
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {graphData.levels.up.map((node: GraphNode) => renderNode(node, 'up'))}
                    </div>
                  </div>
                )}

                {/* Center Node */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-300 rounded-full"></div>
                    Target Node
                  </h3>
                  <div className="flex justify-center">
                    {renderNode(graphData.centerNode, 'center')}
                  </div>
                </div>

                {/* Level Down Nodes */}
                {graphData.levels.down.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-200 rounded-full"></div>
                      Connected Nodes (Level Down) - {graphData.levels.down.length}
                    </h3>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {graphData.levels.down.map((node: GraphNode) => renderNode(node, 'down'))}
                    </div>
                  </div>
                )}

                {/* Edges Summary */}
                {graphData.edges.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold mb-4">Relationships - {graphData.edges.length}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {graphData.edges.map((edge: GraphEdge) => (
                        <div key={edge.id} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                              {edge.source.slice(0, 8)}...
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-mono text-xs bg-white px-2 py-1 rounded">
                              {edge.target.slice(0, 8)}...
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{edge.label}</p>
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