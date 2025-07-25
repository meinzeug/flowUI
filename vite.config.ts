import path from 'path';
// Vite's runtime is an ES module. Load it dynamically so this config works
// when compiled to CommonJS by ts-node during the Docker build.
const loadVite = async () => await import('./frontend/node_modules/vite');

export default async ({ mode }) => {
  const { defineConfig, loadEnv } = await loadVite();
  const rootDir = __dirname;
  const frontendRoot = path.resolve(rootDir, 'frontend');
  const env = loadEnv(mode, rootDir, '');
  const apiKey = env.OPENROUTER_API_KEY || env.GEMINI_API_KEY;
  return defineConfig({
    root: rootDir,
    build: {
      outDir: path.resolve(__dirname, 'dist')
    },
    define: {
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.OPENROUTER_API_KEY': JSON.stringify(env.OPENROUTER_API_KEY)
    },
    resolve: {
      alias: {
        '@': frontendRoot,
      }
    }
  });
};
