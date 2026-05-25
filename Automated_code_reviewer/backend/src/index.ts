import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

// Load .env from monorepo root (not only backend/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import cors from 'cors';
import emotionRoutes from './routes/emotionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT ?? 4000;

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    service: 'automated_code_reviewer',
    status: 'ok',
    features: ['emotion-analyze', 'code-check'],
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/review', reviewRoutes);
app.use('/api/emotion', emotionRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`automated_code_reviewer API listening on http://localhost:${PORT}`);
});
