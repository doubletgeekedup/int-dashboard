import { MemStorage, IStorage } from './storage';
import { GraphQLStorage } from './storage/graphql-storage';

let storage: IStorage;

// Factory function to create the appropriate storage instance
export function initializeStorage(): IStorage {
  if (storage) {
    return storage;
  }

  const databaseUrl = process.env.DATABASE_URL;
  const janusGraphUrl = process.env.JANUSGRAPH_GRAPHQL_URL;
  
  // Priority: JanusGraph GraphQL > PostgreSQL > In-memory
  if (janusGraphUrl) {
    console.log('🗄️  Using JanusGraph GraphQL storage');
    console.log(`   GraphQL endpoint: ${janusGraphUrl}`);
    storage = new GraphQLStorage();
    return storage;
  }
  
  if (databaseUrl) {
    console.log('🗄️  DATABASE_URL detected but using in-memory storage for now');
    console.log(`   Database: ${databaseUrl.split('@')[1] || 'configured'}`);
    console.log('   Note: PostgreSQL integration can be added when needed');
    storage = new MemStorage();
    return storage;
  }

  console.log('🗄️  No database configured - using in-memory storage');
  console.log('   Note: Data will be lost when server restarts');
  console.log('   To use JanusGraph GraphQL, set JANUSGRAPH_GRAPHQL_URL environment variable');
  console.log('   To use PostgreSQL, set DATABASE_URL environment variable');
  storage = new MemStorage();
  return storage;
}

export function getStorage(): IStorage {
  if (!storage) {
    return initializeStorage();
  }
  return storage;
}

// Check storage configuration status
export function getStorageInfo(): {
  type: 'memory' | 'postgresql' | 'graphql';
  status: 'connected' | 'fallback' | 'not_configured';
  message: string;
} {
  const databaseUrl = process.env.DATABASE_URL;
  const janusGraphUrl = process.env.JANUSGRAPH_GRAPHQL_URL;
  
  if (janusGraphUrl) {
    return {
      type: 'graphql',
      status: 'connected',
      message: `JanusGraph GraphQL connected to ${janusGraphUrl}`
    };
  }
  
  if (databaseUrl) {
    return {
      type: 'memory',
      status: 'fallback',
      message: 'DATABASE_URL configured but using in-memory storage (PostgreSQL support can be added)'
    };
  }

  return {
    type: 'memory',
    status: 'not_configured',
    message: 'No database configured - using in-memory storage'
  };
}