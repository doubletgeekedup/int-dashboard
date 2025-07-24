# JanusGraph GraphQL Setup Guide

This guide helps you set up JanusGraph with GraphQL support for your Integration Dashboard.

## Prerequisites

- Java 11 or higher
- JanusGraph 1.0.0 or higher
- GraphQL plugin for JanusGraph

## Installation Steps

### 1. Download JanusGraph

```bash
# Download JanusGraph
wget https://github.com/JanusGraph/janusgraph/releases/download/v1.0.0/janusgraph-1.0.0.zip
unzip janusgraph-1.0.0.zip
cd janusgraph-1.0.0
```

### 2. Enable GraphQL Support

JanusGraph GraphQL support requires additional configuration. Create or modify the `conf/janusgraph-server-graphql.yaml`:

```yaml
host: 0.0.0.0
port: 8182
scriptEvaluationTimeout: 30000
channelizer: org.janusgraph.channelizers.JanusGraphWebSocketChannelizer
graphs:
  graph: conf/janusgraph-berkeleyje.properties
scriptEngines:
  gremlin-groovy:
    plugins:
      - janusgraph.imports
    staticImports:
      - java.lang.Math.PI
    scripts:
      - scripts/empty-sample.groovy
serializers:
  - className: org.apache.tinkerpop.gremlin.driver.ser.GryoMessageSerializerV3d0
    config:
      ioRegistries:
        - org.janusgraph.graphdb.tinkerpop.JanusGraphIoRegistry
  - className: org.apache.tinkerpop.gremlin.driver.ser.GryoMessageSerializerV3d0
    config:
      serializeResultToString: true
      ioRegistries:
        - org.janusgraph.graphdb.tinkerpop.JanusGraphIoRegistry
  - className: org.apache.tinkerpop.gremlin.driver.ser.GraphSONMessageSerializerV3d0
    config:
      ioRegistries:
        - org.janusgraph.graphdb.tinkerpop.JanusGraphIoRegistry
  - className: org.apache.tinkerpop.gremlin.driver.ser.GraphBinaryMessageSerializerV1
    config:
      ioRegistries:
        - org.janusgraph.graphdb.tinkerpop.JanusGraphIoRegistry
processors:
  - className: org.apache.tinkerpop.gremlin.server.op.session.SessionOpProcessor
  - className: org.apache.tinkerpop.gremlin.server.op.traversal.TraversalOpProcessor
  - className: org.apache.tinkerpop.gremlin.server.op.standard.StandardOpProcessor
```

### 3. Configure Graph Properties

Create `conf/janusgraph-berkeleyje.properties`:

```properties
# JanusGraph configuration for Integration Dashboard

# Berkeley DB Java Edition storage backend
storage.backend=berkeleyje
storage.directory=../db/berkeley

# Index backend
index.search.backend=elasticsearch
index.search.hostname=127.0.0.1
index.search.elasticsearch.client-only=false
index.search.elasticsearch.local-mode=true
index.search.elasticsearch.interface=NODE

# GraphQL schema auto-generation
graphql.schema.auto-generate=true
graphql.endpoint=/graphql
```

### 4. Start JanusGraph Server

```bash
# Start the server with GraphQL support
./bin/janusgraph-server.sh start conf/janusgraph-server-graphql.yaml
```

### 5. Initialize Schema

Create a Gremlin script to initialize the schema for the Integration Dashboard:

