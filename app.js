// =======================================
// KONFIG & DEBUG
// =======================================

const API_BASE = window.API_BASE || 'https://gurisan-trengkas-backend.onrender.com';
const DEBUG = true;

function dlog(...args) {
  if (DEBUG) console.log('[GURISAN DEBUG]', ...args);
}

// =======================================
// GLOBAL STATE
// =======================================

let drawing = false;
let erasing = false;
let lastX = 0;
let lastY = 0;
let canvas, ctx, guidesCanvas, guidesCtx;
let currentMode = 'bebas'; // 'bebas' | 'rawak' | 'ditetapkan'
let speakerOn = true;

// Rekod prestasi ringkas
let rekod = {
  betul: 0,
  salah: 0,
  jumlah: 0,
  ketepatanTerkumpul: 0 // dalam %
};

// =======================================
// SETUP CANVAS & GARIS PANDUAN
// =======================================

function setupCanvas() {
  dlog('setupCanvas() called');

  canvas = document.getElementById('canvas');
  guidesCanvas = document.getElementById('guidesCanvas');

  if (!canvas || !guidesCanvas) {
    dlog('Canvas element tidak dijumpai');
    return;
  }

  ctx = canvas.getContext('2d');
  guidesCtx = guidesCanvas.getContext('2d');

  resizeCanvas();
  attachDrawingEvents();
  drawGuides();
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // reset & scale

  guidesCanvas.width = rect.width * dpr;
  guidesCanvas.height = rect.height * dpr;
  guidesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  dlog('resizeCanvas()', { width: rect.width, height: rect.height, dpr });
  drawGuides();
}

function drawGuides() {
  if (!guidesCanvas || !guidesCtx) return;

  const rect = guidesCanvas.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;

  guidesCtx.clearRect(0, 0, w, h);

  const yTop = h * 0.25;
  const yBase = h * 0.5;
  const yBot = h * 0.75;

  // Garis putus-putus atas & bawah
  guidesCtx.strokeStyle = '#cfd8dc';
  guidesCtx.setLineDash([8, 8]);
  guidesCtx.lineWidth = 1;
  guidesCtx.beginPath(); guidesCtx.moveTo(0, yTop); guidesCtx.lineTo(w, yTop); guidesCtx.stroke();
  guidesCtx.beginPath(); guidesCtx.moveTo(0, yBot); guidesCtx.lineTo(w, yBot); guidesCtx.stroke();

  // Baseline solid
  guidesCtx.setLineDash([]);
  guidesCtx.strokeStyle = '#9e9e9e';
  guidesCtx.lineWidth = 2;
  guidesCtx.beginPath(); guidesCtx.moveTo(0, yBase); guidesCtx.lineTo(w, yBase); guidesCtx.stroke();

  dlog('drawGuides() done', { yTop, yBase, yBot });
}

// =======================================
// LOGIK LUKIS (PEN & PEMADAM)
// =======================================

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;

  if (e.touches && e.touches[0]) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDrawing(e) {
  e.preventDefault();
  drawing = true;
  const pos = getCanvasPos(e);
  lastX = pos.x;
  lastY = pos.y;
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();

  const pos = getCanvasPos(e);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 3;

  if (erasing) {
    ctx.strokeStyle = '#ffffff';
  } else {
    ctx.strokeStyle = '#000000';
  }

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
}

function stopDrawing(e) {
  if (!drawing) return;
  e && e.preventDefault();
  drawing = false;
}

function attachDrawingEvents() {
  // Mouse
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDrawing);

  // Touch
  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);
}

// =======================================
// UTILITI UI
// =======================================

function setMode(mode) {
  currentMode = mode;
  dlog('Mode ditukar kepada:', mode);
}

function bersihkanCanvas() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGuides();

  const hasil = document.getElementById('hasil');
  const deteksi = document.getElementById('deteksiGurisan');
  if (hasil) hasil.textContent = 'Tiada semakan lagi';
  if (deteksi) deteksi.textContent = 'Status gurisan: belum dianalisis';
}

