import { configManager } from '../config';

export interface GrafanaConfig {
  url: string;
  apiKey?: string;
  orgId?: number;
  timeout?: number;
}

export interface MetricQuery {
  query: string;
  datasource: string;
  format?: 'time_series' | 'table';
  interval?: string;
}

export interface DashboardPanel {
  id: number;
  title: string;
  type: string;
  targets: MetricQuery[];
  gridPos: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

export interface GrafanaDashboard {
  id?: number;
  uid?: string;
  title: string;
  tags: string[];
  panels: DashboardPanel[];
  time: {
    from: string;
    to: string;
  };
  refresh: string;
}

export class GrafanaService {
  private config: GrafanaConfig;
  private isConnected: boolean = false;

  constructor() {
    const appConfig = configManager.getConfig();
    
    this.config = {
      url: process.env.GRAFANA_URL || 'http://localhost:3000',
      apiKey: process.env.GRAFANA_API_KEY,
      orgId: parseInt(process.env.GRAFANA_ORG_ID || '1'),
      timeout: parseInt(process.env.GRAFANA_TIMEOUT || '10000')
    };

    this.testConnection();
  }

  private async testConnection(): Promise<void> {
    try {
      if (!this.config.apiKey) {
        console.log('📊 Grafana API key not configured - dashboard features will be simulated');
        this.isConnected = false;
        return;
      }

      const response = await this.makeGrafanaRequest('/api/health');
      if (response.ok) {
        console.log('📊 Connected to Grafana successfully');
        this.isConnected = true;
      } else {
        console.log('📊 Grafana connection failed - using simulation mode');
        this.isConnected = false;
      }
    } catch (error) {
      console.log('📊 Grafana not available - performance metrics will be simulated');
      this.isConnected = false;
    }
  }

