import type { IStorage } from '../storage';
import type { 
  Source, 
  Transaction, 
  Bulletin, 
  KnowledgeBase, 
  ChatMessage,
  InsertSource,
  InsertTransaction,
  InsertBulletin,
  InsertKnowledgeBase,
  InsertChatMessage
} from '../../shared/schema';
import { graphqlJanusClient } from '../services/graphql-client';

export class GraphQLStorage implements IStorage {
  constructor() {
    // Initialize connection
    this.initialize();
  }

  private async initialize() {
    await graphqlJanusClient.connect();
  }

  // Source operations
  async getSources(): Promise<Source[]> {
    try {
      const result = await graphqlJanusClient.getSources();
      return result.vertices?.map((vertex: any) => ({
        id: parseInt(vertex.id),
        ...vertex.properties,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSync: new Date()
      })) || [];
    } catch (error) {
      console.error('Error fetching sources from GraphQL:', error);
      return [];
    }
  }

  async getSourceByCode(code: string): Promise<Source | null> {
    const sources = await this.getSources();
    return sources.find(source => source.code === code) || null;
  }

  async createSource(data: InsertSource): Promise<Source> {
    try {
      const result = await graphqlJanusClient.createSource({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSync: new Date().toISOString()
      });

      return {
        id: parseInt(result.addVertex.id),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSync: new Date()
      } as Source;
    } catch (error) {
      console.error('Error creating source in GraphQL:', error);
      throw error;
    }
  }

  async updateSource(id: number, data: Partial<InsertSource>): Promise<Source | null> {
    // GraphQL update would require a specific mutation
    // For now, return existing source with updated data
    const source = await this.getSourceByCode(data.code || '');
    if (source) {
      return { ...source, ...data, updatedAt: new Date() };
    }
    return null;
  }

  async deleteSource(id: number): Promise<boolean> {
    // GraphQL delete would require a specific mutation
    console.log(`Delete source ${id} - GraphQL mutation needed`);
    return true;
  }

  // Transaction operations
  async getTransactions(): Promise<Transaction[]> {
    try {
      const result = await graphqlJanusClient.getTransactions();
      return result.vertices?.map((vertex: any) => ({
        id: parseInt(vertex.id),
        ...vertex.properties,
        timestamp: new Date(vertex.properties.timestamp)
      })) || [];
    } catch (error) {
      console.error('Error fetching transactions from GraphQL:', error);
      return [];
    }
  }

