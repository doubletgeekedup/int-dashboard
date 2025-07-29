# Integration Dashboard - Eclipse IDE Setup Guide

## Overview
This guide will help you set up the Integration Dashboard project in Eclipse IDE. The project is a full-stack TypeScript application with React frontend, Express.js backend, PostgreSQL database, and JanusGraph integration.

## Prerequisites

### Required Software
1. **Eclipse IDE for Enterprise Java and Web Developers** (2023-12 or later)
2. **Node.js 20+** - Download from [nodejs.org](https://nodejs.org/)
3. **PostgreSQL** - Download from [postgresql.org](https://www.postgresql.org/downloads/)
4. **Git** - Download from [git-scm.com](https://git-scm.com/)

### Required Eclipse Plugins
Install these plugins through **Help → Eclipse Marketplace**:

#### Essential Plugins
- **Wild Web Developer** - For TypeScript, React, and modern web development
- **Node.js Development Tools** - For Node.js project support
- **Angular, React and Vue Tools** - Enhanced React development support
- **JSON Editor Plugin** - For JSON configuration files
- **YAML Editor** - For YAML configuration files

#### Database Plugins
- **DBeaver** - Universal database tool (or use Eclipse Data Tools Platform)
- **Eclipse Data Tools Platform** - Built-in database connectivity

#### Optional but Recommended
- **Prettier - Code formatter** - Code formatting
- **ESLint** - JavaScript/TypeScript linting
- **GitLab/GitHub Integration** - Version control enhancements

## Step 1: Project Setup

### 1.1 Create New Project
1. Open Eclipse IDE
2. Go to **File → New → Other**
3. Select **General → Project** (or **Web → Static Web Project** if available)
4. Set project name: `integration-dashboard`
5. Choose your desired workspace location
6. Click **Finish**

### 1.2 Configure Project as Node.js Project
1. Right-click on your project in Project Explorer
2. Go to **Configure → Convert to Node.js Project** (if available)
3. If not available, continue with manual setup below

### 1.3 Initialize Node.js Project
1. Open **Window → Show View → Terminal** (or **Other → Terminal → Terminal**)
2. Navigate to your project directory
3. Run the following commands:

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
npm install -D @types/connect-pg-simple esbuild tailwindcss-animate
```

## Step 2: Project Structure

### 2.1 Create Directory Structure
Right-click on your project and create the following folder structure:

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
├── node_modules/ (auto-generated)
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

To create folders in Eclipse:
1. Right-click on project → **New → Folder**
2. Enter folder name
3. Click **Finish**

## Step 3: Configuration Files

### 3.1 package.json Scripts
Create or update your `package.json` with these scripts:

```json
{
  "name": "integration-dashboard",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "build:server": "esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/server.js --external:@neondatabase/serverless",
    "start": "node dist/server.js",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate"
  },
  "dependencies": {
    "express": "^4.18.2",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### 3.2 tsconfig.json
Create `tsconfig.json` in project root:

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

## Step 4: Eclipse Configuration

### 4.1 Configure TypeScript Support
1. Go to **Window → Preferences**
2. Navigate to **Web → TypeScript**
3. Enable **Use TypeScript builder**
4. Set **TypeScript version** to use project's version
5. Click **Apply and Close**

### 4.2 Configure Node.js
1. Go to **Window → Preferences**
2. Navigate to **JavaScript → Include Path**
3. Add Node.js libraries if available
4. For Node.js execution, you'll primarily use Terminal

### 4.3 Configure Web Development
1. Go to **Window → Preferences**
2. Navigate to **Web → HTML Files → Editor**
3. Configure indentation and formatting preferences
4. Navigate to **Web → CSS Files → Editor**
5. Configure CSS/SCSS preferences

### 4.4 Setup Build Path
1. Right-click project → **Properties**
2. Go to **JavaScript → Include Path**
3. Add source folders: `client/src`, `server`, `shared`
4. Configure output folders appropriately

## Step 5: Database Setup

### 5.1 PostgreSQL Configuration
1. Install PostgreSQL and create database:
```sql
CREATE DATABASE integration_dashboard;
CREATE USER dashboard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE integration_dashboard TO dashboard_user;
```

### 5.2 Eclipse Database Connection
1. Open **Window → Show View → Other**
2. Select **Data Management → Data Source Explorer**
3. Right-click **Database Connections** → **New**
4. Select **PostgreSQL** → **Next**
5. Enter connection details:
   - Host: localhost
   - Port: 5432
   - Database: integration_dashboard
   - Username: dashboard_user
   - Password: your_password
6. Test connection and finish

### 5.3 Drizzle Configuration
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

## Step 6: Environment Variables

### 6.1 Create Environment File
Create `.env` file in project root:
```env
DATABASE_URL=postgresql://dashboard_user:your_password@localhost:5432/integration_dashboard
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

### 6.2 Eclipse Environment Variables
For run configurations:
1. Go to **Run → Run Configurations**
2. Create new **Node.js Application** (if available) or use **External Tools**
3. Set environment variables in **Environment** tab

## Step 7: Run Configurations

### 7.1 Development Server Configuration
1. Go to **Run → External Tools → External Tools Configurations**
2. Create new **Program** configuration
3. Set:
   - **Name**: "Development Server"
   - **Location**: Path to npm (e.g., `/usr/local/bin/npm` or `C:\Program Files\nodejs\npm.cmd`)
   - **Working Directory**: `${workspace_loc:/integration-dashboard}`
   - **Arguments**: `run dev`

### 7.2 Build Configuration
1. Create another **External Tools Configuration**
2. Set:
   - **Name**: "Build Project"
   - **Location**: Path to npm
   - **Working Directory**: `${workspace_loc:/integration-dashboard}`
   - **Arguments**: `run build`

### 7.3 Alternative: Terminal-based Development
Use Eclipse's integrated terminal:
1. **Window → Show View → Other → Terminal → Terminal**
2. Click **Open a Terminal** button
3. Select **Local Terminal**
4. Navigate to project directory and run commands:
   ```bash
   npm run dev
   npm run build
   ```

## Step 8: File Creation and Code Organization

### 8.1 Create Key Files
Create these essential files by right-clicking appropriate folders → **New → File**:

#### Frontend Files (client/src/)
- `App.tsx` - Main application component
- `main.tsx` - React entry point
- `index.css` - Global styles
- Components in `components/ui/` and `components/layout/`
- Page components in `pages/`
- Utility functions in `lib/`
- Custom hooks in `hooks/`

#### Backend Files (server/)
- `index.ts` - Express server entry point
- `routes.ts` - API route definitions
- `config.ts` - Configuration management
- Service files in `services/`

#### Shared Files
- `shared/schema.ts` - Database schema and types

### 8.2 Code Templates
Create Eclipse templates for common patterns:
1. Go to **Window → Preferences → Web → TypeScript → Templates**
2. Create templates for:
   - React functional components
   - Express route handlers
   - TypeScript interfaces

## Step 9: Development Workflow

### 9.1 Project Import (Alternative Setup)
If you have the source code from another location:
1. **File → Import → General → Existing Projects into Workspace**
2. Select your project directory
3. Import the project
4. Run `npm install` in terminal

### 9.2 File Editing
- Use Eclipse's built-in editors for TypeScript/JavaScript files
- Enable **Show Line Numbers**: **Window → Preferences → General → Editors → Text Editors**
- Configure **Content Assist** for better autocomplete

### 9.3 Version Control
1. Right-click project → **Team → Share Project**
2. Select **Git** → **Use or create repository in parent folder**
3. Create `.gitignore`:
```
node_modules/
dist/
.env
*.log
.DS_Store
.metadata/
.recommenders/
```

## Step 10: Debugging and Testing

### 10.1 Browser-based Debugging
- Start development server (`npm run dev`)
- Open browser to `http://localhost:5000`
- Use browser DevTools for frontend debugging

### 10.2 Server-side Debugging
- Add console.log statements in server code
- Use Eclipse console to view server logs
- For advanced debugging, consider using external Node.js debugger

### 10.3 Database Debugging
- Use Eclipse's Data Source Explorer to run queries
- View database tables and data directly in Eclipse

## Step 11: Building and Deployment

### 11.1 Production Build
1. Run build configuration or use terminal:
   ```bash
   npm run build
   ```
2. Files will be generated in `dist/` directory

### 11.2 Production Server
```bash
npm start
```

## Step 12: Troubleshooting

### Common Issues and Solutions

#### TypeScript/JavaScript Issues
- **Problem**: Syntax highlighting not working
- **Solution**: Install Wild Web Developer plugin, configure TypeScript settings

#### Node.js Issues  
- **Problem**: npm commands not recognized
- **Solution**: Add Node.js path to Eclipse environment variables

#### Build Issues
- **Problem**: Module resolution errors
- **Solution**: Check tsconfig.json paths, ensure all dependencies installed

#### Database Connection Issues
- **Problem**: Cannot connect to PostgreSQL
- **Solution**: Verify PostgreSQL service running, check connection credentials

### Performance Optimization
- **Increase Eclipse memory**: Edit `eclipse.ini`, increase `-Xmx` value
- **Disable unnecessary validators**: **Project Properties → Validation**
- **Configure project facets**: **Project Properties → Project Facets**

### Useful Eclipse Shortcuts
- **Ctrl+Shift+R**: Open Resource (quick file search)
- **Ctrl+Space**: Content Assist (autocomplete)
- **Ctrl+Shift+F**: Format code
- **Ctrl+Shift+O**: Organize imports
- **F3**: Open declaration
- **Ctrl+1**: Quick Fix

## Step 13: Advanced Configuration

### 13.1 Code Formatting
1. **Window → Preferences → Web → TypeScript → Code Style**
2. Import or configure formatting rules
3. Enable **Format on save**

### 13.2 Error Reporting
- Configure Eclipse error markers
- Set up problem filters for known issues
- Use **Problems** view to track issues

### 13.3 Team Development
- Configure Git preferences
- Set up code review workflows
- Share Eclipse project settings via version control

This comprehensive guide will help you set up the Integration Dashboard project in Eclipse IDE with full TypeScript, React, and Node.js support. The setup emphasizes using Eclipse's built-in capabilities while leveraging external tools where necessary for optimal development experience.