import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Download, 
  FolderSync, 
  Wifi,
  WifiOff,
  Activity,
  Menu
} from "lucide-react";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Check JanusGraph connection status
  const { data: healthStatus } = useQuery({
    queryKey: ["/api/janusgraph/health"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your dashboard report is being generated...",
    });
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search",
        description: `Searching for: ${searchQuery}`,
      });
    }
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onToggleSidebar}
          >
            <Menu className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-orange to-brand-dark rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#fcb567"/>
                  <path d="M2 17L12 22L22 17" stroke="#27150c" strokeWidth="2" fill="none"/>
                  <path d="M2 12L12 17L22 12" stroke="#27150c" strokeWidth="2" fill="none"/>
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-brand-dark dark:text-foreground">
                Integration Dashboard
              </h2>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-2 text-sm">
              {(healthStatus as any)?.connected ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot" />
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Wifi className="w-3 h-3 mr-1" />
                    JanusGraph Connected
                  </Badge>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <Badge variant="outline" className="text-red-600 border-red-600">
                    <WifiOff className="w-3 h-3 mr-1" />
                    Connection Issue
                  </Badge>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 focus:w-80 transition-all duration-200"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          </form>
          
          {/* Action Buttons */}
          <Button onClick={handleExport} className="github-btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button onClick={handleRefresh} variant="outline">
            <FolderSync className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    </header>
  );
}
