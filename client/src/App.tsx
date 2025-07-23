import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import SourcePage from "@/pages/source-page";
import Bulletins from "@/pages/bulletins";
import KnowledgeBase from "@/pages/knowledge-base";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useWebSocket } from "@/hooks/use-websocket";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/source/:code" component={SourcePage} />
      <Route path="/bulletins" component={Bulletins} />
      <Route path="/knowledge-base" component={KnowledgeBase} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  // Initialize WebSocket connection for real-time updates
  useWebSocket();

  return (
    <div className="flex min-h-screen bg-github-gray-light dark:bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto lg:ml-0">
        <Header />
        <div className="p-6">
          <Router />
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppLayout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
