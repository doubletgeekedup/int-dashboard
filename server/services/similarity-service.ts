import type { IStorage } from "../storage";

export interface NodeSimilarity {
  nodeId: string;
  threadId: string;
  sourceCode: string;
  similarity: number;
  nodeData: any;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ImpactAssessment {
  targetNodeId: string;
  affectedNodes: NodeSimilarity[];
  impactSummary: {
    totalAffectedNodes: number;
    sourceBreakdown: Record<string, number>;
    severityBreakdown: Record<string, number>;
    estimatedImpactScore: number;
  };
  recommendations: string[];
}

export class SimilarityService {
  constructor(private storage: IStorage) {}

  /**
   * Find similar nodes across all sources of truth based on node properties
   */
  async findSimilarNodes(targetNode: any, threshold: number = 0.7): Promise<NodeSimilarity[]> {
    const allThreads = await this.storage.getThreads();
    const similarNodes: NodeSimilarity[] = [];

    for (const thread of allThreads) {
      // Extract nodes from componentNode array
      const componentNodes = Array.isArray(thread.componentNode) ? thread.componentNode : [];
      
      for (const cNode of componentNodes) {
        if (cNode.node && Array.isArray(cNode.node)) {
          for (const node of cNode.node) {
            const similarity = this.calculateNodeSimilarity(targetNode, node);
            
            if (similarity >= threshold) {
              // Determine source code from TQName
              const sourceCode = this.extractSourceFromTQName(thread.tqName);
              
              similarNodes.push({
                nodeId: node.id || node.nodeKey,
                threadId: thread.threadId,
                sourceCode,
                similarity,
                nodeData: node,
                impactLevel: this.calculateImpactLevel(similarity, node)
              });
            }
          }
        }
      }
    }

    return similarNodes.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Perform comprehensive impact assessment for a specific node
   */
  async performImpactAssessment(nodeId: string): Promise<ImpactAssessment> {
    // Find the target node first
    const targetNode = await this.findNodeById(nodeId);
    if (!targetNode) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // Find all similar nodes
    const similarNodes = await this.findSimilarNodes(targetNode, 0.5);
    
    // Calculate impact summary
    const sourceBreakdown: Record<string, number> = {};
    const severityBreakdown: Record<string, number> = {};
    
    similarNodes.forEach(node => {
      sourceBreakdown[node.sourceCode] = (sourceBreakdown[node.sourceCode] || 0) + 1;
      severityBreakdown[node.impactLevel] = (severityBreakdown[node.impactLevel] || 0) + 1;
    });

    const estimatedImpactScore = this.calculateOverallImpactScore(similarNodes);
    
    return {
      targetNodeId: nodeId,
      affectedNodes: similarNodes,
      impactSummary: {
        totalAffectedNodes: similarNodes.length,
        sourceBreakdown,
        severityBreakdown,
        estimatedImpactScore
      },
      recommendations: this.generateRecommendations(similarNodes, estimatedImpactScore)
    };
  }

  /**
   * Calculate similarity between two nodes based on their properties
   */
  private calculateNodeSimilarity(node1: any, node2: any): number {
    let score = 0;
    let totalFactors = 0;

    // Type similarity (highest weight)
    if (node1.type && node2.type) {
      score += node1.type === node2.type ? 0.4 : 0;
      totalFactors += 0.4;
    }

    // Class similarity
    if (node1.class && node2.class) {
      score += node1.class === node2.class ? 0.3 : 0;
      totalFactors += 0.3;
    }

    // Function name similarity
    if (node1.functionName && node2.functionName) {
      const funcSimilarity = this.calculateStringSimilarity(node1.functionName, node2.functionName);
      score += funcSimilarity * 0.2;
      totalFactors += 0.2;
    }

    // Description similarity
    if (node1.description && node2.description) {
      const descSimilarity = this.calculateStringSimilarity(node1.description, node2.description);
      score += descSimilarity * 0.1;
      totalFactors += 0.1;
    }

    return totalFactors > 0 ? score / totalFactors : 0;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  private calculateStringSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));

    for (let i = 0; i <= len1; i++) matrix[0][i] = i;
    for (let j = 0; j <= len2; j++) matrix[j][0] = j;

