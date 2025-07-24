# Grafana Dashboard Embedding Guide

This guide explains how to embed interactive Grafana dashboards directly within your Integration Dashboard for seamless monitoring and visualization.

## Overview

The Integration Dashboard now supports full embedding of Grafana dashboards and individual panels, providing a unified monitoring experience without requiring users to switch between applications.

## Features

### Full Dashboard Embedding
- Complete Grafana dashboards embedded as interactive iframes
- Real-time data updates and interactive controls
- Customizable time ranges, themes, and refresh intervals
- Kiosk mode for clean, distraction-free viewing
- Fullscreen support for detailed analysis

### Individual Panel Embedding
- Embed specific panels for focused monitoring
- Configurable panel dimensions and styling
- Independent refresh controls per panel
- Token-based authentication for secure access

### Interactive Controls
- Time range selection (5m, 15m, 1h, 6h, 24h, 7d)
- Refresh interval configuration (5s to 15m)
- Theme switching (light/dark mode)
- Kiosk mode toggle
- Manual refresh and fullscreen options

## API Endpoints

### Dashboard Embedding

```http
GET /api/grafana/embed/dashboard/{uid}?from=now-1h&to=now&theme=light&kiosk=true
```

**Parameters:**
- `uid`: Dashboard unique identifier
- `from`: Start time (e.g., 'now-1h', 'now-24h')
- `to`: End time (usually 'now')
- `theme`: 'light' or 'dark'
- `kiosk`: Boolean for kiosk mode
- `autofitpanels`: Auto-fit panels to container

**Response:**
```json
{
  "embedUrl": "http://localhost:3000/d-solo/integration-dashboard?from=now-1h&to=now&theme=light&kiosk=true&orgId=1",
  "embedToken": "mock-embed-token-integration-dashboard",
  "iframe": "<iframe src=\"...\" width=\"100%\" height=\"400\" frameborder=\"0\"></iframe>"
}
```

### Panel Embedding

```http
GET /api/grafana/embed/panel/{uid}/{panelId}?width=800&height=400&theme=dark
```

**Parameters:**
- `uid`: Dashboard unique identifier
- `panelId`: Specific panel ID to embed
- `width`: Panel width in pixels
- `height`: Panel height in pixels
- `theme`: 'light' or 'dark'
- `from/to`: Time range parameters

**Response:**
```json
{
  "embedUrl": "http://localhost:3000/d-solo/integration-dashboard?panelId=1&width=800&height=400&theme=dark&orgId=1",
  "embedToken": "mock-embed-token-integration-dashboard-panel-1",
  "panelId": 1,
  "iframe": "<iframe src=\"...\" width=\"800\" height=\"400\" frameborder=\"0\"></iframe>"
}
```

### Token Management

```http
POST /api/grafana/embed/refresh-token
Content-Type: application/json

{
  "dashboardUid": "integration-dashboard",
  "panelId": 1
}
```

**Response:**
```json
{
  "embedToken": "new-embed-token-xyz123"
}
```

## Component Usage

### EmbeddedDashboard Component

```tsx
import EmbeddedDashboard from '@/components/grafana/embedded-dashboard';

// Full dashboard embedding
<EmbeddedDashboard
  dashboardUid="integration-dashboard"
  title="Integration Dashboard - Sources of Truth"
  height={600}
  autoRefresh={true}
  defaultTimeRange={{ from: 'now-1h', to: 'now' }}
/>

// Individual panel embedding
<EmbeddedDashboard
  dashboardUid="integration-dashboard"
  title="Response Times Panel"
  height={400}
  panelId={1}
  autoRefresh={true}
  defaultTimeRange={{ from: 'now-30m', to: 'now' }}
/>
```

### Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dashboardUid` | string | required | Grafana dashboard UID |
| `title` | string | required | Display title for the embed |
| `height` | number | 500 | Height in pixels |
| `panelId` | number | undefined | Specific panel ID (optional) |
| `autoRefresh` | boolean | true | Enable automatic refresh |
| `defaultTimeRange` | object | `{from: 'now-1h', to: 'now'}` | Default time range |

## Dashboard Integration

### Integration Dashboard Panels

**Panel 1: Source Response Times** (`panelId: 1`)
- Time series chart of average response times
- Grouped by source (STC, CPT, SLC, TMC, CAS, NVL)
- Threshold alerts for high response times

**Panel 2: Record Count by Source** (`panelId: 2`)
- Bar gauge showing data volume per source
- Real-time updates every 30 seconds
- Color-coded by volume ranges

**Panel 3: System Uptime** (`panelId: 3`)
- Current uptime percentage statistics
- Individual source status indicators
- Historical uptime trends

**Panel 4: Error Rate** (`panelId: 4`)
- Real-time error rate monitoring
- Alerts for threshold breaches
- Error categorization and trends

**Panel 5: Transaction Throughput** (`panelId: 5`)
- Transaction processing rates
- Peak/average throughput analysis
- Capacity utilization metrics

**Panel 6: JanusGraph Performance** (`panelId: 6`)
- Graph database query performance
- Connection pool status
- Traversal optimization metrics

