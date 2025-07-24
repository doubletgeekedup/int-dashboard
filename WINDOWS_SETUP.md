# Windows Setup Guide

This guide helps Windows users set up and run the Integration Dashboard.

## Issue with `npm run dev`

Windows doesn't recognize the `NODE_ENV=development` syntax in the npm script. Here are several solutions:

## Solution 1: Use the Cross-Platform Script (Recommended)

Run the development server using the provided cross-platform script:

```bash
node start-dev.js
```

This script works on Windows, macOS, and Linux.

## Solution 2: Use Windows Batch File

Run the Windows-specific batch file:

```cmd
dev.bat
```

## Solution 3: Use PowerShell Script

If you prefer PowerShell:

```powershell
.\dev.ps1
```

## Solution 4: Manual Environment Variable

Set the environment variable manually, then run tsx:

### Command Prompt:
```cmd
set NODE_ENV=development
npx tsx server/index.ts
```

### PowerShell:
```powershell
$env:NODE_ENV="development"
npx tsx server/index.ts
```

## Solution 5: Use cross-env (If package.json could be modified)

The cross-env package is already installed. If you can modify package.json scripts:

```json
{
  "scripts": {
    "dev": "cross-env NODE_ENV=development tsx server/index.ts"
  }
}
```

## Recommended Workflow for Windows

1. **For Development**: Use `node start-dev.js`
2. **For Production**: Set `NODE_ENV=production` manually, then run the built application

## Environment Variables

Create a `.env` file in your project root with your configuration:

```env
# Application Configuration
NODE_ENV=development
PORT=5000

# External Work Items Service
EXTERNAL_LISTITEMS_URL=https://your-external-api.com
EXTERNAL_API_KEY=your_external_api_key_here

# AI Features
OPENAI_API_KEY=your_openai_api_key_here

# Database (optional)
DATABASE_URL=postgresql://username:password@localhost:5432/integration_dashboard
```

## Troubleshooting

### Common Windows Issues

1. **'tsx' is not recognized**
   ```cmd
   npm install -g tsx
   ```

2. **Permission denied errors**
   - Run Command Prompt or PowerShell as Administrator
   - Or use `npx tsx` instead of global installation

3. **Port already in use**
   ```cmd
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F
   ```

4. **Module not found errors**
   ```cmd
   npm install
   ```

### Environment Variable Verification

Check if environment variables are set correctly:

```cmd
echo %NODE_ENV%
```

Or in PowerShell:
```powershell
$env:NODE_ENV
```

## Alternative Development Setup

If you continue having issues, you can also:

1. Use **Windows Subsystem for Linux (WSL)**
2. Use **Docker Desktop** 
3. Use **Git Bash** (comes with Git for Windows)

These environments support Unix-style environment variable syntax.

## Next Steps

Once you get the development server running:

1. Open `http://localhost:5000` in your browser
2. Configure your external work items endpoint in `.env`
3. Add your OpenAI API key for AI features
4. Explore the dashboard features

The application will show mock data until you configure the external endpoints.