import { getStorageInfo } from '../storage-factory';
import { janusGraphService } from '../services/janusgraph';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  storage: {
    type: 'memory' | 'postgresql';
    status: 'connected' | 'fallback' | 'not_configured';
    message: string;
  };
  janusgraph: {
    connected: boolean;
    healthy: boolean;
  };
  uptime: number;
}

export async function getHealthStatus(): Promise<HealthStatus> {
  const storageInfo = getStorageInfo();
  const isHealthy = await janusGraphService.performHealthCheck();
  const schemaInfo = await janusGraphService.getSchemaInfo();
  const janusHealth = {
    connected: schemaInfo.connected,
    healthy: isHealthy
  };
  
  // Determine overall health status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  if (storageInfo.status === 'fallback') {
    status = 'degraded';
  }
  
  if (!janusHealth.connected) {
    status = 'degraded';
  }

  return {
    status,
    timestamp: new Date().toISOString(),
    storage: storageInfo,
    janusgraph: janusHealth,
    uptime: process.uptime()
  };
}