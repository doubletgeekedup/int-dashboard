# Integration Dashboard - VS Code Setup Guide

## Overview
This guide will help you set up the Integration Dashboard project in Visual Studio Code. The project is a full-stack TypeScript application with React frontend, Express.js backend, PostgreSQL database, and JanusGraph integration.

## Prerequisites

### Required Software
1. **Visual Studio Code** - Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. **Node.js 20+** - Download from [nodejs.org](https://nodejs.org/)
3. **PostgreSQL** - Download from [postgresql.org](https://www.postgresql.org/downloads/)
4. **Git** - Download from [git-scm.com](https://git-scm.com/)

### Essential VS Code Extensions
Install these extensions through **Extensions** view (Ctrl+Shift+X):

#### Core Development Extensions
- **TypeScript and JavaScript Language Features** (built-in)
- **ES7+ React/Redux/React-Native snippets** - Code snippets for React
- **Auto Rename Tag** - Automatically rename paired HTML/JSX tags
- **Bracket Pair Colorizer 2** - Colorize matching brackets
- **Indent-Rainbow** - Colorize indentation for better readability

#### React and Frontend Extensions
- **Simple React Snippets** - React code snippets
- **Reactjs code snippets** - Additional React snippets
- **CSS Peek** - Navigate to CSS definitions
- **HTML CSS Support** - CSS class name completion
- **Auto Close Tag** - Automatically close HTML/JSX tags

#### TypeScript and Node.js Extensions
- **TypeScript Hero** - Additional TypeScript functionality
- **Node.js Extension Pack** - Complete Node.js development support
- **npm Intellisense** - npm module import autocomplete
- **Path Intellisense** - File path autocomplete

#### Database Extensions
- **PostgreSQL** - PostgreSQL support and syntax highlighting
- **SQLTools** - Database management and query execution
- **SQLTools PostgreSQL/Cockroach Driver** - PostgreSQL connection driver

#### Code Quality Extensions
- **ESLint** - JavaScript/TypeScript linting
- **Prettier - Code formatter** - Code formatting
- **Error Lens** - Inline error highlighting
- **Code Spell Checker** - Spell checking for code

#### Utility Extensions
- **GitLens** - Enhanced Git capabilities
- **Live Share** - Real-time collaborative editing
- **REST Client** - Test HTTP/REST services
- **Thunder Client** - Lightweight REST API client
- **YAML** - YAML language support

#### Tailwind CSS Extensions
- **Tailwind CSS IntelliSense** - Tailwind class name completion
- **Headwind** - Tailwind class sorting

## Step 1: Project Setup

### 1.1 Create New Project
1. Open VS Code
2. Open **Terminal** (Ctrl+` or Terminal → New Terminal)
3. Create project directory:
```bash
mkdir integration-dashboard
cd integration-dashboard
```

### 1.2 Initialize Git Repository
```bash
git init
```

### 1.3 Initialize Node.js Project
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
npm install @radix-ui/react-tabs @radix-ui/react-label @radix-ui/react-input
npm install @radix-ui/react-badge @radix-ui/react-progress @radix-ui/react-avatar
npm install @radix-ui/react-tooltip @radix-ui/react-select @radix-ui/react-textarea

# Install additional dependencies
npm install recharts cmdk date-fns framer-motion
npm install next-themes use-debounce nanoid
npm install gremlin connect-pg-simple memorystore
npm install passport passport-local @types/passport @types/passport-local

# Development dependencies
npm install -D @types/connect-pg-simple esbuild tailwindcss-animate
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install -D prettier eslint-config-prettier eslint-plugin-prettier
```

## Step 2: Project Structure

### 2.1 Create Directory Structure
Create the following folder structure using VS Code's Explorer:

```
integration-dashboard/
├── .vscode/
│   ├── settings.json
│   ├── launch.json
│   ├── tasks.json
│   └── extensions.json
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
├── drizzle/
├── dist/
├── node_modules/
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── drizzle.config.ts
├── components.json
├── config.yaml
├── eslint.config.js
├── prettier.config.js
└── README.md
```

## Step 3: VS Code Configuration

### 3.1 Workspace Settings (.vscode/settings.json)
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "typescript.inlayHints.parameterNames.enabled": "all",
  "typescript.inlayHints.variableTypes.enabled": true,
  "typescript.inlayHints.functionLikeReturnTypes.enabled": true,
  "eslint.workingDirectories": ["."],
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
```

### 3.2 Launch Configuration (.vscode/launch.json)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Development Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server/index.ts",
      "env": {
        "NODE_ENV": "development"
      },
      "envFile": "${workspaceFolder}/.env",
      "runtimeExecutable": "tsx",
      "runtimeArgs": ["--inspect"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Attach to Process",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### 3.3 Tasks Configuration (.vscode/tasks.json)
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Development Server",
      "type": "npm",
      "script": "dev",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared",
        "showReuseMessage": true,
        "clear": false
      },
      "problemMatcher": "$tsc"
    },
    {
      "label": "Build Project",
      "type": "npm",
      "script": "build",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Database Generate",
      "type": "npm",
      "script": "db:generate",
      "group": "build"
    },
    {
      "label": "Database Migrate",
      "type": "npm",
      "script": "db:migrate",
      "group": "build"
    },
    {
      "label": "Type Check",
      "type": "shell",
      "command": "npx tsc --noEmit",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": "$tsc"
    }
  ]
}
```

### 3.4 Recommended Extensions (.vscode/extensions.json)
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "dsznajder.es7-react-js-snippets",
    "formulahendry.auto-rename-tag",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "eamodio.gitlens",
    "christian-kohler.path-intellisense",
    "christian-kohler.npm-intellisense",
    "mtxr.sqltools",
    "mtxr.sqltools-driver-pg",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "rangav.vscode-thunder-client"
  ]
}
```

## Step 4: Configuration Files

### 4.1 package.json Scripts
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
    "db:migrate": "drizzle-kit migrate",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write ."
  }
}
```

### 4.2 TypeScript Configuration (tsconfig.json)
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
  "exclude": ["node_modules", "dist"]
}
```

### 4.3 ESLint Configuration (eslint.config.js)
```javascript
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    },
    settings: {
      react: {
        version: 'detect'
      }
    }
  },
  prettier
];
```

### 4.4 Prettier Configuration (prettier.config.js)
```javascript
export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  jsxSingleQuote: true,
  quoteProps: 'as-needed'
};
```

### 4.5 Tailwind Configuration (tailwind.config.ts)
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

### 4.6 Vite Configuration (vite.config.ts)
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

## Step 5: Environment Setup

### 5.1 Environment Variables (.env)
```env
DATABASE_URL=postgresql://dashboard_user:your_password@localhost:5432/integration_dashboard
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

