# Integration Dashboard Hub
## Package: com.gg.nvl.hub

A sophisticated data integration platform enabling complex synchronization across enterprise sources using advanced graph database technologies and real-time data processing.

## Quick Start

### Development Environment
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Package Structure
This project follows Java package naming conventions for organization:

- **com.gg.nvl.hub.client** - React frontend application
- **com.gg.nvl.hub.server** - Express.js backend services  
- **com.gg.nvl.hub.shared** - Common interfaces and schemas
- **com.gg.nvl.hub.docs** - Project documentation

### Key Features

1. **Sources of Truth Management** - Monitor 6 enterprise sources (SCR, Capital, Slicwave, Teamcenter, CAAS, Navrel)
2. **Real-time Dashboard** - Live metrics and performance monitoring
3. **JanusGraph Integration** - Graph database for complex data relationships
4. **AI-Powered Chat** - Intelligent analysis and recommendations
5. **Government-Level Security** - Secure local data retention and audit trails

### Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js, WebSocket
- **Database**: JanusGraph (graph), PostgreSQL (relational)  
- **Build**: Vite, ESBuild, TypeScript
- **Deployment**: Replit platform

## Architecture Overview

The system uses a hybrid storage architecture:
- **JanusGraph**: Read-only queries for graph data and relationships
- **Memory Storage**: Chat messages and integration dashboard data
- **Configuration**: YAML-based environment management

## Documentation

See `/docs` directory for comprehensive guides:
- Setup and installation
- API documentation  
- Deployment instructions
- Development guidelines