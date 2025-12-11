// Keadaan global
let mode = 'pen';
let speakerOn = true;
let lineWidthNormal = 6;
let lineWidthSeparuh = 3;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const guidesCanvas = document.getElementById('guidesCanvas');
const gctx = guidesCanvas.getContext('2d');

const hasilEl = document.getElementById('hasil');
const deteksiEl = document.getElementById('deteksiGurisan');
const penBtn = document.getElementById('penBtn');
const padamBtn = document.getElementById('padamBtn');
const toggleGuides = document.getElementById('toggleGuides');
const toggleBaseline = document.getElementById('toggleBaseline');
const saizGurisan = document.getElementById('saizGurisan');
const semakBtn = document.getElementById('semakBtn');
const tekaSukuKataBtn = document.getElementById('tekaSukuKataBtn');
const bersihBtn = document.getElementById('bersihBtn');
const muatTurunBtn = document.getElementById('muatTurunBtn');
const ulangSebutanBtn = document.getElementById('ulangSebutanBtn');
const perkataanInput = document.getElementById('perkataan');
const pilihRawakBtn = document.getElementById('pilihRawakBtn');
const senaraiDitETapkan = document.getElementById('senaraiDitETapkan');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const importCsvInput = document.getElementById('importCsvInput');
const resetPrestasiBtn = document.getElementById('resetPrestasiBtn');
const toggleSpeakerBtn = document.getElementById('toggleSpeakerBtn');
const betulEl = document.getElementById('betul');
const salahEl = document.getElementById('salah');
const kejayaanEl = document.getElementById('kejayaan');
const kejayaanInfoEl = document.getElementById('kejayaanInfo');
const tahapEl = document.getElementById('tahap');
const labelAtas = document.getElementById('labelAtas');
const labelBaseline = document.getElementById('labelBaseline');
const labelBawah = document.getElementById('labelBawah');
const ketepatanEl = document.getElementById('ketepatan');

let drawing = false;
let last = null;
let lastResult = {
  perkataan: '',
  sukuKata: [],
  fonetik: ''
};

// Setup canvas size dan DPI scaling
(function setupCanvas() {
  const cssWidth = guidesCanvas.parentElement.clientWidth || 800;
  const cssHeight = cssWidth * 3 / 8; // ratio 8:3
  const dpr = window.devicePixelRatio || 1;

  [canvas, guidesCanvas].forEach(c => {
    c.width = cssWidth * dpr;
    c.height = cssHeight * dpr;
    c.style.width = cssWidth + 'px';
    c.style.height = cssHeight + 'px';
  });

  ctx.scale(dpr, dpr);
  gctx.scale(dpr, dpr);

  drawGuides();
})();

// Audio sebutan
function sebut(text) {
  if (!speakerOn || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ms-MY';
  speechSynthesis.speak(utterance);
}

toggleSpeakerBtn.addEventListener('click', (e) => {
  speakerOn = !speakerOn;
  e.target.textContent = speakerOn ? '🔊 Speaker On' : '🔇 Mute Speaker';
});

// Tukar mod lukisan
penBtn.addEventListener('click', () => { mode = 'pen'; });
padamBtn.addEventListener('click', () => { mode = 'padam'; });

// Util sentuhan
function getTouchPos(e) {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0] || e.changedTouches[0];
  return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}

// Lukis stroke
function drawStroke(x1, y1, x2, y2) {
  const lw = saizGurisan.value === 'normal' ? lineWidthNormal : lineWidthSeparuh;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = mode === 'pen' ? '#000000' : '#fafafa'; // pen hitam, padam warna latar
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Event tetikus
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  last = { x: e.offsetX, y: e.offsetY };
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  drawStroke(last.x, last.y, e.offsetX, e.offsetY);
  last = { x: e.offsetX, y: e.offsetY };
});

canvas.addEventListener('mouseup', () => {
  drawing = false;
  last = null;
  analyzeStroke();
});

canvas.addEventListener('mouseleave', () => {
  drawing = false;
  last = null;
});

// Event sentuhan
const touchOpts = { passive: false };

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const p = getTouchPos(e);
  drawing = true;
  last = p;
}, touchOpts);

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!drawing) return;
  const p = getTouchPos(e);
  drawStroke(last.x, last.y, p.x, p.y);
  last = p;
}, touchOpts);

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  drawing = false;
  last = null;
  analyzeStroke();
}, touchOpts);

