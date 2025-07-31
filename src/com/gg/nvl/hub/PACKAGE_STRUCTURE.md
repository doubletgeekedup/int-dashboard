# Integration Dashboard Hub Package Structure

## Package: com.gg.nvl.hub

This follows Java package naming conventions where:
- `com.gg` - Organization domain (Global Gateway)  
- `nvl` - Network Validation Layer project
- `hub` - Integration Dashboard Hub module

## Directory Structure

```
src/com/gg/nvl/hub/
├── client/           # Frontend React application
│   ├── src/         # React components, pages, hooks, utils
│   └── index.html   # Main HTML template
├── server/          # Backend Express.js application  
│   ├── api/         # REST API endpoints
│   ├── services/    # Business logic services
│   └── storage/     # Data access layer
├── shared/          # Shared TypeScript interfaces and schemas
│   └── schema.ts    # Database schemas and types
├── docs/            # Project documentation
│   ├── guides/      # Setup and usage guides
│   └── api/         # API documentation
└── assets/          # Static assets and resources
```

## Component Organization

### Client Layer (com.gg.nvl.hub.client)
- React frontend with TypeScript
- Component-based architecture
- Real-time WebSocket integration
- TanStack Query for server state

### Server Layer (com.gg.nvl.hub.server)  
- Express.js REST API server
- WebSocket server for real-time updates
- JanusGraph integration for graph data
- Memory storage for chat and integration data

### Shared Layer (com.gg.nvl.hub.shared)
- Common TypeScript interfaces
- Database schemas using Drizzle ORM
- Validation schemas using Zod

### Services Architecture
- **JanusGraph Service**: Read-only graph database queries
- **Chat Service**: AI and non-AI chat implementations  
- **Storage Service**: Hybrid storage management
- **Configuration Service**: Environment-based configuration

## Build System Compatibility

The package structure maintains compatibility with:
- Vite bundler configuration
- TypeScript module resolution
- ESBuild production compilation
- Replit deployment system

## Benefits of This Structure

1. **Clear Organization**: Java package conventions provide logical grouping
2. **Scalability**: Easy to add new modules and services
3. **Maintainability**: Predictable file locations
4. **Team Collaboration**: Standard enterprise structure
5. **Build Compatibility**: Works with existing toolchain