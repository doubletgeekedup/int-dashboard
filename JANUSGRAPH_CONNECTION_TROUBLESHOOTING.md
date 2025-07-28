# JanusGraph TinkerPop Connection Troubleshooting Guide

## Issue: Connection Problems with TinkerPop Gremlin Driver

If you're having trouble connecting to your existing JanusGraph database with TinkerPop Gremlin driver, this guide will help you troubleshoot and resolve connection issues.

## Common Connection URLs to Try

Update your `config.yaml` with the correct URL format for your JanusGraph setup:

```yaml
janusgraph:
  connection:
    # Standard WebSocket connection (most common)
    url: "ws://localhost:8182/gremlin"
    
    # If using a different host/port
    url: "ws://your-janusgraph-server:8182/gremlin"
    
    # For SSL/secure connections
    url: "wss://your-janusgraph-server:8182/gremlin"
    
    # Alternative port configurations
    url: "ws://localhost:8183/gremlin"  # Some setups use different ports
    url: "ws://localhost:8184/gremlin"
```

## Connection Configuration Options

Try these configuration adjustments in your `config.yaml`:

```yaml
janusgraph:
  enabled: true
  useRemote: true
  connection:
    url: "ws://your-server:8182/gremlin"
    timeout: 60000          # Increase timeout
    ping_interval: 30000
    max_retries: 5          # More retry attempts
    connection_timeout: 10000
```

## Troubleshooting Steps

### Step 1: Verify JanusGraph Server Status

Check if your JanusGraph server is running and accessible:

```bash
# Test basic connectivity
telnet localhost 8182

# Or using curl for HTTP endpoint (if available)
curl -X POST http://localhost:8182 \
  -H "Content-Type: application/json" \
  -d '{"gremlin":"g.V().limit(1)"}'
```

### Step 2: Check Gremlin Server Configuration

Verify your JanusGraph Gremlin server configuration file (typically `gremlin-server.yaml`):

```yaml
# Your gremlin-server.yaml should have:
host: localhost
port: 8182
graphs:
  graph: conf/janusgraph-properties-file.properties
scriptEngines:
  gremlin-groovy:
    imports: [java.lang.Math]
    staticImports: [java.lang.Math.PI]
```

### Step 3: Test Different Authentication Methods

If your JanusGraph uses authentication, update the connection:

```javascript
// In janusgraph.ts, you might need to add authentication
this.connection = new DriverRemoteConnection(this.config.connection.url, {
  mimeType: 'application/vnd.gremlin-v3.0+json',
  // Add authentication if needed
  authenticator: {
    username: 'your-username',
    password: 'your-password'
  },
  // ... other options
});
```

### Step 4: Alternative Connection Methods

If WebSocket doesn't work, try HTTP connection:

```yaml
# Try HTTP instead of WebSocket
janusgraph:
  connection:
    url: "http://localhost:8182/gremlin"  # HTTP instead of ws://
```

## Common Error Messages and Solutions

### "ECONNREFUSED 127.0.0.1:8182"
- **Cause**: JanusGraph server is not running or not accessible
- **Solution**: Start your JanusGraph server or check the correct host/port

### "WebSocket connection failed"
- **Cause**: WebSocket protocol issues or firewall blocking
- **Solution**: Try different URL formats or check firewall settings

### "Authentication failed"
- **Cause**: JanusGraph requires authentication
- **Solution**: Add username/password to connection configuration

### "Timeout connecting to server"
- **Cause**: Server is slow to respond or network issues
- **Solution**: Increase timeout values in configuration

## Testing Your Connection

1. **Update your config.yaml** with the correct connection details
2. **Restart the application** to apply new configuration
3. **Check the logs** for connection status messages
4. **Test the health endpoint**: `curl http://localhost:5000/api/janusgraph/health`

Expected successful connection log:
```
✅ Real JanusGraph connection established successfully
```

## Advanced Configuration for TinkerPop

For complex JanusGraph setups, you might need additional configuration:

```yaml
janusgraph:
  connection:
    url: "ws://localhost:8182/gremlin"
    timeout: 60000
    ping_interval: 30000
    max_retries: 5
    # Advanced TinkerPop settings
    pool_settings:
      max_size: 8
      max_in_process_per_connection: 4
      max_simultaneous_usage_per_connection: 16
      max_wait_for_connection: 30000
      reconnect_interval: 1000
      keep_alive_interval: 30000
```

## Getting Help

If you're still having connection issues:

1. **Share your JanusGraph server configuration**
2. **Provide the exact error messages from the logs**
3. **Confirm your JanusGraph version and setup**
4. **Test basic connectivity to your server**

The system will automatically fall back to simulation mode if connection fails, allowing you to continue development while troubleshooting the connection.