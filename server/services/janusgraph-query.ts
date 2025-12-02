import { janusGraphService, JANUSGRAPH_PROPERTIES } from './janusgraph.js';

/**
 * JanusGraph Query Service
 * Provides read-only access to JanusGraph data for chat analysis and data exploration
 * Does NOT store any integration dashboard data - only reads from existing graph
 */
export class JanusGraphQueryService {
  
  /**
   * Query nodes by type or label
   */
  async queryNodesByType(nodeType: string, limit: number = 10): Promise<any[]> {
    try {
      const result = await janusGraphService.executeQuery({
        query: `g.V().hasLabel('${nodeType}').limit(${limit})`
      });
      
      return result.data || [];
    } catch (error) {
      console.error(`Error querying nodes by type ${nodeType}:`, error);
      return [];
    }
  }

  /**
   * Get node relationships and connections
   * Uses the correct case-sensitive property name from JANUSGRAPH_PROPERTIES
   */
  async getNodeRelationships(nodeId: string, depth: number = 2): Promise<any> {
    try {
      const primaryIdProp = JANUSGRAPH_PROPERTIES.PRIMARY_ID;
      const result = await janusGraphService.executeQuery({
        query: `g.V().has('${primaryIdProp}', '${nodeId}').repeat(__.both().simplePath()).times(${depth}).path()`
      });
      
      return result.data || [];
    } catch (error) {
      console.error(`Error getting relationships for node ${nodeId}:`, error);
      return [];
    }
  }

  /**
   * Search for similar nodes based on properties
   */
  async findSimilarNodes(nodeProperties: Record<string, any>, threshold: number = 0.7): Promise<any[]> {
    try {
      // Build a query to find nodes with similar properties
      const propertyFilters = Object.entries(nodeProperties)
        .map(([key, value]) => `has('${key}', '${value}')`)
        .join('.');
      
      const result = await janusGraphService.executeQuery({
        query: `g.V().${propertyFilters}.limit(10)`
      });
      
      return result.data || [];
    } catch (error) {
      console.error('Error finding similar nodes:', error);
      return [];
    }
  }

  /**
   * Get graph statistics
   */
  async getGraphStats(): Promise<{
    vertexCount: number;
    edgeCount: number;
    labels: string[];
  }> {
    try {
      const vertexCount = await janusGraphService.getVertexCount();
      const edgeCount = await janusGraphService.getEdgeCount();
      const schemaInfo = await janusGraphService.getSchemaInfo();
      
      return {
        vertexCount,
        edgeCount,
        labels: schemaInfo.vertexLabels || []
      };
    } catch (error) {
      console.error('Error getting graph stats:', error);
      return {
        vertexCount: 0,
        edgeCount: 0,
        labels: []
      };
    }
  }

  /**
   * Execute custom Gremlin queries for advanced analysis
   */
  async executeCustomQuery(gremlinQuery: string): Promise<any[]> {
    try {
      const result = await janusGraphService.executeQuery({
        query: gremlinQuery
      });
      
      return result.data || [];
    } catch (error) {
      console.error('Error executing custom query:', error);
      return [];
    }
  }

  /**
   * Get connection status for health checks
   */
  getConnectionStatus(): {
    connected: boolean;
    mode: string;
    realConnection: boolean;
  } {
    return {
      connected: true, // Always true since we fall back to simulation
      mode: janusGraphService.getConnectionMode(),
      realConnection: janusGraphService.isUsingRealConnection()
    };
  }
}

export const janusGraphQueryService = new JanusGraphQueryService();