# Production Deployment Guide - Removing Replit Dependencies

## Overview
This guide provides detailed instructions for making your Integration Dashboard production-ready by removing all Replit-specific references, dependencies, and configurations. Follow these steps to deploy the application in any cloud environment while maintaining confidentiality.

## Critical Files to Remove or Modify

### 1. Remove Replit-Specific Files

#### A. Delete replit.md (Complete File Removal)
```bash
rm replit.md
```
**Why:** Contains Replit-specific deployment information and project history.

#### B. Delete .replit Configuration
```bash
rm .replit
```
**Why:** Replit-specific runtime configuration file.

#### C. Delete config.yaml (Optional - Replace with Environment Variables)
```bash
rm config.yaml
```
**Alternative:** Keep but rename to `app.config.yaml` and remove any Replit references.

### 2. Package.json Modifications

#### A. Remove Replit-Specific Dependencies
Remove these dependencies from `package.json`:

```json
// REMOVE THESE LINES FROM devDependencies:
{
  "devDependencies": {
    "@replit/vite-plugin-cartographer": "^0.2.7",        // REMOVE
    "@replit/vite-plugin-runtime-error-modal": "^0.0.3"  // REMOVE
  }
}
```

#### B. Updated package.json (Clean Version)
```json
{
  "name": "integration-dashboard",
  "version": "1.0.0",
  "type": "module",
  "description": "Enterprise Integration Dashboard for monitoring Sources of Truth",
  "main": "dist/server.js",
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
    "format": "prettier --write .",
    "test": "jest"
  },
  "keywords": ["dashboard", "integration", "monitoring", "enterprise"],
  "author": "Your Organization",
  "license": "PROPRIETARY",
  "dependencies": {
    // Keep all existing dependencies EXCEPT Replit ones
  },
  "devDependencies": {
    // Remove @replit/* packages
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.1.3",
    "@types/connect-pg-simple": "^7.0.2",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.18.0",
    "@types/js-yaml": "^4.0.9",
    "@types/node": "^22.10.6",
    "@types/passport": "^1.0.16",
    "@types/passport-local": "^1.0.38",
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@types/ws": "^8.5.13",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.29.0",
    "esbuild": "^0.24.2",
    "postcss": "^8.5.11",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vite": "^6.0.7"
  }
}
```

### 3. Vite Configuration Cleanup

#### A. Original vite.config.ts (Remove Replit Plugins)
```typescript
// REMOVE THIS ENTIRE SECTION:
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal"; // REMOVE

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(), // REMOVE
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined // REMOVE ENTIRE CONDITION
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) => // REMOVE
            m.cartographer(),
          ),
        ]
      : []),
  ],
  // ... rest of config
});
```

#### B. Clean vite.config.ts (Production Ready)
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "client", "src", "assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    fs: {
      strict: true,
      deny: ["**/.*", "**/node_modules/**"],
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
  },
});
```

### 4. HTML Template Cleanup

#### A. Remove Replit Banner from client/index.html
```html
<!-- REMOVE THIS ENTIRE SECTION: -->
<!-- This is a replit script which adds a banner on the top of the page when opened in development mode outside the replit environment -->
<script type="text/javascript" src="https://replit.com/public/js/replit-dev-banner.js"></script>
```

#### B. Clean client/index.html (Production Ready)
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
    <title>Integration Dashboard</title>
    <meta name="description" content="Enterprise Integration Dashboard for monitoring Sources of Truth" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <meta name="robots" content="noindex, nofollow" />
    <meta http-equiv="X-Frame-Options" content="DENY" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 5. Environment Configuration Changes

#### A. Remove Replit Environment Variables
In your environment configuration, remove any references to:
```bash
# REMOVE THESE VARIABLES:
REPL_ID=
REPL_SLUG=
REPLIT_DOMAINS=
REPL_OWNER=
```

#### B. Production Environment Variables (.env.production)
```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@your-db-host:5432/database_name
OPENAI_API_KEY=your_openai_api_key
PORT=5000
HOST=0.0.0.0

# Security Configuration
SESSION_SECRET=your_very_secure_session_secret_minimum_32_characters
CORS_ORIGIN=https://yourdomain.com

