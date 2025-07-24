#!/usr/bin/env node

// Cross-platform development starter script
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variable
process.env.NODE_ENV = 'development';

// Start the development server
const serverPath = join(__dirname, 'server', 'index.ts');
const child = spawn('npx', ['tsx', serverPath], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

child.on('close', (code) => {
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start development server:', err);
  process.exit(1);
});