# Multi-stage Docker build for Integration Dashboard System

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy source code and build configuration
COPY . .

# Build the frontend
RUN npm run check && npx vite build

# Build the backend with proper alias resolution
RUN node esbuild.config.js

# Stage 2: Production runtime
FROM node:20-alpine AS runtime

# Install PostgreSQL client and other required system dependencies
RUN apk add --no-cache \
    postgresql-client \
    curl \
    bash

# Create app directory and user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S appuser -u 1001
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy necessary config and shared files
COPY --chown=appuser:nodejs config.yaml ./
COPY --chown=appuser:nodejs shared/ ./shared/
COPY --chown=appuser:nodejs drizzle.config.ts ./
COPY --chown=appuser:nodejs tsconfig.json ./

# Create startup script
COPY --chown=appuser:nodejs <<EOF ./start.sh
#!/bin/bash
set -e

echo "Starting Integration Dashboard System..."

# Wait for database to be ready if DATABASE_URL is provided
if [ ! -z "\$DATABASE_URL" ]; then
    echo "Waiting for database to be ready..."
    timeout=60
    while ! pg_isready -d "\$DATABASE_URL" >/dev/null 2>&1; do
        timeout=\$((timeout - 1))
        if [ \$timeout -eq 0 ]; then
            echo "Database connection timeout"
            exit 1
        fi
        echo "Database not ready, waiting..."
        sleep 1
    done
    echo "Database is ready!"
    
    # Run database migrations
    echo "Running database migrations..."
    npm run db:push || echo "Migration failed, continuing..."
fi

# Set default environment variables if not provided
export NODE_ENV=\${NODE_ENV:-production}
export AI_CHAT_ENABLED=\${AI_CHAT_ENABLED:-false}

# Start the application
echo "Starting application..."
exec node dist/index.js
EOF

RUN chmod +x ./start.sh

# Create data directory for potential local storage
RUN mkdir -p /app/data && chown appuser:nodejs /app/data

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start command
CMD ["./start.sh"]