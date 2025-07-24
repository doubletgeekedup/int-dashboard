import { 
  sources, threads, bulletins, chatMessages, transactions, knowledgeLinks, performanceMetrics,
  type Source, type InsertSource, type Thread, type InsertThread, type Bulletin, type InsertBulletin,
  type ChatMessage, type InsertChatMessage, type Transaction, type InsertTransaction,
  type KnowledgeLink, type InsertKnowledgeLink, type PerformanceMetric, type InsertPerformanceMetric,
  type DashboardStats, type SourceStats
} from "@shared/schema";

export interface IStorage {
  // Sources of Truth
  getSources(): Promise<Source[]>;
  getSource(code: string): Promise<Source | undefined>;
  createSource(source: InsertSource): Promise<Source>;
  updateSource(code: string, updates: Partial<InsertSource>): Promise<Source | undefined>;
  
  // Threads within Sources of Truth
  getThreads(sourceCode?: string): Promise<Thread[]>;
  getThread(sourceCode: string, threadId: string): Promise<Thread | undefined>;
  createThread(thread: InsertThread): Promise<Thread>;
  updateThread(sourceCode: string, threadId: string, updates: Partial<InsertThread>): Promise<Thread | undefined>;
  
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
  private threads: Map<number, Thread> = new Map();
  
  private currentSourceId = 1;
  private currentBulletinId = 1;
  private currentChatId = 1;
  private currentTransactionId = 1;
  private currentKnowledgeLinkId = 1;
  private currentMetricId = 1;
  private currentThreadId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default sources
    const defaultSources: InsertSource[] = [
      {
        code: "STC",
        name: "System Truth Cache",
        description: "Division team managing system operations through specialized teams",
        status: "active",
        version: "2.4.1",
        uptime: "99.9%",
        recordCount: 1200000,
        avgResponseTime: 142,
        isJanusGraph: true,
        apiEndpoint: "http://localhost:8182/gremlin",
        divisionType: "system_operations",
        teamCount: 3,
        config: { database: "janusgraph", traversal: "g", teams: ["cache_mgmt", "sys_records", "data_repos"] }
      },
      {
        code: "CPT",
        name: "Configuration Processing Tool",
        description: "Division team managing configuration operations through specialized teams",
        status: "active",
        version: "1.8.3",
        uptime: "98.7%",
        recordCount: 850000,
        avgResponseTime: 98,
        isJanusGraph: false,
        apiEndpoint: "http://localhost:3001/api/config",
        divisionType: "configuration_mgmt",
        teamCount: 3,
        config: { timeout: 5000, retries: 3, teams: ["config_files", "settings_mgmt", "policy_mgmt"] }
      },
      {
        code: "SLC",
        name: "Service Layer Coordinator",
        description: "Division team managing service operations through specialized teams",
        status: "syncing",
        version: "3.1.0",
        uptime: "99.2%",
        recordCount: 650000,
        avgResponseTime: 156,
        isJanusGraph: false,
        apiEndpoint: "http://localhost:3002/api/services",
        divisionType: "service_coordination",
        teamCount: 3,
        config: { maxConcurrency: 100, teams: ["orchestration", "endpoints", "coordination"] }
      },
      {
        code: "TMC",
        name: "Transaction Management Center",
        description: "Division team managing transaction operations through specialized teams",
        status: "active",
        version: "2.7.2",
        uptime: "99.5%",
        recordCount: 2100000,
        avgResponseTime: 203,
        isJanusGraph: true,
        apiEndpoint: "http://localhost:8182/gremlin",
        divisionType: "transaction_mgmt",
        teamCount: 4,
        config: { database: "transactions", traversal: "tx", teams: ["processing", "monitoring", "audit", "work_items"] }
      },
      {
        code: "CAS",
        name: "Central Authentication Service",
        description: "Division team managing authentication operations through specialized teams",
        status: "active",
        version: "4.2.1",
        uptime: "99.8%",
        recordCount: 45000,
        avgResponseTime: 67,
        isJanusGraph: false,
        apiEndpoint: "http://localhost:3003/api/auth",
        divisionType: "authentication_mgmt",
        teamCount: 4,
        config: { tokenExpiry: 3600, refreshEnabled: true, teams: ["credentials", "permissions", "roles", "tokens"] }
      },
      {
        code: "NVL",
        name: "Network Validation Layer",
        description: "Division team managing network operations through specialized teams",
        status: "active",
        version: "1.9.4",
        uptime: "98.9%",
        recordCount: 890000,
        avgResponseTime: 178,
        isJanusGraph: false,
        apiEndpoint: "http://localhost:3004/api/network",
        divisionType: "network_operations",
        teamCount: 3,
        config: { pingInterval: 30, healthCheckTimeout: 10, teams: ["validation", "connectivity", "monitoring"] }
      }
    ];

    defaultSources.forEach(source => this.createSource(source));

