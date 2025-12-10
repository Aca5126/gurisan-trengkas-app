import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error('OPENAI_API_KEY tidak ditetapkan dalam .env');
}

export const openai = new OpenAI({ apiKey });

export async function recognizeTrengkas({ imageDataUrl, hint }) {
  const prompt = {
    role: "user",
    content: [
      {
        type: "text",
        text: `
Anda ialah pengenal trengkas Pitman (Bahasa Malaysia).
Analisis imej gurisan (garis ringan/berat, lengkung, bulatan kecil/besar, arah).
Keluarkan jawapan dalam format JSON dengan kunci:
{
  "shorthand": "...",
  "fullText": "...",
  "candidates": ["...","..."],
  "confidence": 0.85
}
Hint (opsyenal): ${hint || "Tiada"}
        `
      },
      { type: "image_url", image_url: { url: imageDataUrl } }
    ]
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Anda pakar Sistem Trengkas Malaysia (Pitman 2000)." },
      prompt
    ],
    temperature: 0.2
  });

  const raw = response.choices?.[0]?.message?.content?.trim() || "";

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    // fallback jika model tidak keluarkan JSON
    parsed = {
      shorthand: "",
      fullText: raw || "tidak pasti",
      candidates: [raw],
      confidence: 0.5
    };
  }

  return {
    shorthand: parsed.shorthand || "",
    fullText: parsed.fullText || "tidak pasti",
    candidates: parsed.candidates || [],
    confidence: parsed.confidence ?? 0.5
  };
}
