import { GraphQLClient } from 'graphql-request';
import { configManager } from '../config';

export class GraphQLJanusClient {
  private client: GraphQLClient;
  private endpoint: string;
  private isConnected: boolean = false;

  constructor() {
    const config = configManager.getJanusGraphConfig();
    // Use config.yaml connection URL or fallback to default
    this.endpoint = config.connection.url.replace('ws://', 'http://').replace('/gremlin', '/graphql');
    
    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async connect(): Promise<boolean> {
    try {
      // Test connection with a simple introspection query
      const query = `
        query {
          __schema {
            queryType {
              name
            }
          }
        }
      `;
      
      await this.client.request(query);
      this.isConnected = true;
      console.log('✅ Connected to JanusGraph GraphQL endpoint');
      return true;
    } catch (error) {
      console.log('⚠️  JanusGraph GraphQL not available, using simulated mode');
      this.isConnected = false;
      return false;
    }
  }

  async executeQuery<T = any>(query: string, variables?: any): Promise<T> {
    if (!this.isConnected) {
      // Return mock data when not connected for development
      return this.getMockData(query) as T;
    }

    try {
      return await this.client.request<T>(query, variables);
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }

  // GraphQL queries for Integration Dashboard data
  async getSources() {
    const query = `
      query GetSources {
        vertices(label: "Source") {
          id
          properties {
            code
            name
            description
            status
            version
            uptime
            recordCount
            avgResponseTime
            isJanusGraph
            apiEndpoint
            config
          }
        }
      }
    `;

    return this.executeQuery(query);
  }

  async getSourceById(id: string) {
    const query = `
      query GetSource($id: ID!) {
        vertex(id: $id) {
          id
          properties {
            code
            name
            description
            status
            version
            uptime
            recordCount
            avgResponseTime
            isJanusGraph
            apiEndpoint
            config
          }
        }
      }
    `;

    return this.executeQuery(query, { id });
  }

  async getTransactions() {
    const query = `
      query GetTransactions {
        vertices(label: "Transaction") {
          id
          properties {
            sourceCode
            transactionId
            type
            status
            timestamp
            responseTime
            errorMessage
            metadata
          }
        }
      }
    `;

    return this.executeQuery(query);
  }

  async getBulletins() {
    const query = `
      query GetBulletins {
        vertices(label: "Bulletin") {
          id
          properties {
            title
            content
            priority
            category
            isActive
            authorId
            createdAt
            updatedAt
          }
        }
      }
    `;

    return this.executeQuery(query);
  }

  async getKnowledgeBase() {
    const query = `
      query GetKnowledgeBase {
        vertices(label: "KnowledgeBase") {
          id
          properties {
            title
            content
            category
            sourceCode
            isPublic
            createdAt
            updatedAt
          }
        }
      }
    `;

    return this.executeQuery(query);
  }

  async getChatMessages() {
    const query = `
      query GetChatMessages {
        vertices(label: "ChatMessage") {
          id
          properties {
            content
            role
            sourceCode
            timestamp
            metadata
          }
        }
      }
    `;

    return this.executeQuery(query);
  }

  // Advanced relationship and similarity queries
  async findSimilarNodes(nodeId: string, similarityThreshold: number = 0.7) {
    const query = `
      query FindSimilarNodes($nodeId: ID!, $threshold: Float!) {
        vertex(id: $nodeId) {
          id
          properties {
            code
            name
            status
            version
            recordCount
            avgResponseTime
          }
          similarNodes(threshold: $threshold) {
            id
            similarity
            properties {
              code
              name
              status
              version
              recordCount
              avgResponseTime
            }
          }
        }
      }
    `;

    return this.executeQuery(query, { nodeId, threshold: similarityThreshold });
  }

  async findNodesByAttributeRange(attribute: string, minValue: any, maxValue: any) {
    const query = `
      query FindNodesByRange($attribute: String!, $min: String!, $max: String!) {
        vertices {
          id
          properties {
            code
            name
            ${attribute}
          }
        }
      }
    `;

    return this.executeQuery(query, { attribute, min: minValue.toString(), max: maxValue.toString() });
  }

  async getNodeRelationships(nodeId: string, maxDepth: number = 2) {
    const query = `
      query GetNodeRelationships($nodeId: ID!, $depth: Int!) {
        vertex(id: $nodeId) {
          id
          properties {
            code
            name
          }
          relationships(maxDepth: $depth) {
            path {
              vertices {
                id
                properties {
                  code
                  name
                  status
                }
              }
              edges {
                label
                properties
              }
            }
            distance
          }
        }
      }
    `;

    return this.executeQuery(query, { nodeId, depth: maxDepth });
  }

  async findNodesWithSimilarAttributes(sourceCode: string, attributes: string[]) {
    const query = `
      query FindSimilarAttributes($sourceCode: String!, $attributes: [String!]!) {
        vertices(filter: { code: { eq: $sourceCode } }) {
          id
          properties {
            code
            name
            status
            version
            recordCount
            avgResponseTime
          }
          similarByAttributes(attributes: $attributes) {
            node {
              id
              properties {
                code
                name
                status
                version
                recordCount
                avgResponseTime
              }
            }
            matchScore
            matchingAttributes
          }
        }
      }
    `;

    return this.executeQuery(query, { sourceCode, attributes });
  }

  async analyzeNodeClusters(clusterAttribute: string) {
    const query = `
      query AnalyzeNodeClusters($attribute: String!) {
        clusters(groupBy: $attribute) {
          key
          count
          avgMetrics {
            recordCount
            avgResponseTime
            uptime
          }
          nodes {
            id
            properties {
              code
              name
              status
              ${clusterAttribute}
            }
          }
        }
      }
    `;

    return this.executeQuery(query, { attribute: clusterAttribute });
  }

  // GraphQL mutations for data creation
  async createSource(sourceData: any) {
    const mutation = `
      mutation CreateSource($properties: SourceInput!) {
        addVertex(label: "Source", properties: $properties) {
          id
          properties {
            code
            name
            description
          }
        }
      }
    `;

    return this.executeQuery(mutation, { properties: sourceData });
  }

  async createTransaction(transactionData: any) {
    const mutation = `
      mutation CreateTransaction($properties: TransactionInput!) {
        addVertex(label: "Transaction", properties: $properties) {
          id
          properties {
            transactionId
            sourceCode
            type
            status
          }
        }
      }
    `;

    return this.executeQuery(mutation, { properties: transactionData });
  }

  async createBulletin(bulletinData: any) {
    const mutation = `
      mutation CreateBulletin($properties: BulletinInput!) {
        addVertex(label: "Bulletin", properties: $properties) {
          id
          properties {
            title
            content
            priority
          }
        }
      }
    `;

    return this.executeQuery(mutation, { properties: bulletinData });
  }

  async createKnowledgeEntry(knowledgeData: any) {
    const mutation = `
      mutation CreateKnowledge($properties: KnowledgeInput!) {
        addVertex(label: "KnowledgeBase", properties: $properties) {
          id
          properties {
            title
            content
            category
          }
        }
      }
    `;

    return this.executeQuery(mutation, { properties: knowledgeData });
  }

  async createChatMessage(messageData: any) {
    if (!this.isConnected) {
      // Return mock data that matches expected format for simulation mode
      return {
        addVertex: {
          id: Math.floor(Math.random() * 10000).toString(),
          properties: messageData
        }
      };
    }

    const mutation = `
      mutation CreateChatMessage($properties: ChatMessageInput!) {
        addVertex(label: "ChatMessage", properties: $properties) {
          id
          properties {
            content
            role
            sourceCode
          }
        }
      }
    `;

    return this.executeQuery(mutation, { properties: messageData });
  }

  // Mock data for development when GraphQL is not available
  private getMockData(query: string): any {
    if (query.includes('GetSources')) {
      return {
        vertices: [
          {
            id: "1",
            properties: {
              code: "SCR",
              name: "System Truth Cache",
              description: "Primary data repository and caching layer for system state management",
              status: "active",
              version: "2.4.1",
              uptime: "99.9%",
              recordCount: 1200000,
              avgResponseTime: 142,
              isJanusGraph: true,
              apiEndpoint: "http://localhost:8182/gremlin",
              config: { database: "janusgraph", traversal: "g" }
            }
          },
          {
            id: "2",
            properties: {
              code: "CPT",
              name: "Configuration Processing Tool",
              description: "Configuration management and processing system",
              status: "active",
              version: "1.8.3",
              uptime: "98.7%",
              recordCount: 850000,
              avgResponseTime: 98,
              isJanusGraph: false,
              apiEndpoint: "http://localhost:3001/api/config",
              config: { timeout: 5000, retries: 3 }
            }
          }
        ]
      };
    }

    if (query.includes('FindSimilarNodes')) {
      return {
        vertex: {
          id: "1",
          properties: { code: "SCR", name: "Source Code Repository", status: "active" },
          similarNodes: [
            {
              id: "4",
              similarity: 0.85,
              properties: { code: "TMC", name: "Transaction Management Center", status: "active" }
            },
            {
              id: "5",
              similarity: 0.72,
              properties: { code: "CAS", name: "Central Authentication Service", status: "active" }
            }
          ]
        }
      };
    }

    if (query.includes('FindSimilarAttributes')) {
      return {
        vertices: [
          {
            id: "1",
            properties: { code: "SCR", status: "active", recordCount: 1200000 },
            similarByAttributes: [
              {
                node: { id: "4", properties: { code: "TMC", status: "active", recordCount: 2100000 } },
                matchScore: 0.90,
                matchingAttributes: ["status", "recordCount"]
              },
              {
                node: { id: "5", properties: { code: "CAS", status: "active", recordCount: 45000 } },
                matchScore: 0.65,
                matchingAttributes: ["status"]
              }
            ]
          }
        ]
      };
    }

    if (query.includes('AnalyzeNodeClusters')) {
      return {
        clusters: [
          {
            key: "active",
            count: 5,
            avgMetrics: { recordCount: 1038000, avgResponseTime: 135, uptime: "99.2%" },
            nodes: [
              { id: "1", properties: { code: "SCR", name: "Source Code Repository", status: "active" } },
              { id: "2", properties: { code: "CPT", name: "Configuration Processing Tool", status: "active" } }
            ]
          },
          {
            key: "syncing",
            count: 1,
            avgMetrics: { recordCount: 650000, avgResponseTime: 156, uptime: "99.2%" },
            nodes: [
              { id: "3", properties: { code: "SLC", name: "Service Layer Coordinator", status: "syncing" } }
            ]
          }
        ]
      };
    }

    if (query.includes('GetTransactions')) {
      return { vertices: [] };
    }

    if (query.includes('GetBulletins')) {
      return { vertices: [] };
    }

    if (query.includes('GetKnowledgeBase')) {
      return { vertices: [] };
    }

    if (query.includes('GetChatMessages')) {
      return { vertices: [] };
    }

    return {};
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      endpoint: this.endpoint,
      status: this.isConnected ? 'connected' : 'simulated'
    };
  }
}

export const graphqlJanusClient = new GraphQLJanusClient();