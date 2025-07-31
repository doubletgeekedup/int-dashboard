# Installation Guide - Integration Dashboard System

## Overview

This guide provides step-by-step instructions for installing and configuring the Integration Dashboard System in various environments. The system is designed to work seamlessly across different platforms and deployment scenarios.

## Prerequisites

### System Requirements

**Minimum Requirements:**
- Node.js 20.0 or higher
- 4GB RAM (8GB+ recommended for production)
- 20GB available disk space
- Operating System: Linux, Windows Server, or macOS

**Recommended Requirements:**
- Node.js 20.x LTS
- 8GB+ RAM
- 50GB+ SSD storage
- Multi-core processor (4+ cores)

### Required Software

1. **Node.js and npm**
   ```bash
   # Check current version
   node --version
   npm --version
   
   # Install Node.js 20.x (using Node Version Manager)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   nvm install 20
   nvm use 20
   ```

2. **Git** (for source code management)
   ```bash
   # Install Git
   # Ubuntu/Debian
   sudo apt update && sudo apt install git
   
   # CentOS/RHEL
   sudo yum install git
   
   # macOS
   brew install git
   ```

### Optional Dependencies

1. **PostgreSQL** (for persistent data storage)
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib
   
   # CentOS/RHEL
   sudo yum install postgresql-server postgresql-contrib
   
   # macOS
   brew install postgresql
   ```

2. **Docker** (for containerized deployment)
   ```bash
   # Install Docker Engine
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

## Installation Methods

### Method 1: Standard Installation (Recommended)

#### Step 1: Download and Extract

```bash
# Clone the repository (if using Git)
git clone <repository-url>
cd integration-dashboard

# Or extract from archive
tar -xzf integration-dashboard.tar.gz
cd integration-dashboard
```

#### Step 2: Install Dependencies

```bash
# Install all required dependencies
npm install

# For production installations (smaller footprint)
npm install --production
```

#### Step 3: Configuration

Create a `config.yaml` file in the project root:

```yaml
app:
  environment: production
  port: 3000
  host: "0.0.0.0"

database:
  enabled: false  # Set to true if using PostgreSQL
  url: ""  # PostgreSQL connection string

janusgraph:
  enabled: true
  useRemote: true
  url: "ws://your-janusgraph-server:8182/gremlin"

ai:
  enabled: false  # Set to true to enable AI features

external:
  workitems:
    url: ""  # External API endpoint
    apiKey: ""  # API key for external service

logging:
  level: "info"
  file: "/var/log/integration-dashboard/app.log"
```

#### Step 4: Environment Variables

Create a `.env` file or set system environment variables:

```bash
# Required for AI features (if enabled)
export OPENAI_API_KEY="your_openai_api_key"

# Required for PostgreSQL (if enabled)
export DATABASE_URL="postgresql://username:password@host:port/database"

# Optional: Custom configuration file path
export CONFIG_FILE_PATH="/path/to/config.yaml"
```

#### Step 5: Build Application

```bash
# Build frontend
npm run build

# Build backend
npm run build:server
```

#### Step 6: Start Application

```bash
# Start production server
npm start

# Or start with process manager (recommended)
npm install -g pm2
pm2 start npm --name "integration-dashboard" -- start
```

### Method 2: Docker Installation

#### Step 1: Create Dockerfile

```dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source
COPY . .

# Build application
RUN npm run build && npm run build:server

# Create non-root user
RUN adduser -D -s /bin/sh appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Step 2: Build Docker Image

```bash
# Build the Docker image
docker build -t integration-dashboard:latest .

# Verify the image
docker images integration-dashboard
```

#### Step 3: Run Container

```bash
# Run with basic configuration
docker run -d \
  --name integration-dashboard \
  -p 3000:3000 \
  -e OPENAI_API_KEY="your_openai_key" \
  -v /path/to/config.yaml:/app/config.yaml \
  -v /var/log/integration-dashboard:/var/log/integration-dashboard \
  integration-dashboard:latest

# Run with additional environment variables
docker run -d \
  --name integration-dashboard \
  -p 3000:3000 \
  --env-file .env \
  -v /path/to/config.yaml:/app/config.yaml \
  -v /var/log/integration-dashboard:/var/log/integration-dashboard \
  integration-dashboard:latest
```

### Method 3: Kubernetes Deployment

#### Step 1: Create ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: dashboard-config
data:
  config.yaml: |
    app:
      environment: production
      port: 3000
      host: "0.0.0.0"
    database:
      enabled: false
    janusgraph:
      enabled: true
      useRemote: true
      url: "ws://janusgraph-service:8182/gremlin"
    ai:
      enabled: true
    external:
      workitems:
        url: "https://external-api.company.com/workitems"
    logging:
      level: "info"
```

#### Step 2: Create Secret

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: dashboard-secrets
type: Opaque
data:
  openai-api-key: <base64-encoded-api-key>
  database-url: <base64-encoded-database-url>
  external-api-key: <base64-encoded-external-api-key>
```

#### Step 3: Create Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: integration-dashboard
spec:
  replicas: 3
  selector:
    matchLabels:
      app: integration-dashboard
  template:
    metadata:
      labels:
        app: integration-dashboard
    spec:
      containers:
      - name: integration-dashboard
        image: integration-dashboard:latest
        ports:
        - containerPort: 3000
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: dashboard-secrets
              key: openai-api-key
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: dashboard-secrets
              key: database-url
        volumeMounts:
        - name: config-volume
          mountPath: /app/config.yaml
          subPath: config.yaml
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 60
          periodSeconds: 30
      volumes:
      - name: config-volume
        configMap:
          name: dashboard-config
---
apiVersion: v1
kind: Service
metadata:
  name: integration-dashboard-service
spec:
  selector:
    app: integration-dashboard
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```

