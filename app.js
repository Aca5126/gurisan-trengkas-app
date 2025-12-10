// Tetapan global
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
const tahapEl = document.getElementById('tahap');
const labelAtas = document.getElementById('labelAtas');
const labelBaseline = document.getElementById('labelBaseline');
const labelBawah = document.getElementById('labelBawah');

let drawing = false;
let last = null;

// Sebutan audio
function sebut(text) {
  if (!speakerOn || !text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ms-MY';
  speechSynthesis.speak(utterance);
}

// Toggle speaker
toggleSpeakerBtn.addEventListener('click', (e) => {
  speakerOn = !speakerOn;
  e.target.textContent = speakerOn ? '🔊 Speaker On' : '🔇 Mute Speaker';
});

// Mod lukisan
penBtn.addEventListener('click', () => { mode = 'pen'; });
padamBtn.addEventListener('click', () => { mode = 'padam'; });

// Event tetikus
canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  last = { x: e.offsetX, y: e.offsetY };
});
canvas.addEventListener('mouseup', () => {
  drawing = false;
  last = null;
  analyzeStroke();
});
canvas.addEventListener('mouseleave', () => { drawing = false; last = null; });
canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const lw = saizGurisan.value === 'normal' ? lineWidthNormal : lineWidthSeparuh;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = mode === 'pen' ? '#111' : '#fafafa';
  ctx.lineWidth = lw;
  if (!last) last = { x: e.offsetX, y: e.offsetY };
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  last = { x: e.offsetX, y: e.offsetY };
});

// Event sentuhan (telefon)
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  drawing = true;
  last = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
});
canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const lw = saizGurisan.value === 'normal' ? lineWidthNormal : lineWidthSeparuh;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = mode === 'pen' ? '#111' : '#fafafa';
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(last.x, last.y);
  ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
  ctx.stroke();
  last = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
});
canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  drawing = false;
  last = null;
  analyzeStroke();
});

// Garis panduan overlay
function drawGuides() {
  gctx.clearRect(0, 0, guidesCanvas.width, guidesCanvas.height);

  const h = guidesCanvas.height;
  const yTop = h * 0.25;
  const yBase = h * 0.5;
  const yBot = h * 0.75;

  if (toggleGuides.checked) {
    gctx.setLineDash([8, 8]);
    gctx.strokeStyle = '#cfd8dc';
    gctx.lineWidth = 1;
    gctx.beginPath(); gctx.moveTo(0, yTop); gctx.lineTo(guidesCanvas.width, yTop); gctx.stroke();
    gctx.beginPath(); gctx.moveTo(0, yBot); gctx.lineTo(guidesCanvas.width, yBot); gctx.stroke();
  }

  if (toggleBaseline.checked) {
    gctx.setLineDash([]);
    gctx.strokeStyle = '#9e9e9e';
    gctx.lineWidth = 2.5;
    gctx.beginPath(); gctx.moveTo(0, yBase); gctx.lineTo(guidesCanvas.width, yBase); gctx.stroke();
  }

  labelAtas.style.top = `${yTop - 18}px`;
  labelBaseline.style.top = `${yBase - 18}px`;
  labelBawah.style.top = `${yBot - 18}px`;
}
drawGuides();

// Bersihkan
bersihBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGuides();
  hasilEl.textContent = 'Tiada semakan lagi';
  deteksiEl.textContent = 'Status gurisan: belum dianalisis';
});

// Muat turun
muatTurunBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'gurisan.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Mod latihan
document.querySelectorAll('input[name="mode"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const mode = e.target.value;
    if (mode === 'bebas') {
      pilihRawakBtn.disabled = true;
      senaraiDitETapkan.disabled = true;
    }
    if (mode === 'rawak') {
      pilihRawakBtn.disabled = false;
      senaraiDitETapkan.disabled = true;
    }
    if (mode === 'ditetapkan') {
      pilihRawakBtn.disabled = true;
      senaraiDitETapkan.disabled = false;
    }
  });
});
pilihRawakBtn.addEventListener('click', () => {
  const idx = Math.floor(Math.random() * window.WORDS.length);
  perkataanInput.value = window.WORDS[idx];
});
senaraiDitETapkan.addEventListener('change', (e) => {
  perkataanInput.value = e.target.value;
});

// Analisis gurisan vs lorekan
function analyzeStroke() {
  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let darkPixels = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      const lum = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
      if (lum < 60) dark