    for (let j = 1; j <= len2; j++) {
      for (let i = 1; i <= len1; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator   // substitution
        );
      }
    }

    const distance = matrix[len2][len1];
    const maxLen = Math.max(len1, len2);
    return (maxLen - distance) / maxLen;
  }

  /**
   * Calculate impact level based on similarity score and node properties
   */
  private calculateImpactLevel(similarity: number, node: any): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    // Critical functions that affect system integrity
    const criticalTypes = ['TX', 'AUTH', 'CORE'];
    const highImpactTypes = ['HH', 'CF', 'NET'];

    if (criticalTypes.includes(node.type) && similarity > 0.8) return 'CRITICAL';
    if (criticalTypes.includes(node.type) || similarity > 0.9) return 'HIGH';
    if (highImpactTypes.includes(node.type) && similarity > 0.7) return 'HIGH';
    if (similarity > 0.8) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Calculate overall impact score (0-100)
   */
  private calculateOverallImpactScore(similarNodes: NodeSimilarity[]): number {
    if (similarNodes.length === 0) return 0;

    const weights = { CRITICAL: 25, HIGH: 15, MEDIUM: 8, LOW: 3 };
    const totalWeight = similarNodes.reduce((sum, node) => sum + weights[node.impactLevel], 0);
    
    // Normalize to 0-100 scale, considering both count and severity
    const baseScore = Math.min(totalWeight, 100);
    const countMultiplier = Math.min(similarNodes.length / 10, 1.5); // Up to 1.5x for many affected nodes
    
    return Math.min(Math.round(baseScore * countMultiplier), 100);
  }

  /**
   * Generate actionable recommendations based on impact assessment
   */
  private generateRecommendations(similarNodes: NodeSimilarity[], impactScore: number): string[] {
    const recommendations: string[] = [];

    if (impactScore >= 80) {
      recommendations.push("🚨 CRITICAL: Implement change management process with extensive testing");
      recommendations.push("📋 Schedule maintenance window for coordinated updates across all affected systems");
    } else if (impactScore >= 60) {
      recommendations.push("⚠️ HIGH IMPACT: Conduct thorough testing in staging environment");
      recommendations.push("🔄 Plan phased rollout to minimize disruption");
    } else if (impactScore >= 30) {
      recommendations.push("📊 MEDIUM IMPACT: Monitor affected systems closely during changes");
      recommendations.push("🔍 Review dependencies before implementing modifications");
    } else {
      recommendations.push("✅ LOW IMPACT: Standard testing procedures should be sufficient");
    }

    // Source-specific recommendations
    const affectedSources = [...new Set(similarNodes.map(n => n.sourceCode))];
    if (affectedSources.length > 2) {
      recommendations.push(`🌐 Multi-system impact detected across ${affectedSources.join(', ')} - coordinate with all teams`);
    }

    // Critical node recommendations
    const criticalNodes = similarNodes.filter(n => n.impactLevel === 'CRITICAL');
    if (criticalNodes.length > 0) {
      recommendations.push(`🛡️ ${criticalNodes.length} critical nodes affected - implement rollback plan`);
    }

    return recommendations;
  }

  /**
   * Find a specific node by ID across all threads
   */
  private async findNodeById(nodeId: string): Promise<any | null> {
    const allThreads = await this.storage.getThreads();

    for (const thread of allThreads) {
      const componentNodes = Array.isArray(thread.componentNode) ? thread.componentNode : [];
      
      for (const cNode of componentNodes) {
        if (cNode.node && Array.isArray(cNode.node)) {
          for (const node of cNode.node) {
            if (node.id === nodeId || node.nodeKey === nodeId) {
              return node;
            }
          }
        }
      }
    }

    return null;
  }

  /**
   * Extract source code from TQName pattern
   */
  private extractSourceFromTQName(tqName: string): string {
    if (tqName.startsWith('STC_')) return 'STC';
    if (tqName.startsWith('CPT_')) return 'CPT';
    if (tqName.startsWith('TMC_')) return 'TMC';
    if (tqName.startsWith('SLC_')) return 'SLC';
    if (tqName.startsWith('CAS_')) return 'CAS';
    if (tqName.startsWith('NVL_')) return 'NVL';
    return 'UNKNOWN';
  }
}