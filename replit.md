# Integration Dashboard System

## Overview

This is a full-stack web application designed to monitor and manage multiple "Sources of Truth" (data integration points) in an enterprise environment. The system provides real-time monitoring, performance analytics, bulletins management, and AI-powered insights through an LLM chat interface.

All configurations are now managed through YAML files for easy deployment and environment management.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (Latest)

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
The system monitors six main integration sources:
- **STC (System Truth Cache)**: Primary data repository and caching layer
- **CPT (Configuration Processing Tool)**: Configuration management system
- **SLC (Service Layer Coordinator)**: Service orchestration layer
- **TMC (Transaction Management Center)**: Transaction monitoring system
- **CAS (Central Authentication Service)**: Authentication management
- **NVL (Network Validation Layer)**: Network validation and monitoring

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