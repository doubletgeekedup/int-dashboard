import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChartGantt,
  Database,
  Settings,
  Layers,
  ArrowRightLeft,
  Shield,
  Network,
  Megaphone,
  Book,
  GitBranch,
  Menu,
  X
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: ChartGantt,
  },
];

const sourcesOfTruth = [
  {
    name: "SCR - Source Code Repository",
    code: "SCR",
    href: "/source/SCR",
    icon: Database,
    description: "Primary data repository and caching layer",
  },
  {
    name: "Capital - Capital Management Tool",
    code: "Capital", 
    href: "/source/Capital",
    icon: Settings,
    description: "Configuration management and processing",
  },
  {
    name: "Slicwave - Service Layer Coordinator",
    code: "Slicwave",
    href: "/source/Slicwave", 
    icon: Layers,
    description: "Service orchestration and coordination",
  },
  {
    name: "Teamcenter - Transaction Management Center",
    code: "Teamcenter",
    href: "/source/Teamcenter",
    icon: ArrowRightLeft,
    description: "Transaction monitoring and management",
  },
  {
    name: "CAAS - Central Authentication Service",
    code: "CAAS",
    href: "/source/CAAS",
    icon: Shield,
    description: "Authentication and authorization management",
  },
  {
    name: "Navrel - Network Validation Layer",
    code: "Navrel",
    href: "/source/Navrel",
    icon: Network,
    description: "Network validation and monitoring",
  },
];

const resources = [
  {
    name: "Bulletins & Updates",
    href: "/bulletins",
    icon: Megaphone,
  },
  {
    name: "Knowledge Base",
    href: "/knowledge-base",
    icon: Book,
  },
  {
    name: "Gremlin Visualizer",
    href: "/gremlin-visualizer",
    icon: GitBranch,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-github-blue rounded-lg flex items-center justify-center">
            <ChartGantt className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-github-gray-dark dark:text-foreground">
              Integration Hub
            </h1>
            <p className="text-xs text-github-gray-medium dark:text-muted-foreground">
              Development Dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {/* Main Navigation */}
          {navigation.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive(item.href) ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    isActive(item.href) 
                      ? "brand-nav-item-active" 
                      : "brand-nav-item-inactive"
                  }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
          
          {/* Sources of Truth */}
          <div className="mt-6">
            <h3 className="px-3 py-2 text-xs font-semibold text-brand-brown dark:text-muted-foreground uppercase tracking-wider">
              Sources of Truth
            </h3>
            <div className="mt-2 space-y-1">
              {sourcesOfTruth.map((source) => {
                const IconComponent = source.icon;
                return (
                  <Link key={source.code} href={source.href}>
                    <Button
                      variant={isActive(source.href) ? "default" : "ghost"}
                      className={`w-full justify-start text-left ${
                        isActive(source.href) 
                          ? "brand-nav-item-active" 
                          : "brand-nav-item-inactive"
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <IconComponent className="w-4 h-4 mr-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">
                          {source.code} - {source.name.split(' - ')[1]}
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Resources */}
          <div className="mt-6">
            <h3 className="px-3 py-2 text-xs font-semibold text-github-gray-medium dark:text-muted-foreground uppercase tracking-wider">
              Resources
            </h3>
            <div className="mt-2 space-y-1">
              {resources.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      className={`w-full justify-start ${
                        isActive(item.href) 
                          ? "github-btn-primary" 
                          : "github-nav-item-inactive"
                      }`}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <IconComponent className="w-4 h-4 mr-3" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between text-xs text-brand-brown dark:text-muted-foreground">
          <span>v2.4.1</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot" />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        brand-sidebar w-64 flex flex-col shadow-sm
        sidebar-mobile
        ${isMobileOpen ? '' : 'sidebar-mobile-closed'}
      `}>
        <SidebarContent />
      </aside>
    </>
  );
}
