import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';

interface AppConfig {
  name: string;
  version: string;
  environment: string;
  port: number;
}

interface OpenAIConfig {
  api_key: string;
  model: string;
  max_tokens: number;
  temperature: number;
  features: {
    chat_analysis: boolean;
    data_insights: boolean;
    performance_recommendations: boolean;
  };
}

interface AzureOpenAIConfig {
  enabled: boolean;
  endpoint?: string;
  api_key?: string;
  deployment_name?: string;
  api_version?: string;
}

interface JanusGraphConfig {
  enabled: boolean;
  useRemote: boolean;
  connection: {
    host: string;
    port: number;
    serializer: string;
    timeout: number;
    ping_interval: number;
    max_retries: number;
    path: string;
  };
  database: {
    name: string;
    traversal_source: string;
  };
  features: {
    health_check: boolean;
    schema_introspection: boolean;
    performance_monitoring: boolean;
  };
}

interface SourceConfig {
  name: string;
  description: string;
  type: 'janusgraph' | 'rest_api' | 'database';
  connection_string?: string;
  endpoint?: string;
  health_check_interval: number;
}

interface DatabaseConfig {
  type: string;
  url: string;
  pool: {
    min: number;
    max: number;
  };
  migrations: {
    auto_run: boolean;
  };
}

interface WebSocketConfig {
  path: string;
  ping_interval: number;
  reconnect_attempts: number;
  reconnect_delay_base: number;
}

interface ExternalConfig {
  listitems: {
    url: string;
  };
  janusgraph_schema: {
    url: string;
  };
  ssl_insecure?: boolean;
}

interface AIConfig {
  chat_enabled: string;
}

interface Config {
  app: AppConfig;
  openai: OpenAIConfig;
  azure_openai: AzureOpenAIConfig;
  janusgraph: JanusGraphConfig;
  sources: Record<string, SourceConfig>;
  database: DatabaseConfig;
  external: ExternalConfig;
  ai: AIConfig;
  websocket: WebSocketConfig;
  logging: {
    level: string;
    format: string;
    outputs: string[];
    request_logging: boolean;
    performance_logging: boolean;
  };
  security: {
    cors: {
      enabled: boolean;
      origins: string[];
    };
    rate_limiting: {
      enabled: boolean;
      requests_per_minute: number;
    };
  };
}

class ConfigManager {
  private config!: Config;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    try {
      const configPath = join(process.cwd(), 'config.yaml');
      const fileContents = readFileSync(configPath, 'utf8');
      const rawConfig = load(fileContents) as any;
      
      // Process environment variables
      this.config = this.processEnvironmentVariables(rawConfig);
      
      console.log('Configuration loaded successfully');
    } catch (error) {
      console.error('Failed to load configuration:', error);
      process.exit(1);
    }
  }

  private processEnvironmentVariables(obj: any): any {
    if (typeof obj === 'string') {
      // Replace ${VAR_NAME} with environment variables
      return obj.replace(/\$\{([^}]+)\}/g, (match, varName) => {
        return process.env[varName] || match;
      });
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.processEnvironmentVariables(item));
    }
    
    if (obj && typeof obj === 'object') {
      const processed: any = {};
      for (const key in obj) {
        processed[key] = this.processEnvironmentVariables(obj[key]);
      }
      return processed;
    }
    
    return obj;
  }

  public getConfig(): Config {
    return this.config;
  }

  public getAppConfig(): AppConfig {
    return this.config.app;
  }

  public getOpenAIConfig(): OpenAIConfig {
    return this.config.openai;
  }

  public getAzureOpenAIConfig(): AzureOpenAIConfig {
    return this.config.azure_openai;
  }

  public getJanusGraphConfig(): JanusGraphConfig {
    return this.config.janusgraph;
  }

  public getSourceConfig(sourceCode: string): SourceConfig | undefined {
    return this.config.sources[sourceCode.toLowerCase()];
  }

  public getAllSourceConfigs(): Record<string, SourceConfig> {
    return this.config.sources;
  }

  public getDatabaseConfig(): DatabaseConfig {
    return this.config.database;
  }

  public getWebSocketConfig(): WebSocketConfig {
    return this.config.websocket;
  }

  public getExternalConfig(): ExternalConfig {
    return this.config.external;
  }

  public getAIConfig(): AIConfig {
    return this.config.ai;
  }

  public getPort(): number {
    // Support both config.yaml and environment variable with fallback
    return this.config.app.port || parseInt(process.env.PORT || '5000', 10);
  }

  public isFeatureEnabled(feature: string): boolean {
    switch (feature) {
      case 'openai_chat':
        return this.config.openai.features.chat_analysis;
      case 'azure_openai':
        return this.config.azure_openai.enabled;
      case 'janusgraph':
        return this.config.janusgraph.enabled;
      case 'janusgraph_remote':
        return this.config.janusgraph.enabled && this.config.janusgraph.useRemote;
      case 'ai_chat':
        return this.config.ai.chat_enabled === 'true';
      default:
        return false;
    }
  }

  public isAIChatEnabled(): boolean {
    return this.config.ai.chat_enabled === 'true';
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
export type { Config, AppConfig, OpenAIConfig, JanusGraphConfig, SourceConfig };