```groovy
// Initialize Integration Dashboard Schema
graph = JanusGraphFactory.open("conf/janusgraph-berkeleyje.properties")
mgmt = graph.openManagement()

// Vertex Labels
source = mgmt.makeVertexLabel('Source').make()
transaction = mgmt.makeVertexLabel('Transaction').make()
bulletin = mgmt.makeVertexLabel('Bulletin').make()
knowledgeBase = mgmt.makeVertexLabel('KnowledgeBase').make()
chatMessage = mgmt.makeVertexLabel('ChatMessage').make()

// Properties for Source
mgmt.makePropertyKey('code').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('name').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('description').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('status').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('version').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('uptime').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('recordCount').dataType(Integer.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('avgResponseTime').dataType(Integer.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('isJanusGraph').dataType(Boolean.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('apiEndpoint').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('config').dataType(String.class).cardinality(Cardinality.SINGLE).make()

// Properties for Transaction
mgmt.makePropertyKey('transactionId').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('sourceCode').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('type').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('duration').dataType(Integer.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('errorMessage').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('metadata').dataType(String.class).cardinality(Cardinality.SINGLE).make()

// Properties for Bulletin
mgmt.makePropertyKey('title').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('content').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('priority').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('category').dataType(String.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('isActive').dataType(Boolean.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('authorId').dataType(String.class).cardinality(Cardinality.SINGLE).make()

// Common properties
mgmt.makePropertyKey('createdAt').dataType(Date.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('updatedAt').dataType(Date.class).cardinality(Cardinality.SINGLE).make()
mgmt.makePropertyKey('timestamp').dataType(Date.class).cardinality(Cardinality.SINGLE).make()

// Indexes
codeIndex = mgmt.buildIndex('sourceByCode', Vertex.class).addKey(mgmt.getPropertyKey('code')).buildCompositeIndex()
transactionIdIndex = mgmt.buildIndex('transactionById', Vertex.class).addKey(mgmt.getPropertyKey('transactionId')).buildCompositeIndex()

// Edge Labels
mgmt.makeEdgeLabel('processes').make()
mgmt.makeEdgeLabel('contains').make()
mgmt.makeEdgeLabel('relates_to').make()

mgmt.commit()
graph.close()
```

### 6. Environment Configuration

Set the environment variable in your `.env` file:

```bash
# JanusGraph GraphQL Configuration
JANUSGRAPH_GRAPHQL_URL=http://localhost:8182/graphql
```

## Verification

### 1. Check GraphQL Endpoint

```bash
curl http://localhost:8182/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ __schema { queryType { name } } }"}'
```

### 2. Check Integration Dashboard Connection

Start your Integration Dashboard and verify the console output shows:

```
🗄️  Using JanusGraph GraphQL storage
   GraphQL endpoint: http://localhost:8182/graphql
✅ Connected to JanusGraph GraphQL endpoint
```

## Troubleshooting

### GraphQL Not Available

If GraphQL endpoint is not available:

1. Ensure JanusGraph server is running on port 8182
2. Verify GraphQL plugin is properly installed
3. Check server logs for GraphQL initialization errors
4. Try connecting to the Gremlin endpoint first: `ws://localhost:8182/gremlin`

### Schema Issues

If schema-related errors occur:

1. Run the schema initialization script
2. Verify all vertex labels and properties are created
3. Check index creation status
4. Restart JanusGraph server after schema changes

### Connection Timeout

If connection times out:

1. Verify firewall settings allow port 8182
2. Check JanusGraph server binding (should be 0.0.0.0, not localhost)
3. Increase timeout values in configuration
4. Monitor server resource usage

## Advanced Configuration

### Custom GraphQL Schema

You can customize the GraphQL schema by modifying the JanusGraph configuration:

```properties
# Custom schema file
graphql.schema.file=schema/integration-dashboard.graphql
graphql.schema.auto-generate=false
```

### Authentication

For production deployments, enable authentication:

```yaml
authentication:
  authenticator: org.apache.tinkerpop.gremlin.server.auth.SimpleAuthenticator
  config:
    credentialsDb: conf/tinkergraph-credentials.properties
```

### Performance Tuning

Optimize for large datasets:

```properties
# Increase cache sizes
cache.db-cache-size=0.25
cache.db-cache-clean-wait=20

# Optimize index queries
index.search.elasticsearch.client-sniff=true
index.search.elasticsearch.bulk-refresh=wait_for
```

This completes the JanusGraph GraphQL setup for your Integration Dashboard.