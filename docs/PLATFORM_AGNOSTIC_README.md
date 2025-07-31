# Integration Dashboard System

A sophisticated enterprise data integration platform enabling complex synchronization across multiple Sources of Truth using advanced graph database technologies and real-time data processing.

## Overview

The Integration Dashboard System is designed for enterprise environments to monitor and manage data integration across six primary Sources of Truth. It provides real-time analytics, AI-powered insights, and comprehensive relationship tracking with government-level security compliance.

## Features

- **Real-time Monitoring Dashboard** with live metrics and performance indicators
- **AI-Powered Data Analysis** using advanced language models for intelligent insights
- **Graph Database Integration** with JanusGraph and Gremlin query support
- **Advanced Similarity Analysis** with 90% accuracy matching across data sources
- **Government-Level Knowledge Retention** with comprehensive audit trails
- **Interactive Node Visualization** with one-click exploration capabilities
- **WebSocket Real-time Updates** for live data synchronization
- **External API Integration** for work item management and external services

## Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe component development
- **Tailwind CSS** with Radix UI for modern, accessible user interfaces
- **TanStack Query** for efficient server state management
- **Recharts** for advanced data visualization and analytics
- **Vite** for optimized development and production builds

### Backend
- **Node.js** with Express.js for scalable server architecture
- **TypeScript** with ES modules for type-safe backend development
- **WebSocket** connections for real-time bidirectional communication
- **Drizzle ORM** for type-safe database operations

### Data Layer
- **JanusGraph** for complex relationship mapping and graph queries
- **PostgreSQL** for structured data persistence (optional)
- **In-Memory Storage** for high-performance session management
- **Hybrid Storage Architecture** with automatic fallback mechanisms

## System Requirements

### Minimum Requirements
- **Node.js**: Version 20 or higher
- **Memory**: 4GB RAM (8GB+ recommended for production)
- **Storage**: 20GB available disk space
- **Network**: Stable internet connection for external integrations

### Supported Platforms
- Linux (Ubuntu 20.04+, CentOS 8+, RHEL 8+)
- Windows Server 2019+
- macOS 12+
- Docker containers and Kubernetes clusters

## Quick Start

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd integration-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure the application**
   
   Create a `config.yaml` file in the project root:
   ```yaml
   app:
     environment: development
     port: 3000
     host: "0.0.0.0"
   
   database:
     enabled: false  # Set to true for PostgreSQL
   
   janusgraph:
     enabled: true
     useRemote: true
     url: "ws://your-janusgraph-server:8182/gremlin"
   
   ai:
     enabled: false  # Set to true for AI features
   
   external:
     workitems:
       url: ""  # External API endpoint
       apiKey: ""  # API authentication key
   ```

4. **Set environment variables**
   ```bash
   # Required for AI features
   export OPENAI_API_KEY=your_openai_api_key
   
   # Required for PostgreSQL (if enabled)
   export DATABASE_URL=postgresql://user:pass@host:port/database
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## Configuration

### Storage Options

The system supports three storage configurations:

1. **In-Memory Storage** (default)
   - No setup required
   - Pre-loaded with sample data
   - Data lost on application restart
   - Ideal for development and testing

2. **PostgreSQL Database**
   - Persistent data storage
   - Full ACID compliance
   - Requires database setup and configuration
   - Recommended for production environments

3. **JanusGraph Integration**
   - Advanced graph database capabilities
   - Complex relationship queries with Gremlin
   - Real-time graph data synchronization
   - Required for advanced analytics features

### AI Integration

To enable AI-powered features:

1. Obtain an API key from your AI service provider
2. Set the `OPENAI_API_KEY` environment variable
3. Configure `ai.enabled: true` in config.yaml
4. Restart the application

### External Service Integration

Configure external APIs in config.yaml:

```yaml
external:
  workitems:
    url: "https://your-external-api.com/workitems"
    apiKey: "your_secure_api_key"
    insecure: false  # Always false in production
    timeout: 30000   # Request timeout in milliseconds
```

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │  Load Balancer  │    │   Application   │
│    (Browser)    │◄──►│    (Optional)   │◄──►│     Server      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐            │
                       │   PostgreSQL    │◄───────────┤
                       │   (Optional)    │            │
                       └─────────────────┘            │
                                                       │
                       ┌─────────────────┐            │
                       │   JanusGraph    │◄───────────┤
                       │  Graph Database │            │
                       └─────────────────┘            │
                                                       │
                       ┌─────────────────┐            │
                       │  External APIs  │◄───────────┘
                       │ (AI, WorkItems) │
                       └─────────────────┘
```

### Data Model

The system organizes data into a hierarchical structure:

- **Sources of Truth**: Six primary data sources (SCR, Capital, Slicwave, Teamcenter, CAAS, Navrel)
- **Threads**: Logical groupings within each source that cluster related data
- **Data Nodes**: Individual data elements with unique identifiers and relationships

### Thread Structure

```typescript
interface Thread {
  nodekey: string;           // Unique thread identifier
  tqName: string;           // Thread query name pattern
  threadId: string;         // Thread UUID
  componentNode: ComponentNode[];  // Array of component nodes
  createTime: number[];     // Creation timestamp
  updateTime: number[];     // Last modification timestamp
}
```

### Node Relationship Format

