# Integration Dashboard System

## Overview

This is a full-stack web application designed to monitor and manage multiple "Sources of Truth" (data integration points) in an enterprise environment. The system provides real-time monitoring, performance analytics, bulletins management, AI-powered insights through an LLM chat interface, and government-level knowledge retention with intelligent node relationship detection.

The system automatically captures important information from conversations, including node relationships like "node xyz is related to dbx" and attribute matching patterns with 90% similarity detection. All data is stored locally for government-level security compliance with comprehensive audit trails.

All configurations are managed through YAML files (config.yaml) and environment variables for easy deployment and environment management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest)

**July 24, 2025 - Gremlin Node Visualizer Implementation with Visual Connections**
- Created comprehensive Gremlin visualizer interface for each Source of Truth
- Built interactive node relationship visualization showing one level up and down connections
- Added dynamic source selection and node ID input with real-time graph generation
- Implemented simulated Gremlin traversal with realistic graph data based on source types
- Created API endpoint /api/gremlin/visualize/:sourceCode/:nodeId for graph data retrieval
- Added visual indicators for different node types and relationship levels (up/center/down)
- Enhanced sidebar navigation with Gremlin Visualizer menu item using GitBranch icon
- Built comprehensive graph data display with node properties, edges, and relationship summaries
- Implemented source-specific node typing (cache_entry, config_file, service_endpoint, etc.)
- Added responsive card-based layout with color-coded node levels and relationship visualization
- **NEW**: Added visual connection lines showing parent-to-child relationships with arrows
- **NEW**: Implemented "+more" popup dialog for nodes with extensive properties
- **NEW**: Created expandable property viewer with formatted JSON display and search capabilities
- **NEW**: Enhanced visual layout with connection arrows, animated target node indicator, and hierarchical flow display

