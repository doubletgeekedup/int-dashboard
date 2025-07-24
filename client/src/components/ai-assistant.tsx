import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, User, Lightbulb, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AIStatus {
  enabled: boolean;
  available: boolean;
  hasApiKey: boolean;
}

interface ChatMessage {
  id: number;
  message: string;
  response: string;
  sessionId: string;
  timestamp: string;
  sourceCode?: string;
}

interface ChatResponse {
  message: ChatMessage;
  aiPowered: boolean;
  insights?: string[];
  recommendations?: string[];
  summary?: string;
}

interface AIAssistantProps {
  sourceCode?: string;
  context?: string;
  title?: string;
  placeholder?: string;
  className?: string;
}

export function AIAssistant({ 
  sourceCode, 
  context = "general", 
  title = "My Assistant",
  placeholder = "Ask me about nodes, similarities, impacts, or dependencies...",
  className = ""
}: AIAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get AI status from server
  const { data: aiStatus } = useQuery<AIStatus>({
    queryKey: ["/api/chat/ai-status"],
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('/api/chat/analyze', {
        method: 'POST',
        body: {
          message,
          sessionId,
          sourceCode,
          context
        }
      }) as Promise<ChatResponse>;
    },
    onSuccess: (response: ChatResponse) => {
      setMessages(prev => [...prev, response.message]);
      
      // Scroll to bottom
      setTimeout(() => {
        scrollAreaRef.current?.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);

      // Show insights/recommendations if available (AI mode)
      if (response.aiPowered && (response.insights?.length || response.recommendations?.length)) {
        toast({
          title: "Analysis Complete",
          description: response.summary || "AI analysis completed successfully",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    chatMutation.mutate(input);
    setInput("");
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-brand-primary" />
            <h3 className="font-semibold text-brand-text">{title}</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              aiStatus?.available ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
            <span className="text-sm text-brand-text-muted">
              {aiStatus?.available ? "AI Assistant Active" : "Direct Mode"}
            </span>
          </div>
        </div>
        {sourceCode && (
          <div className="text-xs text-brand-text-muted mt-1">
            Context: {sourceCode} {context && `(${context})`}
          </div>
        )}
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-brand-text-muted py-8">
              <Bot className="h-12 w-12 mx-auto mb-4 text-brand-primary" />
              <p className="text-sm">
                {aiStatus?.available 
                  ? "AI assistant ready to help with analysis and insights"
                  : "Direct mode for quick commands and data queries"
                }
              </p>
              <p className="text-xs mt-2">
                Try: "help", "system status", or "find similar nodes to [ID]"
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              {/* User Message */}
              <div className="flex items-start gap-3">
                <div className="bg-brand-accent p-2 rounded-full">
                  <User className="h-4 w-4 text-brand-text" />
                </div>
                <div className="flex-1 bg-brand-surface rounded-lg p-3">
                  <div className="text-sm text-brand-text">{message.message}</div>
                  <div className="text-xs text-brand-text-muted mt-1">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>

              {/* Assistant Response */}
              <div className="flex items-start gap-3">
                <div className="bg-brand-primary p-2 rounded-full">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 bg-white border border-brand-border rounded-lg p-3">
                  <div className="text-sm text-brand-text whitespace-pre-wrap">
                    {message.response}
                  </div>
                  <div className="text-xs text-brand-text-muted mt-1">
                    {formatTimestamp(message.timestamp)} • 
                    {aiStatus?.available ? " AI Assistant Active" : " Direct Mode"}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex items-start gap-3">
              <div className="bg-brand-primary p-2 rounded-full">
                <Bot className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="flex-1 bg-white border border-brand-border rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm text-brand-text-muted">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 bg-brand-primary rounded-full animate-bounce"></div>
                  </div>
                  {aiStatus?.available ? "AI analyzing..." : "Processing..."}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="resize-none"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button 
            type="submit" 
            disabled={!input.trim() || chatMutation.isPending}
            className="brand-btn-primary shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-brand-text-muted mt-2">
          {aiStatus?.available ? (
            <>Press Enter to send • Shift+Enter for new line • AI powered analysis</>
          ) : (
            <>Press Enter to send • Shift+Enter for new line • Direct database queries</>
          )}
        </div>
      </form>
    </Card>
  );
}