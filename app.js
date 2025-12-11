// ==========================
// Debug Log
// ==========================
function dlog(...args) {
  console.log('[GURISAN DEBUG]', ...args);
}

// ==========================
// Setup canvas + DPI scaling
// ==========================
function setupCanvas() {
  dlog('setupCanvas() called');

  const canvas = document.getElementById('canvas');
  const guidesCanvas = document.getElementById('guidesCanvas');

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.getContext('2d').scale(dpr, dpr);

  guidesCanvas.width = canvas.width;
  guidesCanvas.height = canvas.height;
  guidesCanvas.getContext('2d').scale(dpr, dpr);

  drawGuides();
}

// ==========================
// Draw Garisan Panduan
// ==========================
function drawGuides() {
  dlog('drawGuides() start');

  const guidesCanvas = document.getElementById('guidesCanvas');
  const ctx = guidesCanvas.getContext('2d');
  const w = guidesCanvas.clientWidth;
  const h = guidesCanvas.clientHeight;

  ctx.clearRect(0, 0, w, h);

  const yTop = h * 0.25;
  const yBase = h * 0.5;
  const yBot = h * 0.75;

  ctx.strokeStyle = '#cfd8dc';
  ctx.setLineDash([8, 8]);
  ctx.beginPath(); ctx.moveTo(0, yTop); ctx.lineTo(w, yTop); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, yBot); ctx.lineTo(w, yBot); ctx.stroke();

  ctx.setLineDash([]);
  ctx.strokeStyle = '#9e9e9e';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, yBase); ctx.lineTo(w, yBase); ctx.stroke();
}

// ==========================
// Event Listeners
// ==========================
window.addEventListener('load', () => {
  setupCanvas();

  document.getElementById('toggleGuides').addEventListener('change', e => {
    document.getElementById('guidesCanvas').style.display = e.target.checked ? 'block' : 'none';
  });

  document.getElementById('toggleBaseline').addEventListener('change', e => {
    document.getElementById('labelBaseline').style.display = e.target.checked ? 'inline' : 'none';
  });

  document.getElementById('bersihBtn').addEventListener('click', () => {
    const canvas = document.getElementById('canvas');
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('hasil').textContent = 'Tiada semakan lagi';
    document.getElementById('deteksiGurisan').textContent = 'Status gurisan: belum dianalisis';
  });

  document.getElementById('semakBtn').addEventListener('click', async () => {
    const canvas = document.getElementById('canvas');
    const perkataan = document.getElementById('perkataan').value.trim();
    if (!perkataan) return alert('Sila masukkan perkataan terlebih dahulu.');

    const dataUrl = canvas.toDataURL();
    const res = await fetch(`${window.API_BASE}/semak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl, perkataan })
    });
    const result = await res.json();
    dlog('Semakan:', result);
    document.getElementById('hasil').textContent = result.mesej || 'Tiada maklum balas';
    document.getElementById('deteksiGurisan').textContent = `Status gurisan: ${result.status || 'tidak pasti'}`;
  });

  document.getElementById('tekaSukuKataBtn').addEventListener('click', async () => {
    const perkataan = document.getElementById('perkataan').value.trim();
    if (!perkataan) return alert('Sila masukkan perkataan terlebih dahulu.');

    const res = await fetch(`${window.API_BASE}/suku-kata?perkataan=${encodeURIComponent(perkataan)}`);
    const result = await res.json();
    dlog('Suku kata:', result);
    alert(`Suku kata: ${result.suku_kata || 'Tidak dapat dikesan'}`);
  });

  document.getElementById('ulangSebutanBtn').addEventListener('click', () => {
    const perkataan = document.getElementById('perkataan').value.trim();
    if (!perkataan) return alert('Tiada perkataan untuk disebut.');
    const utter = new SpeechSynthesisUtterance(perkataan);
    utter.lang = 'ms-MY';
    speechSynthesis.speak(utter);
  });

  document.getElementById('muatTurunBtn').addEventListener('click', () => {
    const canvas = document.getElementById('canvas');
    const perkataan = document.getElementById('perkataan').value.trim() || 'gurisan';
    const link = document.createElement('a');
    link.download = `${perkataan}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });

  document.getElementById('penBtn').addEventListener('click', () => {
    canvas.getContext('2d').strokeStyle = '#000';
  });

  document.getElementById('padamBtn').addEventListener('click', () => {
    canvas.getContext('2d').strokeStyle = '#fff';
  });

  document.getElementById('perkataan').addEventListener('input', e => {
    dlog('Perkataan input:', e.target.value);
  });

  document.getElementById('pilihRawakBtn').addEventListener('click', () => {
    const rawak = window.WORDS[Math.floor(Math.random() * window.WORDS.length)];
    document.getElementById('perkataan').value = rawak;
    dlog('Rawak pilih:', rawak);
  });

  document.getElementById('senaraiDitETapkan').addEventListener('change', e => {
    document.getElementById('perkataan').value = e.target.value;
    dlog('Ditetapkan pilih:', e.target.value);
  });
});
