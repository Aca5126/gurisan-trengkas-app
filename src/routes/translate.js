import { Router } from 'express';
import { recognizeTrengkas } from '../services/openai.js';

const router = Router();
const history = []; // simpan dalam memori sahaja

// POST /api/translate
router.post('/', async (req, res) => {
  try {
    const { imageDataUrl, hint } = req.body;
    if (!imageDataUrl || typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image')) {
      return res.status(400).json({ ok: false, error: 'imageDataUrl tidak sah' });
    }

    const result = await recognizeTrengkas({ imageDataUrl, hint });

    const record = {
      time: new Date().toISOString(),
      hint,
      shorthand: result.shorthand,
      fullText: result.fullText,
      confidence: result.confidence,
      candidates: result.candidates
    };
    history.push(record);

    return res.json({ ok: true, data: record });
  } catch (err) {
    console.error('Ralat /api/translate:', err.message);
    return res.status(500).json({ ok: false, error: 'Terjadi ralat semasa terjemahan' });
  }
});

// GET /api/translate/history
router.get('/history', (_req, res) => {
  res.json({ ok: true, data: history.slice(-50).reverse() });
});

export default router;
