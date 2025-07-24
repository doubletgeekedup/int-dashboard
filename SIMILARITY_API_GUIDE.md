# JanusGraph Similarity and Relationship Analysis API

This guide documents the advanced similarity detection and relationship analysis features available in the Integration Dashboard.

## Overview

The Integration Dashboard supports sophisticated graph-based analysis using JanusGraph's GraphQL interface to find related data based on attribute similarity, clustering, and relationship mapping. Additionally, it integrates with external work item endpoints to provide real-time transaction analysis.

## Prerequisites

- JanusGraph server running with GraphQL endpoint
- External work items service configured (EXTERNAL_LISTITEMS_URL)
- Valid API credentials for external services

## API Endpoints

### 1. Find Similar Sources

Find sources with similar characteristics based on attribute values.

```http
GET /api/sources/{sourceCode}/similar?threshold=0.7
```

**Parameters:**
- `sourceCode`: The code of the source to find similarities for
- `threshold`: Similarity threshold (0.0-1.0, default: 0.7)

**Example:**
```bash
curl "http://localhost:5000/api/sources/STC/similar?threshold=0.6"
```

**Response:**
```json
[
  {
    "id": "4",
    "similarity": 0.85,
    "properties": {
      "code": "TMC",
      "name": "Transaction Management Center",
      "status": "active",
      "version": "2.7.2",
      "recordCount": 2100000,
      "avgResponseTime": 203
    }
  },
  {
    "id": "5",
    "similarity": 0.72,
    "properties": {
      "code": "CAS",
      "name": "Central Authentication Service",
      "status": "active",
      "version": "4.2.1",
      "recordCount": 45000,
      "avgResponseTime": 67
    }
  }
]
```

### 2. Find Sources by Attribute Range

Find sources where a specific attribute falls within a numerical range.

```http
GET /api/sources/range/{attribute}?min={minValue}&max={maxValue}
```

**Parameters:**
- `attribute`: The attribute to filter by (e.g., recordCount, avgResponseTime)
- `min`: Minimum value (inclusive)
- `max`: Maximum value (inclusive)

**Example:**
```bash
curl "http://localhost:5000/api/sources/range/recordCount?min=500000&max=1500000"
```

**Response:**
```json
[
  {
    "id": 2,
    "code": "CPT",
    "name": "Configuration Processing Tool",
    "recordCount": 850000,
    "avgResponseTime": 98,
    "status": "active"
  },
  {
    "id": 1,
    "code": "STC",
    "name": "System Truth Cache",
    "recordCount": 1200000,
    "avgResponseTime": 142,
    "status": "active"
  }
]
```

### 3. Analyze Source Clusters

Group sources by a specific attribute and analyze cluster characteristics.

```http
GET /api/sources/clusters/{attribute}
```

**Parameters:**
- `attribute`: The attribute to cluster by (e.g., status, version, isJanusGraph)

**Example:**
```bash
curl "http://localhost:5000/api/sources/clusters/status"
```

**Response:**
```json
{
  "clusters": [
    {
      "key": "active",
      "count": 5,
      "avgMetrics": {
        "recordCount": 1038000,
        "avgResponseTime": 135,
        "uptime": "99.2%"
      },
      "nodes": [
        {
          "id": 1,
          "properties": {
            "code": "STC",
            "name": "System Truth Cache",
            "status": "active"
          }
        },
        {
          "id": 2,
          "properties": {
            "code": "CPT",
            "name": "Configuration Processing Tool",
            "status": "active"
          }
        }
      ]
    },
    {
      "key": "syncing",
      "count": 1,
      "avgMetrics": {
        "recordCount": 650000,
        "avgResponseTime": 156,
        "uptime": "99.2%"
      },
      "nodes": [
        {
          "id": 3,
          "properties": {
            "code": "SLC",
            "name": "Service Layer Coordinator",
            "status": "syncing"
          }
        }
      ]
    }
  ]
}
```

### 4. Get Source Relationships

Discover relationships and connections between sources in the graph.

```http
GET /api/sources/{sourceCode}/relationships?depth=2
```

**Parameters:**
- `sourceCode`: The source code to analyze relationships for
- `depth`: Maximum relationship depth to explore (default: 2)

**Example:**
```bash
curl "http://localhost:5000/api/sources/STC/relationships?depth=2"
```

**Response:**
```json
{
  "vertex": {
    "id": 1,
    "properties": {
      "code": "STC",
      "name": "System Truth Cache"
    },
    "relationships": [
      {
        "path": {
          "vertices": [
            {
              "id": 1,
              "properties": {
                "code": "STC",
                "name": "System Truth Cache",
                "status": "active"
              }
            },
            {
              "id": 4,
              "properties": {
                "code": "TMC",
                "name": "Transaction Management Center",
                "status": "active"
              }
            }
          ],
          "edges": [
            {
              "label": "processes",
              "properties": {
                "type": "data_flow",
                "weight": 0.8
              }
            }
          ]
        },
        "distance": 1
      }
    ]
  }
}
```

## Similarity Calculation

