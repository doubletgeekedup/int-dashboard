import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Bot, Database, Sparkles, MessageSquare } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: number;
  message: string;
  response: string;
  sourceCode: string | null;
  sessionId: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  sourceCode?: string;
  title?: string;
}

export function ChatInterface({ sourceCode, title = "AI Assistant" }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", { sourceCode, sessionId }],
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, sourceCode, sessionId, useAI }: {
      message: string;
      sourceCode?: string;
      sessionId: string;
      useAI: boolean;
    }) => {
      const response = await fetch("/api/chat/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, sourceCode, sessionId, useAI })
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    chatMutation.mutate({
      message: message.trim(),
      sourceCode,
      sessionId,
      useAI
    });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {title}
            {sourceCode && (
              <Badge variant="outline" className="ml-2">
                {sourceCode}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            <Switch
              id="ai-mode"
              checked={useAI}
              onCheckedChange={setUseAI}
            />
            <Bot className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="ai-mode" className="text-sm">
              {useAI ? "AI Mode" : "Query Mode"}
            </Label>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          {useAI ? (
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI-powered analysis with similarity detection
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              Direct JanusGraph queries for similarity & impact analysis
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.length === 0 && !isLoading && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Start a conversation!</p>
                <p className="text-xs mt-1">
                  {useAI 
                    ? "Ask questions about your data and get AI-powered insights"
                    : "Try: 'Find similar nodes to HH@id@934' or 'What's the impact of node XX@id@123?'"
                  }
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <MessageSquare className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimestamp(msg.timestamp)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-brand-accent text-brand-primary rounded-full p-2">
                    {useAI ? (
                      <Bot className="h-3 w-3" />
                    ) : (
                      <Database className="h-3 w-3" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="bg-brand-primary/10 rounded-lg p-3">
                      <p className="text-sm whitespace-pre-wrap">{msg.response}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {useAI ? "AI Assistant" : "Query Engine"}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex items-center gap-3">
                <div className="bg-brand-accent text-brand-primary rounded-full p-2">
                  {useAI ? (
                    <Bot className="h-3 w-3" />
                  ) : (
                    <Database className="h-3 w-3" />
                  )}
                </div>
                <div className="bg-brand-primary/10 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
                    <span className="text-sm text-muted-foreground">
                      {useAI ? "AI analyzing..." : "Querying database..."}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-6 pt-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                useAI 
                  ? "Ask me anything about your data..."
                  : "Try: 'similar nodes to HH@id@934' or 'impact of node XX@id@123'"
              }
              disabled={chatMutation.isPending}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={!message.trim() || chatMutation.isPending}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          {!useAI && (
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Available commands: similarity analysis, impact assessment, dependency mapping, node search</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}