# Quick Setup Guide

## Instant Setup (No Configuration Required)

The fastest way to get started - works out of the box with sample data:

```bash
# Clone and start
git clone <your-repository-url>
cd integration-dashboard
npm install
npm run dev
```

Open `http://localhost:5000` - you're ready to go!

## External Work Items Integration

To connect to your external work items service, add environment variables:

### 1. Create Environment File
```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your actual configurations
nano .env  # or use your preferred editor
```

Add your external service configuration:
```env
# Required for real transaction data
EXTERNAL_LISTITEMS_URL=https://your-external-api.com
EXTERNAL_API_KEY=your_external_api_key_here

# Required for AI chat features  
OPENAI_API_KEY=your_openai_api_key_here

# Optional database configuration
DATABASE_URL=postgresql://username:password@localhost:5432/integration_dashboard
```

### 2. Run Database Commands Directly

Instead of `npm run db:generate`, use:
```bash
npx drizzle-kit generate
```

Instead of `npm run db:migrate`, use:
```bash
npx drizzle-kit migrate
```

Instead of `npm run db:push`, use:
```bash
npx drizzle-kit push
```

### 3. Alternative: Add Scripts Manually

You can manually add these scripts to your package.json:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "type-check": "tsc --noEmit"
  }
}
```

## Complete Setup Process

### 1. Environment Setup
```bash
# 1. Copy environment template
cp .env.example .env

# 2. Edit with your database credentials
# Update DATABASE_URL in .env file
```

### 2. Database Setup
```bash
# 1. Generate database schema
npx drizzle-kit generate

# 2. Apply migrations to database
npx drizzle-kit migrate

# 3. (Optional) Push schema directly without migrations
npx drizzle-kit push
```

### 3. Development
```bash
# Start development server
npm run dev

# Open browser to http://localhost:5000
```

## Common Database URLs

### Local PostgreSQL
```
DATABASE_URL=postgresql://username:password@localhost:5432/integration_dashboard
```

### Neon (Serverless PostgreSQL)
```
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Supabase
```
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

## Environment Variables Required

```env
# Essential
DATABASE_URL=your_database_url_here
OPENAI_API_KEY=your_openai_api_key

# Optional but recommended
SESSION_SECRET=generate_random_32_character_string
NODE_ENV=development
PORT=5000
```

## Quick Commands Reference

```bash
# Database operations
npx drizzle-kit generate    # Generate migrations
npx drizzle-kit migrate     # Apply migrations
npx drizzle-kit push        # Push schema directly
npx drizzle-kit studio      # Open database browser

# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run check              # Type check

# Alternative if scripts are added
npm run db:generate        # If script exists
npm run db:migrate         # If script exists
npm run type-check         # If script exists
```

This should resolve the "missing script" error and get your database setup working properly.