### Attributes Considered

The similarity algorithm considers multiple attributes:

1. **Status** (30% weight): Exact match for operational status
2. **Record Count** (25% weight): Normalized similarity based on data volume
3. **Response Time** (20% weight): Normalized similarity in performance metrics
4. **Type** (15% weight): JanusGraph vs non-JanusGraph systems
5. **Version** (10% weight): Major version compatibility

### Similarity Score

Scores range from 0.0 (no similarity) to 1.0 (identical).

**Example calculation:**
- Two sources with same status: +0.30
- Similar record counts (80% ratio): +0.20
- Similar response times (90% ratio): +0.18
- Same type (both JanusGraph): +0.15
- Same major version: +0.10
- **Total Score: 0.93**

## GraphQL Integration

### When JanusGraph GraphQL is Connected

With `JANUSGRAPH_GRAPHQL_URL` configured, the system uses native GraphQL queries:

```graphql
query FindSimilarNodes($nodeId: ID!, $threshold: Float!) {
  vertex(id: $nodeId) {
    id
    properties {
      code
      name
      status
      version
      recordCount
      avgResponseTime
    }
    similarNodes(threshold: $threshold) {
      id
      similarity
      properties {
        code
        name
        status
        version
        recordCount
        avgResponseTime
      }
    }
  }
}
```

### Fallback Mode

Without GraphQL connection, the system uses local calculations:
- In-memory similarity algorithms
- Local clustering analysis
- Mock relationship data for testing

## Use Cases

### 1. Performance Monitoring

Find sources with similar performance characteristics:

```bash
# Find sources with similar response times to STC
curl "http://localhost:5000/api/sources/STC/similar?threshold=0.8"

# Find sources with response times between 100-200ms
curl "http://localhost:5000/api/sources/range/avgResponseTime?min=100&max=200"
```

### 2. Capacity Planning

Analyze data volume patterns:

```bash
# Group sources by status for capacity analysis
curl "http://localhost:5000/api/sources/clusters/status"

# Find high-volume sources (>1M records)
curl "http://localhost:5000/api/sources/range/recordCount?min=1000000&max=10000000"
```

### 3. Architecture Analysis

Understand system relationships:

```bash
# Explore how STC connects to other systems
curl "http://localhost:5000/api/sources/STC/relationships?depth=3"

# Group by technology type
curl "http://localhost:5000/api/sources/clusters/isJanusGraph"
```

### 4. Troubleshooting

Find related systems during incidents:

```bash
# Find sources similar to a problematic one
curl "http://localhost:5000/api/sources/PROBLEM_SOURCE/similar?threshold=0.6"

# Analyze all sources with 'syncing' status
curl "http://localhost:5000/api/sources/clusters/status"
```

## Error Handling

### Common Responses

**404 - Source Not Found:**
```json
{
  "error": "Source not found",
  "sourceCode": "INVALID_CODE"
}
```

**400 - Invalid Parameters:**
```json
{
  "error": "min and max query parameters are required"
}
```

**501 - Feature Not Supported:**
```json
{
  "error": "Similarity search not supported with current storage backend"
}
```

**500 - Server Error:**
```json
{
  "error": "Failed to find similar sources"
}
```

## Frontend Integration

### React Query Usage

```typescript
import { useQuery } from '@tanstack/react-query';

// Find similar sources
const { data: similarSources } = useQuery({
  queryKey: ['sources', sourceCode, 'similar', threshold],
  queryFn: () => fetch(`/api/sources/${sourceCode}/similar?threshold=${threshold}`)
    .then(res => res.json())
});

// Cluster analysis
const { data: clusters } = useQuery({
  queryKey: ['sources', 'clusters', attribute],
  queryFn: () => fetch(`/api/sources/clusters/${attribute}`)
    .then(res => res.json())
});
```

### WebSocket Updates

Real-time updates are broadcast when:
- New similarity relationships are discovered
- Cluster membership changes
- Relationship graphs are updated

```typescript
// Listen for similarity updates
websocket.on('similarity_update', (data) => {
  // Invalidate similarity queries
  queryClient.invalidateQueries(['sources', 'similar']);
});
```

## Performance Considerations

### Query Optimization

1. **Use appropriate thresholds**: Higher thresholds (0.8+) for precise matches
2. **Limit depth**: Keep relationship depth ≤ 3 for performance
3. **Cache results**: Similarity calculations are cached for 5 minutes
4. **Batch requests**: Use clustering for bulk analysis

### Scalability

- JanusGraph indexes optimize similarity queries
- Local fallback suitable for development only
- Production should use JanusGraph GraphQL for best performance

## Configuration

### Environment Variables

```bash
# Enable JanusGraph GraphQL similarity features
JANUSGRAPH_GRAPHQL_URL=http://localhost:8182/graphql

# Optional: Tune similarity cache
SIMILARITY_CACHE_TTL=300  # 5 minutes
MAX_SIMILARITY_RESULTS=50
```

This completes the comprehensive similarity and relationship analysis capabilities for your Integration Dashboard.