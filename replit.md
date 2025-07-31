# Integration Dashboard System

## Overview

This is a full-stack web application designed to monitor and manage multiple "Sources of Truth" (data integration points) in an enterprise environment. The system provides real-time monitoring, performance analytics, bulletins management, AI-powered insights through an LLM chat interface, and government-level knowledge retention with intelligent node relationship detection.

The system automatically captures important information from conversations, including node relationships like "node xyz is related to dbx" and attribute matching patterns with 90% similarity detection. All data is stored locally for government-level security compliance with comprehensive audit trails.

All configurations are managed through YAML files (config.yaml) and environment variables for easy deployment and environment management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest)

**July 31, 2025 - Java Package Structure Implementation & Production Deployment Guide**
- Reorganized entire codebase under Java package structure: src/com/gg/nvl/hub
- Created comprehensive package organization following enterprise conventions
- Added detailed package documentation and structure guides
- Maintained compatibility with existing Vite and TypeScript build system
- Client code organized under com.gg.nvl.hub.client package
- Server services structured under com.gg.nvl.hub.server package
- Shared interfaces and schemas in com.gg.nvl.hub.shared package
- Complete documentation in com.gg.nvl.hub.docs package
- Created comprehensive production deployment guide with Replit and self-hosted options
- Added deployment checklist for step-by-step production verification
- Enhanced project organization for scalability and team collaboration

**July 31, 2025 - Fixed SCR Node Detection in Chat System**
- Fixed node counting logic in non-AI chat service to properly detect SCR nodes
- Enhanced source detection to handle various tqName patterns (SCR_yy, PAExchange_mb, etc.)
- Added comprehensive source code mapping for all thread types
- Chat now correctly identifies and counts nodes by both type (HH, CF, TX) and source (SCR, CPT, TMC)
- Fixed node description responses to show accurate source information
- Enhanced error messages to show available node types and sources when search fails
- System now properly responds "Found X SCR nodes" when querying for SCR nodes

**July 31, 2025 - Sample Data Update: STC to SCR**
- Updated all sample data references from "STC" to "SCR" throughout the entire codebase
- Changed schema.ts: TQName examples now use "SCR_yy.SCR_yy" instead of "STC_yy.STC_yy"
- Updated server/storage.ts: Thread sample data changed from STC Thread to SCR Thread
- Fixed frontend display: Knowledge base and source pages now show "SCR - Source Code Repository"
- Updated server routes: Mock work items now use SCR_yy.SCR_yy qName pattern
- Changed GraphQL service: All mock data now uses SCR instead of STC
- Updated non-AI chat service: Random source selection uses SCR instead of STC
- Fixed documentation: All guides and changelogs now reference SCR consistently
- System now uses proper SCR terminology matching the actual source naming convention
- Complete consistency achieved: SCR, CPT, SLC, TMC, CAS, NVL throughout all files

## Recent Changes (Latest)

**July 29, 2025 - Configuration Cleanup**
- Removed unused sources configuration from config.yaml and server/config.ts
- Sources are now dynamically generated from JanusGraph qname patterns rather than static configuration
- Cleaned up SourceConfig interface and related unused methods from ConfigManager
- Simplified configuration structure by removing redundant static source definitions

**July 29, 2025 - External API WorkItem Creation Implementation**
- Updated WorkItem creation to call external API endpoints instead of local processing
- Added external.workitems.url configuration to config.yaml for API endpoint management
- Implemented comprehensive error handling for external API failures with user-friendly messages
- WorkItem creation now requires external API endpoint configuration (shows helpful error when not configured)
- Added proper SSL certificate handling and HTTP method support for external APIs
- Enhanced error reporting to show specific external API response details to users
- Maintained backward compatibility with existing WorkItem structure and WebSocket notifications
- Created comprehensive documentation for external API integration requirements
- Quick Actions panel includes: Create WorkItem (external), Refresh Data, Run Diagnostic, View Logs, Export Report

