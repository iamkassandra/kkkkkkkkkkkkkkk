import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleGenerateConcept, handleGenerateExplanation, handleGenerateFlashcards } from './src/api-handlers.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS and options handling for cloud routing layers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// API Endpoints
app.post('/api/generate-concept', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Missing topic parameter' });
    }
    const data = await handleGenerateConcept(topic);
    return res.json(data);
  } catch (err: any) {
    console.error('API Error in /api/generate-concept:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

app.post('/api/generate-explanation', async (req, res) => {
  try {
    const { conceptTitle, parentTopic } = req.body;
    if (!conceptTitle) {
      return res.status(400).json({ error: 'Missing conceptTitle parameter' });
    }
    const data = await handleGenerateExplanation(conceptTitle, parentTopic);
    return res.json(data);
  } catch (err: any) {
    console.error('API Error in /api/generate-explanation:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { concepts } = req.body;
    if (!concepts || !Array.isArray(concepts)) {
      return res.status(400).json({ error: 'Missing or invalid concepts array' });
    }
    const data = await handleGenerateFlashcards(concepts);
    return res.json(data);
  } catch (err: any) {
    console.error('API Error in /api/generate-flashcards:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

// Serve built React assets
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running in production on port ${PORT}`);
});
