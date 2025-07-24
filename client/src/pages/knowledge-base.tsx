import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Search, Shield, Database, TrendingUp, Clock, FileText, AlertTriangle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

// Form schema for adding knowledge entries
const knowledgeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  category: z.string().default("general"),
  priority: z.string().default("medium"),
  tags: z.string().optional(),
  sourceCode: z.string().optional(),
  isConfidential: z.boolean().default(false),
  retentionPolicy: z.string().default("permanent")
});

interface KnowledgeEntry {
  id: number;
  title: string;
  content: string;
  category: string;
  priority: string;
  tags: string[];
  sourceCode?: string;
  isConfidential: boolean;
  retentionPolicy: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  accessCount: number;
}

interface SearchResult {
  entries: KnowledgeEntry[];
  total: number;
}

interface KnowledgeStats {
  total: number;
  confidential: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  recentActivity: Array<{ date: string; count: number }>;
}

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof knowledgeSchema>>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'general',
      priority: 'medium',
      tags: '',
      sourceCode: '',
      isConfidential: false,
      retentionPolicy: 'permanent'
    }
  });

  // Fetch knowledge statistics
  const { data: stats } = useQuery<KnowledgeStats>({
    queryKey: ['/api/knowledge/stats'],
    queryFn: () => apiRequest('/api/knowledge/stats')
  });

  // Search knowledge entries
  const { data: searchResults, isLoading: isSearching } = useQuery<SearchResult>({
    queryKey: ['/api/knowledge/search', { 
      q: searchQuery, 
      category: selectedCategory, 
      priority: selectedPriority 
    }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedPriority) params.append('priority', selectedPriority);
      
      return apiRequest(`/api/knowledge/search?${params.toString()}`);
    }
  });

  // Add knowledge entry mutation
  const addKnowledgeMutation = useMutation({
    mutationFn: (data: z.infer<typeof knowledgeSchema>) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      };
      return apiRequest('/api/knowledge', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/search'] });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge/stats'] });
      form.reset();
    }
  });

  const onSubmit = (data: z.infer<typeof knowledgeSchema>) => {
    addKnowledgeMutation.mutate(data);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Database className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'analysis': return <TrendingUp className="w-4 h-4" />;
      case 'procedures': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Knowledge Retention System</h1>
          <p className="text-muted-foreground">
            Government-Level Secure Knowledge Management • Local Data Storage • Full Audit Trail
          </p>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.confidential}</p>
                    <p className="text-sm text-muted-foreground">Confidential</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{Object.keys(stats.byCategory).length}</p>
                    <p className="text-sm text-muted-foreground">Categories</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.recentActivity?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Recent Days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search Knowledge</TabsTrigger>
            <TabsTrigger value="add">Add Entry</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-4">
            {/* Search Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Knowledge Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Search by title or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="analysis">Analysis</SelectItem>
                      <SelectItem value="procedures">Procedures</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <div className="space-y-4">
              {isSearching ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">Searching...</p>
                  </CardContent>
                </Card>
              ) : searchResults?.entries?.length ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Found {searchResults.total} entries
                  </p>
                  {searchResults.entries.map((entry) => (
                    <Card key={entry.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(entry.category)}
                            <CardTitle className="text-lg">{entry.title}</CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(entry.priority)}>
                              {entry.priority}
                            </Badge>
                            {entry.isConfidential && (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Confidential
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{entry.content}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>Category: {entry.category}</span>
                            {entry.sourceCode && <span>Source: {entry.sourceCode}</span>}
                            <span>Accessed: {entry.accessCount} times</span>
                          </div>
                          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                        </div>
                        {entry.tags?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {entry.tags.map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-center text-muted-foreground">No entries found</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Knowledge Entry</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter title..." {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                                <SelectItem value="security">Security</SelectItem>
                                <SelectItem value="analysis">Analysis</SelectItem>
                                <SelectItem value="procedures">Procedures</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Content</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter detailed content..." 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="critical">Critical</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sourceCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Source Code</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                <SelectItem value="STC">STC - System Truth Cache</SelectItem>
                                <SelectItem value="CPT">CPT - Configuration Processing Tool</SelectItem>
                                <SelectItem value="SLC">SLC - Service Layer Coordinator</SelectItem>
                                <SelectItem value="TMC">TMC - Transaction Management Center</SelectItem>
                                <SelectItem value="CAS">CAS - Central Authentication Service</SelectItem>
                                <SelectItem value="NVL">NVL - Network Validation Layer</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="retentionPolicy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Retention Policy</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select policy" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="temporary">Temporary</SelectItem>
                                <SelectItem value="standard">Standard</SelectItem>
                                <SelectItem value="permanent">Permanent</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="tags"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tags (comma-separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="tag1, tag2, tag3..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isConfidential"
                        {...form.register("isConfidential")}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor="isConfidential" className="text-sm">
                        Mark as confidential
                      </label>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={addKnowledgeMutation.isPending}
                      className="w-full md:w-auto"
                    >
                      {addKnowledgeMutation.isPending ? 'Adding...' : 'Add Knowledge Entry'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.byCategory).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(category)}
                            <span className="capitalize">{category}</span>
                          </div>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Priority Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(stats.byPriority).map(([priority, count]) => (
                        <div key={priority} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {priority === 'critical' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            <span className="capitalize">{priority}</span>
                          </div>
                          <Badge className={getPriorityColor(priority)}>{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}