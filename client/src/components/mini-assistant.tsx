import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Send, Bot, Lightbulb, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ChatResponse {
  message: {
    response: string;
  };
  aiPowered: boolean;
  insights?: string[];
  recommendations?: string[];
}

interface MiniAssistantProps {
  sourceCode?: string;
  context?: string;
  placeholder?: string;
  className?: string;
}

export function MiniAssistant({ 
  sourceCode, 
  context = "quick", 
  placeholder = "Quick analysis...",
  className = ""
}: MiniAssistantProps) {
  const [input, setInput] = useState("");
  const [useAI, setUseAI] = useState(false); // Default to non-AI for quick queries
  const [lastResponse, setLastResponse] = useState<string | null>(null);
  const [sessionId] = useState(() => `mini_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      return apiRequest('/api/chat/analyze', {
        method: 'POST',
        body: {
          message,
          sessionId,
          useAI,
          sourceCode,
          context
        }
      }) as Promise<ChatResponse>;
    },
    onSuccess: (response: ChatResponse) => {
      setLastResponse(response.message.response);
      
      if (useAI && response.insights?.length) {
        toast({
          title: "Quick Analysis",
          description: response.insights[0] || "Analysis completed",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Quick analysis failed. Please try again.",
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

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {useAI ? (
            <Lightbulb className="h-4 w-4 text-brand-primary" />
          ) : (
            <Zap className="h-4 w-4 text-brand-secondary" />
          )}
          <span className="text-sm font-medium text-brand-text">
            Quick Assistant
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Label htmlFor="mini-ai-toggle" className="text-xs text-brand-text-muted">
            {useAI ? "AI" : "Direct"}
          </Label>
          <Switch
            id="mini-ai-toggle"
            checked={useAI}
            onCheckedChange={setUseAI}
            className="brand-switch scale-75"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder}
            className="text-sm"
            disabled={chatMutation.isPending}
          />
          <Button 
            type="submit" 
            size="sm"
            disabled={!input.trim() || chatMutation.isPending}
            className="brand-btn-primary shrink-0"
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>

        {chatMutation.isPending && (
          <div className="flex items-center gap-2 text-xs text-brand-text-muted">
            <div className="flex space-x-1">
              <div className="h-1 w-1 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-1 w-1 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-1 w-1 bg-brand-primary rounded-full animate-bounce"></div>
            </div>
            {useAI ? "AI analyzing..." : "Processing..."}
          </div>
        )}

        {lastResponse && !chatMutation.isPending && (
          <div className="bg-brand-surface rounded p-3">
            <div className="text-xs text-brand-text-muted mb-1">
              {useAI ? "AI Response:" : "Direct Response:"}
            </div>
            <div className="text-sm text-brand-text whitespace-pre-wrap max-h-20 overflow-y-auto">
              {lastResponse}
            </div>
          </div>
        )}
      </form>
    </Card>
  );
}