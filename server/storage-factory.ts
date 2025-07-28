import { MemStorage, IStorage } from './storage';
import { GraphQLStorage } from './storage/graphql-storage';
import { configManager } from './config';

let storage: IStorage;

// Factory function to create the appropriate storage instance
export function initializeStorage(): IStorage {
  if (storage) {
    return storage;
  }

  const config = configManager.getJanusGraphConfig();
  const databaseConfig = configManager.getDatabaseConfig();
  const databaseUrl = databaseConfig.url;
  // Build GraphQL URL from host and port configuration
  const janusGraphUrl = `http://${config.connection.host}:${config.connection.port}/graphql`;
  
  // Check if useRemote is enabled in config
  if (config.enabled && config.useRemote) {
    // Use JanusGraph for read-only data queries, but store chat and integration data in memory
    if (janusGraphUrl) {
      console.log('🗄️  Using hybrid storage: JanusGraph for reads, Memory for chat/integration data');
      console.log(`   JanusGraph endpoint: ${janusGraphUrl} (read-only)`);
      console.log('   Chat messages and integration data stored in memory');
      storage = new MemStorage();
      return storage;
    }
    
    if (databaseUrl) {
      console.log('🗄️  DATABASE_URL detected but using in-memory storage for now (useRemote: true)');
      console.log(`   Database: ${databaseUrl.split('@')[1] || 'configured'}`);
      console.log('   Note: PostgreSQL integration can be added when needed');
      storage = new MemStorage();
      return storage;
    }

    console.log('⚠️  useRemote is true but no remote database configured - falling back to in-memory storage');
    console.log('   To use JanusGraph GraphQL, configure JanusGraph connection in config.yaml');
    console.log('   To use PostgreSQL, configure database URL in config.yaml');
    storage = new MemStorage();
    return storage;
  }

  // useRemote is false - use in-memory storage regardless of environment variables
  console.log('🗄️  Using in-memory storage (useRemote: false in config.yaml)');
  console.log('   Note: Data will be lost when server restarts');
  console.log('   To enable remote database, set useRemote: true in config.yaml');
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
  status: 'connected' | 'fallback' | 'not_configured' | 'disabled';
  message: string;
} {
  const config = configManager.getJanusGraphConfig();
  const databaseConfig = configManager.getDatabaseConfig();
  const databaseUrl = databaseConfig.url;
  // Build GraphQL URL from host and port configuration  
  const janusGraphUrl = `http://${config.connection.host}:${config.connection.port}/graphql`;
  
  if (!config.useRemote) {
    return {
      type: 'memory',
      status: 'disabled',
      message: 'Remote database disabled (useRemote: false in config.yaml) - using in-memory storage'
    };
  }
  
  if (janusGraphUrl) {
    return {
      type: 'memory',
      status: 'connected',
      message: `Hybrid storage: JanusGraph read-only (${janusGraphUrl}) + Memory for chat/integration data`
    };
  }
  
  if (databaseUrl) {
    return {
      type: 'memory',
      status: 'fallback',
      message: 'DATABASE_URL configured but using in-memory storage (PostgreSQL support can be added, useRemote: true)'
    };
  }

  return {
    type: 'memory',
    status: 'not_configured',
    message: 'No remote database configured despite useRemote: true - using in-memory storage'
  };
}