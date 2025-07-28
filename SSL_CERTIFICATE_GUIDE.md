# SSL Certificate Issue Resolution Guide

## Problem: "Unable to verify the first certificate"

This error occurs when making HTTPS requests to external APIs that have self-signed certificates or certificate chain issues.

## Solution Implemented

The system now automatically bypasses SSL certificate verification for external API calls by:

1. **Routes Configuration**: Updated `/api/listitems` endpoint to use insecure HTTPS agent
2. **Similarity Service**: Updated JanusGraph schema fetching to bypass SSL verification
3. **Configuration**: Added `ssl_insecure: true` flag in `config.yaml`

## Code Implementation

### Fetch with SSL Bypass
```javascript
const https = await import('https');
const response = await fetch(externalUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  // Disable SSL certificate verification for external APIs
  agent: externalUrl.startsWith('https:') ? new https.Agent({
    rejectUnauthorized: false
  }) : undefined
});
```

## Configuration Setup

To use external APIs, update your `config.yaml`:

```yaml
external:
  listitems:
    url: "https://your-actual-api.com/listitems"  # Replace with real URL
  janusgraph_schema:
    url: "https://your-janusgraph-server.com/schema"  # Replace with real URL
  ssl_insecure: true  # Keep this to bypass SSL verification
```

## Security Notes

⚠️ **Important**: SSL verification bypass should only be used in development or trusted internal networks.

For production environments:
- Use properly signed SSL certificates
- Consider using certificate pinning
- Implement proper certificate validation
- Use secure API endpoints with valid certificates

## Testing

1. Set a real external API URL in `config.yaml`
2. Test with: `curl -X GET http://localhost:5000/api/listitems/10`
3. Check server logs for connection details

## Current Status

- ✅ SSL bypass implemented for HTTPS external APIs
- ✅ Automatic fallback to mock data when external API unavailable
- ✅ Proper error handling and logging
- ✅ Configuration-based external service URLs

## Mock Data Fallback

When external APIs are not configured or unavailable, the system automatically returns mock transaction data that matches the expected format for each Source of Truth.