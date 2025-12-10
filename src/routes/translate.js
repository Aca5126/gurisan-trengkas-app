const express = require('express');
const router = express.Router();
const { translateImageWithOpenAI } = require('../services/openai');

// POST /api/translate
// Body: { image: "data:image/png;base64,....", guidance?: "string" }
router.post('/', async (req, res) => {
  try {
    const { image, guidance } = req.body || {};
    if (!image || typeof image !== 'string' || !image.startsWith('data:image')) {
      return res.status(400).json({ error: 'Imej tidak sah. Pastikan format data URL base64.' });
    }

    const translation = await translateImageWithOpenAI({
      imageDataUrl: image,
      guidanceText: guidance
    });

    res.json({ translation });
  } catch (err) {
    console.error('Translation error:', err?.response?.data || err.message || err);
    res.status(500).json({ error: 'Translation failed' });
  }
});

module.exports = router;