# Optional: Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Optional: Database Connection Pool
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
```

### 6. Server Configuration Updates

#### A. Update server/index.ts for Production
```typescript
// ADD PRODUCTION CONFIGURATIONS:
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Production security headers
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, '../public')));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(__dirname, '../public/index.html'));
    }
  });
}

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
```

### 7. Configuration Management Updates

#### A. Replace config.yaml with Environment-Based Config
Create `server/config/production.ts`:
```typescript
export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4000'),
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
  },
  janusgraph: {
    host: process.env.JANUSGRAPH_HOST || 'localhost',
    port: parseInt(process.env.JANUSGRAPH_PORT || '8182'),
    path: process.env.JANUSGRAPH_PATH || '/gremlin',
    protocol: process.env.JANUSGRAPH_PROTOCOL || 'ws',
  },
  app: {
    port: parseInt(process.env.PORT || '5000'),
    host: process.env.HOST || '0.0.0.0',
    environment: process.env.NODE_ENV || 'development',
    sessionSecret: process.env.SESSION_SECRET || 'fallback-dev-secret-change-in-production',
  },
  database: {
    url: process.env.DATABASE_URL || '',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2'),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10'),
    poolIdleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
  },
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  }
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  process.exit(1);
}
```

#### B. Update server/config.ts to Use New Configuration
```typescript
// REPLACE THE ENTIRE FILE CONTENT:
import { config } from './config/production.js';
export { config };
```

### 8. Docker Configuration (Production Deployment)

#### A. Create Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "dist/server.js"]
```

#### B. Create .dockerignore
```
node_modules
.env*
.git
.gitignore
README.md
replit.md
.replit
config.yaml
dist
coverage
.nyc_output
*.log
```

#### C. Create docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=integration_dashboard
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 9. Documentation Updates

#### A. Create Production README.md
```markdown
# Integration Dashboard

Enterprise-grade integration monitoring dashboard for managing Sources of Truth across multiple systems.

## Features

- Real-time monitoring of 6 Sources of Truth (STC, CPT, SLC, TMC, CAS, NVL)
- AI-powered analysis and insights
- Graph database integration for complex relationships
- Real-time transaction monitoring
- Bulletin and knowledge base management

## Production Deployment

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- JanusGraph (optional)
- OpenAI API key

### Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:5432/database
OPENAI_API_KEY=your_api_key
SESSION_SECRET=your_secure_secret
PORT=5000
HOST=0.0.0.0
```

### Deployment Steps
1. Clone repository
2. Install dependencies: `npm ci --only=production`
3. Set environment variables
4. Build application: `npm run build`
5. Run database migrations: `npm run db:migrate`
6. Start server: `npm start`

### Docker Deployment
```bash
docker-compose up -d
```

## License
PROPRIETARY - Internal Use Only
```

### 10. Security Hardening

#### A. Add Rate Limiting (server/middleware/rateLimiter.ts)
```typescript
import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many API requests from this IP, please try again later.',
});
```

#### B. Add Security Headers Middleware (server/middleware/security.ts)
```typescript
import helmet from 'helmet';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});
```

### 11. Build and Deployment Scripts

#### A. Create build.sh
```bash
#!/bin/bash
set -e

echo "Building Integration Dashboard for production..."

# Clean previous builds
rm -rf dist/

# Install dependencies
npm ci --only=production

# Run type checking
npm run type-check

# Build application
npm run build

# Run database migrations
npm run db:migrate

echo "Build completed successfully!"
```

#### B. Create deploy.sh
```bash
#!/bin/bash
set -e

echo "Deploying Integration Dashboard..."

# Build application
./build.sh

# Start application with PM2 or similar process manager
pm2 start dist/server.js --name "integration-dashboard" --instances max

echo "Deployment completed successfully!"
```

## Summary of Changes

### Files to Delete:
1. `replit.md`
2. `.replit`
3. `config.yaml` (optional - replace with environment variables)

### Files to Modify:
1. `package.json` - Remove Replit dependencies
2. `vite.config.ts` - Remove Replit plugins and configurations
3. `client/index.html` - Remove Replit banner script
4. `server/index.ts` - Add production configurations
5. `server/config.ts` - Replace YAML config with environment variables

### Files to Add:
1. `Dockerfile`
2. `docker-compose.yml`
3. `.dockerignore`
4. `server/config/production.ts`
5. `server/middleware/rateLimiter.ts`
6. `server/middleware/security.ts`
7. `build.sh`
8. `deploy.sh`
9. Production `README.md`

### Environment Variables to Remove:
- `REPL_ID`
- `REPL_SLUG`
- `REPLIT_DOMAINS`
- `REPL_OWNER`

This comprehensive guide ensures complete removal of all Replit references while maintaining full functionality and adding production-grade security and deployment capabilities.