# Government-Level Knowledge Retention System

## Overview

The Integration Dashboard System includes a comprehensive knowledge retention system designed for government and confidential environments where external LLM data persistence is prohibited. All knowledge is stored locally with full audit trails and compliance reporting.

## Key Features

### Secure Local Storage
- **No External Data Transfer**: All knowledge stored in local PostgreSQL database
- **Government Compliance**: Meets security requirements for confidential environments
- **Audit Trails**: Complete access logging with IP addresses and timestamps
- **Data Classification**: Categories include general, system, security, analysis, and procedures

### Automatic Knowledge Capture
- **Chat Integration**: Automatically extracts important information from conversations
- **Pattern Recognition**: Detects configuration insights, security findings, and procedural knowledge
- **Node Relationship Detection**: Captures statements like "node xyz is related to dbx"
- **Attribute Matching**: Identifies attributes with different names but same values (90% similarity)

### Retention Policies
- **Temporary**: Data automatically purged after specified period
- **Standard**: Normal retention following organizational policies
- **Permanent**: Critical information retained indefinitely

## Node Relationship Detection

### Automatic Pattern Recognition

The system automatically captures these types of relationship information:

```javascript
// Examples of automatically detected patterns:
"node xyz is related to dbx by similarity analysis"
"these two nodes share attributes with 90% matching values"
"node attributes named differently but have same values"
"customer_id and cust_identifier contain the same data"
```

### Relationship Types

1. **Similarity Analysis**: Detected through algorithmic comparison
2. **Attribute Matching**: Attributes with different names, same values
3. **Manual Mapping**: User-defined relationships
4. **Data Correlation**: Statistical relationships discovered

### Confidence Scoring

Each relationship is stored with confidence metrics:
- **90-100%**: High confidence matches
- **70-89%**: Medium confidence relationships
- **50-69%**: Low confidence correlations
- **Below 50%**: Flagged for manual review

## API Reference

### Knowledge Storage

```bash
# Store general knowledge entry
curl -X POST http://localhost:5000/api/knowledge \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Configuration Finding",
    "content": "Database connection pool should be set to 20 for optimal performance",
    "category": "system",
    "priority": "high",
    "tags": ["database", "performance", "configuration"],
    "sourceCode": "SCR",
    "isConfidential": true,
    "retentionPolicy": "permanent"
  }'
```

### Node Relationship Storage

```bash
# Store node relationship
curl -X POST http://localhost:5000/api/knowledge/node-relationship \
  -H "Content-Type: application/json" \
  -d '{
    "sourceNode": "xyz",
    "targetNode": "dbx",
    "relationshipType": "attribute_match",
    "confidence": 0.9,
    "discoveryMethod": "Manual analysis of attribute matching patterns",
    "attributes": [
      {
        "sourceName": "customer_id",
        "targetName": "cust_identifier",
        "matchPercentage": 95,
        "value": "12345"
      }
    ],
    "sourceCode": "STC"
  }'
```

### Knowledge Search

```bash
# Search by content and category
curl "http://localhost:5000/api/knowledge/search?q=configuration&category=system"

# Search node relationships
curl "http://localhost:5000/api/knowledge/node-relationships?sourceNode=xyz&minConfidence=0.8"
```

### Statistics and Reporting

```bash
# Get comprehensive statistics
curl "http://localhost:5000/api/knowledge/stats"
```

Response includes:
- Total knowledge entries
- Confidential vs. public distribution
- Category breakdown
- Priority distribution
- Recent activity patterns

## Configuration

### Environment Variables

```env
# Enable knowledge retention system
DATABASE_URL=postgresql://username:password@localhost:5432/dashboard

# AI chat control (impacts automatic capture)
AI_CHAT_ENABLED=true

# Session security for audit trails
SESSION_SECRET=your_secure_session_secret_minimum_32_characters
```

### Database Schema

The knowledge retention system uses these tables:
- `knowledge_entries`: Main knowledge storage
- `knowledge_access_log`: Audit trail for all access
- `node_relationships`: Specialized relationship storage

## Data Categories

### General
- General information and documentation
- Non-sensitive operational knowledge
- Public procedures and guidelines

### System
- Configuration settings and parameters
- System architecture information
- Technical specifications

### Security
- Security findings and vulnerabilities
- Access control information
- Compliance requirements

