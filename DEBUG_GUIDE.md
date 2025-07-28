# Debug Guide for Integration Dashboard

This guide helps you troubleshoot common issues and understand the debugging process for the Integration Dashboard application, including external work items integration and custom brand theme features.

## VS Code Debugging

This section explains how to use the debugging configurations in `.vscode/launch.json` for your Integration Dashboard project.

## Available Debug Configurations

### 🚀 Launch Development Server
**Best for:** General development and testing
- Launches the full server with debugging enabled
- Automatically loads environment variables from `.env`
- Uses integrated terminal for output
- Supports hot reloading and breakpoints

**How to use:**
1. Go to Run and Debug view (Ctrl+Shift+D)
2. Select "🚀 Launch Development Server"
3. Press F5 or click the play button
4. Set breakpoints by clicking in the gutter

### 🔍 Debug Current File
**Best for:** Testing individual TypeScript files
- Debugs whatever file is currently open
- Useful for testing utility functions or services
- Loads environment variables automatically

**How to use:**
1. Open the TypeScript file you want to debug
2. Select "🔍 Debug Current File"
3. Press F5

### 🔌 Attach to Running Server
**Best for:** Debugging an already running server
- Connects to a server started with `--inspect`
- Useful when you want to debug without restarting
- Great for production debugging

**How to use:**
1. Start server manually: `tsx --inspect server/index.ts`
2. Select "🔌 Attach to Running Server"
3. Press F5

### 🐛 Debug Server with Breakpoints
**Best for:** Deep debugging with immediate stops
- Stops execution at the very beginning
- Perfect for debugging startup issues
- Enables all debug output

**How to use:**
1. Select "🐛 Debug Server with Breakpoints"
2. Press F5
3. Server will pause immediately - press F5 again to continue

### 🧪 Debug Database Operations
**Best for:** Debugging database connections and queries
- Special environment variable `DEBUG_DB=true`
- Enhanced logging for database operations
- Perfect for troubleshooting Drizzle ORM issues

**How to use:**
1. Select "🧪 Debug Database Operations"
2. Set breakpoints in database-related code
3. Press F5

### 🤖 Debug OpenAI Integration
**Best for:** Debugging AI chat functionality
- Runs OpenAI service directly
- Enhanced logging with `DEBUG_AI=true`
- Perfect for testing chat responses

**How to use:**
1. Select "🤖 Debug OpenAI Integration"
2. Set breakpoints in OpenAI service code
3. Press F5

## External Work Items Debugging

### Common Issues with External Integration

1. **"External service unavailable" errors**
   ```bash
   # Check if endpoint is accessible
   curl -X GET "https://your-external-api.com/listitems/10"
   
   # Check with authentication
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        "https://your-external-api.com/listitems/10"
   ```

2. **Authentication failures**
   - Verify `EXTERNAL_API_KEY` is correctly set
   - Check the authentication method expected by your service
   - Monitor server logs for detailed error messages

3. **No transactions displayed**
   - Verify external API returns data in expected format
   - Check `qName` field contains correct source prefixes (STC_, CPT_, etc.)
   - Use browser dev tools to inspect network requests

### Debug External Integration

Enable debug logging in your `.env` file:
```env
DEBUG=true
EXTERNAL_LISTITEMS_URL=https://your-external-api.com
EXTERNAL_API_KEY=your_api_key_here
```

Check server console for detailed logs:
```
Fetching work items from: https://your-external-api.com/listitems/100
External API returned 200: OK
Found 25 work items for STC source
```

### 📊 Debug JanusGraph Service
**Best for:** Debugging graph database operations
- Runs JanusGraph service directly
- Enhanced logging with `DEBUG_GRAPH=true`
- Perfect for testing graph queries

**How to use:**
1. Select "📊 Debug JanusGraph Service"
2. Set breakpoints in JanusGraph service code
3. Press F5

### 🔧 Debug Production Build
**Best for:** Testing production builds
- Debugs the compiled JavaScript output
- Automatically builds project first
- Tests production environment

**How to use:**
1. Select "🔧 Debug Production Build"
2. Press F5 (will build first, then debug)

## Debugging Shortcuts

