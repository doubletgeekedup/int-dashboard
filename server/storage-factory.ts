import { MemStorage, IStorage } from './storage';

let storage: IStorage;

// Factory function to create the appropriate storage instance
export function initializeStorage(): IStorage {
  if (storage) {
    return storage;
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.log('🗄️  No DATABASE_URL found - using in-memory storage');
    console.log('   Note: Data will be lost when server restarts');
    console.log('   To use PostgreSQL, set DATABASE_URL environment variable');
    storage = new MemStorage();
    return storage;
  }

  try {
    // TODO: In the future, we could add PostgreSQL storage here
    // For now, always use memory storage but show the database URL status
    console.log('🗄️  DATABASE_URL detected but using in-memory storage for now');
    console.log(`   Database: ${databaseUrl.split('@')[1] || 'configured'}`);
    console.log('   Note: PostgreSQL integration can be added when needed');
    storage = new MemStorage();
    return storage;
  } catch (error) {
    console.warn('⚠️  Database connection failed, falling back to in-memory storage');
    console.warn(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    storage = new MemStorage();
    return storage;
  }
}

export function getStorage(): IStorage {
  if (!storage) {
    return initializeStorage();
  }
  return storage;
}

// Check storage configuration status
export function getStorageInfo(): {
  type: 'memory' | 'postgresql';
  status: 'connected' | 'fallback' | 'not_configured';
  message: string;
} {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    return {
      type: 'memory',
      status: 'not_configured',
      message: 'No DATABASE_URL configured - using in-memory storage'
    };
  }

  return {
    type: 'memory',
    status: 'fallback',
    message: 'DATABASE_URL configured but using in-memory storage (PostgreSQL support can be added)'
  };
}