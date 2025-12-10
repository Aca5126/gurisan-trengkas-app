// Tetapan global
let mode = 'pen';
let speakerOn = true;
let lineWidthNormal = 6;
let lineWidthSeparuh = 3;

// Dapatkan elemen
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
const tahapEl = document.getElementById('tahap');
const labelAtas = document.getElementById('labelAtas');
const labelBaseline = document.getElementById('labelBaseline');
const labelBawah = document.getElementById('labelBawah');

let drawing = false;
let last = null;

// DPI scaling (opsyenal, untuk kejelasan pada telefon/peranti retina)
(function setupDPR() {
  const dpr = window.devicePixelRatio || 1;
  const cssW = 800, cssH = 300;
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  guidesCanvas.width = cssW * dpr;
  guidesCanvas.height = cssH * dpr;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  guidesCanvas.style.width = cssW + 'px';
  guidesCanvas.style.height = cssH + 'px';
  ctx.scale(dpr, dpr);
  gctx.scale(dpr, dpr);
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

// Tetikus
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  last = { x: e.offsetX, y: e.offsetY };
});
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  drawStroke(last.x, last.y, e.offsetX, e.offsetY);
  last = { x: e.offsetX, y: e.offsetY };
});
canvas.addEventListener('mouseup', () => { drawing = false; last = null; analyzeStroke(); });
canvas.addEventListener('mouseleave', () => { drawing = false; last = null; });

// Sentuhan (telefon)
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

function getTouchPos(e) {
  const rect = canvas.getBoundingClientRect();
  const t = e.touches[0] || e.changedTouches[0];
  return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}

function drawStroke(x1, y1, x2, y2) {
  const lw = saizGurisan.value === 'normal' ? lineWidthNormal : lineWidthSeparuh;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = mode === 'pen' ? '#000' : '#fff'; // kontras jelas
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

// Overlay garis panduan
function drawGuides() {
  gctx.clearRect(0, 0, guidesCanvas.width, guidesCanvas.height);
  const h = 300; // gunakan saiz CSS untuk label posisi
  const w = 800;
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
    gctx.lineWidth = 2.5;
    gctx.beginPath(); gctx.moveTo(0, yBase); gctx.lineTo(w, yBase); gctx.stroke();
  }

  // Posisi label ikut saiz CSS (bukan backing store)
  labelAtas.style.top = (yTop - 18) + 'px';
  labelBaseline.style.top = (yBase - 18) + 'px';
  labelBawah.style.top = (yBot - 18) + 'px';
}
drawGuides();
toggleGuides.addEventListener('change', drawGuides);
toggleBaseline.addEventListener('change', drawGuides);

// Bersih
bersihBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, 800, 300);
  drawGuides();
  hasilEl.textContent = 'Tiada semakan lagi';
  deteksiEl.textContent = 'Status gurisan: belum dianalisis';
});

// Muat turun
muatTurunBtn.addEventListener('click', () => {
  // Export lapisan lukisan sahaja
  const link = document.createElement('a');
  link.download = 'gurisan.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Mod latihan (input sentiasa aktif)
function applyModeUI() {
  const checked = document.querySelector('input[name="mode"]:checked')?.value || 'bebas';
  perkataanInput.disabled = false; // sentiasa boleh menaip

  if (checked === 'bebas') {
    pilihRawakBtn.disabled = true;
    senaraiDitETapkan.disabled = true;
  } else if (checked === 'rawak') {
    pilihRawakBtn.disabled = false;
    senaraiDitETapkan.disabled = true;
  } else {
    // ditetapkan
    pilihRawakBtn.disabled = true;
    senaraiDitETapkan.disabled = false;
  }
}
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.addEventListener('change', applyModeUI);
});
applyModeUI();

// Rawak/Ditetapkan
pilihRawakBtn.addEventListener('click', () => {
  const idx = Math.floor(Math.random() * window.WORDS.length);
  perkataanInput.value = window.WORDS[idx];
});
senaraiDitETapkan.addEventListener('change', (e) => {
  perkataanInput.value = e.target.value;
});

