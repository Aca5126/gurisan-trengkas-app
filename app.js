const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let tool = 'pen';

const penColor = '#007c91';
const penWidth = 4;
const eraserWidth = 16;

function applyTool() {
  if (tool === 'pen') {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
  } else {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = eraserWidth;
  }
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
}

function pointerPosition(ev) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - r.left) * (canvas.width / r.width),
    y: (ev.clientY - r.top) * (canvas.height / r.height)
  };
}

function startDraw(e) {
  drawing = true;
  ctx.beginPath();
  const { x, y } = pointerPosition(e);
  ctx.moveTo(x, y);
  applyTool();
}
function moveDraw(e) {
  if (!drawing) return;
  const { x, y } = pointerPosition(e);
  ctx.lineTo(x, y);
  ctx.stroke();
}
function endDraw() { drawing = false; }

canvas.addEventListener('pointerdown', startDraw);
canvas.addEventListener('pointermove', moveDraw);
canvas.addEventListener('pointerup', endDraw);
canvas.addEventListener('pointerleave', endDraw);

// --- Garisan panduan kelabu gelap ---
function drawGuideLine() {
  ctx.strokeStyle = '#555555'; // kelabu gelap
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height/2);
  ctx.lineTo(canvas.width, canvas.height/2);
  ctx.stroke();
}
window.addEventListener('load', drawGuideLine);

// --- UI elements ---
const phonemesEl = document.getElementById('phonemes');
const candidatesEl = document.getElementById('candidates');
const bestWordEl = document.getElementById('bestWord');
const confidenceEl = document.getElementById('confidence');
const penBtn = document.getElementById('penBtn');
const eraserBtn = document.getElementById('eraserBtn');
const recognizeBtn = document.getElementById('recognizeBtn');
const clearBtn = document.getElementById('clearBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const downloadBtn = document.getElementById('downloadBtn');
const targetWordEl = document.getElementById('targetWord');
const confBar = document.querySelector('.conf-bar > span');

// Toggle Pen/Eraser
function setTool(next) {
  tool = next;
  penBtn.classList.toggle('active', tool === 'pen');
  eraserBtn.classList.toggle('active', tool === 'eraser');
}
penBtn.addEventListener('click', () => setTool('pen'));
eraserBtn.addEventListener('click', () => setTool('eraser'));
setTool('pen');

// Clear canvas (garisan panduan muncul semula)
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  phonemesEl.textContent = '-';
  candidatesEl.textContent = '-';
  bestWordEl.textContent = '-';
  confidenceEl.textContent = '-';
  confBar.style.width = '0%';
  drawGuideLine();
});

// Muat turun lukisan
downloadBtn.addEventListener('click', () => {
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gurisan-${new Date().toISOString().slice(0,19)}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
});

// Export CSV (optional, masih ada walaupun tiada sejarah)
exportCsvBtn.addEventListener('click', () => {
  alert("Fungsi eksport CSV tidak aktif kerana sejarah telah dibuang.");
});

// --- Mock AI Translate ---
function mockTranslate(imageDataUrl, hint) {
  const candidates = ['kata','buku','makan','balik','malam','buka','lama','lusa'];
  let pick = candidates[Math.floor(Math.random()*candidates.length)];
  if (hint) {
    const h = hint.toLowerCase();
    const bias = candidates.find(c => c.startsWith(h));
    if (bias) pick = bias;
  }
  const confidence = 0.5 + Math.random()*0.45;
  return { shorthand:'simbol', fullText:pick, confidence, candidates: [pick, ...shuffle(candidates).slice(0,4)] };
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i=a.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// Kenali (mock)
recognizeBtn.addEventListener('click', () => {
  const imageDataUrl = canvas.toDataURL('image/png');
  const hint = targetWordEl.value?.trim();
  const { shorthand, fullText, confidence, candidates } = mockTranslate(imageDataUrl, hint);

  phonemesEl.textContent = shorthand;
  bestWordEl.textContent = fullText;
  confidenceEl.textContent = `${Math.round(confidence*100)}%`;
  confBar.style.width = `${Math.round(confidence*100)}%`;
  candidatesEl.textContent = candidates.join(', ');
});

// --- Panduan Trengkas (Pitman BM) ---
const GUIDE = [
  { symbol: 'Garis ringan →', phonem: 'k' },
  { symbol: 'Garis berat ↓', phonem: 'b / p' },
  { symbol: 'Bulatan kecil', phonem: 's' },
  { symbol: 'Lengkung besar', phonem: 'm' },
  { symbol: 'Garis ringan ↘', phonem: 't / d' },
  { symbol: 'Garis berat ↗', phonem: 'g' }
];

const guideEl = document.getElementById('guide');

function renderGuide() {
  guideEl.innerHTML = GUIDE.map(item =>
    `<div class="