### Analysis
- Data analysis results
- Pattern recognition findings
- Performance insights

### Procedures
- Step-by-step operational procedures
- Troubleshooting guides
- Emergency response plans

## Compliance Features

### Audit Trails
- Every access logged with timestamp
- IP address and user agent tracking
- Search query logging
- Data modification history

### Data Classification
- Automatic sensitivity detection
- Manual classification override
- Category-based access controls
- Retention policy enforcement

### Reporting
- Compliance reports for government audits
- Access pattern analysis
- Data lifecycle tracking
- Security incident documentation

## Integration with Chat System

### Automatic Capture

When users interact with the chat system, the knowledge retention service automatically:

1. **Analyzes Conversations**: Scans for important technical information
2. **Extracts Insights**: Identifies configuration details, security findings, procedures
3. **Detects Relationships**: Captures node correlation statements
4. **Stores Securely**: Saves with appropriate classification and retention policy
5. **Maintains Audit**: Logs all capture activities for compliance

### Manual Override

Users can also manually:
- Add knowledge entries through the UI
- Classify sensitivity levels
- Set retention policies
- Add custom tags and categories

## Best Practices

### Data Classification
1. **Default to Confidential**: When in doubt, mark as confidential
2. **Use Appropriate Categories**: Select the most specific category
3. **Add Descriptive Tags**: Include relevant keywords for future search
4. **Set Retention Policies**: Consider data lifecycle requirements

### Node Relationships
1. **Verify Confidence Scores**: Review automatically detected relationships
2. **Add Context**: Include discovery method and source information
3. **Update Regularly**: Refresh relationships as systems evolve
4. **Document Attributes**: Record specific field mappings and values

### Security Considerations
1. **Regular Audits**: Review access logs monthly
2. **Data Minimization**: Only store necessary information
3. **Secure Access**: Use proper authentication and authorization
4. **Backup Strategy**: Implement secure backup procedures

## Troubleshooting

### Common Issues

#### Knowledge Not Being Captured
```bash
# Check if database is connected
curl http://localhost:5000/api/knowledge/stats

# Verify chat analysis is working
curl -X POST http://localhost:5000/api/chat/analyze-and-store \
  -H "Content-Type: application/json" \
  -d '{"message": "test configuration", "sessionId": "test"}'
```

#### Search Not Working
```bash
# Test basic search
curl "http://localhost:5000/api/knowledge/search?q=test"

# Check database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM knowledge_entries;"
```

#### Relationship Detection Issues
```bash
# Test relationship storage
curl -X POST http://localhost:5000/api/knowledge/node-relationship \
  -H "Content-Type: application/json" \
  -d '{"sourceNode":"test1","targetNode":"test2","relationshipType":"similarity","confidence":0.8,"discoveryMethod":"test"}'
```

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes on search fields
2. **Query Optimization**: Use appropriate filters and limits
3. **Cache Strategy**: Implement caching for frequently accessed data
4. **Archive Strategy**: Move old data to archive tables

## Integration Examples

### Chat Integration
```typescript
// Automatic capture during chat
const response = await fetch('/api/chat/analyze-and-store', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: userMessage,
    response: aiResponse,
    sessionId: currentSession,
    sourceCode: 'SCR'
  })
});
```

### Manual Knowledge Entry
```typescript
// Manual knowledge storage
const knowledge = await fetch('/api/knowledge', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Database Performance Optimization',
    content: 'Increasing connection pool from 10 to 20 improved response time by 40%',
    category: 'system',
    priority: 'high',
    tags: ['database', 'performance'],
    isConfidential: true,
    retentionPolicy: 'permanent'
  })
});
```

### Relationship Discovery
```typescript
// Store discovered node relationship
const relationship = await fetch('/api/knowledge/node-relationship', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceNode: 'customer_node',
    targetNode: 'client_record',
    relationshipType: 'attribute_match',
    confidence: 0.92,
    attributes: [
      {
        sourceName: 'customer_id',
        targetName: 'client_identifier',
        matchPercentage: 98,
        value: 'CUST_12345'
      }
    ],
    discoveryMethod: 'Automated similarity analysis'
  })
});
```

This knowledge retention system provides a comprehensive solution for maintaining institutional knowledge while meeting the highest security and compliance requirements for government and confidential environments.