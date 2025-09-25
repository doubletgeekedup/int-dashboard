import { build } from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config = {
  entryPoints: ['server/index.ts'],
  bundle: true,
  outdir: 'dist',
  platform: 'node',
  format: 'esm',
  packages: 'external',
  alias: {
    '@shared': path.resolve(__dirname, 'shared'),
  },
  loader: {
    '.ts': 'ts',
  },
  resolveExtensions: ['.ts', '.js'],
};

try {
  await build(config);
  console.log('✅ Server build completed successfully');
} catch (error) {
  console.error('❌ Server build failed:', error);
  process.exit(1);
}