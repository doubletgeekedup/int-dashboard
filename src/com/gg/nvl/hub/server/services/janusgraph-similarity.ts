import { janusGraphService } from "./janusgraph";
import type { IStorage } from "../storage";

export interface JanusGraphSimilarity {
  nodeId: string;
  similarity: number;
  relationshipCount: number;
  sharedConnections: number;
  nodeProperties: any;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface JanusGraphImpactAssessment {
  targetNodeId: string;
  directConnections: number;
  indirectConnections: number;
  criticalPaths: string[];
  affectedSystems: string[];
  riskScore: number;
  recommendations: string[];
}

export class JanusGraphSimilarityService {
  constructor(private storage: IStorage) {}

  /**
   * Find similar nodes using JanusGraph queries based on graph structure
   */
  async findSimilarNodesByStructure(nodeId: string, maxHops: number = 2): Promise<JanusGraphSimilarity[]> {
    try {
      // Gremlin query to find nodes with similar connection patterns
      const query = `
        g.V().has('nodeId', '${nodeId}').as('target')
         .both().aggregate('targetNeighbors')
         .V().where(neq('target'))
         .local(both().aggregate('candidateNeighbors'))
         .where('candidateNeighbors', intersect('targetNeighbors'))
         .project('nodeId', 'sharedConnections', 'totalConnections', 'properties')
         .by(values('nodeId'))
         .by(local(both().where(within('targetNeighbors')).count()))
         .by(local(both().count()))
         .by(valueMap())
         .order().by(select('sharedConnections'), desc)
         .limit(20)
      `;

      const result = await janusGraphService.executeQuery({ query });
      
      if (!result.success || !result.data) {
        return [];
      }

      return result.data.map((node: any) => ({
        nodeId: node.nodeId,
        similarity: this.calculateStructuralSimilarity(node.sharedConnections, node.totalConnections),
        relationshipCount: node.totalConnections,
        sharedConnections: node.sharedConnections,
        nodeProperties: node.properties,
        impactLevel: this.calculateImpactLevel(node.totalConnections, node.sharedConnections)
      }));

    } catch (error) {
      console.error('JanusGraph similarity query failed:', error);
      // Fallback to local thread-based analysis
      return this.fallbackToLocalSimilarity(nodeId);
    }
  }

  /**
   * Find similar nodes by property matching
   */
  async findSimilarNodesByProperties(nodeProperties: any): Promise<JanusGraphSimilarity[]> {
    try {
      const { type, class: nodeClass, functionName } = nodeProperties;
      
      let query = `g.V()`;
      const conditions = [];

      if (type) conditions.push(`has('type', '${type}')`);
      if (nodeClass) conditions.push(`has('class', '${nodeClass}')`);
      if (functionName) conditions.push(`has('functionName', textContains('${functionName}'))`);

      if (conditions.length > 0) {
        query += `.${conditions.join('.')}`;
      }

      query += `
        .project('nodeId', 'type', 'class', 'functionName', 'connections', 'properties')
        .by(values('nodeId'))
        .by(values('type'))
        .by(values('class'))
        .by(values('functionName'))
        .by(local(both().count()))
        .by(valueMap())
        .limit(50)
      `;

      const result = await janusGraphService.executeQuery({ query });
      
      if (!result.success || !result.data) {
        return [];
      }

      return result.data.map((node: any) => ({
        nodeId: node.nodeId,
        similarity: this.calculatePropertySimilarity(nodeProperties, node),
        relationshipCount: node.connections,
        sharedConnections: 0,
        nodeProperties: node.properties,
        impactLevel: this.calculateImpactLevel(node.connections, 0)
      }));

    } catch (error) {
      console.error('JanusGraph property similarity failed:', error);
      return [];
    }
  }

  /**
   * Perform comprehensive impact assessment using graph traversal
   */
  async performGraphImpactAssessment(nodeId: string): Promise<JanusGraphImpactAssessment> {
    try {
      // Query for direct and indirect connections
      const connectionsQuery = `
        g.V().has('nodeId', '${nodeId}').as('target')
         .project('direct', 'indirect', 'criticalPaths', 'systems')
         .by(local(both().count()))
         .by(local(both().both().dedup().count()))
         .by(local(both().hasLabel('CRITICAL').path().limit(10)))
         .by(local(both().both().values('system').dedup().fold()))
      `;

      const result = await janusGraphService.executeQuery({ query: connectionsQuery });
      
      if (!result.success || !result.data || result.data.length === 0) {
        throw new Error('Failed to get impact data from JanusGraph');
      }

      const data = result.data[0];
      const riskScore = this.calculateRiskScore(data.direct, data.indirect, data.systems?.length || 0);

      return {
        targetNodeId: nodeId,
        directConnections: data.direct || 0,
        indirectConnections: data.indirect || 0,
        criticalPaths: data.criticalPaths || [],
        affectedSystems: data.systems || [],
        riskScore,
        recommendations: this.generateGraphBasedRecommendations(data)
      };

    } catch (error) {
      console.error('JanusGraph impact assessment failed:', error);
      // Fallback to local analysis
      return this.fallbackToLocalImpactAssessment(nodeId);
    }
  }

  /**
   * Find nodes that would be affected by changes to the target node
   */
  async findDependentNodes(nodeId: string, maxDepth: number = 3): Promise<any[]> {
    try {
      const query = `
        g.V().has('nodeId', '${nodeId}')
         .repeat(out().simplePath())
         .times(${maxDepth})
         .emit()
         .project('nodeId', 'distance', 'path', 'type', 'system')
         .by(values('nodeId'))
         .by(loops())
         .by(path().by(values('nodeId')))
         .by(values('type'))
         .by(values('system'))
         .order().by(select('distance'))
      `;

      const result = await janusGraphService.executeQuery({ query });
      return result.success ? result.data || [] : [];
    } catch (error) {
      console.error('Failed to find dependent nodes:', error);
      return [];
    }
  }

