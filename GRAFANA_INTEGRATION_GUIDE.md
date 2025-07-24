# Grafana Integration Guide

This guide explains how to integrate Grafana dashboards with your Integration Dashboard for comprehensive performance metrics visualization.

## Overview

The Integration Dashboard now includes full Grafana integration for advanced performance monitoring and visualization. This provides professional-grade dashboards for monitoring your sources of truth, similarity analysis, and graph database performance.

## Features

### 1. Performance Metrics Dashboard
- Source response times monitoring
- Record count tracking by source
- System uptime statistics
- Error rate analysis
- Transaction throughput monitoring
- JanusGraph performance metrics

### 2. Similarity Analytics Dashboard
- Similarity score distribution analysis
- Relationship discovery tracking
- Cluster analysis visualization
- Graph query performance monitoring

### 3. Real-time Data Integration
- Live metric queries from Prometheus
- Automatic dashboard creation
- Simulated data for development
- WebSocket-based updates

## Setup Instructions

### 1. Grafana Installation

Install Grafana locally or use a hosted instance:

```bash
# Using Docker
docker run -d -p 3000:3000 --name=grafana grafana/grafana-enterprise

# Using package manager (Ubuntu/Debian)
sudo apt-get install -y adduser libfontconfig1
wget https://dl.grafana.com/enterprise/release/grafana-enterprise_10.2.0_amd64.deb
sudo dpkg -i grafana-enterprise_10.2.0_amd64.deb
sudo systemctl start grafana-server
```

### 2. API Key Generation

1. Open Grafana at `http://localhost:3000` (admin/admin)
2. Go to Configuration → API Keys
3. Create new API key with Editor role
4. Copy the generated key

### 3. Environment Configuration

Add Grafana configuration to your `.env` file:

```bash
# Grafana Configuration
GRAFANA_URL=http://localhost:3000
GRAFANA_API_KEY=your_grafana_api_key_here
GRAFANA_ORG_ID=1
GRAFANA_TIMEOUT=10000
```

### 4. Prometheus Data Source

Configure Prometheus as a data source in Grafana:

1. Go to Configuration → Data Sources
2. Add Prometheus data source
3. Set URL to your Prometheus instance
4. Test and save the connection

## Dashboard Creation

### Automatic Dashboard Creation

The Integration Dashboard can automatically create Grafana dashboards:

```bash
# Create integration performance dashboard
curl -X POST http://localhost:5000/api/grafana/dashboard/create

# Create similarity analytics dashboard
curl -X POST http://localhost:5000/api/grafana/dashboard/similarity
```

### Manual Dashboard Import

You can also export and import dashboard JSON:

```bash
# Export existing dashboard
curl http://localhost:5000/api/grafana/dashboard/integration-dashboard/export

# Import to another Grafana instance
curl -X POST http://your-grafana:3000/api/dashboards/db \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d @dashboard.json
```

## Available Dashboards

### 1. Integration Dashboard - Sources of Truth

**Panels:**
- **Source Response Times**: Time series showing average response times for all sources
- **Record Count by Source**: Bar gauge displaying data volume by source
- **System Uptime**: Current uptime percentage for each source
- **Error Rate**: Real-time error rates across all sources
- **Transaction Throughput**: Rate of transactions processed per source
- **JanusGraph Performance**: Graph database specific metrics

**Queries:**
```promql
# Response times
avg_response_time_ms{source=~"STC|CPT|SLC|TMC|CAS|NVL"}

# Record counts
record_count{source=~"STC|CPT|SLC|TMC|CAS|NVL"}

# Uptime
uptime_percentage{source=~"STC|CPT|SLC|TMC|CAS|NVL"}

# Error rates
rate(error_total{source=~"STC|CPT|SLC|TMC|CAS|NVL"}[5m])
```

### 2. Similarity Analytics Dashboard

**Panels:**
- **Similarity Score Distribution**: Histogram of similarity scores
- **Relationship Discovery Count**: Total relationships discovered
- **Cluster Analysis Results**: Pie chart of cluster membership
- **Graph Query Performance**: JanusGraph query performance metrics

**Queries:**
```promql
# Similarity scores
histogram_quantile(0.95, similarity_score_bucket)

# Relationship discoveries
sum(relationship_discoveries_total)

# Cluster membership
cluster_membership_count by (cluster_type)

# Graph performance
janusgraph_similarity_query_duration_ms{quantile="0.95"}
```

## API Endpoints

### Dashboard Management

```http
# Get Grafana connection status
GET /api/grafana/status

# Create integration dashboard
POST /api/grafana/dashboard/create

# Create similarity analytics dashboard
POST /api/grafana/dashboard/similarity

# Export dashboard configuration
GET /api/grafana/dashboard/{uid}/export
```

### Metrics Querying

```http
# Query custom metrics
POST /api/grafana/metrics/query
Content-Type: application/json

{
  "queries": [
    {
      "query": "avg_response_time_ms{source=\"STC\"}",
      "datasource": "Prometheus",
      "format": "time_series"
    }
  ],
  "timeRange": {
    "from": "now-1h",
    "to": "now"
  }
}
```

## Frontend Integration

