-- Initialize the Integration Dashboard database
-- This script will be run when the PostgreSQL container starts for the first time

-- Create the database (if it doesn't exist)
-- Note: This is handled by POSTGRES_DB environment variable in docker-compose.yml

-- Create extensions that might be needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant necessary permissions to the user
-- Note: User and database are created by the postgres image based on environment variables

-- Set timezone
SET timezone = 'UTC';

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Integration Dashboard database initialized successfully';
END
$$;