// ==========================
// app.js (Debug Mode ON)
// ==========================

const DEBUG = true;

// Util log debug
function dlog(...args) {
  if (!DEBUG) return;
  console.log('[GURISAN DEBUG]', ...args);
}

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

// ==========================
// Setup canvas + DPI scaling
========================== */

function setupCanvas() {
  const wrap = guidesCanvas.parentElement;
  const cssWidth = wrap.clientWidth || 800;
  const cssHeight = cssWidth * 3 / 8; // ratio 8:3
  const dpr = window.devicePixelRatio || 1;

  dlog('setupCanvas() called', { cssWidth, cssHeight, dpr });

  [canvas, guidesCanvas].forEach((c) => {
    c.width = cssWidth * dpr;
    c.height = cssHeight * dpr;
    c.style.width = cssWidth + 'px';
    c.style.height = cssHeight + 'px';
  });

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  gctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  dlog('Canvas sizes after setup:', {
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    guidesWidth: guidesCanvas.width,
    guidesHeight: guidesCanvas.height
  });

  drawGuides();
}

// Panggil sekali pada permulaan
setupCanvas();

// Responsif: bila window resize, susun semula
window.addEventListener('resize', () => {
  dlog('window resize detected');
  setupCanvas();
});

// ==========================
// Audio sebutan
// ==========================
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

// ==========================
// Tukar mod lukisan
// ==========================

penBtn.addEventListener('click', () => {
  mode = 'pen';
  dlog('Mode set to PEN');
});
padamBtn.addEventListener('click', () => {
  mode = 'padam';
  dlog('Mode set to PADAM');
});

// ==========================
// Util sentuhan
// ==========================
function getTouchPos(e) {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0] || e.changedTouches[0];
  return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}

// ==========================
// Lukis stroke
// ==========================
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

// ==========================
// Event tetikus
// ==========================

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

// ==========================
// Event sentuhan
// ==========================
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

// ==========================
// Garis panduan (Debug Mode ON)
// ==========================
function drawGuides() {
  const cssWidth = guidesCanvas.clientWidth || 800;
  const cssHeight = guidesCanvas.clientHeight || 300;
  const dpr = window.devicePixelRatio || 1;

  dlog('drawGuides() start', { cssWidth, cssHeight, dpr });

  // Auto-fix jika canvas tidak valid
  if (cssWidth === 0 || cssHeight === 0) {
    dlog('WARNING: guidesCanvas CSS size 0, fallback to parent width.');
    const parent = guidesCanvas.parentElement;
    const fallbackW = parent ? parent.clientWidth || 800 : 800;
    guidesCanvas.style.width = fallbackW + 'px';
    guidesCanvas.style.height = (fallbackW * 3 / 8) + 'px';
  }

  // Reset transform dan bersihkan canvas
  gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  gctx.clearRect(0, 0, cssWidth, cssHeight);

  const yTop = cssHeight * 0.25;
  const yBase = cssHeight * 0.5;
  const yBot = cssHeight * 0.75;

  dlog('Guide lines positions', { yTop, yBase, yBot });

  // Garisan atas & bawah (putus-putus)
  if (toggleGuides.checked) {
    gctx.setLineDash([8, 8]);
    gctx.strokeStyle = '#cfd8dc';
    gctx.lineWidth = 1;

    // Atas
    gctx.beginPath();
    gctx.moveTo(0, yTop);
    gctx.lineTo(cssWidth, yTop);
    gctx.stroke();

    // Bawah
    gctx.beginPath();
    gctx.moveTo(0, yBot);
    gctx.lineTo(cssWidth, yBot);
    gctx.stroke();
  }

  // Garisan tengah (baseline penuh)
  if (toggleBaseline.checked) {
    gctx.setLineDash([]);
    gctx.strokeStyle = '#9e9e9e';
    gctx.lineWidth = 2.5;

    gctx.beginPath();
    gctx.moveTo(0, yBase);
    gctx.lineTo(cssWidth, yBase);
    gctx.stroke();
  }

  // Kedudukan label menggunakan getBoundingClientRect
  const rect = guidesCanvas.getBoundingClientRect();
  const offsetTop = rect.top + window.scrollY;
  const offsetLeft = rect.left + window.scrollX;

  labelAtas.style.position = 'absolute';
  labelBaseline.style.position = 'absolute';
  labelBawah.style.position = 'absolute';

  labelAtas.style.left = (offsetLeft + 8) + 'px';
  labelBaseline.style.left = (offsetLeft + 8) + 'px';
  labelBawah.style.left = (offsetLeft + 8) + 'px';

  labelAtas.style.top = (offsetTop + yTop - 18) + 'px';
  labelBaseline.style.top = (offsetTop + yBase - 18) + 'px';
  labelBawah.style.top = (offsetTop + yBot - 18) + 'px';

  dlog('Labels positioned', {
    atasTop: labelAtas.style.top,
    baselineTop: labelBaseline.style.top,
    bawahTop: labelBawah.style.top
  });
}

toggleGuides.addEventListener('change', () => {
  dlog('toggleGuides changed:', toggleGuides.checked);
  drawGuides();
});
toggleBaseline.addEventListener('change', () => {
  dlog('toggleBaseline changed:', toggleBaseline.checked);
  drawGuides();
});

