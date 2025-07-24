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
  connection: {
    url: string;
    timeout: number;
    ping_interval: number;
    max_retries: number;
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

interface Config {
  app: AppConfig;
  openai: OpenAIConfig;
  azure_openai: AzureOpenAIConfig;
  janusgraph: JanusGraphConfig;
  sources: Record<string, SourceConfig>;
  database: DatabaseConfig;
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
      const configPath = join(process.cwd(), 'config.properties');
      const fileContents = readFileSync(configPath, 'utf8');
      const rawConfig = this.parseProperties(fileContents);
      
      // Process environment variables and build config object
      this.config = this.buildConfigFromProperties(rawConfig);
      
      console.log('Configuration loaded successfully');
    } catch (error) {
      console.error('Failed to load configuration:', error);
      process.exit(1);
    }
  }

  private parseProperties(content: string): Record<string, string> {
    const properties: Record<string, string> = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      const equalIndex = trimmed.indexOf('=');
      if (equalIndex === -1) {
        continue;
      }
      
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      
      // Process environment variable substitution
      const processedValue = this.processEnvironmentVariable(value);
      properties[key] = processedValue;
    }
    
    return properties;
  }

  private buildConfigFromProperties(props: Record<string, string>): Config {
    return {
      app: {
        name: props['app.name'] || 'Integration Dashboard',
        version: props['app.version'] || '1.3.0',
        environment: props['app.environment'] || 'development',
        port: parseInt(props['app.port'] || '5000')
      },
      openai: {
        api_key: props['openai.api_key'] || '',
        model: props['openai.model'] || 'gpt-4o',
        max_tokens: parseInt(props['openai.max_tokens'] || '2000'),
        temperature: parseFloat(props['openai.temperature'] || '0.1'),
        features: {
          chat_analysis: props['openai.chat_analysis'] === 'true',
          data_insights: props['openai.data_insights'] === 'true',
          performance_recommendations: props['openai.performance_recommendations'] === 'true'
        }
      },
      azure_openai: {
        enabled: false
      },
      janusgraph: {
        enabled: props['janusgraph.enabled'] === 'true',
        connection: {
          url: props['janusgraph.url'] || 'ws://localhost:8182/gremlin',
          timeout: parseInt(props['janusgraph.timeout'] || '30000'),
          ping_interval: parseInt(props['janusgraph.ping_interval'] || '30000'),
          max_retries: parseInt(props['janusgraph.max_retries'] || '3')
        },
        database: {
          name: props['janusgraph.database_name'] || 'integration_dashboard',
          traversal_source: props['janusgraph.traversal_source'] || 'g'
        },
        features: {
          health_check: props['janusgraph.health_check'] === 'true',
          schema_introspection: props['janusgraph.schema_introspection'] === 'true',
          performance_monitoring: props['janusgraph.performance_monitoring'] === 'true'
        }
      },
      sources: this.buildSourcesConfig(props),
      database: {
        type: props['database.type'] || 'postgresql',
        url: props['database.url'] || '',
        pool: {
          min: parseInt(props['database.pool_min'] || '2'),
          max: parseInt(props['database.pool_max'] || '10')
        },
        migrations: {
          auto_run: props['database.auto_run_migrations'] === 'true'
        }
      },
      websocket: {
        path: props['websocket.path'] || '/ws',
        ping_interval: parseInt(props['websocket.ping_interval'] || '25000'),
        reconnect_attempts: parseInt(props['websocket.reconnect_attempts'] || '5'),
        reconnect_delay_base: parseInt(props['websocket.reconnect_delay_base'] || '1000')
      },
      logging: {
        level: props['logging.level'] || 'info',
        format: props['logging.format'] || 'combined',
        outputs: ['console'],
        request_logging: props['logging.request_logging'] === 'true',
        performance_logging: props['logging.performance_logging'] === 'true'
      },
      security: {
        cors: {
          enabled: props['security.cors_enabled'] === 'true',
          origins: props['security.cors_origins']?.split(',') || ['*']
        },
        rate_limiting: {
          enabled: props['security.rate_limiting_enabled'] === 'true',
          requests_per_minute: parseInt(props['security.rate_limiting_requests_per_minute'] || '60')
        }
      }
    };
  }

  private buildSourcesConfig(props: Record<string, string>): Record<string, SourceConfig> {
    const sources: Record<string, SourceConfig> = {};
    const sourceKeys = ['stc', 'cpt', 'slc', 'tmc', 'cas', 'nvl'];
    
    for (const sourceKey of sourceKeys) {
      const name = props[`sources.${sourceKey}.name`];
      const description = props[`sources.${sourceKey}.description`];
      const type = props[`sources.${sourceKey}.type`] as 'janusgraph' | 'rest_api' | 'database';
      const healthCheckInterval = parseInt(props[`sources.${sourceKey}.health_check_interval`] || '30');
      
      if (name && description && type) {
        sources[sourceKey] = {
          name,
          description,
          type,
          health_check_interval: healthCheckInterval
        };
      }
    }
    
    return sources;
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

  public isFeatureEnabled(feature: string): boolean {
    switch (feature) {
      case 'openai_chat':
        return this.config.openai.features.chat_analysis;
      case 'azure_openai':
        return this.config.azure_openai.enabled;
      case 'janusgraph':
        return this.config.janusgraph.enabled;
      default:
        return false;
    }
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
export type { Config, AppConfig, OpenAIConfig, JanusGraphConfig, SourceConfig };