function kemaskiniRekod(berjaya, ketepatan) {
  rekod.jumlah += 1;
  if (berjaya) rekod.betul += 1;
  else rekod.salah += 1;

  if (typeof ketepatan === 'number') {
    rekod.ketepatanTerkumpul += ketepatan;
  }

  const kadarKejayaan = rekod.jumlah > 0 ? Math.round((rekod.betul / rekod.jumlah) * 100) : 0;
  const purataKetepatan = rekod.jumlah > 0 ? Math.round(rekod.ketepatanTerkumpul / rekod.jumlah) : 0;

  const betulEl = document.getElementById('betul');
  const salahEl = document.getElementById('salah');
  const kejayaanEl = document.getElementById('kejayaan');
  const kejayaanInfoEl = document.getElementById('kejayaanInfo');
  const ketepatanEl = document.getElementById('ketepatan');
  const tahapEl = document.getElementById('tahap');

  if (betulEl) betulEl.textContent = rekod.betul;
  if (salahEl) salahEl.textContent = rekod.salah;
  if (kejayaanEl) kejayaanEl.textContent = `${kadarKejayaan}%`;
  if (kejayaanInfoEl) kejayaanInfoEl.textContent = `${rekod.jumlah} cubaan keseluruhan`;
  if (ketepatanEl) ketepatanEl.textContent = `${purataKetepatan}%`;

  let tahap = 'Pemula';
  if (kadarKejayaan >= 80 && purataKetepatan >= 80) tahap = 'Mahir';
  else if (kadarKejayaan >= 50) tahap = 'Pertengahan';

  if (tahapEl) tahapEl.textContent = tahap;

  dlog('Rekod dikemaskini:', { ...rekod, kadarKejayaan, purataKetepatan, tahap });
}

// =======================================
// SEMAKAN GURISAN & BACKEND
// =======================================

