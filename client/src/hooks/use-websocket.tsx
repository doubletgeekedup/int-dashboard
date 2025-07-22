import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { createWebSocketConnection, type WebSocketMessage } from "@/lib/websocket";

export function useWebSocket() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'source_updated':
        // Invalidate source-related queries
        queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
        queryClient.invalidateQueries({ queryKey: ["/api/sources", message.sourceCode] });
        
        toast({
          title: "Source Updated",
          description: `${message.sourceCode} has been refreshed with new data.`,
        });
        break;

      case 'transaction_created':
        // Invalidate transaction queries
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        
        // Show notification for failed transactions
        if (message.data?.status === 'failed' || message.data?.status === 'error') {
          toast({
            title: "Transaction Failed",
            description: `Transaction ${message.data.transactionId} failed in ${message.data.sourceCode}.`,
            variant: "destructive",
          });
        }
        break;

      case 'bulletin_created':
        // Invalidate bulletins queries
        queryClient.invalidateQueries({ queryKey: ["/api/bulletins"] });
        
        // Show notification for critical bulletins
        if (message.data?.priority === 'critical') {
          toast({
            title: "Critical Update",
            description: message.data.title,
            variant: "destructive",
          });
        } else {
          toast({
            title: "New Bulletin",
            description: message.data?.title || "A new bulletin has been posted.",
          });
        }
        break;

      case 'chat_message':
        // Invalidate chat messages for the specific source
        queryClient.invalidateQueries({ 
          queryKey: ["/api/chat/messages", message.sourceCode] 
        });
        break;

      case 'system_health_update':
        // Update dashboard stats and source status
        queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
        queryClient.invalidateQueries({ queryKey: ["/api/sources"] });
        
        if (message.data?.status === 'error' || message.data?.healthy === false) {
          toast({
            title: "System Health Alert",
            description: `${message.data.sourceCode || 'System'} health check failed.`,
            variant: "destructive",
          });
        }
        break;

      case 'performance_alert':
        // Show performance-related notifications
        toast({
          title: "Performance Alert",
          description: message.data?.message || "Performance threshold exceeded.",
          variant: "destructive",
        });
        
        // Invalidate performance metrics
        queryClient.invalidateQueries({ 
          queryKey: ["/api/sources", message.sourceCode, "metrics"] 
        });
        break;

      case 'pong':
        // Handle ping/pong for connection health
        break;

      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }, [queryClient, toast]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const ws = createWebSocketConnection();
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
        
        // Send ping every 30 seconds to keep connection alive
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          } else {
            clearInterval(pingInterval);
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        wsRef.current = null;

        // Attempt to reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // 1s, 2s, 4s, 8s, 16s
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`);
            connect();
          }, delay);
        } else {
          toast({
            title: "Connection Lost",
            description: "Unable to maintain real-time connection. Some features may be limited.",
            variant: "destructive",
          });
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [handleMessage, toast]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Connect on mount and disconnect on unmount
  useEffect(() => {
    connect();
    return disconnect;
  }, [connect, disconnect]);

  // Reconnect when the page becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [connect]);

  return {
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
    reconnectAttempts: reconnectAttempts.current,
    connect,
    disconnect,
  };
}
