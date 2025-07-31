# Production Deployment Guide
## Integration Dashboard Hub (com.gg.nvl.hub)

This guide covers deploying the Integration Dashboard Hub to production environments, including Replit deployments and self-hosted options.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Replit Deployment](#replit-deployment)
3. [Self-Hosted Deployment](#self-hosted-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Monitoring and Health Checks](#monitoring-and-health-checks)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Components
- Node.js 20+ runtime environment
- PostgreSQL database (for persistent storage)
- JanusGraph server (for graph data, optional)
- OpenAI API key (for AI chat features, optional)

### Environment Variables
```bash
# Core Configuration
DATABASE_URL=postgresql://username:password@host:port/database
OPENAI_API_KEY=sk-your-openai-api-key-here

# PostgreSQL Connection Details (auto-configured from DATABASE_URL)
PGHOST=your-postgres-host
PGPORT=5432
PGUSER=your-username
PGPASSWORD=your-password
PGDATABASE=your-database

# External API Configuration (optional)
EXTERNAL_LISTITEMS_URL=https://your-api.com/listitems
EXTERNAL_API_KEY=your-external-api-key
```

## Replit Deployment

### Step 1: Prepare for Deployment
1. Ensure all code is committed and the application runs locally
2. Verify all environment secrets are configured in Replit
3. Test the application thoroughly in development mode

### Step 2: Deploy on Replit
1. Click the **Deploy** button in your Replit project
2. Choose **Autoscale Deployment** for production workloads
3. Configure custom domain if needed
4. Set up monitoring and alerts

### Replit-Specific Configuration
```yaml
# .replit configuration (already configured)
run = "npm run dev"
entrypoint = "server/index.ts"

[deployment]
build = ["npm", "run", "build"]
run = ["npm", "start"]
```

### Build Command Configuration
The deployment uses these commands:
```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```

## Self-Hosted Deployment

### Step 1: Server Preparation
```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
npm install -g pm2

# Create application directory
sudo mkdir -p /opt/integration-dashboard
sudo chown $USER:$USER /opt/integration-dashboard
cd /opt/integration-dashboard
```

### Step 2: Application Deployment
```bash
# Clone or upload your code
git clone <your-repository-url> .

# Install dependencies
npm install

# Build the application
npm run build

# Copy configuration
cp config.yaml.example config.yaml
# Edit config.yaml with your production settings
```

### Step 3: Configuration Setup
```yaml
# config.yaml - Production Configuration
app:
  environment: production
  port: 5000
  host: "0.0.0.0"

database:
  url: "${DATABASE_URL}"
  ssl: true

janusgraph:
  enabled: true
  useRemote: true
  host: "your-janusgraph-host"
  port: 8182
  protocol: "ws"

ai:
  enabled: true
  model: "gpt-4o"

external:
  workitems:
    url: "https://your-api.com/workitems"
    method: "POST"
    headers:
      "Authorization": "Bearer ${EXTERNAL_API_KEY}"
      "Content-Type": "application/json"
```

### Step 4: Process Management
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'integration-dashboard',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Create logs directory
mkdir -p logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

### Step 5: Reverse Proxy Setup (Nginx)
```nginx
# /etc/nginx/sites-available/integration-dashboard
server {
    listen 80;
    server_name your-domain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Application proxy
    location / {
        proxy_pass http://localhost:5000;
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
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Static assets caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Environment Configuration

### Production Config Template
```yaml
# config.yaml - Production Template
app:
  environment: production
  name: "Integration Dashboard Hub"
  version: "1.0.0"
  port: ${PORT:-5000}
  host: "0.0.0.0"
  
security:
  cors:
    enabled: true
    origins: 
      - "https://your-domain.com"
      - "https://www.your-domain.com"
  rateLimit:
    enabled: true
    max: 1000
    windowMs: 900000  # 15 minutes

database:
  url: "${DATABASE_URL}"
  ssl: true
  pool:
    min: 2
    max: 20
    acquireTimeout: 60000
    timeout: 30000

janusgraph:
  enabled: true
  useRemote: true
  host: "${JANUSGRAPH_HOST}"
  port: ${JANUSGRAPH_PORT:-8182}
  protocol: "ws"
  timeout: 30000
  retries: 3

ai:
  enabled: ${AI_CHAT_ENABLED:-true}
  provider: "openai"
  model: "gpt-4o"
  timeout: 30000

logging:
  level: "info"
  format: "combined"
  file: "./logs/application.log"
  maxSize: "10m"
  maxFiles: 10

monitoring:
  healthcheck:
    enabled: true
    path: "/health"
    interval: 30000
  metrics:
    enabled: true
    path: "/metrics"
```

## Database Setup

### PostgreSQL Production Setup
```sql
-- Create production database
CREATE DATABASE integration_dashboard_prod;

-- Create application user
CREATE USER dashboard_app WITH PASSWORD 'your-secure-password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE integration_dashboard_prod TO dashboard_app;

-- Connect to the database
\c integration_dashboard_prod

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO dashboard_app;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dashboard_app;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dashboard_app;
```

### Database Migration
```bash
# Run database migrations
npm run db:push

# Verify migration
npm run check
```

## Monitoring and Health Checks

### Health Check Endpoints
- `GET /health` - Basic application health
- `GET /api/janusgraph/health` - JanusGraph connection status
- `GET /metrics` - Application metrics (if enabled)

### Monitoring Configuration
```bash
# Install monitoring tools
npm install -g clinic

# Performance monitoring
clinic doctor -- node dist/index.js

# Memory profiling
clinic heapprofiler -- node dist/index.js
```

### Log Monitoring
```bash
# Monitor application logs
pm2 logs integration-dashboard

# Monitor specific log files
tail -f logs/application.log

# Log rotation setup
sudo logrotate /etc/logrotate.d/integration-dashboard
```

## Performance Optimization

### Production Optimizations
1. **Enable gzip compression**
2. **Configure static asset caching**
3. **Set up CDN for static resources**
4. **Enable database connection pooling**
5. **Configure JanusGraph connection limits**

### Resource Requirements
- **Minimum**: 2 CPU cores, 4GB RAM, 20GB storage
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB storage
- **High Load**: 8 CPU cores, 16GB RAM, 100GB storage

## Security Considerations

### Production Security Checklist
- [ ] HTTPS enabled with valid SSL certificates
- [ ] Environment variables properly secured
- [ ] Database connections encrypted
- [ ] API keys stored in secure secret management
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Regular security updates applied

### Firewall Configuration
```bash
# UFW firewall rules
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
pm2 logs integration-dashboard

# Verify configuration
node -e "console.log(require('./config.yaml'))"

# Check port availability
netstat -tulpn | grep :5000
```

#### Database Connection Issues
```bash
# Test database connection
npm run db:check

# Verify credentials
psql $DATABASE_URL -c "SELECT version();"
```

#### JanusGraph Connection Problems
```bash
# Test Gremlin connection
curl -X POST http://your-janusgraph:8182/gremlin \
  -H "Content-Type: application/json" \
  -d '{"gremlin": "g.V().count()"}'
```

#### WebSocket Connection Issues
```bash
# Test WebSocket connection
wscat -c ws://localhost:5000/ws
```

### Performance Issues
1. **Check CPU usage**: `top` or `htop`
2. **Monitor memory**: `free -h`
3. **Check disk space**: `df -h`
4. **Database performance**: Check slow query logs
5. **Network latency**: Test JanusGraph response times

### Deployment Rollback
```bash
# PM2 rollback to previous version
pm2 reload ecosystem.config.js --update-env

# Git rollback
git checkout previous-stable-tag
npm run build
pm2 restart integration-dashboard
```

## Support and Maintenance

### Regular Maintenance Tasks
- [ ] Monitor application logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database daily
- [ ] Review performance metrics weekly
- [ ] Security patch updates as needed

### Backup Strategy
```bash
# Database backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Application backup
tar -czf app-backup-$(date +%Y%m%d).tar.gz /opt/integration-dashboard
```

For additional support, refer to the project documentation in `/src/com/gg/nvl/hub/docs/` or contact your system administrator.