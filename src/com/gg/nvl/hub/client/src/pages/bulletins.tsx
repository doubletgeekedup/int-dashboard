import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertTriangle, 
  Star, 
  Settings, 
  Megaphone,
  User,
  Clock,
  ChevronDown,
  Plus
} from "lucide-react";
import type { Bulletin } from "@shared/schema";

const priorityIcons = {
  critical: AlertTriangle,
  high: AlertTriangle,
  medium: Star,
  low: Star,
};

const priorityColors = {
  critical: "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  high: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
  medium: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
  low: "bg-gray-100 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400",
};

export default function Bulletins() {
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bulletins = [], isLoading } = useQuery<Bulletin[]>({
    queryKey: ["/api/bulletins", filterPriority, filterCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterPriority !== "all") params.set("priority", filterPriority);
      if (filterCategory !== "all") params.set("category", filterCategory);
      
      const response = await fetch(`/api/bulletins?${params}`);
      return response.json();
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/bulletins/${id}/read`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to mark as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bulletins"] });
      toast({
        title: "Marked as Read",
        description: "Bulletin has been marked as read.",
      });
    },
  });

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const handleCreateBulletin = () => {
    toast({
      title: "Create Bulletin",
      description: "Bulletin creation dialog would open here.",
    });
  };

  // Calculate stats
  const totalBulletins = bulletins.length;
  const unreadBulletins = bulletins.filter(b => !b.isRead).length;
  const criticalBulletins = bulletins.filter(b => b.priority === 'critical').length;
  const thisWeekBulletins = bulletins.filter(b => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(b.publishedAt) > weekAgo;
  }).length;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-muted rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-github-gray-dark dark:text-foreground mb-2">
          Bulletins & Updates
        </h1>
        <p className="text-github-gray-medium dark:text-muted-foreground">
          Stay informed about system updates, new features, and important announcements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Filter Bar */}
          <Card className="p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Filter:</Label>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Updates</SelectItem>
                    <SelectItem value="feature">Feature Updates</SelectItem>
                    <SelectItem value="security">Security Alerts</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="developer-notes">Developer Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Priority:</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Bulletins List */}
          <div className="space-y-6">
            {bulletins.map((bulletin) => {
              const IconComponent = priorityIcons[bulletin.priority as keyof typeof priorityIcons] || Star;
              const priorityColorClass = priorityColors[bulletin.priority as keyof typeof priorityColors] || priorityColors.medium;
              
              return (
                <Card key={bulletin.id} className={`overflow-hidden ${!bulletin.isRead ? 'ring-2 ring-github-blue/20' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-github-gray-dark dark:text-foreground">
                            {bulletin.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <Badge className={priorityColorClass}>
                              {bulletin.priority}
                            </Badge>
                            <span className="text-sm text-github-gray-medium dark:text-muted-foreground">
                              {bulletin.category}
                            </span>
                            <span className="text-sm text-github-gray-medium dark:text-muted-foreground">
                              {new Date(bulletin.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <ChevronDown className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="prose prose-sm max-w-none text-github-gray-dark dark:text-foreground mb-4">
                      <p>{bulletin.summary}</p>
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-github-gray-medium dark:text-muted-foreground">
                            <User className="w-4 h-4 mr-1 inline" />
                            {bulletin.author}
                          </span>
                          <span className="text-sm text-github-gray-medium dark:text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1 inline" />
                            {new Date(bulletin.publishedAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="link" size="sm">
                            View Details
                          </Button>
                          {!bulletin.isRead && (
                            <Button 
                              variant="link" 
                              size="sm"
                              onClick={() => handleMarkAsRead(bulletin.id)}
                              disabled={markAsReadMutation.isPending}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Update Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Bulletins</span>
                  <span className="font-semibold">{totalBulletins}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unread</span>
                  <span className="font-semibold text-red-600">{unreadBulletins}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">This Week</span>
                  <span className="font-semibold">{thisWeekBulletins}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Critical Alerts</span>
                  <span className="font-semibold text-orange-600">{criticalBulletins}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="text-sm">
                    Email Notifications
                  </Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="critical-only" className="text-sm">
                    Critical Alerts Only
                  </Label>
                  <Switch id="critical-only" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-digest" className="text-sm">
                    Weekly Digest
                  </Label>
                  <Switch id="weekly-digest" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Create Bulletin */}
          <Card>
            <CardHeader>
              <CardTitle>Create Update</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={handleCreateBulletin}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Bulletin
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
