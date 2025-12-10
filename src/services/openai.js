const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// Nota penting:
// Kod ini menggunakan endpoint Chat Completions multimodal.
// Ia menghantar imej base64 (data URL) + arahan teks untuk tafsiran trengkas.
async function translateImageWithOpenAI({ imageDataUrl, guidanceText }) {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY tidak ditetapkan');
  }

  // Format content untuk multimodal (teks + imej)
  const messages = [
    {
      role: 'system',
      content: [
        { type: 'text', text: 'Anda adalah pembantu yang pakar menafsir trengkas Pitman dalam konteks bahasa Melayu. Beri terjemahan yang ringkas, jelas, dan sebutkan ketidakpastian jika ada.' }
      ]
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: guidanceText || 'Tafsirkan gurisan trengkas ini ke dalam teks Melayu yang jelas.' },
        {
          type: 'input_image',
          image_url: imageDataUrl // data:image/png;base64,xxxxx
        }
      ]
    }
  ];

  // Panggilan ke OpenAI Chat Completions (multimodal)
  const url = 'https://api.openai.com/v1/chat/completions';
  const headers = {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  };

  const body = {
    model: OPENAI_MODEL,
    messages,
    temperature: 0.2
  };

  const resp = await axios.post(url, body, { headers });
  const choice = resp?.data?.choices?.[0];
  const text = choice?.message?.content || '';

  return text.trim();
}

module.exports = {
  translateImageWithOpenAI
};
