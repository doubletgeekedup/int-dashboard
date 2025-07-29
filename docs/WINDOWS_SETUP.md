# Windows Setup Guide

## Overview
This guide addresses Windows-specific setup requirements for the Integration Dashboard.

## NODE_ENV Issues on Windows

### Problem
Windows environments often have issues with NODE_ENV environment variable handling, leading to runtime errors.

### Solution
The application now uses `config.yaml` instead of NODE_ENV for all environment configuration.

### Configuration Changes Made

1. **Removed NODE_ENV Dependencies**:
   - `dev.bat`: Removed `set NODE_ENV=development`
   - `dev.ps1`: Removed `$env:NODE_ENV="development"`
   - `start-dev.js`: Commented out NODE_ENV setting
   - All server files: Use `configManager.getAppConfig().environment`

2. **Config.yaml Controls Environment**:
   ```yaml
   app:
     environment: "development"  # Set directly, no NODE_ENV dependency
   ```

3. **How to Change Environment**:
   - Edit `config.yaml` and change `app.environment` to "development" or "production"
   - No need to set NODE_ENV environment variable

## Running on Windows

### Option 1: Use npm scripts (recommended)
```cmd
npm run dev
```

### Option 2: Use Windows batch file
```cmd
dev.bat
```

### Option 3: Use PowerShell script
```powershell
.\dev.ps1
```

### Option 4: Direct command
```cmd
npx tsx server/index.ts
```

## Troubleshooting Windows Issues

### Issue: "NODE_ENV is not defined"
**Solution**: The application no longer uses NODE_ENV. Update config.yaml instead.

### Issue: PowerShell execution policy
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: tsx command not found
```cmd
npm install -g tsx
```

## Environment Configuration

All environment settings are now controlled through `config.yaml`:

```yaml
app:
  name: "Integration Dashboard"
  version: "2.4.1"
  environment: "development"  # Change this for different environments
  port: 5000
```

For production deployment, change to:
```yaml
app:
  environment: "production"
```

## Database Configuration

Windows database setup uses the same config.yaml approach:

```yaml
database:
  url: "${DATABASE_URL}"  # Still supports environment variables when needed
```

## Notes

- The application is now fully Windows-compatible
- No NODE_ENV environment variable needed
- All configuration centralized in config.yaml
- Package.json scripts still reference NODE_ENV but application ignores them
- Vite.config.ts NODE_ENV reference is for build-time only, not runtime