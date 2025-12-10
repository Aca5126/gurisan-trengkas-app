import { Router } from 'express';
import Translation from '../models/Translation.js';
import { recognizeTrengkas } from '../services/openai.js';

const router = Router();

/**
 * POST /api/translate
 * body: { imageDataUrl: string(dataURL), hint?: string }
 */
router.post('/', async (req, res) => {
  try {
    const { imageDataUrl, hint } = req.body;
    if (!imageDataUrl || typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image')) {
      return res.status(400).json({ error: 'imageDataUrl tidak sah' });
    }

    const result = await recognizeTrengkas({ imageDataUrl, hint });

    const doc = await Translation.create({
      hint,
      shorthand: result.shorthand,
      fullText: result.fullText,
      confidence: result.confidence,
      candidates: result.candidates,
      imageRef: '' // optional: anda boleh simpan pointer jika guna storage
    });

    return res.json({
      ok: true,
      data: {
        id: doc._id,
        time: doc.time,
        hint: doc.hint,
        shorthand: doc.shorthand,
        fullText: doc.fullText,
        confidence: doc.confidence,
        candidates: doc.candidates
      }
    });
  } catch (err) {
    console.error('Ralat /api/translate:', err.message);
    return res.status(500).json({ error: 'Terjadi ralat semasa terjemahan' });
  }
});

/**
 * GET /api/translate/history
 * query: ?limit=50
 */
router.get('/history', async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const items = await Translation.find().sort({ time: -1 }).limit(limit).lean();
    return res.json({ ok: true, data: items });
  } catch (err) {
    console.error('Ralat sejarah:', err.message);
    return res.status(500).json({ error: 'Terjadi ralat semasa mengambil sejarah' });
  }
});

export default router;
