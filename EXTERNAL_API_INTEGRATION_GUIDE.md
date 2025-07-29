# External API Integration Guide

## Overview

The Integration Dashboard system supports external API integration for WorkItem creation and list item retrieval. This guide explains how to configure and use external APIs with the system.

## Configuration

All external API endpoints are configured in `config.yaml` under the `external` section:

```yaml
external:
  listitems:
    url: ""  # Set to your external service URL for list items, e.g., "https://your-api.com/listitems"
  workitems:
    url: ""  # Set to your WorkItem creation API endpoint, e.g., "https://your-api.com/workitems"
  janusgraph_schema:
    url: ""  # Set to your JanusGraph schema endpoint, e.g., "https://your-api.com/janusgraph/schema"
  ssl_insecure: true  # Disable SSL certificate verification for external APIs
```

## WorkItem Creation API

### Endpoint Configuration

To enable external WorkItem creation, set the `external.workitems.url` in your `config.yaml`:

```yaml
external:
  workitems:
    url: "https://your-workitem-api.com/create"
```

### API Contract

**Request Format:**
```json
POST /your-endpoint
Content-Type: application/json

{
  "sourceCode": "SCR",
  "projectName": "Project Alpha",
  "workItemType": "SCR_TASK",
  "priority": "medium",
  "qName": "SCR_project_alpha",
  "requestedBy": "integration_dashboard",
  "timestamp": "2025-07-29T22:00:00.000Z"
}
```

**Expected Response Format:**
```json
{
  "id": "wi-123456789-abcdef",
  "csWorkItemDetails": {
    "csWorkItemType": "SCR_TASK",
    "qName": "SCR_project_alpha",
    "tid": "generated-thread-id"
  },
  "csWorkItemProcessInfo": {
    "csWorkItemProcessDetail": "Created for project: Project Alpha",
    "csWorkItemProcessSatus": "CREATED"
  },
  "createDate": 1753826212300,
  "lastModified": 1753826212300,
  "projectName": "Project Alpha",
  "sourceCode": "SCR",
  "priority": "medium"
}
```

### Error Handling

The system provides comprehensive error handling:

- **Configuration Missing**: Returns 500 with "WorkItem creation service not configured"
- **External API Error**: Returns the external API's status code and error message
- **Network Error**: Returns 500 with connection error details

## List Items API

### Endpoint Configuration

```yaml
external:
  listitems:
    url: "https://your-api.com/listitems"
```

### API Contract

**Request Format:**
```
GET /your-endpoint/{count}
```

**Expected Response Format:**
```json
[
  {
    "csWorkItemDetails": {
      "csWorkItemType": "string",
      "qName": "string",
      "tid": "string"
    },
    "csWorkItemProcessInfo": {
      "csWorkItemProcessDetail": "string",
      "csWorkItemProcessSatus": "string"
    },
    "createDate": 1234567890,
    "id": "string",
    "lastModified": 1234567890
  }
]
```

## SSL Certificate Handling

For development environments or internal APIs with self-signed certificates:

```yaml
external:
  ssl_insecure: true  # Disables SSL certificate verification
```

**Note**: Only use `ssl_insecure: true` in development environments. Production deployments should use valid SSL certificates.

## Testing External APIs

### Testing WorkItem Creation

```bash
# Test with cURL
curl -X POST "http://localhost:5000/api/workitems" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceCode": "SCR",
    "projectName": "Test Project",
    "workItemType": "SCR_TASK",
    "priority": "high"
  }'
```

### Testing List Items

```bash
# Test with cURL
curl "http://localhost:5000/api/listitems/10"
```

## Integration with Frontend

The frontend automatically handles external API integration:

1. **WorkItem Creation**: Uses the "Create WorkItem" button in Quick Actions
2. **Error Display**: Shows user-friendly error messages for API failures
3. **Loading States**: Displays loading indicators during API calls
4. **Success Notifications**: Shows toast notifications on successful creation

## Monitoring and Troubleshooting

### Common Issues

1. **"WorkItem creation service not configured"**
   - Solution: Set `external.workitems.url` in config.yaml

2. **SSL Certificate Errors**
   - Solution: Set `ssl_insecure: true` for development or fix certificates for production

3. **External API Timeout**
   - Solution: Check external API availability and network connectivity

### Logging

The system logs all external API calls:

```
Calling external WorkItems API: https://your-api.com/workitems
WorkItem created successfully via external API: wi-123456789
```

## Security Considerations

1. **API Keys**: Store API keys in environment variables, not in config.yaml
2. **HTTPS**: Always use HTTPS in production environments
3. **Authentication**: Implement proper authentication on your external APIs
4. **Rate Limiting**: Consider implementing rate limiting for external API calls
5. **Input Validation**: Validate all data before sending to external APIs

## Development vs Production

### Development Configuration
```yaml
external:
  workitems:
    url: "http://localhost:3001/api/workitems"
  ssl_insecure: true
```

### Production Configuration
```yaml
external:
  workitems:
    url: "https://production-api.company.com/workitems"
  ssl_insecure: false
```

## API Documentation Updates

When updating external API integrations, ensure you:

1. Update this guide with new endpoints or parameters
2. Update the API contract documentation
3. Test all integration points
4. Update error handling documentation
5. Verify SSL certificate requirements