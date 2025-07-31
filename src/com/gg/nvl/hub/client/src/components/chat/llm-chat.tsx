import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  Lightbulb,
  CheckCircle
} from "lucide-react";
import type { ChatMessage } from "@shared/schema";

interface LLMChatProps {
  sourceCode?: string;
  className?: string;
}

interface ChatAnalysisResponse {
  message: ChatMessage;
  insights?: string[];
  recommendations?: string[];
}

export function LLMChat({ sourceCode, className }: LLMChatProps) {
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load existing chat messages
  const { data: messages = [], refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/messages", sourceCode, sessionId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (sourceCode) params.set("sourceCode", sourceCode);
      params.set("sessionId", sessionId);
      
      const response = await fetch(`/api/chat/messages?${params}`);
      return response.json();
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string): Promise<ChatAnalysisResponse> => {
      const response = await fetch("/api/chat/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          sourceCode,
          sessionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      refetchMessages();
      setMessage("");
      
      // Show insights if any
      if (data.insights && data.insights.length > 0) {
        toast({
          title: "AI Insights Generated",
          description: `Found ${data.insights.length} key insights about your data.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Message Failed",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate(message.trim());
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Generate placeholder welcome message
  const welcomeMessage = sourceCode 
    ? `Hi! I can help you analyze ${sourceCode} performance data. Try asking about trends, anomalies, or specific metrics.`
    : "Hi! I can help you analyze integration data across all your sources. Ask me about performance trends, system health, or specific metrics.";

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Chat Messages */}
      <ScrollArea className="h-64 w-full">
        <div className="space-y-4 p-4">
          {/* Welcome Message */}
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-github-purple rounded-lg flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-message chat-message-ai">
              <p className="text-sm">{welcomeMessage}</p>
            </div>
          </div>

          {/* Actual Messages */}
          {messages.map((msg) => (
            <div key={msg.id}>
              {/* User Message */}
              <div className="flex items-start space-x-3 justify-end mb-2">
                <div className="chat-message chat-message-user">
                  <p className="text-sm">{msg.message}</p>
                </div>
                <div className="w-8 h-8 bg-github-blue rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-github-purple rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="chat-message chat-message-ai">
                  <p className="text-sm whitespace-pre-wrap">{msg.response}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {sendMessageMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-github-purple rounded-lg flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="chat-message chat-message-ai">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <p className="text-sm">Analyzing your data...</p>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={sourceCode ? `Ask about ${sourceCode} performance...` : "Ask about your integrations..."}
          disabled={sendMessageMutation.isPending}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isPending}
          size="sm"
          className="github-btn-primary"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>

      {/* Quick Suggestion Buttons */}
      {!sourceCode && messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessage("Show me the overall system health")}
            disabled={sendMessageMutation.isPending}
          >
            System Health
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessage("What are the performance trends this week?")}
            disabled={sendMessageMutation.isPending}
          >
            Performance Trends
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessage("Are there any integration issues?")}
            disabled={sendMessageMutation.isPending}
          >
            Integration Issues
          </Button>
        </div>
      )}

      {sourceCode && messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessage(`Analyze ${sourceCode} response times`)}
            disabled={sendMessageMutation.isPending}
          >
            Response Times
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessage(`Show ${sourceCode} error patterns`)}
            disabled={sendMessageMutation.isPending}
          >
            Error Patterns
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessage(`Compare ${sourceCode} with other sources`)}
            disabled={sendMessageMutation.isPending}
          >
            Compare Performance
          </Button>
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-400 rounded-full pulse-dot" />
          <span>AI Assistant Active</span>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Azure GPT Ready
        </Badge>
      </div>
    </div>
  );
}
