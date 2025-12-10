import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY tidak ditetapkan dalam .env');
}

export const openai = new OpenAI({ apiKey });

/**
 * Minta model vision mengenal gurisan:
 * - Terangkan fonem/simbol Pitman BM (garis ringan/berat, bulatan kecil/besar, lengkung)
 * - Cadangkan 3-6 perkataan BM selari dengan fonem
 * - Pulangkan best guess + candidates + confidence (0-1)
 */
export async function recognizeTrengkas({ imageDataUrl, hint }) {
  const prompt = [
    "Anda ialah pengenal trengkas Pitman (Bahasa Malaysia).",
    "Analisis imej gurisan (garis ringan/berat, lengkung, bulatan kecil/besar, arah).",
    "Keluarkan:",
    "1) shorthand: fonem/simbol yang dikesan (ringkas, bukan cerita panjang).",
    "2) fullText: satu perkataan BM yang paling munasabah.",
    "3) candidates: 3-6 calon perkataan berkaitan.",
    "4) confidence: nombor antara 0 dan 1.",
    hint ? `Hint (opsyenal): ${hint}` : "Tiada hint."
  ].join('\n');

  // Vision-style request: image + prompt
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // model vision ringan; sesuaikan jika perlu
    messages: [
      { role: "system", content: "Anda pakar Sistem Trengkas Malaysia (Pitman 2000)." },
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageDataUrl } }
        ]
      }
    ],
    temperature: 0.3
  });

  const text = response.choices?.[0]?.message?.content?.trim() || "";
  // Cuba parse format terstruktur jika ada; jika tidak, fallback heuristik sederhana
  // Format dijangka seperti:
  // shorthand: ...
  // fullText: ...
  // candidates: kata1, kata2, kata3
  // confidence: 0.74

  let shorthand = '';
  let fullText = '';
  let candidates = [];
  let confidence = 0.6;

  const lines = text.split('\n').map(l => l.trim());
  for (const line of lines) {
    if (/^shorthand\s*:/i.test(line)) {
      shorthand = line.split(':').slice(1).join(':').trim();
    } else if (/^fullText\s*:/i.test(line)) {
      fullText = line.split(':').slice(1).join(':').trim();
    } else if (/^candidates?\s*:/i.test(line)) {
      const raw = line.split(':').slice(1).join(':').trim();
      candidates = raw.split(/[,\|]/).map(s => s.trim()).filter(Boolean);
    } else if (/^confidence\s*:/i.test(line)) {
      const num = Number(line.split(':').slice(1).join(':').trim());
      if (!Number.isNaN(num)) confidence = Math.max(0, Math.min(1, num));
    }
  }

  // Fallback jika medan kosong
  if (!fullText) fullText = candidates[0] || 'tidak pasti';
  if (!candidates.length && fullText && fullText !== 'tidak pasti') {
    candidates = [fullText];
  }

  return { shorthand, fullText, confidence, candidates };
}
