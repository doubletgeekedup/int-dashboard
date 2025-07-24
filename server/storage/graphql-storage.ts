import type { IStorage } from '../storage';
import type { 
  Source, 
  Transaction, 
  Bulletin, 
  KnowledgeLink, 
  ChatMessage,
  InsertSource,
  InsertTransaction,
  InsertBulletin,
  InsertKnowledgeLink,
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

  async updateSource(code: string, data: Partial<InsertSource>): Promise<Source | null> {
    // GraphQL update would require a specific mutation
    // For now, return existing source with updated data
    const source = await this.getSourceByCode(code);
    if (source) {
      return { ...source, ...data, updatedAt: new Date() };
    }
    return null;
  }

  async getSource(code: string): Promise<Source | null> {
    return this.getSourceByCode(code);
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
        timestamp: new Date(),
        createdAt: new Date()
      } as Transaction;
    } catch (error) {
      console.error('Error creating transaction in GraphQL:', error);
      throw error;
    }
  }

  async updateTransaction(transactionId: string, data: Partial<InsertTransaction>): Promise<Transaction | null> {
    console.log(`Update transaction ${transactionId} - GraphQL mutation needed`);
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

  async getBulletin(id: number): Promise<Bulletin | null> {
    const bulletins = await this.getBulletins();
    return bulletins.find(b => b.id === id) || null;
  }

  async markBulletinAsRead(id: number, userId: string): Promise<boolean> {
    console.log(`Mark bulletin ${id} as read for user ${userId} - GraphQL mutation needed`);
    return true;
  }

  async deleteBulletin(id: number): Promise<boolean> {
    console.log(`Delete bulletin ${id} - GraphQL mutation needed`);
    return true;
  }

  // Knowledge Link operations
  async getKnowledgeLinks(): Promise<KnowledgeLink[]> {
    try {
      const result = await graphqlJanusClient.getKnowledgeBase();
      return result.vertices?.map((vertex: any) => ({
        id: parseInt(vertex.id),
        ...vertex.properties,
        createdAt: new Date(vertex.properties.createdAt),
        updatedAt: new Date(vertex.properties.updatedAt)
      })) || [];
    } catch (error) {
      console.error('Error fetching knowledge links from GraphQL:', error);
      return [];
    }
  }

  async getKnowledgeLinksBySource(sourceCode: string): Promise<KnowledgeLink[]> {
    const knowledge = await this.getKnowledgeLinks();
    return knowledge.filter(kb => kb.sourceCode === sourceCode);
  }

  async createKnowledgeLink(data: InsertKnowledgeLink): Promise<KnowledgeLink> {
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
      } as KnowledgeLink;
    } catch (error) {
      console.error('Error creating knowledge entry in GraphQL:', error);
      throw error;
    }
  }

  async updateKnowledgeLink(id: number, data: Partial<InsertKnowledgeLink>): Promise<KnowledgeLink | null> {
    console.log(`Update knowledge link ${id} - GraphQL mutation needed`);
    return null;
  }

  async deleteKnowledgeLink(id: number): Promise<boolean> {
    console.log(`Delete knowledge link ${id} - GraphQL mutation needed`);
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

  // Advanced relationship and similarity analysis methods
  async findSimilarSources(sourceCode: string, similarityThreshold: number = 0.7): Promise<any[]> {
    try {
      const sources = await this.getSources();
      const targetSource = sources.find(s => s.code === sourceCode);
      
      if (!targetSource) {
        return [];
      }

      // Use GraphQL similarity query if connected, otherwise calculate locally
      if (graphqlJanusClient.getConnectionStatus().connected) {
        const result = await graphqlJanusClient.findSimilarNodes(targetSource.id.toString(), similarityThreshold);
        return result.vertex?.similarNodes || [];
      }

      // Local similarity calculation for development
      return this.calculateLocalSimilarity(targetSource, sources, similarityThreshold);
    } catch (error) {
      console.error('Error finding similar sources:', error);
      return [];
    }
  }

  async findSourcesByAttributeRange(attribute: string, minValue: any, maxValue: any): Promise<Source[]> {
    try {
      if (graphqlJanusClient.getConnectionStatus().connected) {
        const result = await graphqlJanusClient.findNodesByAttributeRange(attribute, minValue, maxValue);
        return result.vertices?.map((vertex: any) => ({
          id: parseInt(vertex.id),
          ...vertex.properties
        })) || [];
      }

      // Local filtering for development
      const sources = await this.getSources();
      return sources.filter(source => {
        const value = (source as any)[attribute];
        if (typeof value === 'number') {
          return value >= minValue && value <= maxValue;
        }
        return false;
      });
    } catch (error) {
      console.error('Error finding sources by attribute range:', error);
      return [];
    }
  }

  async analyzeSourceClusters(clusterAttribute: string): Promise<any> {
    try {
      if (graphqlJanusClient.getConnectionStatus().connected) {
        return await graphqlJanusClient.analyzeNodeClusters(clusterAttribute);
      }

      // Local clustering analysis for development
      const sources = await this.getSources();
      const clusters = this.groupSourcesByAttribute(sources, clusterAttribute);
      
      return {
        clusters: Object.entries(clusters).map(([key, nodes]) => ({
          key,
          count: nodes.length,
          avgMetrics: this.calculateClusterMetrics(nodes),
          nodes: nodes.map(node => ({
            id: node.id,
            properties: {
              code: node.code,
              name: node.name,
              status: node.status,
              [clusterAttribute]: (node as any)[clusterAttribute]
            }
          }))
        }))
      };
    } catch (error) {
      console.error('Error analyzing source clusters:', error);
      return { clusters: [] };
    }
  }

  async getSourceRelationships(sourceCode: string, maxDepth: number = 2): Promise<any> {
    try {
      const source = await this.getSourceByCode(sourceCode);
      if (!source) return null;

      if (graphqlJanusClient.getConnectionStatus().connected) {
        return await graphqlJanusClient.getNodeRelationships(source.id.toString(), maxDepth);
      }

      // Mock relationship data for development
      return {
        vertex: {
          id: source.id,
          properties: { code: source.code, name: source.name },
          relationships: [
            {
              path: {
                vertices: [
                  { id: source.id, properties: { code: source.code, name: source.name, status: source.status } }
                ],
                edges: []
              },
              distance: 0
            }
          ]
        }
      };
    } catch (error) {
      console.error('Error getting source relationships:', error);
      return null;
    }
  }

  // Helper methods for local similarity calculations
  private calculateLocalSimilarity(targetSource: Source, allSources: Source[], threshold: number): any[] {
    const similarities = allSources
      .filter(s => s.id !== targetSource.id)
      .map(source => ({
        id: source.id.toString(),
        similarity: this.calculateSimilarityScore(targetSource, source),
        properties: {
          code: source.code,
          name: source.name,
          status: source.status,
          version: source.version,
          recordCount: source.recordCount,
          avgResponseTime: source.avgResponseTime
        }
      }))
      .filter(item => item.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return similarities;
  }

  private calculateSimilarityScore(source1: Source, source2: Source): number {
    let score = 0;
    let comparisons = 0;

    // Status similarity
    if (source1.status === source2.status) score += 0.3;
    comparisons++;

    // Record count similarity (normalized)
    if (source1.recordCount && source2.recordCount) {
      const ratio = Math.min(source1.recordCount, source2.recordCount) / Math.max(source1.recordCount, source2.recordCount);
      score += ratio * 0.25;
      comparisons++;
    }

    // Response time similarity (normalized)
    if (source1.avgResponseTime && source2.avgResponseTime) {
      const ratio = Math.min(source1.avgResponseTime, source2.avgResponseTime) / Math.max(source1.avgResponseTime, source2.avgResponseTime);
      score += ratio * 0.2;
      comparisons++;
    }

    // Type similarity (JanusGraph vs non-JanusGraph)
    if (source1.isJanusGraph === source2.isJanusGraph) score += 0.15;
    comparisons++;

    // Version similarity (basic string comparison)
    if (source1.version && source2.version) {
      const version1Parts = source1.version.split('.');
      const version2Parts = source2.version.split('.');
      if (version1Parts[0] === version2Parts[0]) score += 0.1; // Major version match
      comparisons++;
    }

    return comparisons > 0 ? score / comparisons : 0;
  }

  private groupSourcesByAttribute(sources: Source[], attribute: string): Record<string, Source[]> {
    return sources.reduce((groups, source) => {
      const key = (source as any)[attribute]?.toString() || 'unknown';
      if (!groups[key]) groups[key] = [];
      groups[key].push(source);
      return groups;
    }, {} as Record<string, Source[]>);
  }

  private calculateClusterMetrics(sources: Source[]): any {
    const totals = sources.reduce(
      (acc, source) => ({
        recordCount: acc.recordCount + (source.recordCount || 0),
        avgResponseTime: acc.avgResponseTime + (source.avgResponseTime || 0),
        count: acc.count + 1
      }),
      { recordCount: 0, avgResponseTime: 0, count: 0 }
    );

    return {
      recordCount: Math.round(totals.recordCount / totals.count),
      avgResponseTime: Math.round(totals.avgResponseTime / totals.count),
      uptime: "99.2%" // Placeholder - would be calculated from actual data
    };
  }
}