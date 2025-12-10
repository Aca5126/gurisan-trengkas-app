const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

require('dotenv').config(); // Berfungsi jika lokal; di Railway gunakan Variables

const translateRoutes = require('./src/routes/translate');

const app = express();
const PORT = process.env.PORT || 8080;
const ORIGIN = process.env.ALLOWED_ORIGIN || '*';

app.use(helmet());
app.use(express.json({ limit: '10mb' }));

app.use(cors({
  origin: ORIGIN === '*' ? true : ORIGIN,
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/translate', translateRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