## Database Setup

### PostgreSQL Configuration

If using PostgreSQL for persistent storage:

#### Step 1: Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Step 2: Create Database and User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE integration_dashboard;
CREATE USER dashboard_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE integration_dashboard TO dashboard_user;

# Exit PostgreSQL
\q
```

#### Step 3: Configure Connection

Update your configuration:

```yaml
database:
  enabled: true
  url: "postgresql://dashboard_user:secure_password@localhost:5432/integration_dashboard"
```

### JanusGraph Setup (Optional)

For advanced graph database features:

#### Step 1: Install JanusGraph

```bash
# Download JanusGraph
wget https://github.com/JanusGraph/janusgraph/releases/download/v0.6.3/janusgraph-0.6.3.zip
unzip janusgraph-0.6.3.zip
cd janusgraph-0.6.3

# Start JanusGraph with Berkeley DB and Elasticsearch
./bin/janusgraph-server.sh console
```

#### Step 2: Configure Connection

Update config.yaml:

```yaml
janusgraph:
  enabled: true
  useRemote: true
  url: "ws://localhost:8182/gremlin"
```

## Service Configuration

### Systemd Service (Linux)

Create a systemd service file:

```bash
sudo tee /etc/systemd/system/integration-dashboard.service > /dev/null <<EOF
[Unit]
Description=Integration Dashboard System
Documentation=https://github.com/your-org/integration-dashboard
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/integration-dashboard
Environment=NODE_ENV=production
Environment=CONFIG_FILE_PATH=/opt/integration-dashboard/config.yaml
EnvironmentFile=/opt/integration-dashboard/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
KillMode=mixed
TimeoutStopSec=30

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=integration-dashboard

# Security
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/opt/integration-dashboard /var/log/integration-dashboard

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
sudo systemctl daemon-reload
sudo systemctl enable integration-dashboard
sudo systemctl start integration-dashboard
```

### Windows Service

Using node-windows to create a Windows service:

```bash
# Install node-windows globally
npm install -g node-windows

# Create service installation script
node -e "
const Service = require('node-windows').Service;
const svc = new Service({
  name: 'Integration Dashboard',
  description: 'Integration Dashboard System',
  script: 'C:\\path\\to\\integration-dashboard\\dist-server\\index.js',
  env: {
    name: 'NODE_ENV',
    value: 'production'
  }
});
svc.on('install', () => {
  svc.start();
});
svc.install();
"
```

## Load Balancer Configuration

### Nginx Configuration

```nginx
upstream integration_dashboard {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;  # Additional instances
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name dashboard.company.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name dashboard.company.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security Headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000";
    
    # Main application
    location / {
        proxy_pass http://integration_dashboard;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # WebSocket support
    location /ws {
        proxy_pass http://integration_dashboard;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Verification and Testing

### Installation Verification

1. **Check Application Health**
   ```bash
   curl -f http://localhost:3000/api/health
   ```

2. **Verify Database Connectivity** (if enabled)
   ```bash
   curl -f http://localhost:3000/api/janusgraph/health
   ```

3. **Test AI Integration** (if enabled)
   ```bash
   curl -f http://localhost:3000/api/chat/ai-status
   ```

### Performance Testing

```bash
# Install Apache Benchmark
sudo apt install apache2-utils

# Test basic performance
ab -n 1000 -c 10 http://localhost:3000/api/sources

# Test WebSocket connections
npm install -g wscat
wscat -c ws://localhost:3000/ws
```

### Security Testing

```bash
# SSL/TLS Configuration Test
openssl s_client -connect dashboard.company.com:443 -servername dashboard.company.com

# Security Headers Test
curl -I https://dashboard.company.com
```

## Troubleshooting Installation

### Common Issues

1. **Port Already in Use**
   ```bash
   # Find process using port 3000
   lsof -i :3000
   
   # Kill the process
   kill -9 <PID>
   ```

2. **Permission Errors**
   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER /path/to/integration-dashboard
   
   # Fix permissions
   chmod -R 755 /path/to/integration-dashboard
   ```

3. **Node.js Version Issues**
   ```bash
   # Check version
   node --version
   
   # Update Node.js using nvm
   nvm install 20
   nvm use 20
   ```

4. **Build Failures**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Remove node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Log Analysis

```bash
# Application logs
tail -f /var/log/integration-dashboard/app.log

# System logs (systemd)
journalctl -u integration-dashboard -f

# Docker logs
docker logs -f integration-dashboard
```

## Maintenance and Updates

### Update Procedure

1. **Backup Current Installation**
   ```bash
   tar -czf dashboard-backup-$(date +%Y%m%d).tar.gz /opt/integration-dashboard
   ```

2. **Update Application**
   ```bash
   # Stop the service
   sudo systemctl stop integration-dashboard
   
   # Update code
   git pull origin main
   npm install
   npm run build
   npm run build:server
   
   # Start the service
   sudo systemctl start integration-dashboard
   ```

3. **Verify Update**
   ```bash
   curl -f http://localhost:3000/api/health
   ```

This installation guide provides comprehensive instructions for deploying the Integration Dashboard System across various environments. Follow the method that best suits your infrastructure requirements and security policies.