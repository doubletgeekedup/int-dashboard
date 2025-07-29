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
  getThreads(tqNamePrefix?: string): Promise<Thread[]>;
  getThread(threadId: string): Promise<Thread | undefined>;
  createThread(thread: InsertThread): Promise<Thread>;
  updateThread(threadId: string, updates: Partial<InsertThread>): Promise<Thread | undefined>;
  
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
        code: "SCR",
        name: "Source Code Repository",
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
        code: "Capital",
        name: "Capital Management Tool",
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
        code: "Slicwave",
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
        code: "Teamcenter",
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
        code: "CAAS",
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
        code: "Navrel",
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

    // Initialize default threads with the new structure
    const currentTime = [2025, 7, 24, 7, 30, 0, 0];
    const defaultThreads: InsertThread[] = [
      // STC Thread
      {
        nodekey: "Thread@id@b7a9c4e2-8f3d-4b1a-9e5c-2d7f8a1b3c6e",
        tqName: "STC_yy.STC_yy",
        class: "Thread",
        threadId: "b7a9c4e2-8f3d-4b1a-9e5c-2d7f8a1b3c6e",
        componentNode: [{
          nodekey: "cNode@id@657",
          isDefault: true,
          node: [{
            nodeKey: "HH@id@934",
            id: "934",
            type: "HH",
            class: "HH",
            description: "Hard",
            functionName: "Hard Connector",
            hasCC: []
          }],
          class: "cNode",
          type: "cNode",
          id: "657",
          tQuery: {
            nodeKey: "tQuery@id@858",
            class: "tQuery",
            id: "858",
            type: "tQuery",
            tqName: "SCR_mb.SCR_mb"
          }
        }],
        createTime: currentTime,
        updateTime: currentTime
      },
      // CPT Thread
      {
        nodekey: "Thread@id@a1d4f7b9-3e8c-4b2a-7f9d-1c5e8a4b7f2c",
        tqName: "PAExchange_mb",
        class: "Thread",
        threadId: "a1d4f7b9-3e8c-4b2a-7f9d-1c5e8a4b7f2c",
        componentNode: [{
          nodekey: "cNode@id@658",
          isDefault: true,
          node: [{
            nodeKey: "CF@id@935",
            id: "935",
            type: "CF",
            class: "CF",
            description: "Config",
            functionName: "Config Processor",
            hasCC: []
          }],
          class: "cNode",
          type: "cNode",
          id: "658",
          tQuery: {
            nodeKey: "tQuery@id@859",
            class: "tQuery",
            id: "859",
            type: "tQuery",
            tqName: "PAExchange_mb"
          }
        }],
        createTime: currentTime,
        updateTime: currentTime
      },
      // TMC Thread
      {
        nodekey: "Thread@id@f6c9d2a8-4b7e-4a1f-9d2c-8e5a1b4f7c9d",
        tqName: "TeamcenterEbomPart_mb",
        class: "Thread",
        threadId: "f6c9d2a8-4b7e-4a1f-9d2c-8e5a1b4f7c9d",
        componentNode: [{
          nodekey: "cNode@id@659",
          isDefault: true,
          node: [{
            nodeKey: "TX@id@936",
            id: "936",
            type: "TX",
            class: "TX",
            description: "Transaction",
            functionName: "Transaction Processor",
            hasCC: []
          }],
          class: "cNode",
          type: "cNode",
          id: "659",
          tQuery: {
            nodeKey: "tQuery@id@860",
            class: "tQuery",
            id: "860",
            type: "tQuery",
            tqName: "TeamcenterEbomPart_mb"
          }
        }],
        createTime: currentTime,
        updateTime: currentTime
      },
      // Second TMC Thread with HWVerification type
      {
        nodekey: "Thread@id@e8b5c3f7-2a4d-4c9b-8f1e-5a2b9c6f3e8d",
        tqName: "Teamcenter_HWVerification_mb",
        class: "Thread",
        threadId: "e8b5c3f7-2a4d-4c9b-8f1e-5a2b9c6f3e8d",
        componentNode: [{
          nodekey: "cNode@id@660",
          isDefault: true,
          node: [{
            nodeKey: "HW@id@937",
            id: "937",
            type: "HW",
            class: "HW",
            description: "Hardware Verification",
            functionName: "Hardware Verification Processor",
            hasCC: []
          }],
          class: "cNode",
          type: "cNode",
          id: "660",
          tQuery: {
            nodeKey: "tQuery@id@861",
            class: "tQuery",
            id: "861",
            type: "tQuery",
            tqName: "Teamcenter_HWVerification_mb"
          }
        }],
        createTime: currentTime,
        updateTime: currentTime
      }
    ];

    defaultThreads.forEach(thread => this.createThread(thread));

    // Initialize default knowledge links
    const defaultKnowledgeLinks: InsertKnowledgeLink[] = [
      {
        sourceCode: "SCR",
        title: "SCR Documentation",
        description: "Setup and configuration guide",
        url: "https://docs.example.com/scr",
        category: "documentation",
        icon: "fas fa-book",
        order: 1
      },
      {
        sourceCode: "SCR",
        title: "API Reference",
        description: "REST endpoints and schemas",
        url: "https://api.example.com/scr/docs",
        category: "api-reference",
        icon: "fas fa-code",
        order: 2
      },
      {
        sourceCode: "SCR",
        title: "Troubleshooting",
        description: "Common issues and solutions",
        url: "https://support.example.com/scr",
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
  async getThreads(tqNamePrefix?: string): Promise<Thread[]> {
    const allThreads = Array.from(this.threads.values());
    if (tqNamePrefix) {
      return allThreads.filter(thread => thread.tqName.startsWith(tqNamePrefix));
    }
    return allThreads;
  }

  async getThread(threadId: string): Promise<Thread | undefined> {
    return Array.from(this.threads.values()).find(
      thread => thread.threadId === threadId
    );
  }

  async createThread(insertThread: InsertThread): Promise<Thread> {
    const thread: Thread = {
      id: this.currentThreadId++,
      ...insertThread,
    };
    this.threads.set(thread.id, thread);
    return thread;
  }

  async updateThread(threadId: string, updates: Partial<InsertThread>): Promise<Thread | undefined> {
    const thread = await this.getThread(threadId);
    if (!thread) return undefined;

    const updatedThread = { ...thread, ...updates };
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

import { DatabaseStorage } from './storage/database-storage';

// Use database storage when DATABASE_URL is available, otherwise use in-memory storage
import { configManager } from './config';

export const storage = configManager.getDatabaseConfig().url 
  ? new DatabaseStorage() 
  : new MemStorage();
