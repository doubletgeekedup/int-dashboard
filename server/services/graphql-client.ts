import { GraphQLClient } from 'graphql-request';
import { configManager } from '../config';

export class GraphQLJanusClient {
  private client: GraphQLClient;
  private endpoint: string;
  private isConnected: boolean = false;

  constructor() {
    const config = configManager.getConfig();
    // JanusGraph typically exposes GraphQL on port 8182 with /graphql endpoint
    this.endpoint = process.env.JANUSGRAPH_GRAPHQL_URL || 'http://localhost:8182/graphql';
    
    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
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
              code: "STC",
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