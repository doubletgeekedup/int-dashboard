# TinkerPop Server Connection Troubleshooting

## Issue: Connecting to TinkerPop Server Hosting JanusGraph

Your Integration Dashboard is configured to connect to a TinkerPop server at `10.21.23.105:43563` that hosts JanusGraph. The system is properly configured but getting connection refused errors.

## Current Configuration Status

✅ **TinkerPop Server Configuration Applied**:
- Endpoint: `ws://10.21.23.105:43563/gremlin`
- Protocol: WebSocket with Gremlin v3.0 JSON
- Traversal Source: `g` (standard)
- Connection pooling and retry logic enabled

## TinkerPop Server Requirements

### Standard TinkerPop Gremlin Server Setup
Your TinkerPop server should have:

1. **Gremlin Server running** on port 43563
2. **WebSocket endpoint** accessible at `/gremlin`
3. **JanusGraph backend** properly configured
4. **Network accessibility** from external connections

### Expected Server Configuration
Your `gremlin-server.yaml` should include:

```yaml
host: 0.0.0.0  # Or specific IP to allow external connections
port: 43563
graphs:
  graph: conf/janusgraph.properties
scriptEngines:
  gremlin-groovy:
    imports: [java.lang.Math]
    staticImports: [java.lang.Math.PI]
serializers:
  - { className: org.apache.tinkerpop.gremlin.driver.ser.GryoMessageSerializerV3d0 }
  - { className: org.apache.tinkerpop.gremlin.driver.ser.GraphSONMessageSerializerV3d0 }
processors:
  - { className: org.apache.tinkerpop.gremlin.server.op.session.SessionOpProcessor, config: { sessionTimeout: 28800000 }}
  - { className: org.apache.tinkerpop.gremlin.server.op.traversal.TraversalOpProcessor, config: { cacheExpirationTime: 600000, cacheMaxSize: 1000 }}
```

## Troubleshooting Steps

### Step 1: Verify TinkerPop Server Status

Check if your TinkerPop Gremlin server is running:

```bash
# Check if the process is running
ps aux | grep gremlin

# Check if port 43563 is listening
netstat -an | grep 43563
# or
ss -tlnp | grep 43563
```

### Step 2: Test Network Connectivity

From your server hosting the TinkerPop server:
```bash
# Test if the port is accessible locally
telnet localhost 43563

# Test WebSocket endpoint
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" \
     -H "Sec-WebSocket-Version: 13" \
     http://10.21.23.105:43563/gremlin
```

### Step 3: Check Firewall and Network Rules

Ensure port 43563 is open:
```bash
# Check firewall rules (varies by OS)
# Ubuntu/Debian:
sudo ufw status
sudo iptables -L

# CentOS/RHEL:
sudo firewall-cmd --list-all
```

### Step 4: Verify JanusGraph Backend

Test if JanusGraph is properly configured in your TinkerPop server:
```groovy
# In Gremlin console connected to your server:
:remote connect tinkerpop.server conf/remote.yaml
:remote console
graph
g.V().limit(1)
```

## Alternative Connection Configurations

If the standard configuration doesn't work, try these alternatives in your `config.yaml`:

```yaml
# Option 1: Try different URL patterns
janusgraph:
  connection:
    url: "ws://10.21.23.105:43563"  # Without /gremlin

# Option 2: Try with authentication (if enabled)
janusgraph:
  connection:
    url: "ws://10.21.23.105:43563/gremlin"
    username: "your-username"
    password: "your-password"

# Option 3: Try HTTP instead of WebSocket
janusgraph:
  connection:
    url: "http://10.21.23.105:43563/gremlin"
```

## Common TinkerPop Server Issues

### 1. Server Not Started
**Symptoms**: Connection refused errors
**Solution**: Start your Gremlin server
```bash
./bin/gremlin-server.sh conf/gremlin-server.yaml
```

### 2. Binding to localhost only
**Symptoms**: Connection works locally but not remotely
**Solution**: Update `gremlin-server.yaml`:
```yaml
host: 0.0.0.0  # Allow external connections
```

### 3. Firewall Blocking
**Symptoms**: Connection timeouts
**Solution**: Open port 43563 in firewall

### 4. JanusGraph Backend Issues
**Symptoms**: Server starts but queries fail
**Solution**: Check JanusGraph configuration and storage backend

## Testing Your Setup

1. **Start your TinkerPop Gremlin server** with JanusGraph backend
2. **Verify the server is listening** on `0.0.0.0:43563` (not just localhost)
3. **Test basic connectivity** from external machine
4. **Check server logs** for connection attempts
5. **Restart the Integration Dashboard** to attempt connection

## Expected Success Messages

When working correctly, you should see:
```
Connecting to TinkerPop server hosting JanusGraph at: ws://10.21.23.105:43563/gremlin
✅ Real JanusGraph connection established successfully
```

## Current Fallback Behavior

The Integration Dashboard is configured with smart fallback:
- ✅ Attempts real TinkerPop connection first
- ✅ Falls back to simulation mode if connection fails
- ✅ All APIs continue working with simulated JanusGraph data
- ✅ Automatically switches to real data when connection succeeds

## Getting Additional Help

If connection issues persist:
1. **Share your TinkerPop server logs** during connection attempts
2. **Confirm your `gremlin-server.yaml` configuration**
3. **Test basic connectivity** to port 43563
4. **Check if JanusGraph backend is properly initialized**

The system will automatically detect when your TinkerPop server becomes available and switch to real data.