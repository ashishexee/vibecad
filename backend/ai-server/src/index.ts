import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { handleGenerate, handleUpdateParams, handleListProviders, handleGetSession, handleDeleteSession, handleClarify } from './routes/generate';
import { config } from './config';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ai-server', timestamp: new Date().toISOString() });
});
app.get('/api/providers', handleListProviders);
app.post('/api/generate', handleGenerate);
app.post('/api/clarify', handleClarify);
app.post('/api/update-params', handleUpdateParams);
app.get('/api/sessions/:id', handleGetSession);
app.delete('/api/sessions/:id', handleDeleteSession);

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, () => {
    console.log(`AI server on port ${config.port}`);
    console.log(`CAD server at ${config.cadServerUrl}`);
  });
}

export default app;
