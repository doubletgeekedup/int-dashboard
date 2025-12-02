# Integration Dashboard System

## Overview
This full-stack web application monitors and manages enterprise "Sources of Truth" (data integration points). It provides real-time monitoring, performance analytics, bulletins management, and AI-powered insights via an LLM chat interface. The system ensures government-level knowledge retention with intelligent node relationship detection, automatically capturing information and attribute matching patterns with high similarity detection. All data is stored locally for security compliance with comprehensive audit trails, and configurations are managed via YAML files and environment variables for easy deployment.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with Tailwind CSS styling, custom shadcn/ui components
- **Real-time Updates**: WebSocket connection for live data updates
- **UI/UX Decisions**: Custom brand theme implementation using specified colors (#fee1c2, #caae8f, #694628, #fcb567, #27150c) applied to all components, including buttons, navigation, and dashboard statistics cards. Features include responsive card-based layouts, color-coded node levels, interactive hover effects, and one-click depth exploration in the Gremlin Visualizer.

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with WebSocket support
- **Middleware**: Request logging, JSON parsing, error handling
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Configuration Management**: Entire system migrated from environment variables to `config.yaml` for centralized configuration using a `ConfigManager`. This includes external services, database configurations, and environment control, removing `NODE_ENV` dependencies.

### Data Storage Solutions
- **Hybrid Storage Architecture**: JanusGraph for read-only data queries and relationships, combined with in-memory storage for application data.
- **JanusGraph**: Used for node queries, relationships, and similarity analysis, with real or simulation modes and automatic fallback. Supports Gremlin queries and GraphQL integration.
- **JanusGraph Property Naming**: Property names are case-sensitive. Use constants from `JANUSGRAPH_PROPERTIES` in `server/services/janusgraph.ts` when building Gremlin queries to ensure correct property names (e.g., `PRIMARY_ID` = 'nodeId', not 'nodeid' or 'endpointId').
- **Memory Storage**: Stores chat messages (never in JanusGraph), integration dashboard data, sources, transactions, and bulletins.
- **ORM**: Drizzle ORM available for PostgreSQL integration.
- **Session Storage**: In-memory session management.
- **Storage Factory**: Supports GraphQL, PostgreSQL, and in-memory options, with priority given to JanusGraph GraphQL.

### Key Components & Features
- **Sources of Truth Management**: Monitors six main sources (SCR, Capital, Slicwave, Teamcenter, CAAS, Navrel), each with threads clustering related data nodes.
- **Core Features**: Dashboard (real-time metrics), Source Monitoring (detailed analytics), Bulletins System, Knowledge Base, LLM Chat (AI-powered analysis with environment control), Transaction Tracking, Knowledge Retention (secure local data storage with audit trails), Node Relationship Detection (automatic capture of data correlations), Pattern Recognition (90% similarity detection).
- **AI Chat System**: Environment-controlled, supporting dual modes (AI/non-AI). Non-AI mode includes node counting, descriptions, and system status. AI integration uses OpenAI GPT-4o for context-aware responses and structured analysis.
- **Similarity Analysis & Impact Assessment**: Comprehensive service for cross-source analysis, node similarity detection, and impact assessment using multi-factor algorithms. Includes severity-based impact scoring and actionable recommendations. Integrated into the chat interface.
- **External Work Items Integration**: Supports external API calls for WorkItem creation and fetching list items, with error handling and fallback to mock data.
- **Configurable ASOT Work List URLs**: Source-specific ASOT Work List URLs configured in config.yaml for GTS, PAExchange, TeamCenter, and SCR sources, enabling independent external API endpoints per source.
- **Gremlin Visualizer**: Interactive visualization of node relationships for each Source of Truth, allowing one-click exploration and property viewing.

## External Dependencies

### Core Technologies
- **Database**: PostgreSQL (Neon serverless)
- **Graph Database**: JanusGraph with Gremlin query language and GraphQL support
- **AI Service**: OpenAI API (GPT-4o model)
- **Session Store**: `connect-pg-simple` for PostgreSQL

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