    // Initialize default threads for each source of truth with generated UIDs
    const defaultThreads: InsertThread[] = [
      // STC Threads
      { sourceCode: "STC", threadId: "b7a9c4e2-8f3d-4b1a-9e5c-2d7f8a1b3c6e", name: "b7a9c4e2-8f3d-4b1a-9e5c-2d7f8a1b3c6e", description: "Clusters cache entries, policies, and metrics data nodes", threadType: "cache_management", dataNodeTypes: ["cache_entries", "cache_policies", "cache_metrics"], nodeCount: 150 },
      { sourceCode: "STC", threadId: "d3f8b2a5-1c9e-4a7b-8f2d-5e9a3b7c1f4d", name: "d3f8b2a5-1c9e-4a7b-8f2d-5e9a3b7c1f4d", description: "Clusters system logs, audit trails, and performance data nodes", threadType: "record_management", dataNodeTypes: ["system_logs", "audit_trails", "performance_data"], nodeCount: 320 },
      { sourceCode: "STC", threadId: "f9e2c7b4-6a8d-4f1e-9c3b-7a5d2f8e1c4b", name: "f9e2c7b4-6a8d-4f1e-9c3b-7a5d2f8e1c4b", description: "Clusters data stores, backup systems, and archival data nodes", threadType: "repository_management", dataNodeTypes: ["data_stores", "backup_systems", "archival_data"], nodeCount: 89 },
      
      // CPT Threads  
      { sourceCode: "CPT", threadId: "a1d4f7b9-3e8c-4b2a-7f9d-1c5e8a4b7f2c", name: "a1d4f7b9-3e8c-4b2a-7f9d-1c5e8a4b7f2c", description: "Clusters configuration templates and deployment config data nodes", threadType: "file_management", dataNodeTypes: ["config_templates", "environment_configs", "deployment_configs"], nodeCount: 67 },
      { sourceCode: "CPT", threadId: "c8b5e2f1-9a4d-4e7b-8c1f-3a6d9b2e5f8a", name: "c8b5e2f1-9a4d-4e7b-8c1f-3a6d9b2e5f8a", description: "Clusters user settings, system settings, and feature flag data nodes", threadType: "settings_management", dataNodeTypes: ["user_settings", "system_settings", "feature_flags"], nodeCount: 234 },
      { sourceCode: "CPT", threadId: "e4a7b1f8-2d9c-4f5e-a8b1-6c9f2a5d8b3e", name: "e4a7b1f8-2d9c-4f5e-a8b1-6c9f2a5d8b3e", description: "Clusters access policies, security policies, and compliance rule data nodes", threadType: "policy_management", dataNodeTypes: ["access_policies", "security_policies", "compliance_rules"], nodeCount: 145 },
      
      // TMC Threads
      { sourceCode: "TMC", threadId: "f6c9d2a8-4b7e-4a1f-9d2c-8e5a1b4f7c9d", name: "f6c9d2a8-4b7e-4a1f-9d2c-8e5a1b4f7c9d", description: "Clusters transaction processing and workflow management data nodes", threadType: "transaction_processing", dataNodeTypes: ["active_transactions", "workflow_states", "processing_queue"], nodeCount: 1250 },
      { sourceCode: "TMC", threadId: "b2e8f5a1-7c4d-4f9e-b5a8-2d7c1f4e8b5a", name: "b2e8f5a1-7c4d-4f9e-b5a8-2d7c1f4e8b5a", description: "Clusters work items, task assignments, and completion tracking data nodes", threadType: "work_item_management", dataNodeTypes: ["work_items", "task_assignments", "completion_status"], nodeCount: 890 },
      { sourceCode: "TMC", threadId: "d5f1b8c4-9a3e-4c7f-a1b8-5e9c4a7d1f8b", name: "d5f1b8c4-9a3e-4c7f-a1b8-5e9c4a7d1f8b", description: "Clusters audit trails, compliance logs, and transaction history data nodes", threadType: "audit_management", dataNodeTypes: ["audit_trails", "compliance_logs", "transaction_history"], nodeCount: 567 }
    ];

    defaultThreads.forEach(thread => this.createThread(thread));

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

  // Threads
  async getThreads(sourceCode?: string): Promise<Thread[]> {
    const allThreads = Array.from(this.threads.values());
    if (sourceCode) {
      return allThreads.filter(thread => thread.sourceCode === sourceCode);
    }
    return allThreads;
  }

  async getThread(sourceCode: string, threadId: string): Promise<Thread | undefined> {
    return Array.from(this.threads.values()).find(
      thread => thread.sourceCode === sourceCode && thread.threadId === threadId
    );
  }

  async createThread(insertThread: InsertThread): Promise<Thread> {
    const thread: Thread = {
      id: this.currentThreadId++,
      ...insertThread,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.threads.set(thread.id, thread);
    return thread;
  }

  async updateThread(sourceCode: string, threadId: string, updates: Partial<InsertThread>): Promise<Thread | undefined> {
    const thread = await this.getThread(sourceCode, threadId);
    if (!thread) return undefined;

    const updatedThread = { ...thread, ...updates, updatedAt: new Date() };
    this.threads.set(thread.id, updatedThread);
    return updatedThread;
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