### Similarity Analytics Panels

**Panel 1: Similarity Score Distribution** (`panelId: 1`)
- Histogram of similarity scores
- Distribution analysis over time
- Quality metrics for similarity detection

**Panel 2: Relationship Discovery Count** (`panelId: 2`)
- Total relationships discovered
- Discovery rate trends
- Relationship type breakdown

**Panel 3: Cluster Analysis Results** (`panelId: 3`)
- Pie chart of cluster membership
- Cluster size distribution
- Dynamic cluster changes

**Panel 4: Graph Query Performance** (`panelId: 4`)
- JanusGraph similarity query metrics
- Query optimization insights
- Performance trend analysis

## Frontend Implementation

### Embedded Tab Interface

The Grafana dashboard page includes an "Embedded" tab with:

1. **Dashboard Overview**: List of embedded dashboards
2. **Interactive Controls**: Time range, refresh, theme settings
3. **Full Dashboard Views**: Complete dashboard embedding
4. **Individual Panel Options**: Focused panel monitoring
5. **Management Controls**: Add/remove embedded dashboards

### Interactive Features

```tsx
// Time range selection
const handleTimeRangeChange = (range: string) => {
  const timeRanges = {
    '5m': { from: 'now-5m', to: 'now' },
    '1h': { from: 'now-1h', to: 'now' },
    '24h': { from: 'now-24h', to: 'now' }
  };
  setEmbedOptions(prev => ({ ...prev, ...timeRanges[range] }));
};

// Theme switching
const handleThemeChange = (theme: 'light' | 'dark') => {
  setEmbedOptions(prev => ({ ...prev, theme }));
};

// Manual refresh
const handleManualRefresh = () => {
  refetch();
  refreshTokenMutation.mutate();
};

// Fullscreen toggle
const handleFullscreenToggle = () => {
  setIsFullscreen(!isFullscreen);
};
```

## Security and Authentication

### Embed Tokens

Grafana embed tokens provide secure access to dashboards:

- **Viewer Role**: Read-only access to dashboards
- **1 Hour Expiry**: Automatic token refresh
- **Organization Context**: Proper org isolation
- **Mock Tokens**: Development mode simulation

### CORS Configuration

Ensure Grafana allows iframe embedding:

```ini
# grafana.ini
[security]
allow_embedding = true
cookie_samesite = none
cookie_secure = false

[auth.anonymous]
enabled = true
org_role = Viewer
```

## Development and Testing

### Simulation Mode

When Grafana is not configured, the system provides:

- Mock embed URLs for development
- Simulated dashboard responses
- Test iframe content
- Development-friendly error handling

### Testing Embedded Dashboards

```bash
# Test dashboard embedding
curl "http://localhost:5000/api/grafana/embed/dashboard/integration-dashboard?theme=light"

# Test panel embedding
curl "http://localhost:5000/api/grafana/embed/panel/integration-dashboard/1?width=800&height=400"

# Test token refresh
curl -X POST http://localhost:5000/api/grafana/embed/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"dashboardUid": "integration-dashboard", "panelId": 1}'
```

## Performance Optimization

### Iframe Management

- **Lazy Loading**: Load iframes only when visible
- **Resource Cleanup**: Proper iframe disposal
- **Memory Management**: Prevent memory leaks
- **Error Boundaries**: Graceful error handling

### Auto-Refresh Strategy

```tsx
useEffect(() => {
  if (autoRefresh && iframeRef.current) {
    const interval = setInterval(() => {
      // Refresh iframe content
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        iframeRef.current.src = currentSrc;
      }, 100);
    }, 30000);
    
    return () => clearInterval(interval);
  }
}, [autoRefresh]);
```

### Query Optimization

- **React Query Caching**: 5-minute refresh intervals
- **Token Caching**: Reuse valid tokens
- **Background Updates**: Non-blocking refreshes
- **Error Recovery**: Automatic retry logic

## Troubleshooting

### Common Issues

**1. Iframe Not Loading**
```
Error: Dashboard iframe failed to load
```
- Verify Grafana URL and accessibility
- Check CORS configuration
- Ensure dashboard UID exists
- Validate embed token

**2. Authentication Errors**
```
Error: Invalid or expired embed token
```
- Refresh embed token
- Check Grafana API key permissions
- Verify organization ID
- Check token expiry

**3. Panel Not Found**
```
Error: Panel ID not found in dashboard
```
- Verify panel ID exists in dashboard
- Check dashboard structure
- Ensure panel is not hidden
- Validate panel permissions

**4. Theme Issues**
```
Error: Theme not applied correctly
```
- Check theme parameter in URL
- Verify Grafana theme support
- Clear browser cache
- Test with different themes

### Debug Mode

Enable debug logging for embedding:

```typescript
// Add to embedded dashboard component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Embed URL:', embedData?.embedUrl);
    console.log('Embed Options:', embedOptions);
    console.log('Token Status:', embedData?.embedToken ? 'Valid' : 'Missing');
  }
}, [embedData, embedOptions]);
```

This completes the comprehensive Grafana dashboard embedding implementation for your Integration Dashboard.