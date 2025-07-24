# External Work Items Integration Guide

This guide explains how to integrate the Integration Dashboard with external work item services to display real-time transaction data.

## Overview

The Integration Dashboard can connect to external work item services via REST API endpoints to fetch and display real-time transaction data. This integration provides live updates on work items across all six Sources of Truth (STC, CPT, SLC, TMC, CAS, NVL).

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```env
# Required: External work items service URL
EXTERNAL_LISTITEMS_URL=https://your-external-api.com

# Optional: API key for authentication
EXTERNAL_API_KEY=your_api_key_here
```

### API Endpoint Structure

Your external service should provide an endpoint with this structure:

```
GET /listitems/{count}
```

Where `{count}` is the number of recent work items to return.

## Expected Data Format

The external API should return an array of work items with this structure:

```json
[
  {
    "csWorkItemDetails": {
      "csWorkItemType": "IMPORT",
      "qName": "STC_yy.STC_yy",
      "tid": "486h5fj86fj7ref8644f79j56"
    },
    "csWorkItemProcessInfo": {
      "csWorkItemProcessDetail": "Import completed successfully",
      "csWorkItemProcessSatus": "COMPLETED"
    },
    "createDate": 1673523600000,
    "id": "675h-5hyt-6th7",
    "lastModified": 1673523900000
  }
]
```

### Field Mappings

The dashboard maps external fields to display names:

| External Field | Display Name | Description |
|---------------|--------------|-------------|
| `csWorkItemType` | Type | The type of work item (IMPORT, EXPORT, SYNC, etc.) |
| `csWorkItemProcessSatus` | Status | Current status (STARTED, COMPLETED, FAILED) |
| `createDate` - `lastModified` | Duration | Calculated processing time |
| `createDate` | Timestamp | When the work item was created |
| `id` | Transaction ID | Unique identifier (clickable for details) |

### Source Filtering

Work items are filtered by source using the `qName` field:

- **STC**: `qName` contains "STC_"
- **CPT**: `qName` contains "CPT_"
- **SLC**: `qName` contains "SLC_"
- **TMC**: `qName` contains "TMC_"
- **CAS**: `qName` contains "CAS_"
- **NVL**: `qName` contains "NVL_"

## Features

### Transaction Modal

Clicking any Transaction ID opens a modal showing:
- **Transaction ID**: The unique identifier
- **Process Detail**: Full description from `csWorkItemProcessDetail`

### Real-time Updates

The dashboard fetches the latest 100 work items and displays:
- Last 10 items per source
- "No recent transactions" message if no items found for a source
- Live updates when new transactions are processed

### Fallback Behavior

If the external endpoint is not configured or unavailable:
- Dashboard uses mock data for demonstration
- All features remain functional
- Clear indication that external service is not connected

## Authentication

### API Key Authentication

If your external service requires authentication, set the `EXTERNAL_API_KEY` environment variable. The dashboard will automatically include it as a Bearer token:

```http
Authorization: Bearer your_api_key_here
```

### Custom Authentication

For custom authentication schemes, modify the fetch headers in `server/routes.ts`:

```typescript
const response = await fetch(externalUrl, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.EXTERNAL_API_KEY, // Custom header
    // Add other custom headers as needed
  }
});
```

## Error Handling

The integration includes comprehensive error handling:

1. **Network Errors**: Graceful fallback to mock data
2. **Authentication Errors**: Clear error messages
3. **Timeout Handling**: 10-second timeout for external requests
4. **Data Validation**: Validates expected field structure

## Testing the Integration

### Test with Mock Data

1. Start the application without setting `EXTERNAL_LISTITEMS_URL`
2. Visit any source page (e.g., http://localhost:5000/sources/STC)
3. Verify mock transactions are displayed

### Test with External Service

1. Set `EXTERNAL_LISTITEMS_URL` in your `.env` file
2. Optionally set `EXTERNAL_API_KEY` if required
3. Restart the application
4. Visit a source page and verify real data is displayed

### Verify API Calls

Check the server logs for external API calls:

```
Fetching work items from: https://your-external-api.com/listitems/100
```

## Troubleshooting

### Common Issues

1. **"External service unavailable"**
   - Check that `EXTERNAL_LISTITEMS_URL` is correctly set
   - Verify the external service is accessible
   - Check network connectivity

2. **Authentication errors**
   - Verify `EXTERNAL_API_KEY` is correct
   - Check if the external service expects different authentication

3. **No transactions displayed**
   - Verify the external API returns data in the expected format
   - Check if `qName` fields contain the correct source prefixes

### Debug Mode

Enable detailed logging by checking server console output. The dashboard logs:
- External API URLs being called
- Response status codes
- Error details when requests fail

## Performance Considerations

- The dashboard fetches 100 items but only displays the last 10 per source
- Requests timeout after 10 seconds to prevent blocking
- Failed requests fall back to cached or mock data
- Consider implementing caching on the external service for better performance

## Security Notes

- Always use HTTPS for external endpoints in production
- Store API keys securely and never commit them to version control
- Consider implementing rate limiting on your external service
- Validate and sanitize all data received from external sources