### Dashboard Page

Access the Grafana integration through the web interface:

1. Navigate to `/grafana` in your Integration Dashboard
2. View connection status and available dashboards
3. Create dashboards with one-click buttons
4. Execute custom metric queries

### React Components

```typescript
import { useQuery } from '@tanstack/react-query';

// Check Grafana status
const { data: status } = useQuery({
  queryKey: ['grafana', 'status'],
  queryFn: () => fetch('/api/grafana/status').then(res => res.json())
});

// Create dashboard
const createDashboard = useMutation({
  mutationFn: () => apiRequest('/api/grafana/dashboard/create', { 
    method: 'POST' 
  })
});
```

## Development Mode

When Grafana is not configured, the system operates in simulation mode:

- Mock data is generated for all metrics
- Dashboard creation returns simulated responses
- Metric queries return realistic test data
- All features remain functional for development

## Prometheus Metrics

### Integration Sources Metrics

```promql
# Response time metrics
avg_response_time_ms{source="STC"} 142
avg_response_time_ms{source="CPT"} 98
avg_response_time_ms{source="SLC"} 156

# Record count metrics
record_count{source="STC"} 1200000
record_count{source="CPT"} 850000
record_count{source="TMC"} 2100000

# Uptime metrics
uptime_percentage{source="STC"} 99.9
uptime_percentage{source="CPT"} 98.7
uptime_percentage{source="CAS"} 99.5
```

### JanusGraph Metrics

```promql
# Query performance
janusgraph_query_duration_ms{quantile="0.50"} 45
janusgraph_query_duration_ms{quantile="0.95"} 250
janusgraph_query_duration_ms{quantile="0.99"} 500

# Connection pool
janusgraph_connection_pool_active 8
janusgraph_connection_pool_max 20

# Traversal metrics
janusgraph_traversal_steps_total 1234567
janusgraph_vertex_queries_total 987654
```

### Similarity Analysis Metrics

```promql
# Similarity scores
similarity_score_bucket{le="0.5"} 120
similarity_score_bucket{le="0.7"} 450
similarity_score_bucket{le="0.9"} 890
similarity_score_bucket{le="1.0"} 1000

# Relationship discoveries
relationship_discoveries_total{source="STC"} 45
relationship_discoveries_total{source="CPT"} 32

# Cluster analysis
cluster_membership_count{cluster_type="active"} 5
cluster_membership_count{cluster_type="syncing"} 1
cluster_membership_count{cluster_type="maintenance"} 0
```

## Dashboard Customization

### Panel Configuration

Customize dashboard panels by modifying the dashboard JSON:

```json
{
  "id": 1,
  "title": "Custom Response Times",
  "type": "timeseries",
  "gridPos": { "x": 0, "y": 0, "w": 12, "h": 8 },
  "targets": [
    {
      "query": "avg_response_time_ms{source=~\"STC|CPT\"}",
      "datasource": "Prometheus",
      "format": "time_series",
      "interval": "30s"
    }
  ],
  "fieldConfig": {
    "defaults": {
      "color": { "mode": "palette-classic" },
      "unit": "ms",
      "thresholds": {
        "steps": [
          { "color": "green", "value": null },
          { "color": "yellow", "value": 100 },
          { "color": "red", "value": 200 }
        ]
      }
    }
  }
}
```

### Alerting Rules

Set up alerts for critical metrics:

```yaml
groups:
  - name: integration_alerts
    rules:
      - alert: HighResponseTime
        expr: avg_response_time_ms > 500
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "{{ $labels.source }} response time is {{ $value }}ms"
      
      - alert: LowUptime
        expr: uptime_percentage < 99
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Low uptime detected"
          description: "{{ $labels.source }} uptime is {{ $value }}%"
```

## Best Practices

### 1. Dashboard Design
- Use consistent time ranges across panels
- Group related metrics together
- Apply appropriate units and thresholds
- Use colors consistently for status indication

### 2. Query Optimization
- Use appropriate intervals for data resolution
- Limit time ranges for heavy queries
- Cache frequently accessed metrics
- Use query variables for flexibility

### 3. Alert Configuration
- Set reasonable thresholds based on baselines
- Use appropriate alert durations
- Configure notification channels
- Test alert rules regularly

### 4. Performance Monitoring
- Monitor Grafana resource usage
- Optimize dashboard loading times
- Use data source query caching
- Regular cleanup of old metrics

## Troubleshooting

### Common Issues

**1. Connection Failed**
```
Error: Failed to connect to Grafana
```
- Verify GRAFANA_URL is correct
- Check API key permissions
- Ensure Grafana is running

**2. Dashboard Creation Failed**
```
Error: Failed to create dashboard
```
- Verify API key has Editor permissions
- Check Grafana organization ID
- Ensure data sources are configured

**3. No Data in Panels**
```
No data points found
```
- Verify Prometheus data source connection
- Check metric names and labels
- Ensure time range includes data

**4. Query Timeout**
```
Error: Query timeout
```
- Increase GRAFANA_TIMEOUT value
- Optimize query performance
- Check Prometheus server load

This completes the comprehensive Grafana integration for your Integration Dashboard.