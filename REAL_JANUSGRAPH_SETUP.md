# Real JanusGraph Database Setup Guide

This guide helps you set up a real JanusGraph database connection for your Integration Dashboard instead of using the simulation mode.

## Current Configuration Status

Your system is now configured to connect to a real JanusGraph database:
- ✅ Gremlin client package installed
- ✅ Real connection code implemented
- ✅ Automatic fallback to simulation if connection fails
- ✅ Config.yaml set to `useRemote: true`

## Connection Status

When you check the JanusGraph health endpoint (`/api/janusgraph/health`), you'll see:
- `realConnection: true` - Using real JanusGraph database
- `realConnection: false` - Using simulation mode
- `connectionMode: "real"` - Successfully connected to real database
- `connectionMode: "simulation_fallback"` - Attempted real connection but fell back to simulation
- `connectionMode: "simulation"` - Configured to use simulation mode

## Setup Options

### Option 1: Local JanusGraph Server (Recommended for Development)

1. **Download JanusGraph**
   ```bash
   # Download and extract JanusGraph
   wget https://github.com/JanusGraph/janusgraph/releases/download/v1.0.0/janusgraph-1.0.0.zip
   unzip janusgraph-1.0.0.zip
   cd janusgraph-1.0.0
   ```

2. **Configure JanusGraph**
   Create `conf/janusgraph-server.properties`:
   ```properties
   # Storage backend (choose one)
   storage.backend=berkeleyje
   storage.directory=../db/berkeley
   
   # Or use Cassandra
   # storage.backend=cassandra
   # storage.hostname=127.0.0.1
   
   # Gremlin server configuration
   gremlin.graph=org.janusgraph.core.JanusGraphFactory
   ```

3. **Start JanusGraph Server**
   ```bash
   # Start the server on default port 8182
   ./bin/janusgraph-server.sh start
   ```

4. **Verify Connection**
   Your Integration Dashboard will automatically detect the real connection and show:
   ```
   ✅ Real JanusGraph connection established successfully
   ```

### Option 2: Docker JanusGraph (Quick Setup)

1. **Run JanusGraph with Docker**
   ```bash
   # Start JanusGraph with in-memory storage
   docker run -it -p 8182:8182 janusgraph/janusgraph:latest
   ```

2. **Verify Connection**
   Check the Integration Dashboard logs for:
   ```
   ✅ Real JanusGraph connection established successfully
   ```

### Option 3: Cloud JanusGraph Service

1. **Update Configuration**
   Modify `config.yaml` to point to your cloud JanusGraph instance:
   ```yaml
   janusgraph:
     enabled: true
     useRemote: true
     connection:
       url: "wss://your-janusgraph-cloud.com:8182/gremlin"
       timeout: 30000
       ping_interval: 30000
       max_retries: 3
   ```

## Testing Your Connection

### 1. Check Dashboard Health Status
Visit the Integration Dashboard and check the JanusGraph health indicator.

### 2. API Health Check
```bash
curl http://localhost:5000/api/janusgraph/health
```

Expected response for real connection:
```json
{
  "healthy": true,
  "connected": true,
  "connectionMode": "real",
  "realConnection": true,
  "schema": {
    "vertexLabels": ["actual", "labels", "from", "database"],
    "edgeLabels": ["actual", "edge", "labels"],
    "vertexCount": 1234,
    "edgeCount": 567
  }
}
```

Expected response for simulation fallback:
```json
{
  "healthy": true,
  "connected": true,
  "connectionMode": "simulation_fallback",
  "realConnection": false,
  "schema": {
    "vertexLabels": ["Person", "System", "Transaction"],
    "edgeLabels": ["connected_to", "processes", "validates"],
    "vertexCount": 150,
    "edgeCount": 75
  }
}
```

### 3. Gremlin Visualizer Test
1. Go to the Gremlin Visualizer page
2. Select a source (SCR, Capital, etc.)
3. Enter a node ID to visualize
4. Real connections will show actual graph data
5. Simulation will show generated test data

## Troubleshooting

### Connection Refused Error
```
Error: connect ECONNREFUSED 127.0.0.1:8182
```
**Solution**: JanusGraph server is not running. Start the JanusGraph server on port 8182.

### Authentication Errors
If your JanusGraph requires authentication, update the connection configuration:
```yaml
janusgraph:
  connection:
    url: "wss://username:password@your-server:8182/gremlin"
```

### SSL/TLS Issues
For secure connections, ensure your JanusGraph server supports WSS:
```yaml
janusgraph:
  connection:
    url: "wss://your-server:8182/gremlin"
```

### Port Configuration
If JanusGraph runs on a different port:
```yaml
janusgraph:
  connection:
    url: "ws://localhost:9999/gremlin"  # Custom port
```

## Benefits of Real Connection

With a real JanusGraph connection, you get:
- ✅ Actual graph data instead of simulated data
- ✅ Real performance metrics and query execution times
- ✅ Persistent data storage across application restarts
- ✅ Complex graph traversals and relationships
- ✅ Full Gremlin query support
- ✅ Production-ready graph analytics

## Switching Back to Simulation

To disable real connections and use simulation mode:
```yaml
janusgraph:
  enabled: true
  useRemote: false  # Set to false for simulation
```

Restart the application and it will use simulation mode.

## Next Steps

1. Choose your preferred setup option (Local, Docker, or Cloud)
2. Start your JanusGraph server
3. Verify the connection in the Integration Dashboard
4. Explore the Gremlin Visualizer with real data
5. Use the real graph database for development and testing

The system will automatically detect and use the real connection when available, providing seamless integration between simulation and production modes.