async function semakGurisan() {
  if (!canvas) return;

  const perkataanInput = document.getElementById('perkataan');
  const hasil = document.getElementById('hasil');
  const deteksi = document.getElementById('deteksiGurisan');

  const perkataan = perkataanInput.value.trim();
  if (!perkataan) {
    alert('Sila masukkan atau pilih perkataan terlebih dahulu.');
    return;
  }

  const dataUrl = canvas.toDataURL('image/png');

  try {
    dlog('Hantar ke backend /semak');

    const res = await fetch(`${API_BASE}/semak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl, perkataan })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    dlog('Respon /semak:', data);

    const mesej = data.mesej || 'Semakan siap.';
    const status = data.status || 'tidak pasti';
    const ketepatan = typeof data.ketepatan === 'number' ? data.ketepatan : null;
    const betul = data.betul === true || status === 'betul';

    if (hasil) hasil.textContent = mesej;
    if (deteksi) deteksi.textContent = `Status gurisan: ${status}${ketepatan !== null ? ` (${ketepatan}%)` : ''}`;

    kemaskiniRekod(betul, ketepatan ?? 0);

  } catch (err) {
    console.error(err);
    if (hasil) hasil.textContent = 'Ralat ketika menyemak gurisan.';
    if (deteksi) deteksi.textContent = 'Status gurisan: ralat.';
  }
}

async function tekaSukuKata() {
  const perkataanInput = document.getElementById('perkataan');
  const perkataan = perkataanInput.value.trim();
  if (!perkataan) {
    alert('Sila masukkan atau pilih perkataan terlebih dahulu.');
    return;
  }

  try {
    dlog('Panggil /suku-kata');

    const res = await fetch(`${API_BASE}/suku-kata?perkataan=${encodeURIComponent(perkataan)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    dlog('Respon /suku-kata:', data);

    alert(`Suku kata: ${data.suku_kata || 'Tidak dapat dikenal pasti'}`);
  } catch (err) {
    console.error(err);
    alert('Ralat ketika mendapatkan suku kata.');
  }
}

// =======================================
// AUDIO SEBUTAN
// =======================================

function ulangSebutan() {
  const perkataanInput = document.getElementById('perkataan');
  const perkataan = perkataanInput.value.trim();
  if (!perkataan) {
    alert('Tiada perkataan untuk disebut.');
    return;
  }

  if (!speakerOn) {
    alert('Speaker dimatikan. Hidupkan semula untuk guna fungsi ini.');
    return;
  }

  const utter = new SpeechSynthesisUtterance(perkataan);
  utter.lang = 'ms-MY';
  speechSynthesis.speak(utter);
}

// =======================================
// MUAT TURUN PNG
// =======================================

function muatTurunPNG() {
  if (!canvas) return;
  const perkataan = (document.getElementById('perkataan').value.trim() || 'gurisan').replace(/\s+/g, '_');
  const link = document.createElement('a');
  link.download = `${perkataan}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// =======================================
// MOD PERKATAAN: BEBAS / RAWAK / DITETAPKAN
// =======================================

function pilihRawak() {
  if (!window.WORDS || !Array.isArray(window.WORDS) || window.WORDS.length === 0) {
    alert('Senarai perkataan rawak tidak dijumpai.');
    return;
  }
  const idx = Math.floor(Math.random() * window.WORDS.length);
  const perkataan = window.WORDS[idx];
  const input = document.getElementById('perkataan');
  input.value = perkataan;
  dlog('Pilih rawak:', perkataan);
}

function initDitETapkanSelect() {
  const select = document.getElementById('senaraiDitETapkan');
  if (!select) return;

  // Jika words.js sudah auto-populate, jangan sentuh
  if (select.options.length > 0) {
    dlog('senaraiDitETapkan sudah terisi daripada words.js');
    return;
  }

  // Fallback: isi dengan WORDS biasa
  if (window.WORDS && window.WORDS.length > 0) {
    window.WORDS.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = w;
      select.appendChild(opt);
    });
    dlog('senaraiDitETapkan diisi fallback dari WORDS');
  }
}

// =======================================
// REKOD PRESTASI: RESET, CSV
// =======================================

function resetPrestasi() {
  rekod = { betul: 0, salah: 0, jumlah: 0, ketepatanTerkumpul: 0 };
  kemaskiniRekod(false, 0); // akan set semua paparan kepada 0
  dlog('Rekod prestasi direset');
}

// (Ringkas: hanya eksport asas; boleh diperluas ikut keperluan)
function eksportCSV() {
  const rows = [
    ['Betul', 'Salah', 'Jumlah', 'PurataKetepatan(%)'],
    [
      rekod.betul,
      rekod.salah,
      rekod.jumlah,
      rekod.jumlah > 0 ? Math.round(rekod.ketepatanTerkumpul / rekod.jumlah) : 0
    ]
  ];

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rekod_prestasi.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// =======================================
// TOGGLE SPEAKER
// =======================================

function toggleSpeaker() {
  const btn = document.getElementById('toggleSpeakerBtn');
  speakerOn = !speakerOn;
  if (btn) btn.textContent = speakerOn ? '🔊 Speaker On' : '🔇 Speaker Off';
  dlog('SpeakerOn:', speakerOn);
}

// =======================================
// INIT SEMUA EVENT LISTENER
// =======================================

function initEvents() {
  dlog('initEvents() called');

  // Mode radio
  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', e => {
      setMode(e.target.value);
    });
  });

  // Buttons canvas tools
  const penBtn = document.getElementById('penBtn');
  const padamBtn = document.getElementById('padamBtn');
  const bersihBtn = document.getElementById('bersihBtn');
  const semakBtn = document.getElementById('semakBtn');
  const tekaSukuKataBtn = document.getElementById('tekaSukuKataBtn');
  const ulangSebutanBtn = document.getElementById('ulangSebutanBtn');
  const muatTurunBtn = document.getElementById('muatTurunBtn');
  const pilihRawakBtn = document.getElementById('pilihRawakBtn');
  const senaraiDitETapkan = document.getElementById('senaraiDitETapkan');
  const resetPrestasiBtn = document.getElementById('resetPrestasiBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const toggleGuidesCb = document.getElementById('toggleGuides');
  const toggleBaselineCb = document.getElementById('toggleBaseline');
  const toggleSpeakerBtn = document.getElementById('toggleSpeakerBtn');

  if (penBtn) penBtn.addEventListener('click', () => { erasing = false; dlog('Pen mode'); });
  if (padamBtn) padamBtn.addEventListener('click', () => { erasing = true; dlog('Padam mode'); });
  if (bersihBtn) bersihBtn.addEventListener('click', bersihkanCanvas);
  if (semakBtn) semakBtn.addEventListener('click', semakGurisan);
  if (tekaSukuKataBtn) tekaSukuKataBtn.addEventListener('click', tekaSukuKata);
  if (ulangSebutanBtn) ulangSebutanBtn.addEventListener('click', ulangSebutan);
  if (muatTurunBtn) muatTurunBtn.addEventListener('click', muatTurunPNG);
  if (pilihRawakBtn) pilihRawakBtn.addEventListener('click', pilihRawak);
  if (senaraiDitETapkan) senaraiDitETapkan.addEventListener('change', e => {
    document.getElementById('perkataan').value = e.target.value;
    dlog('Ditetapkan pilih:', e.target.value);
  });
  if (resetPrestasiBtn) resetPrestasiBtn.addEventListener('click', resetPrestasi);
  if (exportCsvBtn) exportCsvBtn.addEventListener('click', eksportCSV);
  if (toggleSpeakerBtn) toggleSpeakerBtn.addEventListener('click', toggleSpeaker);

  if (toggleGuidesCb) toggleGuidesCb.addEventListener('change', e => {
    guidesCanvas.style.display = e.target.checked ? 'block' : 'none';
  });

  const labelBaseline = document.getElementById('labelBaseline');
  if (toggleBaselineCb && labelBaseline) {
    toggleBaselineCb.addEventListener('change', e => {
      labelBaseline.style.display = e.target.checked ? 'inline' : 'none';
    });
  }

  // Pastikan select Ditetapkan terisi jika words.js belum auto-populate
  initDitETapkanSelect();
}

// =======================================
// WINDOW LOAD
// =======================================

window.addEventListener('load', () => {
  dlog('Window load');
  setupCanvas();
  initEvents();
  window.addEventListener('resize', resizeCanvas);
});
