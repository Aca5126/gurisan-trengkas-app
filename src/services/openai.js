// src/services/openai.js
const axios = require('axios');

async function recognizeAndTranslate(imageBase64) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      messages: [
        {
          role: 'system',
          content: 'Anda ialah pakar Pitman shorthand (trengkas). Terjemahkan imej kepada teks penuh.'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Sila kenal pasti dan terjemahkan gurisan trengkas ini.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${imageBase64}` } }
          ]
        }
      ]
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

module.exports = { recognizeAndTranslate };