**July 29, 2025 - Thread Structure Implementation with QName-Based Node Retrieval**
- Updated Sources of Truth to return actual thread nodes in complex nested structure format
- Sources API (/api/sources) now retrieves vertex data using qname patterns and transforms to thread structure
- Each source returns threads array with navrelNodeKey, componentNode, threadQuery, and full node metadata
- Thread nodes include proper navrelNodeKey format: "pattern.NodeClass@nrid@uuid" structure
- ComponentNode arrays contain nested node objects with endpointId, nodeClass, nodeName, searchString
- ThreadQuery objects properly structured with threadCompositionQName and node metadata
- Dashboard stats API (/api/dashboard/stats) calculates metrics from qname-filtered vertex counts across all sources
- Transactions API (/api/transactions) retrieves transaction data from JanusGraph with filtering support
- Threads API (/api/threads) queries thread data from JanusGraph with tqName filtering
- Bulletins API (/api/bulletins) fetches bulletin data from JanusGraph with priority/category filtering
- Implemented graceful fallback to memory storage only when JanusGraph has no data available
- Enhanced TinkerPop Gremlin driver configuration for user's TinkerPop server hosting JanusGraph at 10.21.23.105:43563
- Added comprehensive connection troubleshooting with alternative URLs, protocols, and mime types
- Updated config.yaml to use user's actual JanusGraph server URL (10.21.23.105:43563)
- Fixed SSL certificate verification bypass for external API calls using Node.js HTTPS agent
- External API configuration now uses empty URLs to prevent connection attempts to non-existent endpoints
- Chat messages remain stored in memory only (never written to JanusGraph per user requirements)
- System successfully returns simulated JanusGraph data when real connection unavailable

**July 29, 2025 - Real JanusGraph Database Connection Implementation**
- Installed gremlin package and @types/gremlin for real database connectivity
- Updated JanusGraphService to support real Gremlin connections alongside simulation mode
- Added automatic fallback mechanism: attempts real connection, falls back to simulation if unavailable
- Enhanced connection configuration with proper ES module imports and TypeScript compatibility
- Updated config.yaml to enable real connections with useRemote: true by default
- Added connection mode detection: real, simulation_fallback, simulation, or error states
- Enhanced health endpoints to show connection mode and real connection status
- Created comprehensive REAL_JANUSGRAPH_SETUP.md guide for setting up actual JanusGraph servers
- Implemented real Gremlin query execution with safety fallbacks for complex queries
- Added proper connection lifecycle management with cleanup on disconnect

**July 29, 2025 - Complete NODE_ENV Removal**
- Removed all remaining NODE_ENV references throughout entire codebase
- Updated DEBUG_GUIDE.md to use configManager.getAppConfig().environment instead of process.env.NODE_ENV
- Cleaned up PRODUCTION_DEPLOYMENT_GUIDE.md to remove NODE_ENV from environment examples  
- Updated README.md to indicate NODE_ENV is controlled by config.yaml
- Modified SETUP_GUIDE_INTELLIJ.md to remove NODE_ENV from environment setup
- Ensured all documentation consistently references config.yaml app.environment property
- Application now fully uses config.yaml for environment control with no NODE_ENV dependencies

**July 28, 2025 - Enhanced Gremlin Visualizer with One-Click Exploration**
- Created comprehensive Gremlin visualizer interface for each Source of Truth
- Built interactive node relationship visualization showing one level up and down connections
- Added dynamic source selection and node ID input with real-time graph generation
- Implemented simulated Gremlin traversal with realistic graph data based on source types
- Created API endpoint /api/gremlin/visualize/:sourceCode/:nodeId for graph data retrieval
- Added visual indicators for different node types and relationship levels (up/center/down)
- Enhanced sidebar navigation with Gremlin Visualizer menu item using GitBranch icon
- Built comprehensive graph data display with node properties, edges, and relationship summaries
- Implemented source-specific node typing (SCR_mb, PAExchange_mb, TeamcenterEbomPart_mb, etc.)
- Added responsive card-based layout with color-coded node levels and relationship visualization
- One-click depth exploration - click any parent or child node to navigate to its graph view
- Properties popup dialog - click "+more" to view all node properties in detailed popup
- Visual node connections with arrows showing parent-to-center-to-child relationships
- Exploration history tracking with breadcrumb navigation and one-click history navigation
- Interactive node hover effects with scaling, shadows, and cursor pointer for clickable nodes
- Enhanced user experience with exploration hints, clickable visual cues, and seamless graph traversal

