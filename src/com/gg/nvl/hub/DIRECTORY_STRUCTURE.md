# Directory Structure - com.gg.nvl.hub

## Package Hierarchy

```
src/com/gg/nvl/hub/
├── README.md                    # Package overview and quick start
├── PACKAGE_STRUCTURE.md         # Detailed package organization guide
├── package.json                 # Package metadata and structure info
├── client/                      # Frontend React application (com.gg.nvl.hub.client)
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/              # Application pages and routes
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utility libraries and helpers
│   │   ├── App.tsx             # Main application component
│   │   ├── main.tsx            # Application entry point
│   │   └── index.css           # Global styles and themes
│   └── index.html              # HTML template
├── server/                      # Backend services (com.gg.nvl.hub.server)
│   ├── api/                    # REST API endpoint handlers
│   ├── services/               # Business logic services
│   │   ├── chat/              # AI and non-AI chat services
│   │   ├── janusgraph/        # Graph database service
│   │   └── similarity/        # Node similarity analysis
│   ├── storage/               # Data access and storage layer
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API route definitions
│   ├── config.ts              # Configuration management
│   └── db.ts                  # Database connections
├── shared/                      # Common interfaces (com.gg.nvl.hub.shared)
│   └── schema.ts              # Database schemas and TypeScript types
├── docs/                       # Documentation (com.gg.nvl.hub.docs)
│   ├── guides/                # Setup and usage guides
│   ├── api/                   # API documentation
│   └── deployment/            # Deployment instructions
└── assets/                     # Static resources (com.gg.nvl.hub.assets)
    └── [static files]         # Images, icons, attachments
```

## Package Benefits

1. **Enterprise Organization**: Follows Java package conventions for predictable structure
2. **Logical Grouping**: Related functionality organized together
3. **Scalable Architecture**: Easy to extend with new modules and services
4. **Team Collaboration**: Clear ownership and responsibility boundaries
5. **Build System Compatible**: Works seamlessly with existing Vite/TypeScript setup

## Usage

The original build system continues to work unchanged:
- Development: `npm run dev` 
- Production build: `npm run build`
- Type checking: `npm run check`

All imports and module resolution remain the same while providing clear organizational structure for development teams.