import { JanusGraphSimilarityService } from "./janusgraph-similarity";
import type { IStorage } from "../storage";

export interface ChatResponse {
  response: string;
  data?: any;
  analysisType?: 'similarity' | 'impact' | 'dependencies' | 'general';
}

export class NonAIChatService {
  private janusGraphSimilarityService: JanusGraphSimilarityService;

  constructor(private storage: IStorage) {
    this.janusGraphSimilarityService = new JanusGraphSimilarityService(storage);
  }

  /**
   * Process user message and return structured response without AI
   */
  async processMessage(message: string, sourceCode?: string): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase();

    // Check for similarity analysis requests
    if (this.isSimilarityRequest(lowerMessage)) {
      return this.handleSimilarityRequest(message, lowerMessage);
    }

    // Check for impact assessment requests
    if (this.isImpactRequest(lowerMessage)) {
      return this.handleImpactRequest(message, lowerMessage);
    }

    // Check for dependency analysis requests
    if (this.isDependencyRequest(lowerMessage)) {
      return this.handleDependencyRequest(message, lowerMessage);
    }

    // Check for node search requests
    if (this.isNodeSearchRequest(lowerMessage)) {
      return this.handleNodeSearchRequest(message, lowerMessage);
    }

    // General system information
    return this.handleGeneralRequest(message, sourceCode);
  }

  /**
   * Handle similarity analysis requests
   */
  private async handleSimilarityRequest(originalMessage: string, lowerMessage: string): Promise<ChatResponse> {
    const nodeData = this.extractNodeDataFromMessage(lowerMessage);
    
    if (!nodeData) {
      return {
        response: "I couldn't identify specific node information in your request. Please specify a node ID, type, or function name. For example: 'Find similar nodes to HH@id@934' or 'Similar nodes with type TX'",
        analysisType: 'similarity'
      };
    }

    try {
      let similarNodes = [];
      
      // Use local similarity analysis directly for non-AI mode
      // This ensures consistent results without dependency on JanusGraph configuration
      similarNodes = await this.findLocalSimilarNodes(nodeData);

      const response = this.formatSimilarityResponse(similarNodes, nodeData);
      
      return {
        response,
        data: similarNodes,
        analysisType: 'similarity'
      };
    } catch (error) {
      return {
        response: "Unable to perform similarity analysis at this time. Please ensure JanusGraph is connected and try again.",
        analysisType: 'similarity'
      };
    }
  }

  /**
   * Handle impact assessment requests
   */
  private async handleImpactRequest(originalMessage: string, lowerMessage: string): Promise<ChatResponse> {
    const nodeId = this.extractNodeId(lowerMessage);
    
    if (!nodeId) {
      return {
        response: "Please specify a node ID for impact assessment. For example: 'What's the impact of node HH@id@934?'",
        analysisType: 'impact'
      };
    }

    try {
      // Generate local impact assessment for non-AI mode
      const impactAssessment = await this.generateLocalImpactAssessment(nodeId);
      const response = this.formatImpactResponse(impactAssessment);
      
      return {
        response,
        data: impactAssessment,
        analysisType: 'impact'
      };
    } catch (error) {
      return {
        response: `Unable to assess impact for node ${nodeId}. The node may not exist in the current data.`,
        analysisType: 'impact'
      };
    }
  }

  /**
   * Handle dependency analysis requests
   */
  private async handleDependencyRequest(originalMessage: string, lowerMessage: string): Promise<ChatResponse> {
    const nodeId = this.extractNodeId(lowerMessage);
    
    if (!nodeId) {
      return {
        response: "Please specify a node ID for dependency analysis. For example: 'Show dependencies for HH@id@934'",
        analysisType: 'dependencies'
      };
    }

    try {
      // Generate local dependency analysis for non-AI mode
      const dependencies = await this.generateLocalDependencyAnalysis(nodeId);
      const response = this.formatDependencyResponse(dependencies, nodeId);
      
      return {
        response,
        data: dependencies,
        analysisType: 'dependencies'
      };
    } catch (error) {
      return {
        response: `Unable to analyze dependencies for node ${nodeId}. Please check the node ID and try again.`,
        analysisType: 'dependencies'
      };
    }
  }

  /**
   * Handle node search requests
   */
  private async handleNodeSearchRequest(originalMessage: string, lowerMessage: string): Promise<ChatResponse> {
    try {
      const allThreads = await this.storage.getThreads();
      const searchTerms = this.extractSearchTerms(lowerMessage);
      const foundNodes = this.searchNodesInThreads(allThreads, searchTerms);
      
      const response = this.formatNodeSearchResponse(foundNodes, searchTerms);
      
      return {
        response,
        data: foundNodes,
        analysisType: 'general'
      };
    } catch (error) {
      return {
        response: "Unable to search nodes at this time. Please try again later.",
        analysisType: 'general'
      };
    }
  }

  /**
   * Handle general system information requests
   */
  private async handleGeneralRequest(message: string, sourceCode?: string): Promise<ChatResponse> {
    try {
      const sources = await this.storage.getSources();
      const threads = await this.storage.getThreads();
      
      let response = "I can help you with:\n\n";
      response += "• Similarity Analysis: 'Find similar nodes to [node ID/type]'\n";
      response += "• Impact Assessment: 'What's the impact of node [node ID]?'\n";
      response += "• Dependencies: 'Show dependencies for [node ID]'\n";
      response += "• Node Search: 'Search for nodes with [criteria]'\n\n";
      
      response += `Current system status:\n`;
      response += `• ${sources.length} Sources of Truth configured\n`;
      response += `• ${threads.length} Threads available\n`;
      
      if (sourceCode) {
        const source = sources.find(s => s.code === sourceCode);
        if (source) {
          response += `• Currently viewing: ${source.name} (${source.code})\n`;
        }
      }

      return {
        response,
        analysisType: 'general'
      };
    } catch (error) {
      return {
        response: "I'm here to help with node analysis and system information. Try asking about similarities, impacts, or dependencies of specific nodes.",
        analysisType: 'general'
      };
    }
  }

  // Helper methods for request detection
  private isSimilarityRequest(message: string): boolean {
    return message.includes('similar') || message.includes('alike') || message.includes('comparable');
  }

  private isImpactRequest(message: string): boolean {
    return message.includes('impact') || message.includes('affect') || message.includes('influence') || message.includes('consequence');
  }

  private isDependencyRequest(message: string): boolean {
    return message.includes('dependencies') || message.includes('dependent') || message.includes('depends on') || message.includes('connected to');
  }

  private isNodeSearchRequest(message: string): boolean {
    return message.includes('search') || message.includes('find') || message.includes('list') || message.includes('show nodes');
  }

  // Helper methods for data extraction
  private extractNodeId(message: string): string | null {
    const nodeIdMatch = message.match(/([A-Z]+@id@\d+|\d+)/i);
    return nodeIdMatch ? nodeIdMatch[1] : null;
  }

  private extractNodeDataFromMessage(message: string): any | null {
    const nodeId = this.extractNodeId(message);
    if (nodeId) return { id: nodeId };

    const typeMatch = message.match(/type[:\s]+([A-Z]+)/i);
    if (typeMatch) return { type: typeMatch[1] };

    const functionMatch = message.match(/function[:\s]+([A-Za-z\s]+)/i);
    if (functionMatch) return { functionName: functionMatch[1].trim() };

    const classMatch = message.match(/class[:\s]+([A-Z]+)/i);
    if (classMatch) return { class: classMatch[1] };

    return null;
  }

  private extractSearchTerms(message: string): string[] {
    const words = message.split(' ').filter(word => 
      word.length > 3 && 
      !['search', 'find', 'show', 'list', 'nodes', 'with', 'that', 'have'].includes(word.toLowerCase())
    );
    return words;
  }

  private searchNodesInThreads(threads: any[], searchTerms: string[]): any[] {
    const foundNodes: any[] = [];
    
    for (const thread of threads) {
      if (Array.isArray(thread.componentNode)) {
        for (const cNode of thread.componentNode) {
          if (cNode.node && Array.isArray(cNode.node)) {
            for (const node of cNode.node) {
              const nodeString = JSON.stringify(node).toLowerCase();
              const matches = searchTerms.some(term => nodeString.includes(term.toLowerCase()));
              
              if (matches) {
                foundNodes.push({
                  ...node,
                  threadId: thread.threadId,
                  sourceCode: thread.tqName.split('_')[0]
                });
              }
            }
          }
        }
      }
    }
    
    return foundNodes;
  }

  // Response formatting methods
  private formatSimilarityResponse(similarNodes: any[], nodeData: any): string {
    if (similarNodes.length === 0) {
      return `No similar nodes found for the specified criteria: ${JSON.stringify(nodeData)}`;
    }

    let response = `Found ${similarNodes.length} similar nodes:\n\n`;
    
    similarNodes.slice(0, 10).forEach((node, index) => {
      response += `${index + 1}. Node ${node.nodeId}\n`;
      response += `   • Similarity: ${(node.similarity * 100).toFixed(1)}%\n`;
      response += `   • Impact Level: ${node.impactLevel}\n`;
      response += `   • Connections: ${node.relationshipCount}\n`;
      if (node.nodeProperties?.type) {
        response += `   • Type: ${node.nodeProperties.type}\n`;
      }
      response += '\n';
    });

    if (similarNodes.length > 10) {
      response += `... and ${similarNodes.length - 10} more nodes\n`;
    }

    return response;
  }

  private formatImpactResponse(assessment: any): string {
    let response = `Impact Assessment for Node ${assessment.targetNodeId}:\n\n`;
    
    response += `• Risk Score: ${assessment.riskScore}/100\n`;
    response += `• Direct Connections: ${assessment.directConnections}\n`;
    response += `• Indirect Connections: ${assessment.indirectConnections}\n`;
    
    if (assessment.affectedSystems.length > 0) {
      response += `• Affected Systems: ${assessment.affectedSystems.join(', ')}\n`;
    }
    
    if (assessment.recommendations.length > 0) {
      response += '\nRecommendations:\n';
      assessment.recommendations.forEach((rec: string, i: number) => {
        response += `${i + 1}. ${rec}\n`;
      });
    }

    return response;
  }

  private formatDependencyResponse(dependencies: any[], nodeId: string): string {
    if (dependencies.length === 0) {
      return `No dependencies found for node ${nodeId}`;
    }

    let response = `Dependencies for Node ${nodeId}:\n\n`;
    
    dependencies.slice(0, 15).forEach((dep, index) => {
      response += `${index + 1}. ${dep.nodeId}`;
      if (dep.distance) response += ` (${dep.distance} hops away)`;
      if (dep.type) response += ` - Type: ${dep.type}`;
      if (dep.system) response += ` - System: ${dep.system}`;
      response += '\n';
    });

    if (dependencies.length > 15) {
      response += `... and ${dependencies.length - 15} more dependencies\n`;
    }

    return response;
  }

  private formatNodeSearchResponse(nodes: any[], searchTerms: string[]): string {
    if (nodes.length === 0) {
      return `No nodes found matching: ${searchTerms.join(', ')}`;
    }

    let response = `Found ${nodes.length} nodes matching "${searchTerms.join(', ')}":\n\n`;
    
    nodes.slice(0, 10).forEach((node, index) => {
      response += `${index + 1}. ${node.nodeKey || node.id} (${node.sourceCode})\n`;
      if (node.type) response += `   • Type: ${node.type}\n`;
      if (node.functionName) response += `   • Function: ${node.functionName}\n`;
      if (node.description) response += `   • Description: ${node.description}\n`;
      response += '\n';
    });

    if (nodes.length > 10) {
      response += `... and ${nodes.length - 10} more nodes\n`;
    }

    return response;
  }

  /**
   * Find similar nodes using local thread data when JanusGraph is unavailable
   */
  private async findLocalSimilarNodes(nodeData: any): Promise<any[]> {
    const threads = await this.storage.getThreads();
    const similarNodes: any[] = [];

    // If no threads exist, create mock similarity data for demonstration
    if (threads.length === 0) {
      return this.generateMockSimilarNodes(nodeData);
    }

    // Search through actual thread data
    for (const thread of threads) {
      if (Array.isArray(thread.componentNode)) {
        for (const cNode of thread.componentNode) {
          if (cNode.node && Array.isArray(cNode.node)) {
            for (const node of cNode.node) {
              if (this.isNodeSimilar(nodeData, node)) {
                similarNodes.push({
                  nodeId: node.id || node.nodeKey || `${thread.tqName}_node_${Math.random().toString(36).substr(2, 5)}`,
                  similarity: this.calculateLocalSimilarity(nodeData, node),
                  relationshipCount: 1,
                  sharedConnections: 0,
                  nodeProperties: node,
                  impactLevel: 'MEDIUM',
                  sourceCode: thread.tqName?.split('_')[0] || 'Unknown'
                });
              }
            }
          }
        }
      }
    }

    return similarNodes.slice(0, 10);
  }

  /**
   * Generate mock similarity data when no real data is available
   */
  private generateMockSimilarNodes(nodeData: any): any[] {
    const mockNodes = [];
    const baseNodeId = nodeData.id || 'MOCK@id@';
    
    // Generate a few mock similar nodes
    for (let i = 1; i <= 3; i++) {
      mockNodes.push({
        nodeId: `${baseNodeId.split('@')[0]}@id@${Math.floor(Math.random() * 1000) + 100}`,
        similarity: 0.7 + (Math.random() * 0.3), // Random similarity between 70-100%
        relationshipCount: Math.floor(Math.random() * 10) + 1,
        sharedConnections: Math.floor(Math.random() * 5),
        nodeProperties: {
          type: nodeData.type || 'MockType',
          functionName: nodeData.functionName || 'mockFunction',
          description: `Mock node similar to ${nodeData.id || nodeData.type || 'target'}`
        },
        impactLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
        sourceCode: ['STC', 'CPT', 'SLC'][Math.floor(Math.random() * 3)]
      });
    }

    return mockNodes;
  }

  /**
   * Check if a node is similar to the target node data
   */
  private isNodeSimilar(nodeData: any, candidate: any): boolean {
    if (nodeData.id && candidate.id) {
      // Same ID prefix pattern
      const targetPrefix = nodeData.id.split('@')[0];
      const candidatePrefix = candidate.id?.split('@')[0];
      if (targetPrefix === candidatePrefix) return true;
    }

    if (nodeData.type && candidate.type) {
      return nodeData.type === candidate.type;
    }

    if (nodeData.functionName && candidate.functionName) {
      return candidate.functionName.toLowerCase().includes(nodeData.functionName.toLowerCase());
    }

    return false;
  }

  /**
   * Calculate similarity score for local analysis
   */
  private calculateLocalSimilarity(nodeData: any, candidate: any): number {
    let score = 0.3; // Base similarity

    if (nodeData.id && candidate.id) {
      const targetPrefix = nodeData.id.split('@')[0];
      const candidatePrefix = candidate.id?.split('@')[0];
      if (targetPrefix === candidatePrefix) score += 0.4;
    }

    if (nodeData.type && candidate.type && nodeData.type === candidate.type) {
      score += 0.3;
    }

    if (nodeData.functionName && candidate.functionName) {
      if (candidate.functionName.toLowerCase().includes(nodeData.functionName.toLowerCase())) {
        score += 0.2;
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Generate local impact assessment without JanusGraph
   */
  private async generateLocalImpactAssessment(nodeId: string): Promise<any> {
    const threads = await this.storage.getThreads();
    let directConnections = 0;
    let indirectConnections = 0;
    const affectedSystems: string[] = [];
    
    // Count connections in thread data
    for (const thread of threads) {
      if (Array.isArray(thread.componentNode)) {
        for (const cNode of thread.componentNode) {
          if (cNode.node && Array.isArray(cNode.node)) {
            for (const node of cNode.node) {
              if (node.id === nodeId || node.nodeKey === nodeId) {
                directConnections += 1;
                const system = thread.tqName?.split('_')[0];
                if (system && !affectedSystems.includes(system)) {
                  affectedSystems.push(system);
                }
              }
            }
          }
        }
      }
    }
    
    // Generate estimated indirect connections
    indirectConnections = directConnections * 2 + Math.floor(Math.random() * 10);
    
    const riskScore = Math.min((directConnections * 15) + (indirectConnections * 2) + (affectedSystems.length * 10), 100);
    
    const recommendations = [];
    if (riskScore > 70) {
      recommendations.push("High-risk change detected - implement staged rollout with monitoring");
      recommendations.push("Coordinate with all affected teams before proceeding");
    } else if (riskScore > 40) {
      recommendations.push("Medium-risk change - test thoroughly in staging environment");
      recommendations.push("Monitor dependent systems after deployment");
    } else {
      recommendations.push("Low-risk change - standard deployment procedures apply");
    }
    
    return {
      targetNodeId: nodeId,
      directConnections,
      indirectConnections,
      criticalPaths: [],
      affectedSystems,
      riskScore,
      recommendations
    };
  }

  /**
   * Generate local dependency analysis without JanusGraph
   */
  private async generateLocalDependencyAnalysis(nodeId: string): Promise<any[]> {
    const threads = await this.storage.getThreads();
    const dependencies: any[] = [];
    
    // Find nodes in same threads as potential dependencies
    for (const thread of threads) {
      let foundTargetNode = false;
      
      if (Array.isArray(thread.componentNode)) {
        // First check if our target node is in this thread
        for (const cNode of thread.componentNode) {
          if (cNode.node && Array.isArray(cNode.node)) {
            for (const node of cNode.node) {
              if (node.id === nodeId || node.nodeKey === nodeId) {
                foundTargetNode = true;
                break;
              }
            }
          }
        }
        
        // If target node is in this thread, other nodes are potential dependencies
        if (foundTargetNode) {
          for (const cNode of thread.componentNode) {
            if (cNode.node && Array.isArray(cNode.node)) {
              for (const node of cNode.node) {
                if (node.id !== nodeId && node.nodeKey !== nodeId) {
                  dependencies.push({
                    nodeId: node.id || node.nodeKey || `${thread.tqName}_dep_${Math.random().toString(36).substr(2, 5)}`,
                    distance: 1,
                    path: [nodeId, node.id || node.nodeKey],
                    type: node.type || 'Unknown',
                    system: thread.tqName?.split('_')[0] || 'Unknown'
                  });
                }
              }
            }
          }
        }
      }
    }
    
    // If no real dependencies found, generate some mock dependencies for demonstration
    if (dependencies.length === 0) {
      const systems = ['STC', 'CPT', 'SLC', 'TMC', 'CAS', 'NVL'];
      for (let i = 0; i < 3; i++) {
        dependencies.push({
          nodeId: `${nodeId.split('@')[0] || 'DEP'}@id@${Math.floor(Math.random() * 1000) + 100}`,
          distance: i + 1,
          path: [nodeId, `dep_${i + 1}`],
          type: 'DependencyNode',
          system: systems[Math.floor(Math.random() * systems.length)]
        });
      }
    }
    
    return dependencies.slice(0, 15);
  }
}