**July 24, 2025 - Complete Config.yaml Migration & NODE_ENV Removal**
- Migrated entire system from environment variables to config.yaml-based configuration
- Removed ALL NODE_ENV references throughout application in favor of config.yaml app.environment
- Updated all services (OpenAI, JanusGraph, GraphQL, Similarity, External APIs) to use centralized ConfigManager
- Replaced all process.env direct access with config.yaml settings throughout server codebase
- Updated server/index.ts to use configManager.getAppConfig().environment instead of NODE_ENV
- Removed NODE_ENV from start-dev.js, .vscode/launch.json debugging configurations
- Enhanced app.environment in config.yaml to support "${NODE_ENV:-development}" with fallback
- Added external services configuration section for LISTITEMS and JANUSGRAPH_SCHEMA endpoints (URLs only, no API keys)
- Added AI chat configuration control through config.yaml instead of environment variables
- Updated database configuration to use config.yaml with environment variable interpolation
- Enhanced port configuration to support both config.yaml and environment variable with proper fallback
- Improved storage factory to use configuration-based database URL detection
- All server services now consistently use ConfigManager for environment-agnostic configuration
- Updated console logging to reference config.yaml instead of environment variables for clarity
- Note: package.json scripts still use NODE_ENV (can't be modified) but application ignores it in favor of config.yaml
- Simplified external services to use URL-only configuration (no API keys) as string values
- Updated external service fetch operations to remove all authentication headers
- Added SSL insecure support for external APIs with certificate verification bypass
- Created comprehensive WINDOWS_SETUP.md guide with Windows-specific NODE_ENV troubleshooting

**July 24, 2025 - Government-Level Knowledge Retention System**
- Implemented secure knowledge retention system for confidential environments where external LLM data persistence is prohibited
- Added comprehensive PostgreSQL-based knowledge storage with categories, priorities, tags, and audit trails
- Created government-compliant data classification system (general, system, analysis, insights, procedures)
- Built automated knowledge extraction from chat interactions with security classification
- Added knowledge search, statistics, and access audit capabilities for compliance reporting
- Implemented retention policies (temporary, standard, permanent) for data lifecycle management
- Created secure API endpoints for knowledge management with full access logging
- Enhanced with specialized node relationship detection and storage for similarity analysis
- Added automatic capture of attribute matching patterns and correlation discoveries
- Built dedicated APIs for storing and searching node relationships with confidence scoring
- Created UI interface for viewing node relationship discoveries and patterns

**July 24, 2025 - Environment-Controlled AI Chat System**
- Removed user toggles for AI/non-AI mode - now controlled by AI_CHAT_ENABLED environment variable
- Added AI status endpoint (/api/chat/ai-status) showing enabled/available/hasApiKey status
- Updated AI assistant components to show proper status indicators based on environment configuration
- Enhanced dashboard with dynamic AI status indicators (green = AI ready, yellow = direct mode)
- Fixed AI status indicator inconsistencies - now properly shows yellow "Direct Mode" when AI_CHAT_ENABLED=false
- Added proper TypeScript interfaces for AI status responses
- Removed Quick AI Assistant box from dashboard as requested
- Renamed "AI Assistant" to "My Assistant" throughout the system
- Updated "Data Analysis Chat" to "My Assistant" on source pages for consistency
- Updated status indicators: "AI Assistant Active" (green) when enabled, "Direct Mode" (yellow) when disabled
- Fixed OpenAI service integration and chat interface functionality
- Implemented comprehensive dual-mode chat system with environment control
- Added extensive non-AI command set: node counting, descriptions, system status, source listing
- Created reusable AI assistant components (AIAssistant, MiniAssistant) for dashboard integration
- Built intelligent command processing with local similarity analysis and impact assessment
- Enhanced non-AI mode with comprehensive analysis capabilities
- Added comprehensive help system and command discovery features
- Integrated AI assistants into dashboard and source pages for contextual assistance

**July 24, 2025 - Threads Architecture**  
- Clarified that Teams = Threads (clusters of related data nodes)
- Updated all terminology from "teams" to "threads" throughout system
- Each Source of Truth contains multiple threads that cluster related data nodes
- Thread IDs (tid) from external work items now map to specific threads
- Updated API endpoints from /api/teams to /api/threads
- Enhanced transaction modals to show thread assignment mapping
- Thread names are now generated UIDs instead of descriptive names
- Updated all mock data and storage to use UUID-format thread identifiers
- Removed thread descriptions, threads now use complex structure with nodekey, componentNode, etc.
- Updated thread schema to match new structure: nodekey, tqName, class, componentNode arrays
- Thread storage now uses simplified API with threadId-only lookups

**July 24, 2025 - Similarity Analysis & Impact Assessment**
- Created comprehensive similarity service for cross-source analysis
- Implemented node similarity detection using multi-factor algorithms
- Added impact assessment API for evaluating changes across all sources of truth  
- Built node search capabilities with filtering by type and source
- Added severity-based impact scoring (LOW/MEDIUM/HIGH/CRITICAL)
- Created actionable recommendations based on impact analysis
- Enabled cross-system dependency tracking through node data analysis
- Added JanusGraph schema integration for enhanced similarity analysis
- Implemented schema-based impact assessment with relationship mapping
- Created external schema endpoint support with caching and authentication
- Integrated similarity analysis into chat interface only (no exposed endpoints)
- Enhanced OpenAI service to automatically detect similarity/impact requests in chat
- Added intelligent node data extraction from user messages for analysis
- Created non-AI chat service using direct JanusGraph queries for similarity analysis
- Implemented toggleable AI/non-AI chat modes with automatic fallback
- Built comprehensive JanusGraph-based similarity and impact assessment without OpenAI dependency

**July 24, 2025 - Division Teams Architecture**
- Implemented hierarchical Division Teams → Teams → Data Nodes structure
- Updated schema to support teams within division teams concept
- Each division team (Source of Truth) now contains multiple specialized teams
- Teams cluster data nodes by type (cache management, config processing, etc.)
- Updated all configurations and storage to reflect organizational hierarchy
- Division teams manage operations through specialized sub-teams for better organization

**July 24, 2025 - External Work Items Integration**
- Added proxy endpoint `/api/listitems/{count}` that fetches from external service
- Configured environment variables for EXTERNAL_LISTITEMS_URL and EXTERNAL_API_KEY
- Implemented fallback to mock data when external endpoint is not configured
- Updated source pages to display work items with proper field mappings
- Added clickable transaction IDs with modal showing tid and process details
- Displays "no recent transactions" message when none found in last 100 items

**July 24, 2025 - Custom Brand Theme Implementation**
- Implemented complete custom brand theme using specified colors: #fee1c2, #caae8f, #694628, #fcb567, #27150c
- Updated all CSS variables to use brand colors while maintaining white and modern design
- Created brand-specific component classes (brand-btn-primary, brand-nav-item-active, etc.)
- Replaced all GitHub-style classes throughout the application with brand theme equivalents
- Added custom logo using brand colors #fcb567 and #27150c as specified
- Updated dashboard statistics cards with brand color scheme
- Enhanced visual consistency across all components and pages

**July 24, 2025 - JanusGraph GraphQL Integration**
- Added full GraphQL support for JanusGraph database connectivity
- Created GraphQLStorage implementation with complete CRUD operations
- Built GraphQL client service with automatic fallback to simulated mode
- Implemented storage factory pattern supporting GraphQL, PostgreSQL, and in-memory options
- Added comprehensive JanusGraph setup guide with schema initialization
- Created environment configuration for JANUSGRAPH_GRAPHQL_URL
- Updated storage priority: JanusGraph GraphQL > PostgreSQL > In-memory storage

**December 22, 2025 - Comprehensive IDE Documentation Suite**
- Created complete setup guides for VS Code, IntelliJ IDEA, and Eclipse IDEs
- Implemented advanced VS Code debugging with 8 specialized debug configurations
- Built production deployment guide with Replit reference removal for confidentiality
- Developed comprehensive README with multi-IDE command references
- Added professional debugging workflow with launch.json configurations
- Established complete documentation suite for enterprise development teams

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Component Library**: Custom shadcn/ui components based on Radix primitives
- **Real-time Updates**: WebSocket connection for live data updates

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support
- **Middleware**: Request logging, JSON parsing, error handling
- **Build System**: Vite for frontend bundling, esbuild for backend compilation

### Data Storage Solutions
- **Primary Database**: JanusGraph with GraphQL interface (preferred for graph operations)
- **Alternative Database**: PostgreSQL with Neon serverless driver  
- **Fallback Storage**: In-memory storage for development without database setup
- **ORM**: Drizzle ORM for type-safe database operations
- **Graph Database**: JanusGraph integration with GraphQL and Gremlin query support
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Session Storage**: PostgreSQL-based session management with connect-pg-simple
- **Storage Factory**: Automatic selection based on environment configuration

## Key Components

### Sources of Truth Management
The system monitors six main Sources of Truth, each containing multiple threads that cluster related data nodes:
- **STC (System Truth Cache)**: Source managing system operations through cache management, system records, and data repository threads
- **CPT (Configuration Processing Tool)**: Source managing configuration operations through file management, settings, and policy threads
- **SLC (Service Layer Coordinator)**: Source managing service operations through orchestration, endpoint, and coordination threads
- **TMC (Transaction Management Center)**: Source managing transaction operations through processing, monitoring, and audit threads
- **CAS (Central Authentication Service)**: Source managing authentication operations through credential, permission, and token threads
- **NVL (Network Validation Layer)**: Source managing network operations through validation, connectivity, and monitoring threads

### Core Features
1. **Dashboard**: Real-time metrics, performance charts, system health overview
2. **Source Monitoring**: Individual source pages with detailed analytics
3. **Bulletins System**: Announcements and updates with priority levels
4. **Knowledge Base**: Documentation and troubleshooting resources with relationship discovery
5. **LLM Chat**: AI-powered analysis and insights using OpenAI GPT-4o with environment control
6. **Transaction Tracking**: Real-time transaction monitoring and logging
7. **Knowledge Retention**: Government-level secure local data storage with audit trails
8. **Node Relationship Detection**: Automatic capture of data correlations and attribute matching
9. **Pattern Recognition**: 90% similarity detection for attributes with different names but same values

### Performance Monitoring
- Response time tracking
- Throughput monitoring
- Error rate analysis
- Uptime statistics
- Custom performance metrics with configurable alerts

## Data Flow

### Client-Server Communication
1. **HTTP APIs**: RESTful endpoints for CRUD operations
2. **WebSocket**: Real-time updates for live data synchronization
3. **Query Management**: TanStack Query handles caching, background updates, and optimistic updates
4. **Error Handling**: Centralized error management with user-friendly notifications

### Real-time Updates
- WebSocket connection established on app initialization
- Server broadcasts updates for source changes, transaction events, and bulletin notifications
- Client automatically invalidates relevant queries and updates UI
- Automatic reconnection with exponential backoff

### AI Integration
- OpenAI GPT-4o integration for data analysis
- Context-aware responses based on source-specific data
- Chat history persistence with session management
- Structured analysis with insights and recommendations

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL (Neon serverless)
- **Graph Database**: JanusGraph with Gremlin query language
- **AI Service**: OpenAI API (GPT-4o model)
- **Session Store**: PostgreSQL with connect-pg-simple

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Recharts**: Data visualization and charting
- **Lucide React**: Icon library

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migration and introspection
- **ESBuild**: Backend bundling for production

## Deployment Strategy

### Development Environment
- Vite dev server with HMR for frontend development
- Express server with TypeScript compilation via tsx
- Database migrations handled through Drizzle Kit
- Environment variables for API keys and database connections

### Production Build
- Frontend: Vite production build with optimized bundles
- Backend: ESBuild compilation to single JavaScript file
- Static assets served through Express static middleware
- Database migrations applied automatically on deployment

### Environment Configuration
- **Development**: Local development with hot reloading
- **Production**: Optimized builds with proper error handling
- **Database**: PostgreSQL connection via DATABASE_URL environment variable
- **External APIs**: OpenAI API key configuration for LLM features

### Monitoring and Observability
- Request/response logging with performance metrics
- WebSocket connection monitoring
- Database query performance tracking
- Error reporting and user notification system