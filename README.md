# Integration Dashboard System

A comprehensive enterprise integration monitoring system featuring six Division Teams (STC, CPT, SLC, TMC, CAS, NVL) with government-level knowledge retention and intelligent node relationship detection. Each division team contains multiple specialized threads that cluster data nodes by type, providing hierarchical organization with AI-powered analysis, graph database integration, and automatic pattern recognition.

## Features

- **Real-time Monitoring**: Live dashboard with performance metrics and health status
- **AI-Powered Analysis**: OpenAI GPT-4o integration with environment-controlled chat modes
- **Government Knowledge Retention**: Secure local data storage for confidential environments with comprehensive audit trails
- **Node Relationship Detection**: Automatic capture of data correlations like "node xyz is related to dbx" with 90% similarity analysis
- **Attribute Matching Intelligence**: Pattern recognition for attributes with different names but same values
- **Graph Database**: JanusGraph integration for complex relationship mapping and similarity analysis
- **External Work Items**: Integration with external transaction endpoints for real-time work item tracking
- **Transaction Tracking**: Real-time transaction monitoring with detailed modal views
- **Custom Brand Theme**: Professional theme with configurable brand colors
- **Bulletin System**: Centralized announcements and update management
- **Knowledge Base**: Integrated documentation with relationship discovery and pattern storage
- **WebSocket Support**: Live updates without page refresh

## Quick Start