  /**
   * Calculate structural similarity based on shared connections
   */
  private calculateStructuralSimilarity(sharedConnections: number, totalConnections: number): number {
    if (totalConnections === 0) return 0;
    return Math.min(sharedConnections / totalConnections, 1.0);
  }

  /**
   * Calculate property-based similarity
   */
  private calculatePropertySimilarity(target: any, candidate: any): number {
    let score = 0;
    let factors = 0;

    // Type match (40% weight)
    if (target.type && candidate.type) {
      score += target.type === candidate.type ? 0.4 : 0;
      factors += 0.4;
    }

    // Class match (30% weight)
    if (target.class && candidate.class) {
      score += target.class === candidate.class ? 0.3 : 0;
      factors += 0.3;
    }

    // Function name similarity (30% weight)
    if (target.functionName && candidate.functionName) {
      const similarity = this.stringSimilarity(target.functionName, candidate.functionName);
      score += similarity * 0.3;
      factors += 0.3;
    }

    return factors > 0 ? score / factors : 0;
  }

  /**
   * Simple string similarity using Jaccard coefficient
   */
  private stringSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.toLowerCase().split(''));
    const set2 = new Set(str2.toLowerCase().split(''));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return intersection.size / union.size;
  }

  /**
   * Calculate impact level based on connection counts
   */
  private calculateImpactLevel(connections: number, sharedConnections: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const score = connections + (sharedConnections * 2);
    
    if (score > 20) return 'CRITICAL';
    if (score > 10) return 'HIGH';
    if (score > 5) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate risk score (0-100)
   */
  private calculateRiskScore(direct: number, indirect: number, systems: number): number {
    const directWeight = direct * 5;
    const indirectWeight = indirect * 2;
    const systemWeight = systems * 10;
    
    return Math.min(directWeight + indirectWeight + systemWeight, 100);
  }

  /**
   * Generate recommendations based on graph analysis
   */
  private generateGraphBasedRecommendations(data: any): string[] {
    const recommendations: string[] = [];
    
    if (data.direct > 10) {
      recommendations.push('High-impact node with many direct connections - implement staged rollout');
    }
    
    if (data.indirect > 50) {
      recommendations.push('Extensive indirect impact detected - coordinate with downstream systems');
    }
    
    if (data.systems && data.systems.length > 3) {
      recommendations.push(`Multi-system impact across ${data.systems.length} systems - plan cross-system coordination`);
    }
    
    if (data.criticalPaths && data.criticalPaths.length > 0) {
      recommendations.push('Critical dependency paths identified - implement rollback procedures');
    }
    
    return recommendations;
  }

  /**
   * Fallback to local thread-based similarity when JanusGraph is unavailable
   */
  private async fallbackToLocalSimilarity(nodeId: string): Promise<JanusGraphSimilarity[]> {
    const threads = await this.storage.getThreads();
    const similarNodes: JanusGraphSimilarity[] = [];

    // Simple local similarity based on thread data
    for (const thread of threads) {
      if (Array.isArray(thread.componentNode)) {
        for (const cNode of thread.componentNode) {
          if (cNode.node && Array.isArray(cNode.node)) {
            for (const node of cNode.node) {
              if (node.id !== nodeId && node.nodeKey !== nodeId) {
                // Calculate basic similarity based on node properties
                const similarity = this.calculateBasicSimilarity(nodeId, node);
                
                similarNodes.push({
                  nodeId: node.id || node.nodeKey || `node_${Math.random().toString(36).substr(2, 9)}`,
                  similarity,
                  relationshipCount: 1,
                  sharedConnections: 0,
                  nodeProperties: node,
                  impactLevel: this.calculateImpactLevel(1, 0)
                });
              }
            }
          }
        }
      }
    }

    // Sort by similarity and return top 10
    return similarNodes
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
  }

  /**
   * Calculate basic similarity for local fallback
   */
  private calculateBasicSimilarity(targetNodeId: string, candidateNode: any): number {
    let similarity = 0.3; // Base similarity for existing nodes
    
    // Check if node IDs have similar patterns
    if (targetNodeId.includes('@id@') && candidateNode.id?.includes('@id@')) {
      const targetPrefix = targetNodeId.split('@id@')[0];
      const candidatePrefix = candidateNode.id?.split('@id@')[0];
      if (targetPrefix === candidatePrefix) {
        similarity += 0.4; // Same prefix pattern
      }
    }
    
    // Check for property matches
    if (candidateNode.type && targetNodeId.includes(candidateNode.type)) {
      similarity += 0.2;
    }
    
    if (candidateNode.functionName && targetNodeId.toLowerCase().includes(candidateNode.functionName.toLowerCase())) {
      similarity += 0.1;
    }
    
    return Math.min(similarity, 1.0);
  }

  /**
   * Fallback impact assessment using local data
   */
  private async fallbackToLocalImpactAssessment(nodeId: string): Promise<JanusGraphImpactAssessment> {
    return {
      targetNodeId: nodeId,
      directConnections: 0,
      indirectConnections: 0,
      criticalPaths: [],
      affectedSystems: [],
      riskScore: 30,
      recommendations: ['JanusGraph unavailable - limited impact analysis', 'Consider manual dependency review']
    };
  }
}