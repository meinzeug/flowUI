import path from 'path';
// Load Vite dynamically so this config also works when compiled by ts-node
const loadVite = async () => await import('./node_modules/vite');

export default async ({ mode }) => {
  const { defineConfig, loadEnv } = await loadVite();
  const rootDir = __dirname;
  const env = loadEnv(mode, rootDir, '');
  const apiKey = env.OPENROUTER_API_KEY || env.GEMINI_API_KEY;
  return defineConfig({
    root: rootDir,
    build: {
      outDir: path.resolve(rootDir, 'dist')
    },
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY)
    },
    resolve: {
      alias: {
        '@': rootDir
      }
    }
  });
};
