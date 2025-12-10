// src/routes/translate.js
const express = require('express');
const router = express.Router();
const { recognizeAndTranslate } = require('../services/openai');

router.post('/', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data required' });
    }

    const result = await recognizeAndTranslate(imageBase64);
    res.json({ translation: result });
  } catch (err) {
    console.error('Error in /api/translate:', err.message);
    res.status(500).json({ error: 'Translation failed' });
  }
});

module.exports = router;
