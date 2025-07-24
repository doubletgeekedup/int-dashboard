# Integration Dashboard System

## Overview

This is a full-stack web application designed to monitor and manage multiple "Sources of Truth" (data integration points) in an enterprise environment. The system provides real-time monitoring, performance analytics, bulletins management, and AI-powered insights through an LLM chat interface.

All configurations are now managed through YAML files for easy deployment and environment management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest)

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
4. **Knowledge Base**: Documentation and troubleshooting resources
5. **LLM Chat**: AI-powered analysis and insights using OpenAI GPT-4o
6. **Transaction Tracking**: Real-time transaction monitoring and logging

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