### 5.2 Git Ignore (.gitignore)
```
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Database
drizzle/
```

### 5.3 Application Configuration (config.yaml)
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

## Step 6: Database Setup

### 6.1 PostgreSQL Setup
1. Install PostgreSQL and create database:
```sql
CREATE DATABASE integration_dashboard;
CREATE USER dashboard_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE integration_dashboard TO dashboard_user;
```

### 6.2 VS Code Database Connection
1. Install **SQLTools** and **SQLTools PostgreSQL Driver** extensions
2. Open Command Palette (Ctrl+Shift+P)
3. Run **SQLTools: Add New Connection**
4. Select **PostgreSQL**
5. Configure connection:
   - Connection name: Integration Dashboard
   - Server: localhost
   - Port: 5432
   - Database: integration_dashboard
   - Username: dashboard_user
   - Password: your_password

### 6.3 Drizzle Configuration (drizzle.config.ts)
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

## Step 7: Development Workflow

### 7.1 Running the Project
Use VS Code's integrated terminal or Command Palette:

#### Using Terminal (Ctrl+`)
```bash
npm run dev
```

#### Using Command Palette (Ctrl+Shift+P)
1. Type **Tasks: Run Task**
2. Select **Start Development Server**

#### Using Debug Configuration
1. Go to **Run and Debug** view (Ctrl+Shift+D)
2. Select **Launch Development Server**
3. Press F5 or click the play button

### 7.2 Code Navigation
- **Go to Definition**: F12 or Ctrl+Click
- **Go to References**: Shift+F12
- **Go to Symbol**: Ctrl+Shift+O
- **Go to File**: Ctrl+P
- **Command Palette**: Ctrl+Shift+P

