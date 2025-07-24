import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/chat-interface";
import { 
  Book, 
  Code, 
  Wrench, 
  ExternalLink, 
  Search,
  Filter,
  Star,
  Clock,
  MessageSquare
} from "lucide-react";
import type { KnowledgeLink } from "@shared/schema";

const categoryIcons = {
  documentation: Book,
  "api-reference": Code,
  troubleshooting: Wrench,
};

const categoryColors = {
  documentation: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  "api-reference": "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
  troubleshooting: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
};

export default function KnowledgeBase() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const { data: links = [], isLoading } = useQuery<KnowledgeLink[]>({
    queryKey: ["/api/knowledge-links"],
  });

  // Filter links based on search and tab
  const filteredLinks = links.filter(link => {
    const matchesSearch = searchQuery === "" || 
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "general" && !link.sourceCode) ||
      link.sourceCode === activeTab;
    
    return matchesSearch && matchesTab;
  });

  // Group links by category
  const linksByCategory = filteredLinks.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, KnowledgeLink[]>);

  // Get unique source codes for tabs
  const sourceCodes = Array.from(new Set(links.map(l => l.sourceCode).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-muted rounded-lg"></div>
        <div className="h-12 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-github-gray-dark dark:text-foreground mb-2">
          Knowledge Base
        </h1>
        <p className="text-github-gray-medium dark:text-muted-foreground">
          Comprehensive documentation and resources for all integrations
        </p>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documentation, guides, and resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-auto">
          <TabsTrigger value="all">All Resources</TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-1" />
            Chat Assistant
          </TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
          {sourceCodes.map(code => (
            <TabsTrigger key={code} value={code || "general"}>
              {code}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <ChatInterface title="System Analysis Assistant" />
        </TabsContent>

        <TabsContent value={activeTab} className="mt-6">
          {Object.keys(linksByCategory).length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Book className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search terms or filters."
                    : "No knowledge base resources available for this section."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {Object.entries(linksByCategory).map(([category, categoryLinks]) => {
                const IconComponent = categoryIcons[category as keyof typeof categoryIcons] || Book;
                const categoryColorClass = categoryColors[category as keyof typeof categoryColors] || categoryColors.documentation;
                
                return (
                  <div key={category}>
                    <div className="flex items-center space-x-3 mb-4">
                      <IconComponent className="w-6 h-6 text-github-blue" />
                      <h2 className="text-xl font-semibold text-github-gray-dark dark:text-foreground">
                        {category.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </h2>
                      <Badge variant="secondary">
                        {categoryLinks.length}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryLinks.map((link) => (
                        <Card key={link.id} className="hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-github-blue/10 rounded-lg flex items-center justify-center">
                                  <i className={`${link.icon} text-github-blue text-sm`} />
                                </div>
                                <div className="flex-1">
                                  <CardTitle className="text-base">{link.title}</CardTitle>
                                  {link.sourceCode && (
                                    <Badge variant="outline" className="mt-1">
                                      {link.sourceCode}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground mb-4">
                              {link.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge className={categoryColorClass}>
                                {category}
                              </Badge>
                              <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 h-auto"
                                asChild
                              >
                                <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1"
                                >
                                  <span>View</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="p-6 text-center">
            <Book className="w-8 h-8 text-github-blue mx-auto mb-2" />
            <h3 className="font-semibold text-lg">{links.length}</h3>
            <p className="text-sm text-muted-foreground">Total Resources</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <h3 className="font-semibold text-lg">{sourceCodes.length}</h3>
            <p className="text-sm text-muted-foreground">Source Systems</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-semibold text-lg">Recently Updated</h3>
            <p className="text-sm text-muted-foreground">All docs current</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