// ==========================
// Bersih kanvas
// ==========================
bersihBtn.addEventListener('click', () => {
  const cssWidth = canvas.clientWidth || 800;
  const cssHeight = canvas.clientHeight || 300;
  const dpr = window.devicePixelRatio || 1;

  dlog('Bersih kanvas', { cssWidth, cssHeight, dpr });

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  drawGuides();
  hasilEl.textContent = 'Tiada semakan lagi';
  deteksiEl.textContent = 'Status gurisan: belum dianalisis';
  lastResult = { perkataan: '', sukuKata: [], fonetik: '' };
});
// ==========================
// Analisis ketumpatan gurisan
// ==========================
function analyzeStroke() {
  try {
    const cssWidth = canvas.clientWidth || 800;
    const cssHeight = canvas.clientHeight || 300;
    const imgData = ctx.getImageData(0, 0, cssWidth, cssHeight);

    let darkPixels = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      const lum = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
      if (lum < 60) darkPixels++;
    }

    const density = darkPixels / (cssWidth * cssHeight);
    dlog('Stroke density:', density);

    if (density > 0.12) deteksiEl.textContent = 'Status gurisan: Lorekan (ketumpatan tinggi)';
    else if (density > 0.02) deteksiEl.textContent = 'Status gurisan: Gurisan sah';
    else deteksiEl.textContent = 'Status gurisan: Sangat sedikit';

  } catch (err) {
    dlog('analyzeStroke() error:', err);
    deteksiEl.textContent = 'Status gurisan: tidak dapat dianalisis';
  }
}

// ==========================
// Semak Gurisan (API)
// ==========================
semakBtn.addEventListener('click', async () => {
  const imageBase64 = canvas.toDataURL('image/png');
  const target = (perkataanInput.value || '').trim();

  dlog('Semak Gurisan clicked', { target });

  try {
    const res = await fetch(`${window.API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, target })
    });

    const data = await res.json();
    dlog('API /translate response:', data);

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

    const ok = target && perkataan.toLowerCase() === target.toLowerCase();
    updatePrestasi(ok);

  } catch (e) {
    dlog('API /translate error:', e);
    hasilEl.textContent = 'Ralat: Sambungan API gagal';
  }
});

// ==========================
// Teka Suku Kata
// ==========================
tekaSukuKataBtn.addEventListener('click', async () => {
  const imageBase64 = canvas.toDataURL('image/png');

  dlog('Teka Suku Kata clicked');

  try {
    const res = await fetch(`${window.API_BASE}/api/suku-kata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });

    const data = await res.json();
    dlog('API /suku-kata response:', data);

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
    dlog('API /suku-kata error:', e);
    hasilEl.textContent = 'Ralat: Sambungan API gagal';
  }
});

// ==========================
// Ulang Sebutan
// ==========================
ulangSebutanBtn.addEventListener('click', () => {
  const text = (perkataanInput.value || '').trim() || lastResult.perkataan;
  dlog('Ulang Sebutan:', text);
  sebut(text);
});

// ==========================
// Rekod Prestasi
// ==========================
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
  kejayaanInfoEl.textContent = `${s.attempts} cubaan keseluruhan`;
  ketepatanEl.textContent = `${rate}%`;

  let tahap = 'Pemula';
  if (rate >= 80) tahap = 'Mahir';
  else if (rate >= 50) tahap = 'Pertengahan';
  tahapEl.textContent = tahap;

  dlog('Prestasi updated:', s);
}

renderPrestasi();

// ==========================
// Eksport CSV
// ==========================
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

  dlog('CSV exported:', csv);
});

// ==========================
// Import CSV
// ==========================
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
    dlog('CSV imported:', s);
  };

  reader.readAsText(file);
});

// ==========================
// Reset Prestasi
// ==========================
resetPrestasiBtn.addEventListener('click', () => {
  setStats({ betul: 0, salah: 0, attempts: 0 });
  renderPrestasi();
  dlog('Prestasi reset');
});

// ==========================
// Export PNG + teks
// ==========================
function exportWithText() {
  const cssWidth = canvas.clientWidth || 800;
  const cssHeight = canvas.clientHeight || 300;
  const exportHeight = cssHeight + 60;

  const off = document.createElement('canvas');
  off.width = cssWidth;
  off.height = exportHeight;
  const octx = off.getContext('2d');

  octx.fillStyle = '#ffffff';
  octx.fillRect(0, 0, off.width, off.height);

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

  octx.drawImage(canvas, 0, 0, cssWidth, cssHeight);

  octx.fillStyle = '#333333';
  octx.font = '14px system-ui';

  const perkataan = lastResult.perkataan || (perkataanInput.value || '').trim();
  const sukuText = lastResult.sukuKata?.length
    ? lastResult.sukuKata.join(' + ')
    : '(tiada data suku kata)';

  octx.fillText(`Perkataan: ${perkataan}`, 10, cssHeight + 20);
  octx.fillText(`SukuKata: ${sukuText}`, 10, cssHeight + 38);
  if (lastResult.fonetik) {
    octx.fillText(`Fonetik: ${lastResult.fonetik}`, 10, cssHeight + 56);
  }

  const link = document.createElement('a');
  link.download = 'gurisan_trengkas.png';
  link.href = off.toDataURL('image/png');
  link.click();

  dlog('PNG exported with text');
}

muatTurunBtn.addEventListener('click', exportWithText);

// ==========================
// Mode Bebas / Rawak / Ditetapkan
// ==========================
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

  dlog('Mode UI applied:', checked);
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
  dlog('Rawak pilih:', window.WORDS[idx]);
});

// Ditetapkan
senaraiDitETapkan.addEventListener('change', (e) => {
  perkataanInput.value = e.target.value;
  dlog('Ditetapkan pilih:', e.target.value);
});