### 7.3 Debugging
- **Set Breakpoints**: Click in gutter or F9
- **Start Debugging**: F5
- **Step Over**: F10
- **Step Into**: F11
- **Step Out**: Shift+F11

## Step 8: Code Development Features

### 8.1 IntelliSense and Autocomplete
- TypeScript IntelliSense works out of the box
- Tailwind CSS class completion
- Import suggestions and auto-imports
- Parameter hints and documentation

### 8.2 Code Formatting
- **Format Document**: Shift+Alt+F
- **Format Selection**: Ctrl+K Ctrl+F
- Automatic formatting on save (configured)

### 8.3 Refactoring
- **Rename Symbol**: F2
- **Extract Function**: Ctrl+Shift+R
- **Organize Imports**: Shift+Alt+O

### 8.4 Git Integration
- **Source Control** view: Ctrl+Shift+G
- **Stage Changes**: Click + next to file
- **Commit**: Ctrl+Enter in commit message
- **GitLens**: Inline blame annotations

## Step 9: Testing and API Development

### 9.1 Thunder Client (REST API Testing)
1. Install **Thunder Client** extension
2. Create new request collection
3. Test your API endpoints:
   - GET http://localhost:5000/api/sources
   - GET http://localhost:5000/api/dashboard/stats
   - POST http://localhost:5000/api/chat/messages

### 9.2 Live Server for Frontend
- The development server includes hot reloading
- Changes automatically refresh the browser
- Error overlay shows compilation errors

## Step 10: Advanced Features

### 10.1 Snippets and Templates
Create custom snippets in **File → Preferences → Configure User Snippets**:

#### React Functional Component Snippet
```json
{
  "React Functional Component": {
    "prefix": "rfc",
    "body": [
      "interface ${1:Component}Props {",
      "  $2",
      "}",
      "",
      "export function $1({ $3 }: $1Props) {",
      "  return (",
      "    <div>$4</div>",
      "  );",
      "}"
    ]
  }
}
```

### 10.2 Multi-cursor Editing
- **Add Cursor**: Alt+Click
- **Add Cursor Above/Below**: Ctrl+Alt+Up/Down
- **Select All Occurrences**: Ctrl+Shift+L

### 10.3 Workspace Management
- **Open Folder**: Ctrl+K Ctrl+O
- **Save Workspace**: File → Save Workspace As
- **Switch Windows**: Ctrl+R

## Step 11: Building and Deployment

### 11.1 Build Project
```bash
npm run build
```

### 11.2 Type Checking
```bash
npm run type-check
```

### 11.3 Linting and Formatting
```bash
npm run lint
npm run format
```

## Step 12: Troubleshooting

### Common Issues and Solutions

#### TypeScript Errors
- **Problem**: Import paths not resolved
- **Solution**: Check tsconfig.json path mappings, restart TypeScript server (Ctrl+Shift+P → TypeScript: Restart TS Server)

#### Extension Issues
- **Problem**: Extensions not working
- **Solution**: Reload window (Ctrl+Shift+P → Developer: Reload Window)

#### Performance Issues
- **Problem**: VS Code running slowly
- **Solution**: Disable unused extensions, increase memory limit, exclude large directories from search

### Useful VS Code Shortcuts
- **Quick Open**: Ctrl+P
- **Command Palette**: Ctrl+Shift+P
- **Integrated Terminal**: Ctrl+`
- **Explorer**: Ctrl+Shift+E
- **Search**: Ctrl+Shift+F
- **Git**: Ctrl+Shift+G
- **Run and Debug**: Ctrl+Shift+D
- **Extensions**: Ctrl+Shift+X

## Step 13: Collaborative Development

### 13.1 Shared Settings
- Commit `.vscode/` folder (except settings.json for personal preferences)
- Use workspace settings for project-wide configurations
- Share extensions.json for recommended extensions

### 13.2 Code Reviews
- Use GitLens for blame annotations
- Compare changes with built-in diff viewer
- Use Live Share for collaborative editing

This comprehensive VS Code setup guide provides everything needed to create a professional development environment for your Integration Dashboard project. VS Code's excellent TypeScript and React support, combined with the recommended extensions, creates an optimal development experience with powerful debugging, testing, and code quality tools.