  async getTransactionsBySource(sourceCode: string): Promise<Transaction[]> {
    const transactions = await this.getTransactions();
    return transactions.filter(tx => tx.sourceCode === sourceCode);
  }

  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    try {
      const result = await graphqlJanusClient.createTransaction({
        ...data,
        timestamp: new Date().toISOString()
      });

      return {
        id: parseInt(result.addVertex.id),
        ...data,
        timestamp: new Date()
      } as Transaction;
    } catch (error) {
      console.error('Error creating transaction in GraphQL:', error);
      throw error;
    }
  }

  async updateTransaction(id: number, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    console.log(`Update transaction ${id} - GraphQL mutation needed`);
    return null;
  }

  async deleteTransaction(id: number): Promise<boolean> {
    console.log(`Delete transaction ${id} - GraphQL mutation needed`);
    return true;
  }

  // Bulletin operations
  async getBulletins(): Promise<Bulletin[]> {
    try {
      const result = await graphqlJanusClient.getBulletins();
      return result.vertices?.map((vertex: any) => ({
        id: parseInt(vertex.id),
        ...vertex.properties,
        createdAt: new Date(vertex.properties.createdAt),
        updatedAt: new Date(vertex.properties.updatedAt)
      })) || [];
    } catch (error) {
      console.error('Error fetching bulletins from GraphQL:', error);
      return [];
    }
  }

  async createBulletin(data: InsertBulletin): Promise<Bulletin> {
    try {
      const result = await graphqlJanusClient.createBulletin({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {
        id: parseInt(result.addVertex.id),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Bulletin;
    } catch (error) {
      console.error('Error creating bulletin in GraphQL:', error);
      throw error;
    }
  }

  async updateBulletin(id: number, data: Partial<InsertBulletin>): Promise<Bulletin | null> {
    console.log(`Update bulletin ${id} - GraphQL mutation needed`);
    return null;
  }

  async deleteBulletin(id: number): Promise<boolean> {
    console.log(`Delete bulletin ${id} - GraphQL mutation needed`);
    return true;
  }

  // Knowledge Base operations
  async getKnowledgeBase(): Promise<KnowledgeBase[]> {
    try {
      const result = await graphqlJanusClient.getKnowledgeBase();
      return result.vertices?.map((vertex: any) => ({
        id: parseInt(vertex.id),
        ...vertex.properties,
        createdAt: new Date(vertex.properties.createdAt),
        updatedAt: new Date(vertex.properties.updatedAt)
      })) || [];
    } catch (error) {
      console.error('Error fetching knowledge base from GraphQL:', error);
      return [];
    }
  }

  async getKnowledgeBySource(sourceCode: string): Promise<KnowledgeBase[]> {
    const knowledge = await this.getKnowledgeBase();
    return knowledge.filter(kb => kb.sourceCode === sourceCode);
  }

  async createKnowledgeBase(data: InsertKnowledgeBase): Promise<KnowledgeBase> {
    try {
      const result = await graphqlJanusClient.createKnowledgeEntry({
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      return {
        id: parseInt(result.addVertex.id),
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      } as KnowledgeBase;
    } catch (error) {
      console.error('Error creating knowledge entry in GraphQL:', error);
      throw error;
    }
  }

  async updateKnowledgeBase(id: number, data: Partial<InsertKnowledgeBase>): Promise<KnowledgeBase | null> {
    console.log(`Update knowledge base ${id} - GraphQL mutation needed`);
    return null;
  }

  async deleteKnowledgeBase(id: number): Promise<boolean> {
    console.log(`Delete knowledge base ${id} - GraphQL mutation needed`);
    return true;
  }

  // Chat Message operations
  async getChatMessages(): Promise<ChatMessage[]> {
    try {
      const result = await graphqlJanusClient.getChatMessages();
      return result.vertices?.map((vertex: any) => ({
        id: parseInt(vertex.id),
        ...vertex.properties,
        timestamp: new Date(vertex.properties.timestamp)
      })) || [];
    } catch (error) {
      console.error('Error fetching chat messages from GraphQL:', error);
      return [];
    }
  }

  async getChatMessagesBySource(sourceCode: string): Promise<ChatMessage[]> {
    const messages = await this.getChatMessages();
    return messages.filter(msg => msg.sourceCode === sourceCode);
  }

  async createChatMessage(data: InsertChatMessage): Promise<ChatMessage> {
    try {
      const result = await graphqlJanusClient.createChatMessage({
        ...data,
        timestamp: new Date().toISOString()
      });

      return {
        id: parseInt(result.addVertex.id),
        ...data,
        timestamp: new Date()
      } as ChatMessage;
    } catch (error) {
      console.error('Error creating chat message in GraphQL:', error);
      throw error;
    }
  }

  async updateChatMessage(id: number, data: Partial<InsertChatMessage>): Promise<ChatMessage | null> {
    console.log(`Update chat message ${id} - GraphQL mutation needed`);
    return null;
  }

  async deleteChatMessage(id: number): Promise<boolean> {
    console.log(`Delete chat message ${id} - GraphQL mutation needed`);
    return true;
  }

  // Dashboard stats
  async getDashboardStats() {
    const sources = await this.getSources();
    const transactions = await this.getTransactions();
    
    const activeSources = sources.filter(s => s.status === 'active').length;
    const totalDataPoints = sources.reduce((sum, s) => sum + (s.recordCount || 0), 0);
    const avgResponseTime = sources.reduce((sum, s, _, arr) => 
      sum + (s.avgResponseTime || 0) / arr.length, 0
    );

    return {
      totalIntegrations: sources.length,
      activeSources,
      dataPoints: this.formatNumber(totalDataPoints),
      avgResponseTime: `${Math.round(avgResponseTime)}ms`
    };
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }
}