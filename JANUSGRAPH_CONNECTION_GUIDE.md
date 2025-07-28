# JanusGraph Connection Configuration Guide

## Overview

The JanusGraph connection configuration now supports flexible host, port, and serializer parameters for better integration with different JanusGraph server setups.

## Configuration Parameters

### Connection Settings

In `config.yaml`, configure your JanusGraph connection:

```yaml
janusgraph:
  enabled: true
  useRemote: true  # Set to true for real JanusGraph database
  connection:
    host: "localhost"         # JanusGraph server hostname/IP
    port: 8182               # JanusGraph server port
    serializer: "GraphSONV3d0"  # Serialization format
    timeout: 30000           # Connection timeout in milliseconds
    ping_interval: 30000     # Ping interval for connection health
    max_retries: 3           # Maximum connection retry attempts
    path: "/gremlin"         # WebSocket endpoint path
  database:
    name: "janusgraph"
    traversal_source: "g"
  features:
    health_check: true
    schema_introspection: true
    performance_monitoring: true
```

### Supported Serializers

The system supports three serializer types:

1. **GraphSONV3d0** (default)
   - MIME Type: `application/vnd.gremlin-v3.0+json`
   - Most common for modern JanusGraph installations
   - Best compatibility with JanusGraph 0.5+

2. **GraphSONV2d0**
   - MIME Type: `application/vnd.gremlin-v2.0+json`
   - For older JanusGraph versions
   - Legacy compatibility

3. **GraphBinaryV1d0**
   - MIME Type: `application/vnd.gremlin-v1.0+gryo`
   - Binary format for better performance
   - Use for high-throughput scenarios

## Connection Examples

### Local Development
```yaml
connection:
  host: "localhost"
  port: 8182
  serializer: "GraphSONV3d0"
  path: "/gremlin"
```

### Remote Server
```yaml
connection:
  host: "janusgraph.company.com"
  port: 8182
  serializer: "GraphSONV3d0"
  path: "/gremlin"
```

### Custom Port Configuration
```yaml
connection:
  host: "10.0.1.100"
  port: 9999
  serializer: "GraphBinaryV1d0"
  path: "/gremlin"
```

## Connection URL Construction

The system automatically builds the WebSocket connection URL:
- Pattern: `ws://{host}:{port}{path}`
- Example: `ws://localhost:8182/gremlin`

## Health Check

The system provides health check endpoint at `/api/janusgraph/health` that reports:
- Connection status
- Server availability
- Connection mode (real/simulation_fallback/simulation)

## Troubleshooting

### Connection Refused
If you see `connect ECONNREFUSED` errors:
1. Verify JanusGraph server is running
2. Check host and port configuration
3. Ensure firewall allows connections
4. Verify JanusGraph WebSocket server is enabled

### Serializer Issues
If you encounter serialization errors:
1. Try different serializer types
2. Check JanusGraph server configuration
3. Verify client-server compatibility

### Fallback Mode
The system automatically falls back to simulation mode when:
- Real JanusGraph server is unavailable
- Connection configuration is incorrect
- Network connectivity issues occur

## Implementation

The connection logic:
1. Reads host, port, serializer, and path from config
2. Constructs WebSocket URL
3. Maps serializer name to appropriate MIME type
4. Establishes Gremlin driver connection
5. Falls back to simulation if connection fails

This flexible configuration allows the system to connect to various JanusGraph server setups while maintaining compatibility with different deployment scenarios.