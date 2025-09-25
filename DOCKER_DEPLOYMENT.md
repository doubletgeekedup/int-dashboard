# Docker Deployment Guide for Integration Dashboard

This guide explains how to deploy the Integration Dashboard System using Docker in a restricted environment with no internet access.

## Prerequisites

- Docker Engine 20.10+ installed
- Docker Compose 2.0+ installed
- At least 2GB of available RAM
- At least 5GB of available disk space

## Quick Start

1. **Clone or copy this repository** to your target environment with all files included.

2. **Build and start the application:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Open your web browser and go to: `http://localhost:5000`
   - The application should be running with a local PostgreSQL database

## Configuration

### Environment Variables

The default configuration works out of the box, but you can customize it by:

1. **Copy the environment template:**
   ```bash
   cp .env.template .env
   ```

2. **Edit `.env` file** to match your requirements:
   - Database credentials (if you want to change them)
   - OpenAI API key (if you want to enable AI chat features)
   - External API endpoints (if you have them)

### Application Configuration

The main configuration is in `config.yaml`. Key settings:

- **AI Chat**: Set `AI_CHAT_ENABLED=true` in environment and provide `OPENAI_API_KEY`
- **External APIs**: Configure URLs in the `external` section of `config.yaml`
- **JanusGraph**: Currently configured for remote connection but will fallback to simulation mode

## Services

The Docker Compose setup includes:

1. **PostgreSQL Database** (`db` service):
   - Port: 5432 (internal), exposed on host if needed
   - Database: `integration_dashboard`
   - User: `dashboard_user`
   - Password: `dashboard_password`

2. **Integration Dashboard App** (`app` service):
   - Port: 5000
   - Includes both frontend and backend
   - Automatically runs database migrations on startup

## Management Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f db
```

### Restart Application Only
```bash
docker-compose restart app
```

### Update Configuration
1. Edit `config.yaml` or `.env`
2. Restart the application:
   ```bash
   docker-compose restart app
   ```

### Database Operations

#### Access Database Shell
```bash
docker-compose exec db psql -U dashboard_user -d integration_dashboard
```

#### Backup Database
```bash
docker-compose exec db pg_dump -U dashboard_user integration_dashboard > backup.sql
```

#### Restore Database
```bash
docker-compose exec -T db psql -U dashboard_user -d integration_dashboard < backup.sql
```

### Reset Everything
```bash
# Stop and remove everything including data
docker-compose down -v

# Start fresh
docker-compose up -d
```

## Health Checks

The application includes health checks:

- **App Health**: `http://localhost:5000/api/health`
- **Database Health**: Automatic via Docker health checks

Check status:
```bash
docker-compose ps
```

## Troubleshooting

### Application Won't Start
1. Check logs: `docker-compose logs app`
2. Verify database is healthy: `docker-compose ps`
3. Check environment variables in `.env`

### Database Connection Issues
1. Ensure database container is running: `docker-compose ps db`
2. Check database logs: `docker-compose logs db`
3. Verify credentials in `.env` match `docker-compose.yml`

### Port Conflicts
If port 5000 is already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "8080:5000"  # Use port 8080 instead
```

### Performance Issues
- Ensure at least 2GB RAM is available
- Check disk space for database storage
- Monitor with: `docker stats`

## Security Notes

- Default database password should be changed for production
- Consider using Docker secrets for sensitive data
- The application runs as a non-root user inside containers
- Database data is persisted in Docker volumes

## File Structure

```
.
├── Dockerfile              # Multi-stage application build
├── docker-compose.yml      # Complete stack definition
├── .dockerignore          # Optimize build context
├── esbuild.config.js       # Backend build configuration with module resolution
├── init-db.sql            # Database initialization
├── .env.template          # Environment configuration template
├── config.yaml            # Application configuration
└── [application files]    # Source code and assets
```

## Support

For issues with the Integration Dashboard System:
1. Check logs: `docker-compose logs`
2. Verify configuration in `config.yaml` and `.env`
3. Ensure all required files are present in the deployment directory