### Essential Keyboard Shortcuts
- **F5**: Start debugging / Continue
- **F10**: Step over (next line)
- **F11**: Step into (enter function)
- **Shift+F11**: Step out (exit function)
- **Ctrl+Shift+F5**: Restart debugging
- **Shift+F5**: Stop debugging
- **F9**: Toggle breakpoint

### Breakpoint Types
- **Line Breakpoint**: Click in gutter or press F9
- **Conditional Breakpoint**: Right-click breakpoint → Edit Breakpoint
- **Logpoint**: Right-click gutter → Add Logpoint

## Common Debugging Scenarios

### 1. API Endpoint Not Working
```typescript
// Set breakpoint in server/routes.ts
app.get('/api/sources', async (req, res) => {
  console.log('API call received'); // Add logging
  // Breakpoint here ←
  const sources = await getSources();
  res.json(sources);
});
```

**Steps:**
1. Use "🚀 Launch Development Server"
2. Set breakpoint in route handler
3. Make API call from frontend
4. Inspect variables when breakpoint hits

### 2. Database Query Issues
```typescript
// Set breakpoint in database operation
export async function getSources() {
  // Breakpoint here ←
  const sources = await db.select().from(sourcesTable);
  return sources;
}
```

**Steps:**
1. Use "🧪 Debug Database Operations"
2. Set breakpoint in database function
3. Check connection and query results

### 3. OpenAI Integration Problems
```typescript
// Set breakpoint in OpenAI service
export async function sendChatMessage(message: string) {
  // Breakpoint here ←
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: message }]
  });
  return response;
}
```

**Steps:**
1. Use "🤖 Debug OpenAI Integration"
2. Set breakpoint in chat function
3. Inspect API request/response data

### 4. Frontend State Issues
Since this is a backend-focused debug config, for frontend debugging:
1. Use browser DevTools
2. Add `console.log` statements in React components
3. Use React DevTools extension

## Debug Console Usage

### Evaluate Expressions
While debugging, use the Debug Console to:
```javascript
// Check variable values
req.body
res.locals

// Call functions
await getSources()

// Check environment
process.env.DATABASE_URL
```

### Watch Variables
Add variables to Watch panel:
1. Right-click variable → Add to Watch
2. Or manually add in Watch panel
3. Variables update automatically as you step through code

## Environment-Specific Debugging

### Development Environment
```typescript
import { configManager } from './config';
if (configManager.getAppConfig().environment === 'development') {
  console.log('Debug info:', data);
}
```

### Production Environment
```typescript
// Use proper logging instead of console.log
import { logger } from './logger';
logger.debug('Debug info:', data);
```

## Advanced Debugging Tips

### 1. Source Maps
Source maps are enabled in all configurations, so you can:
- Set breakpoints in TypeScript files
- Step through original TypeScript code
- See original variable names

### 2. Skip Files
Configurations skip:
- Node.js internals
- node_modules
- This keeps debugging focused on your code

### 3. Environment Variables
All configurations load `.env` file automatically:
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
DEBUG=*
```

### 4. Multiple Debug Sessions
You can run multiple debug configurations simultaneously:
- Main server in one session
- Specific service in another
- Useful for complex debugging scenarios

## Troubleshooting Debug Issues

### Port Already in Use
```bash
# Kill process using port 9229
npx kill-port 9229
```

### TypeScript Compilation Errors
```bash
# Check for TypeScript errors
npx tsc --noEmit
```

### Environment Variables Not Loading
1. Check `.env` file exists
2. Verify file format (no spaces around =)
3. Restart VS Code if needed

### Breakpoints Not Hitting
1. Ensure source maps are enabled
2. Check file paths in launch.json
3. Verify code is actually executing

## Integration with Other Tools

### With SQLTools Extension
1. Set breakpoint in database operation
2. When hit, use SQLTools to examine database state
3. Run queries directly in VS Code

### With Thunder Client
1. Debug API endpoint
2. Use Thunder Client to make test requests
3. Step through server code as requests come in

### With Git Integration
1. Debug specific commits or branches
2. Use GitLens to see code history while debugging
3. Compare debugging results across versions

This debugging setup gives you comprehensive tools to troubleshoot any issues in your Integration Dashboard project, from database operations to AI integrations.