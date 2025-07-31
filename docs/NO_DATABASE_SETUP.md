# No Database Setup Guide

## Overview
This guide shows you how to run the Integration Dashboard without any database setup. Perfect for development, testing, or when you want to get started quickly. The application includes external work items integration and custom brand theme features that work out of the box.

The Integration Dashboard can run entirely without a PostgreSQL database using in-memory storage. This is perfect for:
- Development and testing
- Demonstrations and prototypes  
- Environments where database setup is not feasible
- Quick evaluation of the application

## Quick Start (No Database Required)

### 1. Clone and Install
```bash
git clone <your-repository-url>
cd integration-dashboard
npm install
```

### 2. Create Minimal Environment File
Create `.env` file with just the essential variables:
```env
# No DATABASE_URL needed - will use in-memory storage
NODE_ENV=development
PORT=5000

# Optional: Add OpenAI API key for AI features  
# OPENAI_API_KEY=your_openai_api_key_here

# Optional: External work items service
# EXTERNAL_LISTITEMS_URL=https://your-external-api.com  
# EXTERNAL_API_KEY=your_external_api_key_here

# Optional: JanusGraph configuration (simulated)
JANUSGRAPH_HOST=localhost
JANUSGRAPH_PORT=8182
```

### 3. Start the Application
```bash
npm run dev
```

The application will start with:
- ✅ In-memory storage (no database required)
- ✅ All API endpoints working
- ✅ Sample data pre-loaded
- ✅ Real-time WebSocket updates
- ✅ Full UI functionality

## What You Get Without PostgreSQL

### ✅ Full Functionality
- **Dashboard**: Complete with metrics and charts
- **6 Sources of Truth**: SCR, CPT, SLC, TMC, CAS, NVL
- **Real-time Updates**: WebSocket communication  
- **Bulletins**: System announcements and updates
- **Transactions**: Monitoring and logging
- **Knowledge Base**: Documentation links
- **AI Chat**: If OpenAI API key is provided

### ✅ Sample Data Included
The in-memory storage comes pre-loaded with:
- 6 integration sources with realistic metrics
- Sample bulletins and announcements
- Mock transaction data
- Knowledge base links
- Performance metrics

### ⚠️ Limitations
- **Data Persistence**: Data is lost when server restarts
- **Scalability**: Limited to single server instance
- **Backup**: No automatic data backup capabilities

## Environment Variables

### Required (None!)
The application works out of the box with no environment variables.

### Optional Enhancements
```env
# OpenAI Integration (for AI chat features)
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
HOST=0.0.0.0
NODE_ENV=development

# Session Configuration
SESSION_SECRET=dev_secret_change_in_production

# JanusGraph Configuration (simulated)
JANUSGRAPH_HOST=localhost
JANUSGRAPH_PORT=8182
JANUSGRAPH_PATH=/gremlin
JANUSGRAPH_PROTOCOL=ws
```

## Health Monitoring

Check application health at:
```bash
curl http://localhost:5000/api/health
```

Response includes:
```json
{
  "status": "healthy",
  "timestamp": "2025-07-23T...",
  "storage": {
    "type": "memory",
    "status": "not_configured", 
    "message": "No DATABASE_URL configured - using in-memory storage"
  },
  "janusgraph": {
    "connected": true,
    "healthy": true
  },
  "uptime": 123.45
}
```

## Adding PostgreSQL Later

When you're ready to add PostgreSQL persistence:

### 1. Install and Configure PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib  # Ubuntu/Debian
brew install postgresql                         # macOS

# Create database
sudo -u postgres createdb integration_dashboard
```

### 2. Add Database URL
Update `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost:5432/integration_dashboard
```

### 3. Run Database Setup
```bash
# Generate database schema
npx drizzle-kit generate

# Apply migrations  
npx drizzle-kit migrate
```

### 4. Restart Application
```bash
npm run dev
```

The application will automatically detect the DATABASE_URL and switch to PostgreSQL.

## Development Workflow

### 1. Start Development
```bash
npm run dev
```

### 2. Open Browser
Navigate to `http://localhost:5000`

### 3. Explore Features
- View dashboard with live metrics
- Navigate between source pages
- Test real-time updates via WebSocket
- Try bulletin management
- Explore knowledge base links

### 4. API Testing
Test all endpoints work without database:
```bash
curl http://localhost:5000/api/sources
curl http://localhost:5000/api/dashboard/stats  
curl http://localhost:5000/api/transactions
curl http://localhost:5000/api/bulletins
curl http://localhost:5000/api/health
```

## Production Considerations

### For Production Without Database
If you need to run in production without PostgreSQL:

1. **Data Backup**: Implement periodic data exports
2. **High Availability**: Use load balancer with sticky sessions
3. **Monitoring**: Monitor memory usage and application health
4. **Scaling**: Consider Redis for shared session storage

### Migration Path
The application is designed for easy migration:
1. Start with in-memory storage for development
2. Add PostgreSQL when ready for persistence  
3. No code changes required - just environment variables

## Troubleshooting

### Application Won't Start
```bash
# Check Node.js version
node --version  # Should be 20+

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
npx kill-port 5000
```

### Memory Issues
```bash
# Monitor memory usage
top -p $(pgrep -f "tsx server/index.ts")

# Restart if needed
npm run dev
```

### Missing Features
If some features don't work:
1. Check console for errors
2. Verify OpenAI API key for AI features
3. Check browser network tab for API failures

## Benefits of No-Database Setup

### ✅ Rapid Development
- Instant setup with `npm install` and `npm run dev`
- No database installation or configuration
- Pre-loaded with realistic sample data

### ✅ Easy Deployment  
- Single server deployment
- No database maintenance
- Simplified backup/restore (if needed)

### ✅ Testing and Demos
- Perfect for presentations and demos
- Consistent sample data across environments
- Fast reset by restarting server

### ✅ Learning and Exploration
- Focus on application features, not infrastructure
- Understand the system before adding complexity
- Easy experimentation with configurations

This no-database setup makes the Integration Dashboard extremely accessible while maintaining full functionality for development, testing, and evaluation purposes.