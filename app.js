// Keadaan global
let mode = 'pen';
let speakerOn = true;
let lineWidthNormal = 6;
let lineWidthSeparuh = 3;

// Elemen DOM
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
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

// Event kanvas
canvas.addEventListener('mousedown', (e) => { drawing = true; last = { x: e.offsetX, y: e.offsetY }; });
canvas.addEventListener('mouseup', () => { drawing = false; last = null; analyzeStroke(); });
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

// Garis panduan
function drawGuides() {
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const h = canvas.height;
  const yTop = h * 0.25;
  const yBase = h * 0.5;
  const yBot = h * 0.75;

  if (toggleGuides.checked) {
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, yTop); ctx.lineTo(canvas.width, yTop); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, yBot); ctx.lineTo(canvas.width, yBot); ctx.stroke();
  }

  if (toggleBaseline.checked) {
    ctx.setLineDash([]);
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, yBase); ctx.lineTo(canvas.width, yBase); ctx.stroke();
  }

  ctx.setLineDash([]);
  labelAtas.style.top = `${yTop - 18}px`;
  labelBaseline.style.top = `${yBase - 18}px`;
  labelBawah.style.top = `${yBot - 18}px`;

  ctx.putImageData(img, 0, 0);
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
      perkataanInput.disabled = false;
      pilihRawakBtn.disabled = true;
      senaraiDitETapkan.disabled = true;
    }

    if (mode === 'rawak') {
      perkataanInput.disabled = false;
      pilihRawakBtn.disabled = false;
      senaraiDitETapkan.disabled = true;
    }

    if (mode === 'ditetapkan') {
      perkataanInput.disabled = false;
      pilihRawakBtn.disabled = true;
      senaraiDitETapkan.disabled = false;
    }
  });
});

// Pilih rawak
pilihRawakBtn.addEventListener('click', () => {
  const idx = Math.floor(Math.random() * window.WORDS.length);
  perkataanInput.value = window.WORDS[idx];
});

// Pilih ditetapkan
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
      if (lum < 60) darkPixels++;
    }
    const density = darkPixels / (canvas.width * canvas.height);
    if (density > 0.12) deteksiEl.textContent = 'Status gurisan: Lorekan (ketumpatan tinggi)';
    else if (density > 0.02) deteksiEl.textContent = 'Status gurisan: Gurisan sah';
    else deteksiEl.textContent = 'Status gurisan: Sangat sedikit';
  } catch { deteksiEl.textContent = 'Status gurisan: tidak dapat dianalisis'; }
}

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
  localStorage.setItem('attempt
