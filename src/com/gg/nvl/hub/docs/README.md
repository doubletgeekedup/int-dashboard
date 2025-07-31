# Documentation - Integration Dashboard Hub
## Package: com.gg.nvl.hub.docs

Complete documentation for the Integration Dashboard Hub system.

## Quick Navigation

### Setup & Installation
- [Setup Guide](SETUP_GUIDE.md) - Complete installation and configuration guide
- [IDE Setup Guides](guides/) - VS Code, IntelliJ IDEA, and Eclipse configuration

### Deployment
- [Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md) - Complete production deployment instructions
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md) - Step-by-step deployment verification
- [Debug Guide](DEBUG_GUIDE.md) - Troubleshooting and debugging procedures

### Architecture & Development
- [Package Structure](../PACKAGE_STRUCTURE.md) - Java package organization guide
- [Directory Structure](../DIRECTORY_STRUCTURE.md) - Complete directory layout
- [API Documentation](api/) - REST API and WebSocket documentation

### External Integrations
- [JanusGraph Setup](REAL_JANUSGRAPH_SETUP.md) - Graph database configuration
- [External APIs](guides/EXTERNAL_API_INTEGRATION.md) - WorkItem and external service integration

### Features & Usage
- [Chat System](guides/CHAT_SYSTEM.md) - AI and non-AI chat functionality
- [Knowledge Retention](guides/KNOWLEDGE_RETENTION.md) - Government-level data storage
- [Similarity Analysis](guides/SIMILARITY_ANALYSIS.md) - Cross-source analysis capabilities

## Document Organization

```
docs/
├── README.md                           # This file - documentation index
├── PRODUCTION_DEPLOYMENT_GUIDE.md     # Production deployment instructions
├── DEPLOYMENT_CHECKLIST.md            # Deployment verification checklist
├── SETUP_GUIDE.md                     # Development environment setup
├── DEBUG_GUIDE.md                     # Troubleshooting and debugging
├── REAL_JANUSGRAPH_SETUP.md          # JanusGraph database configuration
├── guides/                            # Detailed feature guides
│   ├── IDE_SETUP_GUIDES/             # IDE-specific setup instructions
│   ├── CHAT_SYSTEM.md                # Chat functionality documentation
│   ├── KNOWLEDGE_RETENTION.md        # Knowledge storage system
│   ├── SIMILARITY_ANALYSIS.md        # Analysis capabilities
│   └── EXTERNAL_API_INTEGRATION.md   # External service integration
└── api/                              # API documentation
    ├── REST_API.md                   # REST endpoint documentation
    ├── WEBSOCKET_API.md             # WebSocket event documentation
    └── GRAPHQL_API.md               # GraphQL schema documentation
```

## Getting Started

1. **New to the project?** Start with the [Setup Guide](SETUP_GUIDE.md)
2. **Ready to deploy?** Follow the [Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)
3. **Need to debug?** Check the [Debug Guide](DEBUG_GUIDE.md)
4. **Want to understand architecture?** Review the [Package Structure](../PACKAGE_STRUCTURE.md)

## Contributing to Documentation

When adding new documentation:

1. Follow the established structure and naming conventions
2. Update this index file with new document references
3. Use clear, concise language suitable for technical and non-technical users
4. Include practical examples and code snippets where relevant
5. Cross-reference related documents for easy navigation

## Support

For questions about documentation or system usage:
- Check the relevant guide first
- Review troubleshooting sections
- Consult API documentation for technical integration details