**July 24, 2025 - Complete Config.yaml Migration & NODE_ENV Removal**
- Migrated entire system from environment variables to config.yaml-based configuration
- Removed ALL NODE_ENV references throughout application in favor of config.yaml app.environment
- Updated all services to use centralized ConfigManager
- Enhanced app.environment in config.yaml to support environment variable interpolation
- Added external services configuration section for API endpoints
- Updated database configuration to use config.yaml with proper fallback
- All server services now consistently use ConfigManager for environment-agnostic configuration
- Added SSL insecure support for external APIs with certificate verification bypass

**July 24, 2025 - Government-Level Knowledge Retention System**
- Implemented secure knowledge retention system for confidential environments
- Added comprehensive PostgreSQL-based knowledge storage with categories, priorities, tags, and audit trails
- Created government-compliant data classification system
- Built automated knowledge extraction from chat interactions with security classification
- Added knowledge search, statistics, and access audit capabilities for compliance reporting
- Implemented retention policies for data lifecycle management
- Enhanced with specialized node relationship detection and storage for similarity analysis
- Added automatic capture of attribute matching patterns and correlation discoveries

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

**December 22, 2025 - IDE Documentation Suite**
- Created complete setup guides for VS Code, IntelliJ IDEA, and Eclipse IDEs
- Implemented advanced VS Code debugging with specialized debug configurations
- Developed comprehensive README with multi-IDE command references
- Added professional debugging workflow with launch.json configurations

## System Architecture

### Package Organization
The system follows Java package naming conventions:
- **com.gg.nvl.hub.client** - Frontend React application layer
- **com.gg.nvl.hub.server** - Backend Express.js services layer
- **com.gg.nvl.hub.shared** - Common interfaces and schemas
- **com.gg.nvl.hub.docs** - Project documentation and guides
- **com.gg.nvl.hub.assets** - Static resources and attachments

### Frontend Architecture (com.gg.nvl.hub.client)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling
- **Component Library**: Custom shadcn/ui components based on Radix primitives
- **Real-time Updates**: WebSocket connection for live data updates

### Backend Architecture (com.gg.nvl.hub.server)
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support
- **Middleware**: Request logging, JSON parsing, error handling
- **Build System**: Vite for frontend bundling, esbuild for backend compilation

### Data Storage Solutions
- **Hybrid Storage Architecture**: JanusGraph for read-only data queries + Memory storage for application data
- **JanusGraph**: Read-only access for node queries, relationships, and similarity analysis (real or simulation mode)
- **Memory Storage**: All chat messages, integration dashboard data, sources, transactions, bulletins, threads
- **Graph Database**: JanusGraph integration with Gremlin query support for data exploration
- **Chat Storage**: Chat messages never stored in JanusGraph - only in memory for session management
- **ORM**: Drizzle ORM available for PostgreSQL integration when needed
- **Session Storage**: In-memory session management with automatic cleanup
- **Storage Factory**: Automatic hybrid mode selection when JanusGraph is configured

## Key Components

### Sources of Truth Management
The system monitors six main Sources of Truth, each containing multiple threads that cluster related data nodes:
- **SCR (Source Code Repository)**: Source managing system operations through cache management, system records, and data repository threads
- **Capital (Capital Management Tool)**: Source managing configuration operations through file management, settings, and policy threads
- **Slicwave (Slicwave)**: Source managing service operations through orchestration, endpoint, and coordination threads
- **Teamcenter (Teamcenter)**: Source managing transaction operations through processing, monitoring, and audit threads
- **CAAS (CAAS)**: Source managing authentication operations through credential, permission, and token threads
- **Navrel (Navrel)**: Source managing network operations through validation, connectivity, and monitoring threads

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