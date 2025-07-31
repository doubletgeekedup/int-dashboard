import { db } from "../db";
import { knowledgeEntries, knowledgeRelations, knowledgeAccess } from "@shared/schema";
import type { 
  InsertKnowledgeEntry, 
  KnowledgeEntry, 
  InsertKnowledgeRelation,
  InsertKnowledgeAccess 
} from "@shared/schema";
import { eq, desc, like, and, or, sql } from "drizzle-orm";

/**
 * Government-Level Knowledge Retention Service
 * 
 * This service provides secure, local knowledge management for confidential environments
 * where external LLM data persistence is not permitted. All data is stored locally
 * in the PostgreSQL database with full audit trails and access controls.
 */
export class KnowledgeRetentionService {
  
  /**
   * Store important information with full classification and audit trail
   */
  async storeKnowledge(data: {
    title: string;
    content: string;
    category?: string;
    priority?: string;
    tags?: string[];
    sourceCode?: string;
    sessionId?: string;
    isConfidential?: boolean;
    retentionPolicy?: string;
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
    };
  }): Promise<KnowledgeEntry> {
    const entry = await db.insert(knowledgeEntries).values({
      title: data.title,
      content: data.content,
      category: data.category || "general",
      priority: data.priority || "medium",
      tags: data.tags || [],
      sourceCode: data.sourceCode,
      sessionId: data.sessionId,
      isConfidential: data.isConfidential || false,
      retentionPolicy: data.retentionPolicy || "permanent"
    }).returning();

    // Log access for audit trail
    if (data.metadata) {
      await this.logAccess({
        entryId: entry[0].id,
        accessType: "create",
        sessionId: data.sessionId,
        sourceCode: data.sourceCode,
        ipAddress: data.metadata.ipAddress,
        userAgent: data.metadata.userAgent,
      });
    }

    return entry[0];
  }

  /**
   * Retrieve knowledge with automatic access tracking
   */
  async getKnowledge(id: number, metadata?: {
    sessionId?: string;
    sourceCode?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<KnowledgeEntry | null> {
    const entries = await db.select()
      .from(knowledgeEntries)
      .where(eq(knowledgeEntries.id, id));

    if (entries.length === 0) return null;

    const entry = entries[0];

    // Update access tracking
    await db.update(knowledgeEntries)
      .set({
        lastAccessedAt: new Date(),
        accessCount: sql`${knowledgeEntries.accessCount} + 1`
      })
      .where(eq(knowledgeEntries.id, id));

    // Log access
    if (metadata) {
      await this.logAccess({
        entryId: id,
        accessType: "view",
        ...metadata
      });
    }

    return entry;
  }

  /**
   * Search knowledge base with full-text search and filtering
   */
  async searchKnowledge(query: {
    searchText?: string;
    category?: string;
    priority?: string;
    sourceCode?: string;
    tags?: string[];
    isConfidential?: boolean;
    limit?: number;
    offset?: number;
  }, metadata?: {
    sessionId?: string;
    sourceCode?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ entries: KnowledgeEntry[]; total: number }> {
    let whereConditions = [];

    if (query.searchText) {
      whereConditions.push(
        or(
          like(knowledgeEntries.title, `%${query.searchText}%`),
          like(knowledgeEntries.content, `%${query.searchText}%`)
        )
      );
    }

    if (query.category) {
      whereConditions.push(eq(knowledgeEntries.category, query.category));
    }

    if (query.priority) {
      whereConditions.push(eq(knowledgeEntries.priority, query.priority));
    }

    if (query.sourceCode) {
      whereConditions.push(eq(knowledgeEntries.sourceCode, query.sourceCode));
    }

    if (query.isConfidential !== undefined) {
      whereConditions.push(eq(knowledgeEntries.isConfidential, query.isConfidential));
    }

    if (query.tags && query.tags.length > 0) {
      // PostgreSQL array overlap operator
      whereConditions.push(sql`${knowledgeEntries.tags} && ${query.tags}`);
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const entries = await db.select()
      .from(knowledgeEntries)
      .where(whereClause)
      .orderBy(desc(knowledgeEntries.updatedAt))
      .limit(query.limit || 50)
      .offset(query.offset || 0);

    const total = await db.select({ count: sql<number>`count(*)` })
      .from(knowledgeEntries)
      .where(whereClause);

    // Log search access
    if (metadata) {
      await this.logAccess({
        entryId: null,
        accessType: "search",
        ...metadata
      });
    }

    return {
      entries,
      total: Number(total[0].count)
    };
  }

  /**
   * Get knowledge by category for quick access
   */
  async getKnowledgeByCategory(category: string, limit = 20): Promise<KnowledgeEntry[]> {
    return await db.select()
      .from(knowledgeEntries)
      .where(eq(knowledgeEntries.category, category))
      .orderBy(desc(knowledgeEntries.lastAccessedAt))
      .limit(limit);
  }

  /**
   * Get recent knowledge entries
   */
  async getRecentKnowledge(limit = 20, sourceCode?: string): Promise<KnowledgeEntry[]> {
    const conditions = sourceCode 
      ? eq(knowledgeEntries.sourceCode, sourceCode)
      : undefined;

    return await db.select()
      .from(knowledgeEntries)
      .where(conditions)
      .orderBy(desc(knowledgeEntries.updatedAt))
      .limit(limit);
  }

  /**
   * Create relationships between knowledge entries
   */
  async createRelation(data: InsertKnowledgeRelation): Promise<void> {
    await db.insert(knowledgeRelations).values(data);
  }

  /**
   * Get related knowledge entries
   */
  async getRelatedKnowledge(entryId: number): Promise<Array<{
    entry: KnowledgeEntry;
    relationType: string;
    confidence: number;
  }>> {
    const relations = await db.select({
      relationType: knowledgeRelations.relationType,
      confidence: knowledgeRelations.confidence,
      targetId: knowledgeRelations.toEntryId
    })
    .from(knowledgeRelations)
    .where(eq(knowledgeRelations.fromEntryId, entryId));

    const relatedEntries = [];
    for (const relation of relations) {
      if (relation.targetId) {
        const entry = await this.getKnowledge(relation.targetId);
        if (entry) {
          relatedEntries.push({
            entry,
            relationType: relation.relationType,
            confidence: relation.confidence || 0.5
          });
        }
      }
    }

    return relatedEntries;
  }

  /**
   * Update knowledge entry
   */
  async updateKnowledge(id: number, updates: Partial<InsertKnowledgeEntry>): Promise<KnowledgeEntry | null> {
    const updated = await db.update(knowledgeEntries)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(knowledgeEntries.id, id))
      .returning();

    return updated[0] || null;
  }

  /**
   * Get knowledge access audit trail
   */
  async getAccessAudit(entryId?: number, limit = 100) {
    const conditions = entryId 
      ? eq(knowledgeAccess.entryId, entryId)
      : undefined;

    return await db.select()
      .from(knowledgeAccess)
      .where(conditions)
      .orderBy(desc(knowledgeAccess.createdAt))
      .limit(limit);
  }

  /**
   * Get knowledge statistics for government reporting
   */
  async getKnowledgeStats() {
    // Get basic counts
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(knowledgeEntries);
    const confidentialResult = await db.select({ count: sql<number>`count(*)` })
      .from(knowledgeEntries)
      .where(eq(knowledgeEntries.isConfidential, true));

    // Get category distribution
    const categoryStats = await db.select({
      category: knowledgeEntries.category,
      count: sql<number>`count(*)`
    })
    .from(knowledgeEntries)
    .groupBy(knowledgeEntries.category);

    // Get priority distribution  
    const priorityStats = await db.select({
      priority: knowledgeEntries.priority,
      count: sql<number>`count(*)`
    })
    .from(knowledgeEntries)
    .groupBy(knowledgeEntries.priority);

    // Get recent activity
    const recentActivity = await db.select({
      date: sql<string>`date_trunc('day', created_at)`,
      count: sql<number>`count(*)`
    })
    .from(knowledgeEntries)
    .where(sql`created_at >= now() - interval '30 days'`)
    .groupBy(sql`date_trunc('day', created_at)`)
    .orderBy(sql`date_trunc('day', created_at)`);

    // Build response object
    const byCategory: Record<string, number> = {};
    categoryStats.forEach(stat => {
      byCategory[stat.category] = Number(stat.count);
    });

    const byPriority: Record<string, number> = {};
    priorityStats.forEach(stat => {
      byPriority[stat.priority] = Number(stat.count);
    });

    // Convert activity counts to numbers
    const convertedActivity = recentActivity.map(activity => ({
      date: activity.date,
      count: Number(activity.count)
    }));

    return {
      total: Number(totalResult[0]?.count || 0),
      confidential: Number(confidentialResult[0]?.count || 0),
      byCategory,
      byPriority,
      recentActivity: convertedActivity
    };
  }

  /**
   * Log knowledge access for security audit trails
   */
  private async logAccess(data: InsertKnowledgeAccess): Promise<void> {
    await db.insert(knowledgeAccess).values(data);
  }

  /**
   * Extract and store important information from LLM interactions
   * This method identifies key insights, patterns, and critical information
   * that should be retained for future reference in a government environment
   */
  async extractAndStoreFromChat(chatData: {
    message: string;
    response: string;
    sessionId: string;
    sourceCode?: string;
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
    };
  }): Promise<KnowledgeEntry[]> {
    const extractedEntries: KnowledgeEntry[] = [];

    // Analyze the chat for important information
    const insights = this.analyzeChatForInsights(chatData.message, chatData.response);

    for (const insight of insights) {
      const entry = await this.storeKnowledge({
        title: insight.title,
        content: insight.content,
        category: insight.category,
        priority: insight.priority,
        tags: insight.tags,
        sourceCode: chatData.sourceCode,
        sessionId: chatData.sessionId,
        isConfidential: insight.isConfidential,
        retentionPolicy: insight.retentionPolicy,
        metadata: chatData.metadata
      });

      extractedEntries.push(entry);
    }

    return extractedEntries;
  }

  /**
   * Analyze chat content to identify important information worth retaining
   */
  private analyzeChatForInsights(message: string, response: string): Array<{
    title: string;
    content: string;
    category: string;
    priority: string;
    tags: string[];
    isConfidential: boolean;
    retentionPolicy: string;
  }> {
    const insights = [];
    
    // Check for node relationship discoveries
    if (this.containsNodeRelationshipInfo(message, response)) {
      insights.push({
        title: `Node Relationship Discovery - ${new Date().toISOString().slice(0, 10)}`,
        content: `Relationship Query: ${message}\n\nRelationship Analysis: ${response}`,
        category: "analysis",
        priority: "high",
        tags: ["node-relationships", "similarity-analysis", "data-mapping"],
        isConfidential: false,
        retentionPolicy: "permanent"
      });
    }

    // Check for attribute matching patterns
    if (this.containsAttributeMatchingInfo(message, response)) {
      insights.push({
        title: `Attribute Matching Pattern - ${new Date().toISOString().slice(0, 10)}`,
        content: `Attribute Analysis: ${message}\n\nMatching Results: ${response}`,
        category: "analysis", 
        priority: "medium",
        tags: ["attribute-matching", "data-correlation", "pattern-recognition"],
        isConfidential: false,
        retentionPolicy: "permanent"
      });
    }

    // Check for similarity threshold discoveries
    if (this.containsSimilarityThresholdInfo(message, response)) {
      insights.push({
        title: `Similarity Threshold Analysis - ${new Date().toISOString().slice(0, 10)}`,
        content: `Threshold Query: ${message}\n\nSimilarity Analysis: ${response}`,
        category: "analysis",
        priority: "medium", 
        tags: ["similarity-thresholds", "matching-criteria", "data-analysis"],
        isConfidential: false,
        retentionPolicy: "permanent"
      });
    }
    
    // Check for system configurations
    if (message.toLowerCase().includes('config') || response.toLowerCase().includes('configuration')) {
      insights.push({
        title: `Configuration Insight - ${new Date().toISOString().slice(0, 10)}`,
        content: `Query: ${message}\n\nResponse: ${response}`,
        category: "system",
        priority: "high",
        tags: ["configuration", "system-setup"],
        isConfidential: true,
        retentionPolicy: "permanent"
      });
    }

    // Check for security-related information
    if (message.toLowerCase().includes('security') || message.toLowerCase().includes('auth') || 
        response.toLowerCase().includes('security') || response.toLowerCase().includes('authentication')) {
      insights.push({
        title: `Security Analysis - ${new Date().toISOString().slice(0, 10)}`,
        content: `Security Query: ${message}\n\nSecurity Response: ${response}`,
        category: "security",
        priority: "critical",
        tags: ["security", "authentication", "access-control"],
        isConfidential: true,
        retentionPolicy: "permanent"
      });
    }

    // Check for troubleshooting procedures
    if (message.toLowerCase().includes('error') || message.toLowerCase().includes('issue') ||
        message.toLowerCase().includes('problem') || response.toLowerCase().includes('troubleshoot')) {
      insights.push({
        title: `Troubleshooting Procedure - ${new Date().toISOString().slice(0, 10)}`,
        content: `Problem: ${message}\n\nSolution: ${response}`,
        category: "procedures",
        priority: "high",
        tags: ["troubleshooting", "error-resolution", "maintenance"],
        isConfidential: false,
        retentionPolicy: "permanent"
      });
    }

    // Check for data analysis insights
    if (message.toLowerCase().includes('analysis') || message.toLowerCase().includes('similarity') ||
        message.toLowerCase().includes('impact') || response.toLowerCase().includes('analysis')) {
      insights.push({
        title: `Data Analysis Insight - ${new Date().toISOString().slice(0, 10)}`,
        content: `Analysis Query: ${message}\n\nAnalysis Result: ${response}`,
        category: "analysis",
        priority: "medium",
        tags: ["data-analysis", "insights", "patterns"],
        isConfidential: false,
        retentionPolicy: "standard"
      });
    }

    // Check for important procedures or best practices
    if (response.length > 200 && (
        response.toLowerCase().includes('procedure') ||
        response.toLowerCase().includes('best practice') ||
        response.toLowerCase().includes('recommendation'))) {
      insights.push({
        title: `Procedure Documentation - ${new Date().toISOString().slice(0, 10)}`,
        content: `Context: ${message}\n\nProcedure: ${response}`,
        category: "procedures",
        priority: "medium",
        tags: ["procedures", "best-practices", "documentation"],
        isConfidential: false,
        retentionPolicy: "permanent"
      });
    }

    return insights;
  }

  /**
   * Detect if the conversation contains node relationship information
   */
  private containsNodeRelationshipInfo(message: string, response: string): boolean {
    const relationshipKeywords = [
      'node', 'related', 'relationship', 'connection', 'linked',
      'similar', 'xyz', 'dbx', 'correlation', 'mapping'
    ];
    
    const combinedText = `${message} ${response}`.toLowerCase();
    return relationshipKeywords.some(keyword => combinedText.includes(keyword)) &&
           (combinedText.includes('related') || combinedText.includes('connection'));
  }

  /**
   * Detect if the conversation contains attribute matching information
   */
  private containsAttributeMatchingInfo(message: string, response: string): boolean {
    const attributeKeywords = [
      'attribute', 'field', 'property', 'value', 'match', 'same',
      'share', 'percentage', '90%', 'similar', 'named differently'
    ];
    
    const combinedText = `${message} ${response}`.toLowerCase();
    return attributeKeywords.some(keyword => combinedText.includes(keyword)) &&
           (combinedText.includes('attribute') || combinedText.includes('value'));
  }

  /**
   * Detect if the conversation contains similarity threshold information
   */
  private containsSimilarityThresholdInfo(message: string, response: string): boolean {
    const thresholdKeywords = [
      'threshold', 'percentage', '%', 'similarity', 'match', 
      'criteria', 'cutoff', 'level', '90%', 'same value'
    ];
    
    const combinedText = `${message} ${response}`.toLowerCase();
    return thresholdKeywords.some(keyword => combinedText.includes(keyword)) &&
           (combinedText.includes('threshold') || combinedText.includes('%') || combinedText.includes('criteria'));
  }

  /**
   * Store node relationship information specifically
   */
  async storeNodeRelationship(data: {
    sourceNode: string;
    targetNode: string;
    relationshipType: 'similarity' | 'attribute_match' | 'manual_mapping' | 'correlation';
    confidence: number;
    attributes?: Array<{
      sourceName: string;
      targetName: string;
      matchPercentage: number;
      value?: string;
    }>;
    discoveryMethod: string;
    sessionId?: string;
    sourceCode?: string;
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
    };
  }): Promise<KnowledgeEntry> {
    
    const relationshipContent = this.formatNodeRelationshipContent(data);
    
    return await this.storeKnowledge({
      title: `Node Relationship: ${data.sourceNode} ↔ ${data.targetNode}`,
      content: relationshipContent,
      category: "analysis",
      priority: data.confidence > 0.8 ? "high" : "medium",
      tags: [
        "node-relationships", 
        data.relationshipType, 
        data.sourceNode, 
        data.targetNode,
        `confidence-${Math.round(data.confidence * 100)}`
      ],
      sourceCode: data.sourceCode,
      sessionId: data.sessionId,
      isConfidential: false,
      retentionPolicy: "permanent",
      metadata: data.metadata
    });
  }

  /**
   * Format node relationship content for storage
   */
  private formatNodeRelationshipContent(data: {
    sourceNode: string;
    targetNode: string;
    relationshipType: string;
    confidence: number;
    attributes?: Array<{
      sourceName: string;
      targetName: string;
      matchPercentage: number;
      value?: string;
    }>;
    discoveryMethod: string;
  }): string {
    let content = `Node Relationship Discovery\n\n`;
    content += `Source Node: ${data.sourceNode}\n`;
    content += `Target Node: ${data.targetNode}\n`;
    content += `Relationship Type: ${data.relationshipType}\n`;
    content += `Confidence: ${Math.round(data.confidence * 100)}%\n`;
    content += `Discovery Method: ${data.discoveryMethod}\n\n`;
    
    if (data.attributes && data.attributes.length > 0) {
      content += `Attribute Matches:\n`;
      data.attributes.forEach((attr, index) => {
        content += `${index + 1}. ${attr.sourceName} ↔ ${attr.targetName}\n`;
        content += `   Match Percentage: ${attr.matchPercentage}%\n`;
        if (attr.value) {
          content += `   Shared Value: ${attr.value}\n`;
        }
        content += '\n';
      });
    }
    
    content += `Analysis: These nodes are related through ${data.relationshipType}. `;
    if (data.attributes && data.attributes.length > 0) {
      const avgMatch = data.attributes.reduce((sum, attr) => sum + attr.matchPercentage, 0) / data.attributes.length;
      content += `Average attribute match percentage: ${Math.round(avgMatch)}%. `;
    }
    content += `This relationship can be used for future similarity analysis and data correlation.`;
    
    return content;
  }

  /**
   * Search for node relationships in knowledge base
   */
  async searchNodeRelationships(query: {
    sourceNode?: string;
    targetNode?: string;
    relationshipType?: string;
    minConfidence?: number;
    limit?: number;
  }): Promise<KnowledgeEntry[]> {
    const searchTags = ["node-relationships"];
    
    if (query.relationshipType) {
      searchTags.push(query.relationshipType);
    }
    
    let searchText = "";
    if (query.sourceNode) {
      searchText += query.sourceNode + " ";
    }
    if (query.targetNode) {
      searchText += query.targetNode + " ";
    }
    
    const results = await this.searchKnowledge({
      searchText: searchText.trim(),
      category: "analysis",
      limit: query.limit || 50
    });
    
    // Filter by confidence if specified
    if (query.minConfidence) {
      const confidenceThreshold = query.minConfidence * 100;
      results.entries = results.entries.filter(entry => {
        const confidenceTag = (entry.tags || []).find(tag => tag.startsWith('confidence-'));
        if (confidenceTag) {
          const confidence = parseInt(confidenceTag.split('-')[1]);
          return confidence >= confidenceThreshold;
        }
        return false;
      });
    }
    
    return results.entries;
  }
}

export const knowledgeRetentionService = new KnowledgeRetentionService();