// Analisis ketumpatan gurisan
function analyzeStroke() {
  try {
    const imgData = ctx.getImageData(0, 0, 800, 300);
    let darkPixels = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      // alpha tidak digunakan (kanvas penuh opaque)
      const lum = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
      if (lum < 60) darkPixels++;
    }
    const density = darkPixels / (800 * 300);
    if (density > 0.12) deteksiEl.textContent = 'Status gurisan: Lorekan (ketumpatan tinggi)';
    else if (density > 0.02) deteksiEl.textContent = 'Status gurisan: Gurisan sah';
    else deteksiEl.textContent = 'Status gurisan: Sangat sedikit';
  } catch {
    deteksiEl.textContent = 'Status gurisan: tidak dapat dianalisis';
  }
}

// Semak gurisan (terjemahan penuh)
semakBtn.addEventListener('click', async () => {
  try {
    const imageBase64 = canvas.toDataURL('image/png');
    const res = await fetch(`${window.API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, target: (perkataanInput.value || '').trim() })
    });
    const data = await res.json();
    if (data.error) {
      hasilEl.textContent = `Ralat: ${data.error}`;
      return;
    }
    const perkataan = data.perkataan || '(tidak pasti)';
    const sukuKata = (data.sukuKata || []).join(' + ');
    const fonetik = data.fonetik || '';
    hasilEl.textContent = `Perkataan: ${perkataan} | SukuKata: ${sukuKata} | Fonetik: ${fonetik}`;
    if (perkataan) sebut(perkataan);
    // Kemaskini prestasi (ringkas: kira betul jika sama dengan target bila diisi)
    const target = (perkataanInput.value || '').trim().toLowerCase();
    const ok = target && perkataan.toLowerCase() === target;
    updatePrestasi(ok);
  } catch (e) {
    hasilEl.textContent = 'Ralat: Sambungan API gagal';
  }
});

// Teka suku kata
tekaSukuKataBtn.addEventListener('click', async () => {
  try {
    const imageBase64 = canvas.toDataURL('image/png');
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
    hasilEl.textContent = `SukuKata: ${data.sukuKata || '(tidak pasti)'} | Fonetik: ${data.fonetik || ''}`;
    if (data.sukuKata) sebut(data.sukuKata);
  } catch {
    hasilEl.textContent = 'Ralat: Sambungan API gagal';
  }
});

// Ulang sebutan
ulangSebutanBtn.addEventListener('click', () => {
  const text = (perkataanInput.value || '').trim();
  sebut(text);
});

// Rekod prestasi
function getStats() {
  return {
    betul: parseInt(localStorage.getItem('betul') || '0'),
    salah: parseInt(localStorage.getItem('salah') || '0'),
    attempts: parseInt(localStorage.getItem('attempts') || '0'),
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
  if (betul) s.betul += 1; else s.salah += 1;
  setStats(s);
  renderPrestasi();
}
function renderPrestasi() {
  const s = getStats();
  const rate = s.attempts ? Math.round((s.betul / s.attempts) * 100) : 0;
  betulEl.textContent = s.betul;
  salahEl.textContent = s.salah;
  kejayaanEl.textContent = `${rate}%`;
  const ketepatanEl = document.getElementById('ketepatan');
  if (ketepatanEl) ketepatanEl.textContent = `${rate}%`;
  tahapEl.textContent = rate >= 80 ? 'Mahir' : rate >= 50 ? 'Pertengahan' : 'Pemula';
}
renderPrestasi();

// Eksport/Import CSV Rekod
exportCsvBtn.addEventListener('click', () => {
  const s = getStats();
  const csv = `betul,salah,attempts\n${s.betul},${s.salah},${s.attempts}\n`;
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'rekod_prestasi.csv'; a.click();
  URL.revokeObjectURL(url);
});
importCsvInput.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    const lines = String(reader.result).trim().split(/\r?\n/);
    const vals = lines[1]?.split(',').map(x => x.trim()) || [];
    const s = { betul: parseInt(vals[0] || '0'), salah: parseInt(vals[1] || '0'), attempts: parseInt(vals[2] || '0') };
    setStats(s);
    renderPrestasi();
  };
  reader.readAsText(f);
});
resetPrestasiBtn.addEventListener('click', () => {
  setStats({ betul: 0, salah: 0, attempts: 0 });
  renderPrestasi();
});
