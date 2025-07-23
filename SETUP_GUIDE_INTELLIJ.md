# Integration Dashboard - IntelliJ IDEA Setup Guide

## Overview
This guide will help you set up the Integration Dashboard project in IntelliJ IDEA. The project is a full-stack TypeScript application with React frontend, Express.js backend, PostgreSQL database, and JanusGraph integration.

## Prerequisites

### Required Software
1. **IntelliJ IDEA Ultimate** (recommended) or Community Edition
2. **Node.js 20+** - Download from [nodejs.org](https://nodejs.org/)
3. **PostgreSQL** - Download from [postgresql.org](https://www.postgresql.org/downloads/)
4. **Git** - Download from [git-scm.com](https://git-scm.com/)

### Required IntelliJ Plugins
- **JavaScript and TypeScript** (built-in)
- **Node.js** (built-in)
- **Database Tools and SQL** (built-in in Ultimate)
- **Tailwind CSS** (optional but recommended)

## Step 1: Project Setup

### 1.1 Create New Project
1. Open IntelliJ IDEA
2. Click **"New Project"**
3. Select **"Empty Project"**
4. Set project name: `integration-dashboard`
5. Choose your desired location
6. Click **"Create"**

### 1.2 Initialize Node.js Project
1. Open Terminal in IntelliJ (Alt+F12 or View → Tool Windows → Terminal)
2. Run the following commands:

```bash
# Initialize npm project
npm init -y

# Install core dependencies
npm install express tsx typescript @types/node @types/express
npm install react react-dom @types/react @types/react-dom
npm install vite @vitejs/plugin-react
npm install wouter @tanstack/react-query
npm install drizzle-orm drizzle-kit @neondatabase/serverless
npm install openai ws @types/ws
npm install express-session @types/express-session
npm install tailwindcss postcss autoprefixer
npm install @tailwindcss/vite @tailwindcss/typography
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install zod drizzle-zod
npm install @hookform/resolvers react-hook-form
npm install js-yaml @types/js-yaml

# Install Radix UI components
npm install @radix-ui/react-slot @radix-ui/react-toast @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu @radix-ui/react-separator
npm install @radix-ui/react-tabs @radix-ui/react-label @radix-ui/react-button
npm install @radix-ui/react-input @radix-ui/react-badge @radix-ui/react-progress
npm install @radix-ui/react-avatar @radix-ui/react-tooltip
npm install @radix-ui/react-select @radix-ui/react-textarea

# Install additional dependencies
npm install recharts cmdk date-fns framer-motion
npm install next-themes use-debounce nanoid
npm install gremlin connect-pg-simple memorystore
npm install passport passport-local @types/passport @types/passport-local

# Development dependencies
npm install -D @types/connect-pg-simple esbuild
```

## Step 2: Project Structure

### 2.1 Create Directory Structure
Create the following folder structure in your project root:

```
project-root/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   └── layout/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── index.html
├── server/
│   ├── services/
│   ├── index.ts
│   ├── routes.ts
│   ├── storage.ts
│   ├── vite.ts
│   └── config.ts
├── shared/
│   └── schema.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── drizzle.config.ts
├── components.json
├── config.yaml
└── replit.md
```

## Step 3: Configuration Files

### 3.1 package.json Scripts
Update your package.json scripts section:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/server.js --external:@neondatabase/serverless",
    "start": "node dist/server.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  }
}
```

### 3.2 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./client/src/*"],
      "@assets/*": ["./client/src/assets/*"],
      "@shared/*": ["./shared/*"]
    }
  },
  "include": ["client/src", "server", "shared"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 3.3 vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './client/src/assets'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: 'dist/client',
  },
  server: {
    port: 5173,
  },
})
```

### 3.4 tailwind.config.ts
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './client/src/**/*.{ts,tsx}',
    './client/index.html',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### 3.5 config.yaml
```yaml
# Integration Dashboard Configuration

# OpenAI Configuration
openai:
  apiKey: "${OPENAI_API_KEY}"
  model: "gpt-4o"
  maxTokens: 4000
  temperature: 0.7

# JanusGraph Configuration
janusgraph:
  host: "localhost"
  port: 8182
  path: "/gremlin"
  protocol: "ws"
  
# Application Configuration
app:
  port: 5000
  environment: "development"
```

## Step 4: Database Setup

### 4.1 PostgreSQL Setup
1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE integration_dashboard;
CREATE USER dashboard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE integration_dashboard TO dashboard_user;
```

2. Set environment variable in IntelliJ:
   - Go to **Run → Edit Configurations**
   - Add environment variable: `DATABASE_URL=postgresql://dashboard_user:your_password@localhost:5432/integration_dashboard`

### 4.2 Drizzle Configuration
Create `drizzle.config.ts`:
```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## Step 5: Environment Variables

Create a `.env` file in your project root:
```env
DATABASE_URL=postgresql://dashboard_user:your_password@localhost:5432/integration_dashboard
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

## Step 6: IntelliJ Configuration

### 6.1 Configure Node.js
1. Go to **File → Settings** (Ctrl+Alt+S)
2. Navigate to **Languages & Frameworks → Node.js**
3. Set **Node interpreter** to your Node.js installation
4. Set **Package manager** to npm

### 6.2 Configure TypeScript
1. Go to **File → Settings** (Ctrl+Alt+S)
2. Navigate to **Languages & Frameworks → TypeScript**
3. Enable **TypeScript Language Service**
4. Set **TypeScript** to your project's typescript version

### 6.3 Configure Database
1. Go to **View → Tool Windows → Database**
2. Click **+** → **Data Source** → **PostgreSQL**
3. Enter your database credentials
4. Test connection and apply

### 6.4 Create Run Configurations

#### Development Server Configuration
1. Go to **Run → Edit Configurations**
2. Click **+** → **npm**
3. Set:
   - **Name**: "Development Server"
   - **Command**: "run"
   - **Scripts**: "dev"
   - **Environment variables**: Add your .env variables

#### Build Configuration
1. Go to **Run → Edit Configurations**
2. Click **+** → **npm**
3. Set:
   - **Name**: "Build"
   - **Command**: "run"
   - **Scripts**: "build"

## Step 7: Copy Source Code

You'll need to copy the source code files from the working project. The main files to copy are:

### Core Files
- All files from `client/src/` directory
- All files from `server/` directory  
- All files from `shared/` directory
- `components.json`
- `postcss.config.js`

### Key Components to Implement
1. **Frontend Components** (in `client/src/components/`)
   - UI components (Button, Input, etc.)
   - Layout components (Header, Sidebar)
   - Page components (Dashboard, Source pages)

2. **Backend Services** (in `server/`)
   - Express server setup
   - API routes
   - OpenAI service integration
   - JanusGraph service integration

3. **Database Schema** (in `shared/schema.ts`)
   - Drizzle ORM schema definitions
   - Type definitions

## Step 8: Running the Project

### 8.1 Initial Setup
1. Install dependencies: `npm install`
2. Generate database schema: `npm run db:generate`
3. Run database migrations: `npm run db:migrate`

### 8.2 Development
1. Start the development server using the IntelliJ run configuration or:
   ```bash
   npm run dev
   ```
2. Open browser to `http://localhost:5000`

### 8.3 Building for Production
1. Build the project:
   ```bash
   npm run build
   ```
2. Start production server:
   ```bash
   npm start
   ```

## Step 9: Additional IntelliJ Features

### 9.1 Code Style
1. Go to **File → Settings → Editor → Code Style → TypeScript**
2. Configure indentation, spacing, and formatting preferences

### 9.2 Live Templates
Create useful live templates for React components:
1. Go to **File → Settings → Editor → Live Templates**
2. Create templates for common component patterns

### 9.3 Version Control
1. Go to **VCS → Enable Version Control Integration**
2. Select **Git**
3. Create `.gitignore` file with:
```
node_modules/
dist/
.env
*.log
.DS_Store
```

## Step 10: Debugging

### 10.1 Frontend Debugging
1. Use browser DevTools for React debugging
2. Install React DevTools browser extension

### 10.2 Backend Debugging
1. Set breakpoints in server code
2. Use IntelliJ's Node.js debugger
3. Configure debug run configuration with `--inspect` flag

## Troubleshooting

### Common Issues
1. **Port conflicts**: Change port in vite.config.ts or server config
2. **Database connection**: Verify PostgreSQL is running and credentials are correct
3. **TypeScript errors**: Ensure all types are properly imported
4. **Build errors**: Check all dependencies are installed correctly

### Performance Tips
1. Enable IntelliJ's power save mode for better battery life
2. Increase memory allocation in IntelliJ settings
3. Use incremental builds for faster development

This guide provides a complete setup for recreating your Integration Dashboard project in IntelliJ IDEA. The project structure follows modern full-stack TypeScript patterns with proper separation of concerns between frontend, backend, and shared code.