// Garis panduan
function drawGuides() {
  const cssWidth = guidesCanvas.clientWidth || 800;
  const cssHeight = guidesCanvas.clientHeight || 300;
  const dpr = window.devicePixelRatio || 1;

  gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  gctx.clearRect(0, 0, cssWidth, cssHeight);

  const h = cssHeight;
  const w = cssWidth;
  const yTop = h * 0.25;
  const yBase = h * 0.5;
  const yBot = h * 0.75;

  if (toggleGuides.checked) {
    gctx.setLineDash([8, 8]);
    gctx.strokeStyle = '#cfd8dc';
    gctx.lineWidth = 1;
    gctx.beginPath(); gctx.moveTo(0, yTop); gctx.lineTo(w, yTop); gctx.stroke();
    gctx.beginPath(); gctx.moveTo(0, yBot); gctx.lineTo(w, yBot); gctx.stroke();
  }

  if (toggleBaseline.checked) {
    gctx.setLineDash([]);
    gctx.strokeStyle = '#9e9e9e';
    gctx.lineWidth = 2;
    gctx.beginPath(); gctx.moveTo(0, yBase); gctx.lineTo(w, yBase); gctx.stroke();
  }

  labelAtas.style.top = (guidesCanvas.offsetTop + yTop - 18) + 'px';
  labelBaseline.style.top = (guidesCanvas.offsetTop + yBase - 18) + 'px';
  labelBawah.style.top = (guidesCanvas.offsetTop + yBot - 18) + 'px';
}

toggleGuides.addEventListener('change', drawGuides);
toggleBaseline.addEventListener('change', drawGuides);

// Bersih
bersihBtn.addEventListener('click', () => {
  const cssWidth = canvas.clientWidth || 800;
  const cssHeight = canvas.clientHeight || 300;
  ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  drawGuides();
  hasilEl.textContent = 'Tiada semakan lagi';
  deteksiEl.textContent = 'Status gurisan: belum dianalisis';
  lastResult = { perkataan: '', sukuKata: [], fonetik: '' };
});

// Muat turun PNG + teks suku kata
muatTurunBtn.addEventListener('click', () => {
  exportWithText();
});

// Mod latihan
function applyModeUI() {
  const checked = document.querySelector('input[name="mode"]:checked')?.value || 'bebas';
  perkataanInput.disabled = false;

  if (checked === 'bebas') {
    pilihRawakBtn.disabled = true;
    senaraiDitETapkan.disabled = true;
  } else if (checked === 'rawak') {
    pilihRawakBtn.disabled = false;
    senaraiDitETapkan.disabled = true;
  } else {
    pilihRawakBtn.disabled = true;
    senaraiDitETapkan.disabled = false;
  }
}

document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.addEventListener('change', applyModeUI);
});
applyModeUI();

// Rawak
pilihRawakBtn.addEventListener('click', () => {
  if (!window.WORDS || !window.WORDS.length) return;
  const idx = Math.floor(Math.random() * window.WORDS.length);
  perkataanInput.value = window.WORDS[idx];
});

// Ditetapkan
senaraiDitETapkan.addEventListener('change', (e) => {
  perkataanInput.value = e.target.value;
});

// Analisis ketumpatan gurisan
function analyzeStroke() {
  try {
    const cssWidth = canvas.clientWidth || 800;
    const cssHeight = canvas.clientHeight || 300;
    const dpr = window.devicePixelRatio || 1;
    const imgData = ctx.getImageData(0, 0, cssWidth, cssHeight);
    let darkPixels = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      const lum = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
      if (lum < 60) darkPixels++;
    }
    const density = darkPixels / (cssWidth * cssHeight);
    if (density > 0.12) deteksiEl.textContent = 'Status gurisan: Lorekan (ketumpatan tinggi)';
    else if (density > 0.02) deteksiEl.textContent = 'Status gurisan: Gurisan sah';
    else deteksiEl.textContent = 'Status gurisan: Sangat sedikit';
  } catch {
    deteksiEl.textContent = 'Status gurisan: tidak dapat dianalisis';
  }
}

// Semak gurisan (terjemah penuh)
semakBtn.addEventListener('click', async () => {
  const imageBase64 = canvas.toDataURL('image/png');
  const target = (perkataanInput.value || '').trim();

  try {
    const res = await fetch(`${window.API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, target })
    });
    const data = await res.json();

    if (data.error) {
      hasilEl.textContent = `Ralat: ${data.error}`;
      return;
    }

    const perkataan = data.perkataan || '(tidak pasti)';
    const sukuKata = Array.isArray(data.sukuKata) ? data.sukuKata : [];
    const fonetik = data.fonetik || '';

    lastResult = { perkataan, sukuKata, fonetik };

    const sukuText = sukuKata.length ? sukuKata.join(' + ') : '(tiada data)';
    hasilEl.textContent = `Perkataan: ${perkataan} | SukuKata: ${sukuText} | Fonetik: ${fonetik}`;

    if (perkataan && speakerOn) sebut(perkataan);

    const targetLower = target.toLowerCase();
    const ok = targetLower && perkataan.toLowerCase() === targetLower;
    updatePrestasi(ok);

  } catch (e) {
    console.error(e);
    hasilEl.textContent = 'Ralat: Sambungan API gagal';
  }
});

// Teka suku kata
tekaSukuKataBtn.addEventListener('click', async () => {
  const imageBase64 = canvas.toDataURL('image/png');
  try {
    const res = await fetch(`${window.API_BASE}/api/suku-kata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });
    const data = await res.json();
    if (data.error) {
      hasilEl.textContent = `Ralat: ${data.error}`;
      return;
    }

    const sukuKata = data.sukuKata || '(tidak pasti)';
    const fonetik = data.fonetik || '';
    lastResult = { perkataan: '', sukuKata: [sukuKata], fonetik };

    hasilEl.textContent = `SukuKata: ${sukuKata} | Fonetik: ${fonetik}`;
    if (sukuKata && speakerOn) sebut(sukuKata);
  } catch (e) {
    console.error(e);
    hasilEl.textContent = 'Ralat: Sambungan API gagal';
  }
});