```typescript
interface DataNode {
  nodeKey: string;          // Format: "TYPE@id@ID" (e.g., "HH@id@934")
  id: string;               // Numeric identifier
  type: string;             // Node classification
  description: string;      // Human-readable description
  functionName: string;     // Functional purpose
}
```

## API Reference

### Core Endpoints

- `GET /api/sources` - List all Sources of Truth with metadata
- `GET /api/sources/:code` - Get detailed source information
- `GET /api/dashboard/stats` - System metrics and performance statistics
- `GET /api/threads` - Thread data with filtering capabilities
- `POST /api/workitems` - Create work items via external API integration
- `GET /api/chat/messages` - Retrieve chat conversation history
- `POST /api/chat/analyze` - AI-powered data analysis

### Health Check Endpoints

- `GET /api/health` - Overall application health status
- `GET /api/janusgraph/health` - Graph database connectivity
- `GET /api/chat/ai-status` - AI service availability

### WebSocket Events

- `source_update` - Source status and data changes
- `thread_change` - Thread modifications and updates
- `system_alert` - System-wide notifications
- `chat_message` - Real-time chat synchronization

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build frontend for production
- `npm run build:server` - Compile backend for production
- `npm start` - Start production server
- `npm test` - Run automated test suite
- `npm run type-check` - TypeScript type checking
- `npm run lint` - Code quality linting
- `npm run db:push` - Apply database schema changes

### Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Frontend: Edit files in `client/src/`
   - Backend: Edit files in `server/`
   - Shared Types: Edit `shared/schema.ts`

3. **Test Changes**
   - Use browser developer tools for frontend debugging
   - Check terminal output for backend logs
   - Use API testing tools for endpoint verification

4. **Type Checking**
   ```bash
   npm run type-check
   ```

## Production Deployment

### Build Process

1. **Install dependencies**
   ```bash
   npm install --production
   ```

2. **Build the application**
   ```bash
   npm run build
   npm run build:server
   ```

3. **Configure production environment**
   - Update config.yaml with production settings
   - Set all required environment variables
   - Configure external service endpoints

4. **Start production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Build application
RUN npm run build && npm run build:server

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Environment Variables

Production environment configuration:

```bash
# Application Environment
NODE_ENV=production

# AI Service Integration
OPENAI_API_KEY=your_production_openai_key

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Custom Configuration File
CONFIG_FILE_PATH=/opt/app/config/production.yaml

# Session Security
SESSION_SECRET=your_secure_session_secret_minimum_32_characters
```

### Security Configuration

Production security settings in config.yaml:

```yaml
app:
  environment: production
  
security:
  session:
    secure: true
    httpOnly: true
    sameSite: "strict"
  cors:
    origin: ["https://yourdomain.com"]
    
external:
  workitems:
    insecure: false  # Always false in production
```

## Monitoring and Maintenance

### Health Monitoring

The application provides comprehensive health monitoring:

- Application health status at `/api/health`
- Database connectivity status at `/api/janusgraph/health`
- AI service availability at `/api/chat/ai-status`

### Performance Metrics

Monitor these key performance indicators:

- Response time for API endpoints
- WebSocket connection stability
- Memory usage and garbage collection
- Database query performance
- External API response times

### Logging

Configure application logging in config.yaml:

```yaml
logging:
  level: "info"           # Options: debug, info, warn, error
  file: "/var/log/app.log" # Log file location
  maxFiles: 10            # Log rotation file count
  maxSize: "100MB"        # Maximum log file size
```

### Backup Procedures

1. **Configuration Backup**
   ```bash
   tar -czf config-backup-$(date +%Y%m%d).tar.gz config.yaml
   ```

2. **Database Backup** (if using PostgreSQL)
   ```bash
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

3. **Application Logs**
   ```bash
   tar -czf logs-backup-$(date +%Y%m%d).tar.gz /var/log/
   ```

## Troubleshooting

### Common Issues

1. **Application Startup Failures**
   - Verify Node.js version compatibility (requires v20+)
   - Check all required dependencies are installed
   - Validate configuration file syntax
   - Review application logs for specific error messages

2. **Database Connection Issues**
   - Verify database server is running and accessible
   - Check connection credentials and network connectivity
   - Validate connection URL format
   - Review database server logs

3. **AI Service Integration Problems**
   - Confirm API key is set correctly
   - Verify AI service is enabled in configuration
   - Check API key permissions and rate limits
   - Review external service status

4. **Performance Issues**
   - Monitor system resource usage (CPU, memory, disk)
   - Check for memory leaks in application logs
   - Optimize database queries and connections
   - Consider horizontal scaling options

### Debug Mode

Enable detailed debugging by updating config.yaml:

```yaml
app:
  environment: development
  
logging:
  level: "debug"
  console: true
```

### Support Resources

- **Configuration Guide**: See `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`
- **System Architecture**: See `docs/SYSTEM_OVERVIEW.md`
- **API Documentation**: Complete endpoint reference in codebase
- **Troubleshooting**: Check application logs and health endpoints

## License

PROPRIETARY - Internal Enterprise Use Only

This software is confidential and proprietary. Unauthorized distribution, modification, or use is strictly prohibited.

## Support

For technical support and system administration:

1. Review comprehensive documentation in the `docs/` directory
2. Check application logs for detailed error information
3. Verify all configuration settings and environment variables
4. Contact your system administrator or technical support team