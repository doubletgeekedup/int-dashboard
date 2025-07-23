import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { getStorage, getStorageInfo } from "./storage-factory";
import { openAIService } from "./services/openai";
import { janusGraphService } from "./services/janusgraph";
import { configManager } from "./config";
import { 
  insertBulletinSchema, insertChatMessageSchema, 
  insertTransactionSchema, insertKnowledgeLinkSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize storage
  const storage = getStorage();

  // Initialize JanusGraph connection
  janusGraphService.connect().catch(console.error);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        if (data.type === 'ping') {
          ws.send(JSON.stringify({ type: 'pong' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Dashboard API Routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Sources API Routes
  app.get("/api/sources", async (req, res) => {
    try {
      const sources = await storage.getSources();
      res.json(sources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sources" });
    }
  });

  app.get("/api/sources/:code", async (req, res) => {
    try {
      const source = await storage.getSource(req.params.code);
      if (!source) {
        return res.status(404).json({ error: "Source not found" });
      }
      
      const stats = await storage.getSourceStats(req.params.code);
      res.json({ ...source, stats });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch source" });
    }
  });

  app.post("/api/sources/:code/refresh", async (req, res) => {
    try {
      const sourceCode = req.params.code;
      const source = await storage.getSource(sourceCode);
      
      if (!source) {
        return res.status(404).json({ error: "Source not found" });
      }

      // Update last sync time
      const updatedSource = await storage.updateSource(sourceCode, {
        lastSync: new Date()
      });

      // Broadcast update
      broadcast({
        type: 'source_updated',
        sourceCode,
        data: updatedSource
      });

      res.json({ message: "Source refreshed successfully", source: updatedSource });
    } catch (error) {
      res.status(500).json({ error: "Failed to refresh source" });
    }
  });

  // Performance Metrics API Routes
  app.get("/api/sources/:code/metrics", async (req, res) => {
    try {
      const { code } = req.params;
      const { type, limit } = req.query;
      
      const metrics = await storage.getPerformanceMetrics(
        code, 
        type as string, 
        limit ? parseInt(limit as string) : undefined
      );
      
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance metrics" });
    }
  });

  // Transactions API Routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const { sourceCode, limit } = req.query;
      const transactions = await storage.getTransactions(
        sourceCode as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validatedData);
      
      // Broadcast new transaction
      broadcast({
        type: 'transaction_created',
        data: transaction
      });
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid transaction data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  // Bulletins API Routes
  app.get("/api/bulletins", async (req, res) => {
    try {
      const { limit, priority, category } = req.query;
      const bulletins = await storage.getBulletins(
        limit ? parseInt(limit as string) : undefined,
        priority as string,
        category as string
      );
      res.json(bulletins);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bulletins" });
    }
  });

  app.post("/api/bulletins", async (req, res) => {
    try {
      const validatedData = insertBulletinSchema.parse(req.body);
      const bulletin = await storage.createBulletin(validatedData);
      
      // Broadcast new bulletin
      broadcast({
        type: 'bulletin_created',
        data: bulletin
      });
      
      res.status(201).json(bulletin);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid bulletin data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create bulletin" });
    }
  });

  app.patch("/api/bulletins/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bulletin = await storage.markBulletinAsRead(id);
      
      if (!bulletin) {
        return res.status(404).json({ error: "Bulletin not found" });
      }
      
      res.json(bulletin);
    } catch (error) {
      res.status(500).json({ error: "Failed to mark bulletin as read" });
    }
  });

  // Chat/LLM API Routes
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const { sourceCode, sessionId } = req.query;
      const messages = await storage.getChatMessages(
        sourceCode as string,
        sessionId as string
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/analyze", async (req, res) => {
    try {
      const { message, sourceCode, sessionId } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required" });
      }

      // Get context data if sourceCode is provided
      let contextData = {};
      if (sourceCode) {
        const source = await storage.getSource(sourceCode);
        const metrics = await storage.getPerformanceMetrics(sourceCode, undefined, 10);
        const transactions = await storage.getTransactions(sourceCode, 5);
        
        contextData = {
          source,
          recentMetrics: metrics,
          recentTransactions: transactions
        };
      }

      // Analyze with OpenAI
      const analysisResult = await openAIService.analyzeData({
        data: contextData,
        context: `User message: ${message}`,
        source: sourceCode
      });

      const chatResponse = await openAIService.chatCompletion([
        {
          role: 'system',
          content: 'You are an AI assistant for an integration dashboard. Provide helpful, concise responses about system integration data and performance.'
        },
        {
          role: 'user',
          content: `${message}\n\nContext: ${JSON.stringify(contextData, null, 2)}`
        }
      ]);

      // Store chat message
      const chatMessage = await storage.createChatMessage({
        sourceCode: sourceCode || null,
        message,
        response: chatResponse,
        sessionId
      });

      // Broadcast chat update
      broadcast({
        type: 'chat_message',
        sourceCode,
        data: chatMessage
      });

      res.json({
        message: chatMessage,
        insights: analysisResult.insights,
        recommendations: analysisResult.recommendations,
        summary: analysisResult.summary
      });
    } catch (error) {
      console.error("Chat analysis error:", error);
      res.status(500).json({ error: "Failed to analyze message" });
    }
  });

  // Knowledge Base API Routes
  app.get("/api/knowledge-links", async (req, res) => {
    try {
      const { sourceCode } = req.query;
      const links = await storage.getKnowledgeLinks(sourceCode as string);
      res.json(links);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch knowledge links" });
    }
  });

  app.post("/api/knowledge-links", async (req, res) => {
    try {
      const validatedData = insertKnowledgeLinkSchema.parse(req.body);
      const link = await storage.createKnowledgeLink(validatedData);
      res.status(201).json(link);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid knowledge link data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create knowledge link" });
    }
  });

  // Health API Routes
  app.get("/api/health", async (req, res) => {
    try {
      const isHealthy = await janusGraphService.performHealthCheck();
      const schemaInfo = await janusGraphService.getSchemaInfo();
      
      const storageInfo = getStorageInfo();
      let status = 'healthy';
      
      if (storageInfo.status === 'fallback') {
        status = 'degraded';
      }
      
      if (!schemaInfo.connected) {
        status = 'degraded';
      }

      res.json({
        status,
        timestamp: new Date().toISOString(),
        storage: storageInfo,
        janusgraph: {
          connected: schemaInfo.connected,
          healthy: isHealthy
        },
        uptime: process.uptime()
      });
    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ error: "Failed to check system health" });
    }
  });

  // JanusGraph API Routes
  app.get("/api/janusgraph/health", async (req, res) => {
    try {
      const isHealthy = await janusGraphService.performHealthCheck();
      const schemaInfo = await janusGraphService.getSchemaInfo();
      
      res.json({
        healthy: isHealthy,
        connected: schemaInfo.connected,
        schema: schemaInfo
      });
    } catch (error) {
      res.status(500).json({ 
        healthy: false, 
        connected: false, 
        error: "JanusGraph health check failed" 
      });
    }
  });

  app.post("/api/janusgraph/query", async (req, res) => {
    try {
      const { query, bindings } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const result = await janusGraphService.executeQuery({ query, bindings });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to execute JanusGraph query" });
    }
  });

  // System diagnostics
  app.post("/api/system/diagnostics", async (req, res) => {
    try {
      const sources = await storage.getSources();
      const diagnostics = [];

      for (const source of sources) {
        const isHealthy = source.isJanusGraph 
          ? await janusGraphService.performHealthCheck()
          : true; // For external APIs, you'd implement specific health checks

        diagnostics.push({
          sourceCode: source.code,
          name: source.name,
          status: source.status,
          healthy: isHealthy,
          responseTime: source.avgResponseTime,
          lastSync: source.lastSync
        });
      }

      res.json({ diagnostics, timestamp: new Date() });
    } catch (error) {
      res.status(500).json({ error: "Failed to run system diagnostics" });
    }
  });

  return httpServer;
}