// Ulang sebutan
ulangSebutanBtn.addEventListener('click', () => {
  const text = (perkataanInput.value || '').trim() || lastResult.perkataan;
  sebut(text);
});

// Rekod prestasi
function getStats() {
  return {
    betul: parseInt(localStorage.getItem('betul') || '0'),
    salah: parseInt(localStorage.getItem('salah') || '0'),
    attempts: parseInt(localStorage.getItem('attempts') || '0')
  };
}

function setStats(s) {
  localStorage.setItem('betul', s.betul);
  localStorage.setItem('salah', s.salah);
  localStorage.setItem('attempts', s.attempts);
}

function updatePrestasi(betul) {
  const s = getStats();
  s.attempts += 1;
  if (betul) s.betul += 1;
  else s.salah += 1;
  setStats(s);
  renderPrestasi();
}

function renderPrestasi() {
  const s = getStats();
  const rate = s.attempts ? Math.round((s.betul / s.attempts) * 100) : 0;

  betulEl.textContent = s.betul;
  salahEl.textContent = s.salah;
  kejayaanEl.textContent = `${rate}%`;
  if (kejayaanInfoEl) {
    kejayaanInfoEl.textContent = `${s.attempts} cubaan keseluruhan`;
  }
  if (ketepatanEl) ketepatanEl.textContent = `${rate}%`;

  let tahap = 'Pemula';
  if (rate >= 80) tahap = 'Mahir';
  else if (rate >= 50) tahap = 'Pertengahan';
  tahapEl.textContent = tahap;
}

renderPrestasi();

// Eksport CSV
exportCsvBtn.addEventListener('click', () => {
  const s = getStats();
  const csv = `betul,salah,attempts\n${s.betul},${s.salah},${s.attempts}\n`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rekod_prestasi.csv';
  a.click();
  URL.revokeObjectURL(url);
});

// Import CSV
importCsvInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = String(reader.result).trim();
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return;
    const vals = lines[1].split(',').map(v => v.trim());
    const s = {
      betul: parseInt(vals[0] || '0'),
      salah: parseInt(vals[1] || '0'),
      attempts: parseInt(vals[2] || '0')
    };
    setStats(s);
    renderPrestasi();
  };
  reader.readAsText(file);
});

// Reset prestasi
resetPrestasiBtn.addEventListener('click', () => {
  setStats({ betul: 0, salah: 0, attempts: 0 });
  renderPrestasi();
});

// Export dengan teks suku kata + perkataan
function exportWithText() {
  const cssWidth = canvas.clientWidth || 800;
  const cssHeight = canvas.clientHeight || 300;
  const exportHeight = cssHeight + 60; // ruang untuk teks

  const off = document.createElement('canvas');
  off.width = cssWidth;
  off.height = exportHeight;
  const octx = off.getContext('2d');

  // Latar
  octx.fillStyle = '#ffffff';
  octx.fillRect(0, 0, off.width, off.height);

  // Lukis garis panduan (ringkas, hanya baseline)
  const yTop = cssHeight * 0.25;
  const yBase = cssHeight * 0.5;
  const yBot = cssHeight * 0.75;

  octx.strokeStyle = '#cfd8dc';
  octx.setLineDash([8,8]);
  octx.beginPath(); octx.moveTo(0, yTop); octx.lineTo(cssWidth, yTop); octx.stroke();
  octx.beginPath(); octx.moveTo(0, yBot); octx.lineTo(cssWidth, yBot); octx.stroke();

  octx.setLineDash([]);
  octx.strokeStyle = '#9e9e9e';
  octx.lineWidth = 2;
  octx.beginPath(); octx.moveTo(0, yBase); octx.lineTo(cssWidth, yBase); octx.stroke();

  // Lukis gurisan dari canvas
  octx.drawImage(canvas, 0, 0, cssWidth, cssHeight);

  // Teks suku kata
  octx.fillStyle = '#333333';
  octx.font = '14px system-ui';
  const perkataan = lastResult.perkataan || (perkataanInput.value || '').trim();
  const sukuText = lastResult.sukuKata && lastResult.sukuKata.length
    ? lastResult.sukuKata.join(' + ')
    : '(tiada data suku kata)';
  const line1 = `Perkataan: ${perkataan || '(tidak pasti)'}`;
  const line2 = `SukuKata: ${sukuText}`;
  const line3 = lastResult.fonetik ? `Fonetik: ${lastResult.fonetik}` : '';

  octx.fillText(line1, 10, cssHeight + 20);
  octx.fillText(line2, 10, cssHeight + 38);
  if (line3) octx.fillText(line3, 10, cssHeight + 56);

  const link = document.createElement('a');
  link.download = 'gurisan_trengkas.png';
  link.href = off.toDataURL('image/png');
  link.click();
}
