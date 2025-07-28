import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { getStorage, getStorageInfo } from "./storage-factory";
import { openAIService } from "./services/openai";
import { janusGraphService } from "./services/janusgraph";
import { configManager } from "./config";
import { NonAIChatService } from "./services/non-ai-chat";
import { 
  insertBulletinSchema, insertChatMessageSchema, 
  insertTransactionSchema, insertKnowledgeLinkSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Initialize storage and services
  const storage = getStorage();
  const nonAIChatService = new NonAIChatService(storage);

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

  // Division Teams (Sources) API Routes
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

  // Proxy endpoint for external listitems service
  app.get("/api/listitems/:count", async (req, res) => {
    try {
      const { count } = req.params;
      const numCount = parseInt(count);
      
      if (isNaN(numCount) || numCount <= 0) {
        return res.status(400).json({ error: "Count must be a positive number" });
      }

      // Get external endpoint URL from config
      const externalConfig = configManager.getExternalConfig();
      const externalEndpoint = externalConfig.listitems.url;
      
      if (!externalEndpoint) {
        console.warn("External listitems URL not configured in config.yaml, using mock data");
        
        // Fallback mock data when external endpoint is not available
        const mockWorkItems = [
          {
            csWorkItemDetails: {
              csWorkItemType: "IMPORT",
              qName: "STC_yy.STC_yy",
              tid: "b7a9c4e2-8f3d-4b1a-9e5c-2d7f8a1b3c6e"
            },
            csWorkItemProcessInfo: {
              csWorkItemProcessDetail: "Import completed successfully",
              csWorkItemProcessSatus: "COMPLETED"
            },
            createDate: Date.now() - 300000,
            id: "675h-5hyt-6th7",
            lastModified: Date.now() - 240000
          },
          {
            csWorkItemDetails: {
              csWorkItemType: "EXPORT",
              qName: "CPT_config.CPT_config",
              tid: "a1d4f7b9-3e8c-4b2a-7f9d-1c5e8a4b7f2c"
            },
            csWorkItemProcessInfo: {
              csWorkItemProcessDetail: "Configuration export in progress",
              csWorkItemProcessSatus: "STARTED"
            },
            createDate: Date.now() - 600000,
            id: "789a-bcde-fgh1",
            lastModified: Date.now() - 120000
          },
          {
            csWorkItemDetails: {
              csWorkItemType: "SYNC",
              qName: "SLC_service.SLC_service",
              tid: "e7f4a9b2-1d8c-4e5a-9f2b-7c4d1a8e5f9c"
            },
            csWorkItemProcessInfo: {
              csWorkItemProcessDetail: "Service synchronization failed - timeout",
              csWorkItemProcessSatus: "FAILED"
            },
            createDate: Date.now() - 900000,
            id: "def4-56gh-789i",
            lastModified: Date.now() - 60000
          },
          {
            csWorkItemDetails: {
              csWorkItemType: "VALIDATE",
              qName: "TMC_transaction.TMC_transaction", 
              tid: "f6c9d2a8-4b7e-4a1f-9d2c-8e5a1b4f7c9d"
            },
            csWorkItemProcessInfo: {
              csWorkItemProcessDetail: "Transaction validation completed",
              csWorkItemProcessSatus: "COMPLETED"
            },
            createDate: Date.now() - 1200000,
            id: "ghi7-89jk-lmn0",
            lastModified: Date.now() - 900000
          },
          {
            csWorkItemDetails: {
              csWorkItemType: "AUTHENTICATION",
              qName: "CAS_auth.CAS_auth",
              tid: "c3a8f5d1-9b4e-4c7a-8f1d-5b9e2a7c4f8d"
            },
            csWorkItemProcessInfo: {
              csWorkItemProcessDetail: "Authentication token refresh completed",
              csWorkItemProcessSatus: "COMPLETED"
            },
            createDate: Date.now() - 1800000,
            id: "jkl0-12mn-345o",
            lastModified: Date.now() - 1500000
          },
          {
            csWorkItemDetails: {
              csWorkItemType: "NETWORK_CHECK",
              qName: "NVL_network.NVL_network",
              tid: "9e3f7a2d-5c8b-4f1e-a7d3-8b5c2f9e7a1d"
            },
            csWorkItemProcessInfo: {
              csWorkItemProcessDetail: "Network validation completed successfully",
              csWorkItemProcessSatus: "COMPLETED"
            },
            createDate: Date.now() - 2400000,
            id: "mno3-45pq-678r",
            lastModified: Date.now() - 2100000
          }
        ];
        
        return res.json(mockWorkItems.slice(0, numCount));
      }

      // Fetch from external endpoint
      const externalUrl = `${externalEndpoint}/${count}`;
      console.log(`Fetching work items from: ${externalUrl}`);
      
      const response = await fetch(externalUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // No API key needed - URLs only
        },
        // Disable SSL certificate verification for external APIs
        // @ts-ignore - Node.js specific option
        agent: externalUrl.startsWith('https:') ? new (await import('https')).Agent({
          rejectUnauthorized: false
        }) : undefined
      });

      if (!response.ok) {
        throw new Error(`External API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
      
    } catch (error) {
      console.error("Error fetching work items from external service:", error);
      
      // Return error but don't expose internal details
      res.status(500).json({ 
        error: "Failed to fetch work items",
        message: "External service unavailable"
      });
    }
  });

  // Endpoint to get transaction details by ID
  app.get("/api/transactions/:id/details", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock transaction detail data
      // In a real implementation, this would fetch from your actual data source
      const mockDetails = {
        id,
        tid: "486h5fj86fj7ref8644f79j56",
        csWorkItemProcessDetail: "Import completed successfully with 1,234 records processed. Average processing time: 2.3ms per record.",
        additionalInfo: {
          recordsProcessed: 1234,
          avgProcessingTime: "2.3ms",
          memoryUsage: "45MB",
          startTime: Date.now() - 300000,
          endTime: Date.now() - 240000
        }
      };
      
      res.json(mockDetails);
    } catch (error) {
      console.error("Error fetching transaction details:", error);
      res.status(500).json({ error: "Failed to fetch transaction details" });
    }
  });

  // Threads API Routes
  app.get("/api/threads", async (req, res) => {
    try {
      const { tqNamePrefix } = req.query;
      const threads = await storage.getThreads(tqNamePrefix as string);
      res.json(threads);
    } catch (error) {
      console.error("Error fetching threads:", error);
      res.status(500).json({ error: "Failed to fetch threads" });
    }
  });

  app.get("/api/threads/:threadId", async (req, res) => {
    try {
      const { threadId } = req.params;
      const thread = await storage.getThread(threadId);
      if (!thread) {
        return res.status(404).json({ error: "Thread not found" });
      }
      res.json(thread);
    } catch (error) {
      console.error("Error fetching thread:", error);
      res.status(500).json({ error: "Failed to fetch thread" });
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

  app.get("/api/chat/ai-status", async (req, res) => {
    try {
      const aiEnabled = configManager.isAIChatEnabled();
      const hasOpenAIKey = !!configManager.getOpenAIConfig().api_key;
      
      res.json({
        enabled: aiEnabled,
        available: aiEnabled && hasOpenAIKey,
        hasApiKey: hasOpenAIKey
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get AI status" });
    }
  });

  app.post("/api/chat/analyze", async (req, res) => {
    try {
      const { message, sourceCode, sessionId } = req.body;
      
      if (!message || !sessionId) {
        return res.status(400).json({ error: "Message and sessionId are required" });
      }

      let chatResponse: string;
      let analysisResult: any = null;

      // Determine AI usage based on environment variable
      const aiEnabled = configManager.isAIChatEnabled();
      
      if (aiEnabled && configManager.getOpenAIConfig().features.chat_analysis) {
        // AI-powered response
        try {
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
          analysisResult = await openAIService.analyzeData({
            data: contextData,
            context: `User message: ${message}`,
            source: sourceCode
          });

          chatResponse = await openAIService.chatCompletion([
            {
              role: 'system',
              content: 'You are an AI assistant for an integration dashboard. Provide helpful, concise responses about system integration data and performance. When users ask about node similarities, impact assessments, or dependencies, use the provided similarity analysis data to give detailed insights.'
            },
            {
              role: 'user',
              content: `${message}\n\nContext: ${JSON.stringify(contextData, null, 2)}`
            }
          ], storage);
        } catch (error) {
          console.log('AI chat failed, falling back to non-AI response:', error);
          const nonAIResponse = await nonAIChatService.processMessage(message, sourceCode);
          chatResponse = nonAIResponse.response;
        }
      } else {
        // Non-AI response using direct JanusGraph queries
        const nonAIResponse = await nonAIChatService.processMessage(message, sourceCode);
        chatResponse = nonAIResponse.response;
      }

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

      const responseData: any = {
        message: chatMessage,
        aiPowered: aiEnabled && !!analysisResult
      };

      if (analysisResult) {
        responseData.insights = analysisResult.insights;
        responseData.recommendations = analysisResult.recommendations;
        responseData.summary = analysisResult.summary;
      }

      res.json(responseData);
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
      const vertexCount = await janusGraphService.getVertexCount();
      const edgeCount = await janusGraphService.getEdgeCount();
      const schemaInfo = await janusGraphService.getSchemaInfo();
      
      res.json({
        healthy: isHealthy,
        connected: schemaInfo.connected,
        connectionMode: janusGraphService.getConnectionMode(),
        realConnection: janusGraphService.isUsingRealConnection(),
        schema: {
          vertexLabels: schemaInfo.vertexLabels,
          edgeLabels: schemaInfo.edgeLabels,
          vertexCount,
          edgeCount
        }
      });
    } catch (error) {
      res.status(500).json({ 
        healthy: false, 
        connected: false,
        connectionMode: 'error',
        realConnection: false,
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

  // Advanced GraphQL relationship and similarity API routes
  app.get("/api/sources/:sourceCode/similar", async (req, res) => {
    try {
      const { sourceCode } = req.params;
      const threshold = parseFloat(req.query.threshold as string) || 0.7;
      
      const storage = getStorage();
      if (typeof (storage as any).findSimilarSources === 'function') {
        const similarSources = await (storage as any).findSimilarSources(sourceCode, threshold);
        res.json(similarSources);
      } else {
        res.status(501).json({ error: "Similarity search not supported with current storage backend" });
      }
    } catch (error) {
      console.error("Error finding similar sources:", error);
      res.status(500).json({ error: "Failed to find similar sources" });
    }
  });

  app.get("/api/sources/range/:attribute", async (req, res) => {
    try {
      const { attribute } = req.params;
      const { min, max } = req.query;
      
      if (!min || !max) {
        return res.status(400).json({ error: "min and max query parameters are required" });
      }

      const storage = getStorage();
      if (typeof (storage as any).findSourcesByAttributeRange === 'function') {
        const sources = await (storage as any).findSourcesByAttributeRange(
          attribute, 
          parseFloat(min as string), 
          parseFloat(max as string)
        );
        res.json(sources);
      } else {
        res.status(501).json({ error: "Attribute range search not supported with current storage backend" });
      }
    } catch (error) {
      console.error("Error finding sources by attribute range:", error);
      res.status(500).json({ error: "Failed to find sources by attribute range" });
    }
  });

  app.get("/api/sources/clusters/:attribute", async (req, res) => {
    try {
      const { attribute } = req.params;
      
      const storage = getStorage();
      if (typeof (storage as any).analyzeSourceClusters === 'function') {
        const clusters = await (storage as any).analyzeSourceClusters(attribute);
        res.json(clusters);
      } else {
        res.status(501).json({ error: "Cluster analysis not supported with current storage backend" });
      }
    } catch (error) {
      console.error("Error analyzing source clusters:", error);
      res.status(500).json({ error: "Failed to analyze source clusters" });
    }
  });

  app.get("/api/sources/:sourceCode/relationships", async (req, res) => {
    try {
      const { sourceCode } = req.params;
      const maxDepth = parseInt(req.query.depth as string) || 2;
      
      const storage = getStorage();
      if (typeof (storage as any).getSourceRelationships === 'function') {
        const relationships = await (storage as any).getSourceRelationships(sourceCode, maxDepth);
        res.json(relationships);
      } else {
        res.status(501).json({ error: "Relationship analysis not supported with current storage backend" });
      }
    } catch (error) {
      console.error("Error getting source relationships:", error);
      res.status(500).json({ error: "Failed to get source relationships" });
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



  // Knowledge Retention API for Government-Level Security
  app.post('/api/knowledge', async (req, res) => {
    try {
      const { knowledgeRetentionService } = await import('./services/knowledge-retention');
      const { insertKnowledgeEntrySchema } = await import('@shared/schema');
      
      const knowledgeData = insertKnowledgeEntrySchema.parse(req.body);
      const entry = await knowledgeRetentionService.storeKnowledge({
        ...knowledgeData,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
      res.json(entry);
    } catch (error) {
      console.error('Knowledge storage error:', error);
      res.status(500).json({ error: 'Failed to store knowledge' });
    }
  });

  // Search knowledge base
  app.get('/api/knowledge/search', async (req, res) => {
    try {
      const { knowledgeRetentionService } = await import('./services/knowledge-retention');
      
      const query = {
        searchText: req.query.q as string,
        category: req.query.category as string,
        priority: req.query.priority as string,
        sourceCode: req.query.source as string,
        isConfidential: req.query.confidential === 'true',
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0,
        tags: req.query.tags ? (req.query.tags as string).split(',') : undefined
      };

      const result = await knowledgeRetentionService.searchKnowledge(query, {
        sessionId: req.query.sessionId as string,
        sourceCode: req.query.source as string,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      res.json(result);
    } catch (error) {
      console.error('Knowledge search error:', error);
      res.status(500).json({ error: 'Failed to search knowledge' });
    }
  });

  // Get knowledge statistics for government reporting
  app.get('/api/knowledge/stats', async (req, res) => {
    try {
      const { knowledgeRetentionService } = await import('./services/knowledge-retention');
      const stats = await knowledgeRetentionService.getKnowledgeStats();
      res.json(stats);
    } catch (error) {
      console.error('Knowledge stats error:', error);
      res.status(500).json({ error: 'Failed to get knowledge statistics' });
    }
  });

  // Store node relationship information specifically
  app.post('/api/knowledge/node-relationship', async (req, res) => {
    try {
      const { knowledgeRetentionService } = await import('./services/knowledge-retention');
      
      const relationshipData = {
        ...req.body,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      };
      
      const entry = await knowledgeRetentionService.storeNodeRelationship(relationshipData);
      res.json(entry);
    } catch (error) {
      console.error('Node relationship storage error:', error);
      res.status(500).json({ error: 'Failed to store node relationship' });
    }
  });

  // Search for node relationships
  app.get('/api/knowledge/node-relationships', async (req, res) => {
    try {
      const { knowledgeRetentionService } = await import('./services/knowledge-retention');
      
      const query = {
        sourceNode: req.query.sourceNode as string,
        targetNode: req.query.targetNode as string,
        relationshipType: req.query.relationshipType as string,
        minConfidence: req.query.minConfidence ? parseFloat(req.query.minConfidence as string) : undefined,
        limit: parseInt(req.query.limit as string) || 50
      };
      
      const relationships = await knowledgeRetentionService.searchNodeRelationships(query);
      res.json(relationships);
    } catch (error) {
      console.error('Node relationship search error:', error);
      res.status(500).json({ error: 'Failed to search node relationships' });
    }
  });

  // Gremlin visualizer endpoint
  app.get("/api/gremlin/visualize/:sourceCode/:nodeId", async (req, res) => {
    try {
      const { sourceCode, nodeId } = req.params;
      
      console.log(`Visualizing node ${nodeId} in source ${sourceCode}`);
      
      // Simulate Gremlin query to get node and its connections
      const graphData = await simulateGremlinTraversal(sourceCode, nodeId);
      
      if (!graphData) {
        return res.status(404).json({ 
          error: "Node not found",
          message: `Node ${nodeId} not found in source ${sourceCode}`
        });
      }
      
      res.json(graphData);
      
    } catch (error) {
      console.error("Error in Gremlin visualization:", error);
      res.status(500).json({ 
        error: "Visualization failed",
        message: "Failed to retrieve graph data"
      });
    }
  });

  return httpServer;
}

// Simulate Gremlin traversal for visualization
async function simulateGremlinTraversal(sourceCode: string, nodeId: string) {
  // Generate realistic graph data based on source and node ID
  const centerNode = {
    id: nodeId,
    label: `${sourceCode}_${nodeId}`,
    properties: {
      name: `Node_${nodeId}`,
      type: getNodeTypeBySource(sourceCode),
      created: Date.now() - 86400000,
      status: "active"
    },
    type: getNodeTypeBySource(sourceCode),
    sourceCode
  };

  // Generate connected nodes (level up - parents)
  const upNodes = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, (_, i) => ({
    id: `${nodeId}_parent_${i + 1}`,
    label: `${sourceCode}_parent_${i + 1}`,
    properties: {
      name: `Parent_${i + 1}`,
      type: getParentNodeType(sourceCode),
      created: Date.now() - 172800000,
      status: "active"
    },
    type: getParentNodeType(sourceCode),
    sourceCode
  }));

  // Generate connected nodes (level down - children)
  const downNodes = Array.from({ length: Math.floor(Math.random() * 5) + 2 }, (_, i) => ({
    id: `${nodeId}_child_${i + 1}`,
    label: `${sourceCode}_child_${i + 1}`,
    properties: {
      name: `Child_${i + 1}`,
      type: getChildNodeType(sourceCode),
      created: Date.now() - 43200000,
      status: "active"
    },
    type: getChildNodeType(sourceCode),
    sourceCode
  }));

  // Generate edges
  const edges = [
    ...upNodes.map(node => ({
      id: `edge_${node.id}_to_${nodeId}`,
      source: node.id,
      target: nodeId,
      label: "parent_of",
      properties: { weight: 1.0 }
    })),
    ...downNodes.map(node => ({
      id: `edge_${nodeId}_to_${node.id}`,
      source: nodeId,
      target: node.id,
      label: "child_of",
      properties: { weight: 1.0 }
    }))
  ];

  return {
    nodes: [centerNode, ...upNodes, ...downNodes],
    edges,
    centerNode,
    levels: {
      up: upNodes,
      down: downNodes
    }
  };
}

function getNodeTypeBySource(sourceCode: string): string {
  const types = {
    SCR: "SCR_mb",
    Capital: "PAExchange_mb", 
    Slicwave: "service_endpoint",
    Teamcenter: "TeamcenterEbomPart_mb",
    CAAS: "auth_token",
    Navrel: "network_rule"
  };
  return types[sourceCode as keyof typeof types] || "unknown";
}

function getParentNodeType(sourceCode: string): string {
  const types = {
    SCR: "SCR_repository",
    Capital: "PAExchange_template",
    Slicwave: "service_cluster", 
    Teamcenter: "Teamcenter_HWVerification_mb",
    CAAS: "auth_policy",
    Navrel: "network_zone"
  };
  return types[sourceCode as keyof typeof types] || "parent";
}

function getChildNodeType(sourceCode: string): string {
  const types = {
    SCR: "SCR_item",
    Capital: "PAExchange_config",
    Slicwave: "service_instance",
    Teamcenter: "TeamcenterEbomPart_item", 
    CAAS: "permission",
    Navrel: "network_check"
  };
  return types[sourceCode as keyof typeof types] || "child";
}