### Prerequisites

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL 15+** - [Optional] [Download here](https://www.postgresql.org/downloads/)

### Option 1: No Database Required (Recommended for Development)

```bash
# Clone the repository
git clone <your-repository-url>
cd integration-dashboard

# Install dependencies
npm install

# Start development server (no setup required!)
npm run dev
```

The application will be available at `http://localhost:5000` with in-memory storage and sample data.

📖 **[Complete No-Database Setup Guide](NO_DATABASE_SETUP.md)**  
🔗 **[External Work Items Integration](EXTERNAL_INTEGRATION_GUIDE.md)**  
🛡️ **[Government Knowledge Retention Guide](KNOWLEDGE_RETENTION_GUIDE.md)**  
🪟 **[Windows Setup Guide](WINDOWS_SETUP.md)**

### Option 2: With PostgreSQL Database

```bash
# Clone the repository
git clone <your-repository-url>
cd integration-dashboard

# Install dependencies
npm install

# Create environment file
# Create .env file with your database configuration

# Push database schema directly (recommended)
npm run db:push

# Start development server
npm run dev
```

## Environment Setup

### No Database Setup (Default)
No environment file required! The application works out of the box.

### Optional Environment Variables
Create a `.env` file for additional features:

```env
# Database Configuration (optional - will use in-memory storage if not provided)
DATABASE_URL=postgresql://username:password@localhost:5432/integration_dashboard

# External Work Items Service (required for real transaction data)
EXTERNAL_LISTITEMS_URL=https://your-external-api.com
EXTERNAL_API_KEY=your_external_api_key_here

# AI Features (required for LLM chat functionality)
OPENAI_API_KEY=your_openai_api_key_here

# AI Chat Control (optional - defaults to false for security)
AI_CHAT_ENABLED=true

# JanusGraph Configuration (optional - for graph database features)
JANUSGRAPH_GRAPHQL_URL=http://localhost:8182/graphql

# Development Settings (optional) - controlled by config.yaml
PORT=5000
HOST=0.0.0.0

# Session Security (optional - defaults provided)
SESSION_SECRET=your_secure_session_secret_minimum_32_characters

# JanusGraph Configuration (optional - simulated by default)
JANUSGRAPH_HOST=localhost
JANUSGRAPH_PORT=8182
JANUSGRAPH_PATH=/gremlin
JANUSGRAPH_PROTOCOL=ws
```

## Storage Options

### In-Memory Storage (Default)
- ✅ No setup required
- ✅ Pre-loaded with sample data
- ✅ Full functionality 
- ⚠️ Data lost on restart

### PostgreSQL Database (Optional)
```bash
# Create database and user
sudo -u postgres psql

# In PostgreSQL console:
CREATE DATABASE integration_dashboard;
CREATE USER dashboard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE integration_dashboard TO dashboard_user;
\q
```

Then add `DATABASE_URL` to your `.env` file.

📖 **[No-Database Setup Guide](NO_DATABASE_SETUP.md)** - Complete instructions for running without PostgreSQL

## IDE Setup Guides

Choose your preferred development environment:

### 🔵 VS Code (Recommended)
**Best for:** TypeScript/React development with excellent debugging support

```bash
# Install recommended extensions automatically
code .
# VS Code will prompt to install recommended extensions
```

📖 **[Complete VS Code Setup Guide](SETUP_GUIDE_VSCODE.md)**
- Pre-configured debugging with 8 specialized debug modes
- Integrated database management with SQLTools
- Thunder Client for API testing
- Advanced TypeScript IntelliSense

### 🟠 IntelliJ IDEA
**Best for:** Enterprise development with powerful refactoring tools

```bash
# Open project in IntelliJ
idea .
# Or File → Open → Select project directory
```

📖 **[Complete IntelliJ Setup Guide](SETUP_GUIDE_INTELLIJ.md)**
- Professional debugging with advanced breakpoint management
- Built-in database tools and SQL console
- Integrated REST client
- Advanced code analysis and refactoring

### 🟣 Eclipse
**Best for:** Java developers familiar with Eclipse ecosystem

```bash
# Import project in Eclipse
# File → Import → General → Existing Projects into Workspace
```

📖 **[Complete Eclipse Setup Guide](SETUP_GUIDE_ECLIPSE.md)**
- Wild Web Developer plugin for modern JavaScript/TypeScript
- Integrated terminal and Git support
- Database development perspective
- Comprehensive debugging tools

## Development Commands

### General Commands
```bash
# Start development server (all IDEs)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run format

# Database operations
npm run db:push        # Push schema changes to database
```

### IDE-Specific Commands

#### VS Code Commands (Ctrl+Shift+P)
```
Tasks: Run Task → Start Development Server
TypeScript: Restart TS Server
SQLTools: Add New Connection
Thunder Client: New Request
```

#### IntelliJ IDEA Commands
```bash
# Run configuration: "Development Server"
# Database: View → Tool Windows → Database
# REST Client: Tools → HTTP Client
# Debug: Run → Debug 'Development Server'
```

#### Eclipse Commands
```bash
# Run As → Node.js Application
# Window → Show View → Database
# Run → Debug As → Node.js Application
# Terminal: Window → Show View → Terminal
```

## Debugging

Each IDE has specialized debugging configurations:

### VS Code Debugging (F5)
- 🚀 **Launch Development Server**: Full-stack debugging
- 🔍 **Debug Current File**: Test individual TypeScript files
- 🧪 **Debug Database Operations**: Database-focused debugging
- 🤖 **Debug OpenAI Integration**: AI feature debugging

📖 **[Complete Debugging Guide](DEBUG_GUIDE.md)**

### IntelliJ/Eclipse Debugging
- Set breakpoints in TypeScript files
- Use "Debug" run configuration
- Inspect variables and call stack
- Step through code execution

## Project Structure

```
integration-dashboard/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and configurations
│   │   └── App.tsx        # Main React component
│   └── index.html         # HTML template
├── server/                # Express.js backend
│   ├── services/          # Business logic services
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database interface
│   └── config.ts          # Configuration management
├── shared/                # Shared TypeScript schemas
│   └── schema.ts          # Database schemas and types
├── .vscode/               # VS Code configuration
│   ├── launch.json        # Debug configurations
│   ├── settings.json      # Workspace settings
│   └── tasks.json         # Task definitions
├── config.yaml           # Application configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── drizzle.config.ts      # Database migration configuration
```

## API Endpoints

The backend provides these REST endpoints:

```
GET    /api/sources                      # List all integration sources
GET    /api/sources/:code                # Get specific source details
GET    /api/dashboard/stats              # Dashboard statistics
GET    /api/transactions                 # Transaction history
GET    /api/chat/messages                # Chat history
POST   /api/chat/messages                # Send chat message
GET    /api/chat/ai-status               # AI system status and configuration
POST   /api/chat/analyze-and-store       # Analyze chat for knowledge retention
GET    /api/bulletins                    # System bulletins
POST   /api/bulletins                    # Create bulletin
GET    /api/janusgraph/health            # Graph database health
GET    /api/knowledge/search             # Search knowledge base
POST   /api/knowledge                    # Store knowledge entry
GET    /api/knowledge/stats              # Knowledge retention statistics
POST   /api/knowledge/node-relationship  # Store node relationship
GET    /api/knowledge/node-relationships # Search node relationships
```

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Wouter** for client-side routing
- **TanStack Query** for server state management
- **Radix UI** component library
- **Tailwind CSS** for styling
- **Recharts** for data visualization

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **Drizzle ORM** for database operations
- **PostgreSQL** with Neon serverless
- **WebSocket** for real-time updates

### External Services
- **OpenAI GPT-4o** for AI analysis
- **JanusGraph** for graph database operations

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process using port 5000
npx kill-port 5000

# Or use different port
PORT=3001 npm run dev
```

### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Verify connection
psql -h localhost -U dashboard_user -d integration_dashboard
```

### TypeScript Compilation Errors
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for errors
npm run type-check
```

### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Use Node Version Manager (recommended)
nvm install 20
nvm use 20
```

## Testing

### API Testing
Use the built-in API testing tools in your IDE:

#### VS Code: Thunder Client
1. Install Thunder Client extension
2. Create new request collection
3. Test endpoints: `GET http://localhost:5000/api/sources`

#### IntelliJ: HTTP Client
1. Tools → HTTP Client → Create Request
2. Create `.http` files in project
3. Execute requests directly in IDE

#### Eclipse: REST Client
1. Install REST Client plugin
2. Use built-in HTTP request editor
3. Test API endpoints interactively

### Manual Testing
```bash
# Test API endpoints
curl http://localhost:5000/api/sources
curl http://localhost:5000/api/dashboard/stats

# Test WebSocket connection
wscat -c ws://localhost:5000/ws
```

## Deployment

For production deployment, see the **[Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)** which includes:

- Replit reference removal for confidentiality
- Docker configuration
- Security hardening
- Environment variable management
- Build and deployment scripts

### Quick Production Build
```bash
# Build for production
npm run build

# Start production server
npm start
```

## Development Workflow

### Starting Development
1. Choose your IDE setup guide above
2. Follow the IDE-specific configuration
3. Use `npm run dev` to start development server
4. Open browser to `http://localhost:5000`

### Making Changes
1. Frontend changes: Edit files in `client/src/`
2. Backend changes: Edit files in `server/`
3. Database changes: Update `shared/schema.ts` and run `npm run db:generate`
4. Hot reloading automatically updates the browser

### Debugging Issues
1. Use IDE-specific debugging configurations
2. Check browser console for frontend errors
3. Check terminal output for backend errors
4. Use database tools in your IDE for data inspection

## Contributing

1. Follow the IDE setup guide for your preferred environment
2. Use the debugging configurations for thorough testing
3. Run `npm run type-check` and `npm run lint` before committing
4. Test all API endpoints using your IDE's REST client

## Support

- **VS Code Users**: See [VS Code Setup Guide](SETUP_GUIDE_VSCODE.md)
- **IntelliJ Users**: See [IntelliJ Setup Guide](SETUP_GUIDE_INTELLIJ.md)  
- **Eclipse Users**: See [Eclipse Setup Guide](SETUP_GUIDE_ECLIPSE.md)
- **Debugging**: See [Debug Guide](DEBUG_GUIDE.md)
- **Knowledge Retention**: See [Government Knowledge Retention Guide](KNOWLEDGE_RETENTION_GUIDE.md)
- **Production**: See [Production Deployment Guide](PRODUCTION_DEPLOYMENT_GUIDE.md)

## License

PROPRIETARY - Internal Use Only