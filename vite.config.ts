import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { defineConfig, loadEnv } = require('./frontend/node_modules/vite');

export default defineConfig(({ mode }) => {
  const frontendRoot = path.resolve(__dirname, 'frontend');
  const env = loadEnv(mode, frontendRoot, '');
  return {
    root: frontendRoot,
    build: {
      outDir: path.resolve(__dirname, 'dist')
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': frontendRoot,
      }
    }
  };
});
