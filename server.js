import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import translateRouter from './src/routes/translate.js';

const app = express();

// Security & misc
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(morgan('tiny'));

// CORS
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
  origin: allowedOrigin,
  credentials: false
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/translate', translateRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Start
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`);
});
