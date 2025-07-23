import { 
  sources, bulletins, chatMessages, transactions, knowledgeLinks, performanceMetrics,
  type Source, type InsertSource, type Bulletin, type InsertBulletin,
  type ChatMessage, type InsertChatMessage, type Transaction, type InsertTransaction,
  type KnowledgeLink, type InsertKnowledgeLink, type PerformanceMetric, type InsertPerformanceMetric,
  type DashboardStats, type SourceStats
} from "@shared/schema";

export interface IStorage {
  // Sources
  getSources(): Promise<Source[]>;
  getSource(code: string): Promise<Source | undefined>;
  createSource(source: InsertSource): Promise<Source>;
  updateSource(code: string, updates: Partial<InsertSource>): Promise<Source | undefined>;
  
  // Bulletins
  getBulletins(limit?: number, priority?: string, category?: string): Promise<Bulletin[]>;
  getBulletin(id: number): Promise<Bulletin | undefined>;
  createBulletin(bulletin: InsertBulletin): Promise<Bulletin>;
  markBulletinAsRead(id: number): Promise<Bulletin | undefined>;
  
  // Chat Messages
  getChatMessages(sourceCode?: string, sessionId?: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Transactions
  getTransactions(sourceCode?: string, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(transactionId: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined>;
  
  // Knowledge Links
  getKnowledgeLinks(sourceCode?: string): Promise<KnowledgeLink[]>;
  createKnowledgeLink(link: InsertKnowledgeLink): Promise<KnowledgeLink>;
  
  // Performance Metrics
  getPerformanceMetrics(sourceCode: string, metricType?: string, limit?: number): Promise<PerformanceMetric[]>;
  createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  
  // Dashboard Stats
  getDashboardStats(): Promise<DashboardStats>;
  getSourceStats(sourceCode: string): Promise<SourceStats>;
}

export class MemStorage implements IStorage {
  private sources: Map<number, Source> = new Map();
  private bulletins: Map<number, Bulletin> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private transactions: Map<number, Transaction> = new Map();
  private knowledgeLinks: Map<number, KnowledgeLink> = new Map();
  private performanceMetrics: Map<number, PerformanceMetric> = new Map();
  
  private currentSourceId = 1;
  private currentBulletinId = 1;
  private currentChatId = 1;
  private currentTransactionId = 1;
  private currentKnowledgeLinkId = 1;
  private currentMetricId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default sources
    const defaultSources: InsertSource[] = [
      {
        code: "STC",
        name: "System Truth Cache",
        description: "Primary data repository and caching layer for system state management",
        status: "active",
        version: "2.4.1",
        uptime: "99.9%",
        recordCount: 1200000,
        avgResponseTime: 142,
        isJanusGraph: true,
        apiEndpoint: "http://localhost:8182/gremlin",
        config: { database: "janusgraph", traversal: "g" }
      },
      {
        code: "CPT",
        name: "Configuration Processing Tool",
        description: "Configuration management and processing system",
        status: "active",
        version: "1.8.3",
        uptime: "98.7%",
        recordCount: 850000,
        avgResponseTime: 98,
        isJanusGraph: false,
        apiEndpoint: "http://localhost:3001/api/config",
        config: { timeout: 5000, retries: 3 }
      },
      {
        code: "SLC",
        name: "Service Layer Coordinator",
        description: "Service orchestration and coordination layer",
        status: "syncing",
        version: "3.1.0",
        uptime: "99.2%",
        recordCount: 650000,
        avgResponseTime: 156,
        isJanusGraph: false,
        apiEndpoint: "http://localhost:3002/api/services",
        config: { maxConcurrency: 100 }
      },
      {
        code: "TMC",
        name: "Transaction Management Center",
        description: "Transaction monitoring and management interface",
        status: "active",
        version: "2.7.2",
        uptime: "99.5%",
        recordCount: 2100000,
        avgResponseTime: 203,
        isJanusGraph: true,
        apiEndpoint: "http://localhost:8182/gremlin",
        config: { database: "transactions", traversal: "tx" }
      },
      {
        code: "CAS",
        name: "Central Authentication Service",
        description: "Authentication and authorization management system",
        status: "active",
        version: "4.2.1",
        uptime: "99.8%",
        recordCount: 45000,
        avgResponseTime: 67,
        isJanusGraph: false,
        apiEndpoint: "http://localhost:3003/api/auth",
        config: { tokenExpiry: 3600, refreshEnabled: true }
      },
      {
        code: "NVL",
        name: "Network Validation Layer",
        description: "Network validation and monitoring interface",
        status: "active",
        version: "1.9.4",
        uptime: "98.9%",
        recordCount: 890000,
        avgResponseTime: 178,
        isJanusGraph: false,
        apiEndpoint: "http://localhost:3004/api/network",
        config: { pingInterval: 30, healthCheckTimeout: 10 }
      }
    ];

    defaultSources.forEach(source => this.createSource(source));

    // Initialize default knowledge links
    const defaultKnowledgeLinks: InsertKnowledgeLink[] = [
      {
        sourceCode: "STC",
        title: "STC Documentation",
        description: "Setup and configuration guide",
        url: "https://docs.example.com/stc",
        category: "documentation",
        icon: "fas fa-book",
        order: 1
      },
      {
        sourceCode: "STC",
        title: "API Reference",
        description: "REST endpoints and schemas",
        url: "https://api.example.com/stc/docs",
        category: "api-reference",
        icon: "fas fa-code",
        order: 2
      },
      {
        sourceCode: "STC",
        title: "Troubleshooting",
        description: "Common issues and solutions",
        url: "https://support.example.com/stc",
        category: "troubleshooting",
        icon: "fas fa-tools",
        order: 3
      }
    ];

    defaultKnowledgeLinks.forEach(link => this.createKnowledgeLink(link));
  }

  // Sources
  async getSources(): Promise<Source[]> {
    return Array.from(this.sources.values());
  }

  async getSource(code: string): Promise<Source | undefined> {
    return Array.from(this.sources.values()).find(s => s.code === code);
  }

  async createSource(insertSource: InsertSource): Promise<Source> {
    const id = this.currentSourceId++;
    const now = new Date();
    const source: Source = { 
      ...insertSource, 
      id, 
      createdAt: now,
      updatedAt: now,
      lastSync: insertSource.lastSync || now
    };
    this.sources.set(id, source);
    return source;
  }

  async updateSource(code: string, updates: Partial<InsertSource>): Promise<Source | undefined> {
    const source = await this.getSource(code);
    if (!source) return undefined;
    
    const updatedSource = { ...source, ...updates, updatedAt: new Date() };
    this.sources.set(source.id, updatedSource);
    return updatedSource;
  }

  // Bulletins
  async getBulletins(limit = 50, priority?: string, category?: string): Promise<Bulletin[]> {
    let bulletins = Array.from(this.bulletins.values());
    
    if (priority) {
      bulletins = bulletins.filter(b => b.priority === priority);
    }
    
    if (category) {
      bulletins = bulletins.filter(b => b.category === category);
    }
    
    return bulletins
      .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
      .slice(0, limit);
  }

  async getBulletin(id: number): Promise<Bulletin | undefined> {
    return this.bulletins.get(id);
  }

  async createBulletin(insertBulletin: InsertBulletin): Promise<Bulletin> {
    const id = this.currentBulletinId++;
    const bulletin: Bulletin = { 
      ...insertBulletin, 
      id, 
      createdAt: new Date(),
      publishedAt: insertBulletin.publishedAt || new Date()
    };
    this.bulletins.set(id, bulletin);
    return bulletin;
  }

  async markBulletinAsRead(id: number): Promise<Bulletin | undefined> {
    const bulletin = this.bulletins.get(id);
    if (!bulletin) return undefined;
    
    const updatedBulletin = { ...bulletin, isRead: true };
    this.bulletins.set(id, updatedBulletin);
    return updatedBulletin;
  }

  // Chat Messages
  async getChatMessages(sourceCode?: string, sessionId?: string): Promise<ChatMessage[]> {
    let messages = Array.from(this.chatMessages.values());
    
    if (sourceCode !== undefined) {
      messages = messages.filter(m => m.sourceCode === sourceCode);
    }
    
    if (sessionId) {
      messages = messages.filter(m => m.sessionId === sessionId);
    }
    
    return messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentChatId++;
    const message: ChatMessage = { 
      ...insertMessage, 
      id, 
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  // Transactions
  async getTransactions(sourceCode?: string, limit = 100): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values());
    
    if (sourceCode) {
      transactions = transactions.filter(t => t.sourceCode === sourceCode);
    }
    
    return transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(transactionId: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const transaction = Array.from(this.transactions.values()).find(t => t.transactionId === transactionId);
    if (!transaction) return undefined;
    
    const updatedTransaction = { ...transaction, ...updates };
    this.transactions.set(transaction.id, updatedTransaction);
    return updatedTransaction;
  }

  // Knowledge Links
  async getKnowledgeLinks(sourceCode?: string): Promise<KnowledgeLink[]> {
    let links = Array.from(this.knowledgeLinks.values()).filter(l => l.isActive);
    
    if (sourceCode !== undefined) {
      links = links.filter(l => l.sourceCode === sourceCode);
    }
    
    return links.sort((a, b) => a.order - b.order);
  }

  async createKnowledgeLink(insertLink: InsertKnowledgeLink): Promise<KnowledgeLink> {
    const id = this.currentKnowledgeLinkId++;
    const link: KnowledgeLink = { 
      ...insertLink, 
      id, 
      createdAt: new Date()
    };
    this.knowledgeLinks.set(id, link);
    return link;
  }

  // Performance Metrics
  async getPerformanceMetrics(sourceCode: string, metricType?: string, limit = 100): Promise<PerformanceMetric[]> {
    let metrics = Array.from(this.performanceMetrics.values()).filter(m => m.sourceCode === sourceCode);
    
    if (metricType) {
      metrics = metrics.filter(m => m.metricType === metricType);
    }
    
    return metrics
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createPerformanceMetric(insertMetric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const id = this.currentMetricId++;
    const metric: PerformanceMetric = { 
      ...insertMetric, 
      id, 
      timestamp: new Date()
    };
    this.performanceMetrics.set(id, metric);
    return metric;
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const sources = await this.getSources();
    const activeSources = sources.filter(s => s.status === 'active').length;
    const totalRecords = sources.reduce((sum, s) => sum + s.recordCount, 0);
    const avgResponseTime = Math.round(sources.reduce((sum, s) => sum + s.avgResponseTime, 0) / sources.length);

    return {
      totalIntegrations: sources.length,
      activeSources,
      dataPoints: totalRecords > 1000000 ? `${(totalRecords / 1000000).toFixed(1)}M` : `${Math.round(totalRecords / 1000)}K`,
      avgResponseTime: `${avgResponseTime}ms`
    };
  }

  async getSourceStats(sourceCode: string): Promise<SourceStats> {
    const source = await this.getSource(sourceCode);
    if (!source) {
      throw new Error(`Source ${sourceCode} not found`);
    }

    return {
      status: source.status,
      version: source.version,
      records: source.recordCount > 1000000 ? `${(source.recordCount / 1000000).toFixed(1)}M` : `${Math.round(source.recordCount / 1000)}K`,
      responseTime: `${source.avgResponseTime}ms`,
      uptime: source.uptime
    };
  }
}

// Export the MemStorage class for use by storage factory
// The actual storage instance is created by storage-factory.ts
