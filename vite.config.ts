import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { handleGenerateConcept, handleGenerateExplanation, handleGenerateFlashcards } from './src/api-handlers';

function getRequestBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: any) => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

export default defineConfig(() => {
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              res.setHeader('Content-Type', 'application/json');
              res.setHeader('Access-Control-Allow-Origin', '*');
              res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
              res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

              if (req.method === 'OPTIONS') {
                res.statusCode = 204;
                res.end();
                return;
              }

              try {
                if (req.url === '/api/generate-concept' && req.method === 'POST') {
                  const { topic } = await getRequestBody(req);
                  if (!topic) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Missing topic parameter' }));
                    return;
                  }
                  const result = await handleGenerateConcept(topic);
                  res.end(JSON.stringify(result));
                  return;
                }

                if (req.url === '/api/generate-explanation' && req.method === 'POST') {
                  const { conceptTitle, parentTopic } = await getRequestBody(req);
                  if (!conceptTitle) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Missing conceptTitle parameter' }));
                    return;
                  }
                  const result = await handleGenerateExplanation(conceptTitle, parentTopic);
                  res.end(JSON.stringify(result));
                  return;
                }

                if (req.url === '/api/generate-flashcards' && req.method === 'POST') {
                  const { concepts } = await getRequestBody(req);
                  if (!concepts || !Array.isArray(concepts)) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Missing or invalid concepts array' }));
                    return;
                  }
                  const result = await handleGenerateFlashcards(concepts);
                  res.end(JSON.stringify(result));
                  return;
                }

                res.statusCode = 404;
                res.end(JSON.stringify({ error: `Route ${req.url} not found` }));
                return;
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message || 'Internal API Error' }));
                return;
              }
            }
            next();
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
