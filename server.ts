import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

// Import the Netlify handlers
import { handler as rssHandler } from './netlify/functions/rss.js';
import { handler as extractHandler } from './netlify/functions/extract.js';
import { handler as youtubeHandler } from './netlify/functions/youtube.js';
import { handler as podcastHandler } from './netlify/functions/podcast.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes FIRST (Simulating Netlify functions)
  app.all('/.netlify/functions/:func', async (req, res) => {
    const { func } = req.params;
    let handler;
    if (func === 'rss') handler = rssHandler;
    else if (func === 'extract') handler = extractHandler;
    else if (func === 'youtube') handler = youtubeHandler;
    else if (func === 'podcast') handler = podcastHandler;

    if (handler) {
      const event = {
        httpMethod: req.method,
        queryStringParameters: req.query,
        headers: req.headers,
        body: req.body,
      };
      try {
        const response = await handler(event);
        if (response.headers) {
          for (const [key, value] of Object.entries(response.headers)) {
            res.setHeader(key, value as string);
          }
        }
        res.status(response.statusCode).send(response.body);
      } catch (error: any) {
        console.error(`Error in function ${func}:`, error);
        res.status(500).json({ error: error.message });
      }
    } else {
      res.status(404).json({ error: 'Function not found' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
