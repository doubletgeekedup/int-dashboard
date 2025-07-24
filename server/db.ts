import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import { configManager } from './config';

neonConfig.webSocketConstructor = ws;

const databaseConfig = configManager.getDatabaseConfig();

if (!databaseConfig.url) {
  throw new Error(
    "Database URL must be set in config.yaml. Did you forget to configure the database?",
  );
}

export const pool = new Pool({ connectionString: databaseConfig.url });
export const db = drizzle({ client: pool, schema });