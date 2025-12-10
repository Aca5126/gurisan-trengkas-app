import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY tidak ditetapkan dalam .env');
}

export const openai = new OpenAI({ apiKey });

export async function recognizeTrengkas({ imageDataUrl, hint }) {
  const prompt = [
    "Anda ialah pengenal trengkas Pitman (Bahasa Malaysia).",
    "Analisis imej gurisan (garis ringan/berat, lengkung, bulatan kecil/besar, arah).",
    "Keluarkan:",
    "1) shorthand: fonem/simbol yang dikesan.",
    "2) fullText: satu perkataan BM yang paling munasabah.",
    "3) candidates: 3-6 calon perkataan berkaitan.",
    "4) confidence: nombor antara 0 dan 1.",
    hint ? `Hint (opsyenal): ${hint}` : "Tiada hint."
  ].join('\n');

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
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

  if (!fullText) fullText = candidates[0] || 'tidak pasti';
  if (!candidates.length && fullText && fullText !== 'tidak pasti') {
    candidates = [fullText];
  }

  return { shorthand, fullText, confidence, candidates };
}
