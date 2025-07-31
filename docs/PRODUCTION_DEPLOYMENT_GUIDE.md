# Production Deployment Guide

## Overview

This Integration Dashboard System is a full-stack application designed for enterprise environments to monitor and manage multiple Sources of Truth. The system provides real-time monitoring, analytics, AI-powered insights, and government-level knowledge retention capabilities.

## System Requirements

### Runtime Environment
- **Node.js**: Version 20 or higher
- **PostgreSQL**: Version 13 or higher (optional, uses in-memory storage by default)
- **JanusGraph**: Compatible graph database server (optional)
- **Memory**: Minimum 4GB RAM, recommended 8GB+
- **Storage**: Minimum 20GB available space
- **Network**: Stable internet connection for external API integrations

### Supported Platforms
- Linux (Ubuntu 20.04+, CentOS 8+, RHEL 8+)
- Windows Server 2019+
- macOS 12+
- Docker containers
- Kubernetes clusters

## Pre-deployment Setup

### 1. Environment Configuration
Create a `config.yaml` file in the project root:

```yaml
app:
  environment: production
  port: 3000
  host: "0.0.0.0"
  
database:
  enabled: false  # Set to true if using PostgreSQL
  url: ""  # PostgreSQL connection string if enabled
  
janusgraph:
  enabled: true
  useRemote: true
  url: "ws://your-janusgraph-server:8182/gremlin"
  
ai:
  enabled: false  # Set to true to enable AI chat features
  
external:
  workitems:
    url: ""  # External API endpoint for WorkItem creation
    apiKey: ""  # API key for external service
    insecure: false  # Set to true to bypass SSL verification
```

### 2. Environment Variables
Set the following environment variables in your deployment environment:

```bash
# Required for AI features (if enabled)
OPENAI_API_KEY=your_openai_api_key_here

# Required for PostgreSQL (if enabled)
DATABASE_URL=postgresql://username:password@host:port/database

# Optional: Custom configuration file path
CONFIG_FILE_PATH=/path/to/config.yaml
```

### 3. Dependencies Installation
```bash
npm install --production
```

## Build Process

### 1. Frontend Build
```bash
npm run build
```

### 2. Backend Compilation
```bash
npm run build:server
```

### 3. Production Assets
After building, the following directories contain production-ready files:
- `dist/` - Compiled frontend assets
- `dist-server/` - Compiled backend code

## Deployment Options

### Option 1: Direct Node.js Deployment

1. **Install Dependencies**
```bash
npm install --production
```

2. **Build Application**
```bash
npm run build
npm run build:server
```

3. **Start Production Server**
```bash
npm start
```

### Option 2: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Build application
RUN npm run build && npm run build:server

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

2. **Build and Run Container**
```bash
docker build -t integration-dashboard .
docker run -d -p 3000:3000 \
  -e OPENAI_API_KEY=your_key \
  -v /path/to/config.yaml:/app/config.yaml \
  integration-dashboard
```

### Option 3: Kubernetes Deployment

1. **Create Deployment YAML**
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
              name: api-secrets
              key: openai-key
        volumeMounts:
        - name: config-volume
          mountPath: /app/config.yaml
          subPath: config.yaml
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

## Production Configuration

### 1. Security Settings
```yaml
app:
  environment: production
  cors:
    origin: ["https://yourdomain.com"]
    credentials: true
  
security:
  session:
    secure: true
    httpOnly: true
    sameSite: "strict"
  
external:
  workitems:
    insecure: false  # Always false in production
```

### 2. Performance Optimization
```yaml
app:
  clustering: true  # Enable if using PM2 or similar
  
database:
  pool:
    min: 5
    max: 20
    
janusgraph:
  connectionPool:
    min: 2
    max: 10
```

### 3. Logging Configuration
```yaml
logging:
  level: "info"  # Options: error, warn, info, debug
  file: "/var/log/integration-dashboard/app.log"
  maxFiles: 10
  maxSize: "100MB"
```

## Health Checks and Monitoring

### Health Check Endpoints
- `GET /api/health` - Application health status
- `GET /api/janusgraph/health` - JanusGraph connection status
- `GET /api/chat/ai-status` - AI service availability

### Monitoring Setup
```bash
# Example health check for load balancer
curl -f http://localhost:3000/api/health || exit 1
```

### Log Monitoring
Monitor these log patterns for issues:
- `Error executing real Gremlin query` - JanusGraph connectivity issues
- `Unable to connect to database` - PostgreSQL connection problems
- `OpenAI API error` - AI service issues

## Backup and Recovery

### 1. Configuration Backup
```bash
# Backup configuration
tar -czf config-backup-$(date +%Y%m%d).tar.gz config.yaml

# Backup application logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz /var/log/integration-dashboard/
```

### 2. Database Backup (if using PostgreSQL)
```bash
pg_dump $DATABASE_URL > dashboard-backup-$(date +%Y%m%d).sql
```

### 3. Recovery Procedures
1. Stop the application service
2. Restore configuration files
3. Restore database (if applicable)
4. Restart the application service
5. Verify health check endpoints

## Performance Tuning

### 1. Node.js Optimization
```bash
# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable production optimizations
export NODE_ENV=production
```

### 2. Process Management
Using PM2 for process management:
```bash
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'integration-dashboard',
    script: './dist-server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Security Considerations

### 1. Network Security
- Use HTTPS in production
- Configure firewall rules to restrict access
- Use VPN or private networks for database connections

### 2. API Security
- Rotate API keys regularly
- Use environment variables for sensitive data
- Implement rate limiting if needed

### 3. Data Protection
- Enable SSL/TLS for all database connections
- Encrypt sensitive configuration data
- Implement audit logging for compliance

## Troubleshooting

### Common Issues

1. **Application won't start**
   - Check Node.js version compatibility
   - Verify all required dependencies are installed
   - Check configuration file syntax

2. **JanusGraph connection errors**
   - Verify JanusGraph server is running
   - Check network connectivity
   - Validate connection URL format

3. **High memory usage**
   - Monitor for memory leaks
   - Adjust Node.js memory limits
   - Consider horizontal scaling

### Debug Mode
To enable debug logging temporarily:
```yaml
logging:
  level: "debug"
```

## Scaling Recommendations

### Horizontal Scaling
- Deploy multiple application instances behind a load balancer
- Use session affinity or external session store
- Implement health checks for automatic failover

### Vertical Scaling
- Increase server memory and CPU resources
- Optimize database queries and connections
- Use caching layers for frequently accessed data

## Maintenance

### Regular Tasks
1. Monitor application logs for errors
2. Check health endpoints regularly
3. Update dependencies for security patches
4. Backup configuration and data
5. Monitor system resource usage

### Update Procedure
1. Test updates in staging environment
2. Create backup of current deployment
3. Deploy updates during maintenance window
4. Verify all services are functioning
5. Monitor for issues post-deployment

## Support and Documentation

### Additional Resources
- System logs: `/var/log/integration-dashboard/`
- Configuration validation: `npm run validate-config`
- Health status: `curl http://localhost:3000/api/health`

For production support and advanced configuration options, refer to the system administrator documentation or contact your technical support team.