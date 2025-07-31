import { db } from "../db";
import { 
  sources, threads, bulletins, chatMessages, transactions, knowledgeLinks, performanceMetrics
} from "@shared/schema";
import { eq, desc, sql, like, and } from "drizzle-orm";
import type { 
  Source, InsertSource, 
  Bulletin, InsertBulletin,
  Transaction, InsertTransaction,
  ChatMessage, InsertChatMessage,
  Thread, InsertThread,
  KnowledgeLink, InsertKnowledgeLink,
  PerformanceMetric, InsertPerformanceMetric,
  DashboardStats, SourceStats
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

export class DatabaseStorage implements IStorage {
  
  // Sources of Truth
  async getSources(): Promise<Source[]> {
    return await db.select().from(sources).orderBy(sources.code);
  }

  async getSource(code: string): Promise<Source | undefined> {
    const result = await db.select().from(sources).where(eq(sources.code, code));
    return result[0];
  }

  async createSource(source: InsertSource): Promise<Source> {
    const result = await db.insert(sources).values(source).returning();
    return result[0];
  }

  async updateSource(code: string, updates: Partial<InsertSource>): Promise<Source | undefined> {
    const result = await db.update(sources)
      .set(updates)
      .where(eq(sources.code, code))
      .returning();
    return result[0];
  }

  // Threads within Sources of Truth
  async getThreads(tqNamePrefix?: string): Promise<Thread[]> {
    if (tqNamePrefix) {
      return await db.select().from(threads)
        .where(like(threads.tqName, `${tqNamePrefix}%`))
        .orderBy(threads.tqName);
    }
    return await db.select().from(threads).orderBy(threads.tqName);
  }

  async getThread(threadId: string): Promise<Thread | undefined> {
    const result = await db.select().from(threads).where(eq(threads.threadId, threadId));
    return result[0];
  }

  async createThread(thread: InsertThread): Promise<Thread> {
    const result = await db.insert(threads).values(thread).returning();
    return result[0];
  }

  async updateThread(threadId: string, updates: Partial<InsertThread>): Promise<Thread | undefined> {
    const result = await db.update(threads)
      .set(updates)
      .where(eq(threads.threadId, threadId))
      .returning();
    return result[0];
  }

  // Bulletins
  async getBulletins(limit = 50, priority?: string, category?: string): Promise<Bulletin[]> {
    let query = db.select().from(bulletins);
    
    const conditions = [];
    if (priority) conditions.push(eq(bulletins.priority, priority));
    if (category) conditions.push(eq(bulletins.category, category));
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query
      .orderBy(desc(bulletins.publishedAt))
      .limit(limit);
  }

  async getBulletin(id: number): Promise<Bulletin | undefined> {
    const result = await db.select().from(bulletins).where(eq(bulletins.id, id));
    return result[0];
  }

  async createBulletin(bulletin: InsertBulletin): Promise<Bulletin> {
    const result = await db.insert(bulletins).values(bulletin).returning();
    return result[0];
  }

  async markBulletinAsRead(id: number): Promise<Bulletin | undefined> {
    const result = await db.update(bulletins)
      .set({ isRead: true })
      .where(eq(bulletins.id, id))
      .returning();
    return result[0];
  }

  // Chat Messages
  async getChatMessages(sourceCode?: string, sessionId?: string): Promise<ChatMessage[]> {
    const conditions = [];
    if (sourceCode) conditions.push(eq(chatMessages.sourceCode, sourceCode));
    if (sessionId) conditions.push(eq(chatMessages.sessionId, sessionId));

    let query = db.select().from(chatMessages);
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    return await query.orderBy(desc(chatMessages.timestamp));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  // Transactions
  async getTransactions(sourceCode?: string, limit = 100): Promise<Transaction[]> {
    let query = db.select().from(transactions);
    
    if (sourceCode) {
      query = query.where(eq(transactions.sourceCode, sourceCode));
    }
    
    return await query
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const result = await db.insert(transactions).values(transaction).returning();
    return result[0];
  }

  async updateTransaction(transactionId: string, updates: Partial<InsertTransaction>): Promise<Transaction | undefined> {
    const result = await db.update(transactions)
      .set(updates)
      .where(eq(transactions.transactionId, transactionId))
      .returning();
    return result[0];
  }

  // Knowledge Links
  async getKnowledgeLinks(sourceCode?: string): Promise<KnowledgeLink[]> {
    let query = db.select().from(knowledgeLinks);
    
    if (sourceCode) {
      query = query.where(eq(knowledgeLinks.sourceCode, sourceCode));
    }
    
    return await query.orderBy(knowledgeLinks.title);
  }

  async createKnowledgeLink(link: InsertKnowledgeLink): Promise<KnowledgeLink> {
    const result = await db.insert(knowledgeLinks).values(link).returning();
    return result[0];
  }

  // Performance Metrics
  async getPerformanceMetrics(sourceCode: string, metricType?: string, limit = 100): Promise<PerformanceMetric[]> {
    let query = db.select().from(performanceMetrics)
      .where(eq(performanceMetrics.sourceCode, sourceCode));
    
    if (metricType) {
      query = query.where(and(
        eq(performanceMetrics.sourceCode, sourceCode),
        eq(performanceMetrics.metricType, metricType)
      ));
    }
    
    return await query
      .orderBy(desc(performanceMetrics.timestamp))
      .limit(limit);
  }

  async createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const result = await db.insert(performanceMetrics).values(metric).returning();
    return result[0];
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const sourceCount = await db.select({ count: sql<number>`count(*)` }).from(sources);
    const activeSources = await db.select({ count: sql<number>`count(*)` })
      .from(sources)
      .where(eq(sources.status, 'active'));
    
    const threadCount = await db.select({ count: sql<number>`count(*)` }).from(threads);
    
    const avgResponseTime = await db.select({ 
      avg: sql<number>`avg(avg_response_time)` 
    }).from(sources);

    return {
      totalIntegrations: sourceCount[0].count,
      activeSources: activeSources[0].count,
      dataPoints: `${threadCount[0].count} threads`,
      avgResponseTime: `${Math.round(avgResponseTime[0].avg || 150)}ms`
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
      records: source.recordCount.toLocaleString(),
      responseTime: `${source.avgResponseTime}ms`,
      uptime: source.uptime
    };
  }
}