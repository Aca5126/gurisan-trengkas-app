import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';

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
app.use(express.json({ limit: '10mb' })); // image dataURL boleh besar
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB
const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI tidak ditetapkan dalam .env');
  process.exit(1);
}
mongoose.connect(uri, { autoIndex: true })
  .then(() => console.log('MongoDB bersambung'))
  .catch(err => {
    console.error('Gagal sambung MongoDB:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/translate', translateRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Start
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`API berjalan di http://localhost:${port}`);
});