  private async makeGrafanaRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.config.url}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      'X-Grafana-Org-Id': this.config.orgId?.toString() || '1',
      ...options.headers
    };

    return fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.config.timeout || 10000)
    });
  }

  async createIntegrationDashboard(): Promise<GrafanaDashboard> {
    const dashboard: GrafanaDashboard = {
      title: 'Integration Dashboard - Sources of Truth',
      tags: ['integration', 'sources', 'monitoring'],
      time: {
        from: 'now-1h',
        to: 'now'
      },
      refresh: '30s',
      panels: [
        {
          id: 1,
          title: 'Source Response Times',
          type: 'timeseries',
          gridPos: { x: 0, y: 0, w: 12, h: 8 },
          targets: [
            {
              query: 'avg_response_time_ms{source=~"STC|CPT|SLC|TMC|CAS|NVL"}',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        },
        {
          id: 2,
          title: 'Record Count by Source',
          type: 'bargauge',
          gridPos: { x: 12, y: 0, w: 12, h: 8 },
          targets: [
            {
              query: 'record_count{source=~"STC|CPT|SLC|TMC|CAS|NVL"}',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        },
        {
          id: 3,
          title: 'System Uptime',
          type: 'stat',
          gridPos: { x: 0, y: 8, w: 6, h: 4 },
          targets: [
            {
              query: 'uptime_percentage{source=~"STC|CPT|SLC|TMC|CAS|NVL"}',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        },
        {
          id: 4,
          title: 'Error Rate',
          type: 'stat',
          gridPos: { x: 6, y: 8, w: 6, h: 4 },
          targets: [
            {
              query: 'rate(error_total{source=~"STC|CPT|SLC|TMC|CAS|NVL"}[5m])',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        },
        {
          id: 5,
          title: 'Transaction Throughput',
          type: 'timeseries',
          gridPos: { x: 12, y: 8, w: 12, h: 8 },
          targets: [
            {
              query: 'rate(transaction_total{source=~"STC|CPT|SLC|TMC|CAS|NVL"}[1m])',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        },
        {
          id: 6,
          title: 'JanusGraph Performance',
          type: 'timeseries',
          gridPos: { x: 0, y: 16, w: 24, h: 8 },
          targets: [
            {
              query: 'janusgraph_query_duration_ms{quantile="0.95"}',
              datasource: 'Prometheus',
              format: 'time_series'
            },
            {
              query: 'janusgraph_connection_pool_active',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        }
      ]
    };

    if (this.isConnected) {
      try {
        const response = await this.makeGrafanaRequest('/api/dashboards/db', {
          method: 'POST',
          body: JSON.stringify({
            dashboard: dashboard,
            overwrite: true
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📊 Integration dashboard created successfully');
          return { ...dashboard, id: result.id, uid: result.uid };
        }
      } catch (error) {
        console.error('Error creating Grafana dashboard:', error);
      }
    }

    // Return mock dashboard for development
    return {
      ...dashboard,
      id: 1,
      uid: 'integration-dashboard'
    };
  }

  async queryMetrics(queries: MetricQuery[], timeRange: { from: string; to: string }): Promise<any[]> {
    if (!this.isConnected) {
      // Return simulated metrics for development
      return this.getSimulatedMetrics(queries, timeRange);
    }

    try {
      const results = await Promise.all(
        queries.map(async (query) => {
          const response = await this.makeGrafanaRequest('/api/ds/query', {
            method: 'POST',
            body: JSON.stringify({
              queries: [
                {
                  expr: query.query,
                  refId: 'A',
                  datasource: { type: 'prometheus', uid: query.datasource },
                  format: query.format || 'time_series',
                  interval: query.interval || '30s'
                }
              ],
              from: timeRange.from,
              to: timeRange.to
            })
          });

          if (response.ok) {
            return await response.json();
          }
          return null;
        })
      );

      return results.filter(result => result !== null);
    } catch (error) {
      console.error('Error querying Grafana metrics:', error);
      return this.getSimulatedMetrics(queries, timeRange);
    }
  }

  async getDashboardUrl(uid: string): Promise<string> {
    return `${this.config.url}/d/${uid}/integration-dashboard-sources-of-truth`;
  }

  async getEmbeddableUrl(uid: string, options: {
    from?: string;
    to?: string;
    refresh?: string;
    theme?: 'light' | 'dark';
    kiosk?: boolean;
    autofitpanels?: boolean;
  } = {}): Promise<string> {
    const params = new URLSearchParams();
    
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    if (options.refresh) params.set('refresh', options.refresh);
    if (options.theme) params.set('theme', options.theme);
    if (options.kiosk) params.set('kiosk', 'true');
    if (options.autofitpanels) params.set('autofitpanels', 'true');
    
    // Add orgId for proper context
    params.set('orgId', this.config.orgId?.toString() || '1');
    
    const queryString = params.toString();
    return `${this.config.url}/d-solo/${uid}?${queryString}`;
  }

  async getPanelEmbedUrl(dashboardUid: string, panelId: number, options: {
    from?: string;
    to?: string;
    refresh?: string;
    theme?: 'light' | 'dark';
    width?: number;
    height?: number;
  } = {}): Promise<string> {
    const params = new URLSearchParams();
    
    params.set('panelId', panelId.toString());
    params.set('orgId', this.config.orgId?.toString() || '1');
    
    if (options.from) params.set('from', options.from);
    if (options.to) params.set('to', options.to);
    if (options.refresh) params.set('refresh', options.refresh);
    if (options.theme) params.set('theme', options.theme);
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    
    const queryString = params.toString();
    return `${this.config.url}/d-solo/${dashboardUid}?${queryString}`;
  }

  async generateEmbedToken(dashboardUid: string, panelId?: number): Promise<string | null> {
    if (!this.isConnected) {
      // Return a mock token for development
      return `mock-embed-token-${dashboardUid}${panelId ? `-panel-${panelId}` : ''}`;
    }

    try {
      const response = await this.makeGrafanaRequest('/api/auth/keys', {
        method: 'POST',
        body: JSON.stringify({
          name: `embed-${dashboardUid}${panelId ? `-panel-${panelId}` : ''}`,
          role: 'Viewer',
          secondsToLive: 3600 // 1 hour expiry
        })
      });

      if (response.ok) {
        const result = await response.json();
        return result.key;
      }
    } catch (error) {
      console.error('Error generating embed token:', error);
    }

    return null;
  }

  async exportDashboard(uid: string): Promise<GrafanaDashboard | null> {
    if (!this.isConnected) {
      return null;
    }

    try {
      const response = await this.makeGrafanaRequest(`/api/dashboards/uid/${uid}`);
      if (response.ok) {
        const result = await response.json();
        return result.dashboard;
      }
    } catch (error) {
      console.error('Error exporting dashboard:', error);
    }

    return null;
  }

  async createSimilarityAnalyticsDashboard(): Promise<GrafanaDashboard> {
    const dashboard: GrafanaDashboard = {
      title: 'Integration Similarity Analytics',
      tags: ['similarity', 'relationships', 'analytics'],
      time: {
        from: 'now-24h',
        to: 'now'
      },
      refresh: '5m',
      panels: [
        {
          id: 1,
          title: 'Similarity Score Distribution',
          type: 'histogram',
          gridPos: { x: 0, y: 0, w: 12, h: 8 },
          targets: [
            {
              query: 'histogram_quantile(0.95, similarity_score_bucket)',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        },
        {
          id: 2,
          title: 'Relationship Discovery Count',
          type: 'stat',
          gridPos: { x: 12, y: 0, w: 6, h: 4 },
          targets: [
            {
              query: 'sum(relationship_discoveries_total)',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        },
        {
          id: 3,
          title: 'Cluster Analysis Results',
          type: 'piechart',
          gridPos: { x: 18, y: 0, w: 6, h: 8 },
          targets: [
            {
              query: 'cluster_membership_count by (cluster_type)',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        },
        {
          id: 4,
          title: 'Graph Query Performance',
          type: 'timeseries',
          gridPos: { x: 0, y: 8, w: 24, h: 8 },
          targets: [
            {
              query: 'janusgraph_similarity_query_duration_ms{quantile="0.95"}',
              datasource: 'Prometheus',
              format: 'time_series'
            },
            {
              query: 'janusgraph_traversal_steps_total',
              datasource: 'Prometheus',
              format: 'time_series'
            }
          ]
        }
      ]
    };

    if (this.isConnected) {
      try {
        const response = await this.makeGrafanaRequest('/api/dashboards/db', {
          method: 'POST',
          body: JSON.stringify({
            dashboard: dashboard,
            overwrite: true
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('📊 Similarity analytics dashboard created successfully');
          return { ...dashboard, id: result.id, uid: result.uid };
        }
      } catch (error) {
        console.error('Error creating similarity dashboard:', error);
      }
    }

    return {
      ...dashboard,
      id: 2,
      uid: 'similarity-analytics'
    };
  }

  private getSimulatedMetrics(queries: MetricQuery[], timeRange: { from: string; to: string }): any[] {
    // Generate realistic mock data for development
    const now = Date.now();
    const points = 50;
    const interval = 60000; // 1 minute intervals

    return queries.map((query, index) => ({
      target: query.query,
      datapoints: Array.from({ length: points }, (_, i) => {
        const timestamp = now - (points - i) * interval;
        let value: number;

        // Generate realistic values based on query type
        if (query.query.includes('response_time')) {
          value = 100 + Math.random() * 100 + Math.sin(i / 10) * 20;
        } else if (query.query.includes('record_count')) {
          value = 1000000 + Math.random() * 500000;
        } else if (query.query.includes('uptime')) {
          value = 99.0 + Math.random() * 1.0;
        } else if (query.query.includes('error_rate')) {
          value = Math.random() * 0.05; // 0-5% error rate
        } else if (query.query.includes('similarity_score')) {
          value = 0.6 + Math.random() * 0.4; // 0.6-1.0 similarity
        } else {
          value = Math.random() * 100;
        }

        return [value, timestamp];
      })
    }));
  }

  getConnectionStatus(): { connected: boolean; url: string; configured: boolean } {
    return {
      connected: this.isConnected,
      url: this.config.url,
      configured: !!this.config.apiKey
    };
  }

  async refreshConnection(): Promise<boolean> {
    await this.testConnection();
    return this.isConnected;
  }
}

// Export singleton instance
export const grafanaService = new GrafanaService();