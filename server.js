// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const translateRoute = require('./src/routes/translate');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*'
}));
app.use(bodyParser.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// =======================================
// UTILITI MOCK SUKU KATA & GURISAN
// (boleh diganti dengan logik sebenar kemudian)
// =======================================

function mockSplitSyllablesFromWord(word) {
  if (!word) return [];
  const vowels = 'aeiouAEIOU';
  let current = '';
  const result = [];

  for (let i = 0; i < word.length; i++) {
    current += word[i];
    const next = word[i + 1];
    const isVowel = vowels.includes(word[i]);
    const nextIsConsonant = next && !vowels.includes(next);

    if (isVowel && nextIsConsonant) {
      result.push(current);
      current = '';
    }
  }

  if (current) result.push(current);
  return result;
}

function mockGuessSyllablesFromImage(imageBase64) {
  // Untuk sementara, gunakan panjang string sebagai "kerumitan"
  if (!imageBase64 || typeof imageBase64 !== 'string') return [];

  const len = imageBase64.length;

  if (len < 20000) {
    return ['ku'];
  } else if (len < 50000) {
    return ['bu', 'ku'];
  } else {
    return ['ru', 'ma', 'h'];
  }
}

// =======================================
// ROUTE BAHARU: /api/guess-syllables
// =======================================

app.post('/api/guess-syllables', (req, res) => {
  try {
    const { image, perkataan, mode } = req.body || {};

    if (!image) {
      return res.status(400).json({
        error: 'Imej gurisan tidak dihantar.',
        suku_kata: []
      });
    }

    let sukuKata = [];

    if (mode === 'guided' && perkataan) {
      // Mod berpandukan perkataan
      sukuKata = mockSplitSyllablesFromWord(perkataan);
    } else {
      // Mod bebas (tiada perkataan atau mode !== 'guided')
      sukuKata = mockGuessSyllablesFromImage(image);
    }

    return res.json({
      suku_kata: sukuKata
    });
  } catch (err) {
    console.error('Ralat di /api/guess-syllables:', err);
    return res.status(500).json({
      error: 'Ralat pelayan semasa meneka suku kata.',
      suku_kata: []
    });
  }
});

// =======================================
// ROUTE BAHARU: /api/pronounce-word
// (buat masa ini hanya pulangkan audio WAV senyap)
// =======================================

app.post('/api/pronounce-word', (req, res) => {
  try {
    const { perkataan } = req.body || {};
    if (!perkataan) {
      return res.status(400).json({ error: 'Perkataan tidak diberikan.' });
    }

    // Placeholder audio (senyap pendek)
    const silenceWav = Buffer.from(
      '524946462400000057415645666d74201000000001000100401f0000803e00000200100064' +
      '61746100000000',
      'hex'
    );
    res.setHeader('Content-Type', 'audio/wav');
    res.send(silenceWav);
  } catch (err) {
    console.error('Ralat di /api/pronounce-word:', err);
    return res.status(500).json({ error: 'Ralat pelayan.' });
  }
});

// Routes sedia ada
app.use('/api/translate', translateRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
