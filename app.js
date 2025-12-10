// ----- State lukisan & alat -----
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let tool = 'pen';

const penColor = '#007c91';
const penWidth = 4;
const eraserWidth = 16;

// Sejarah untuk eksport CSV
const history = [];

// ----- Alat lukisan -----
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
  const isTouch = ev.touches && ev.touches[0];
  const clientX = isTouch ? ev.touches[0].clientX : ev.clientX;
  const clientY = isTouch ? ev.touches[0].clientY : ev.clientY;
  return {
    x: (clientX - r.left) * (canvas.width / r.width),
    y: (clientY - r.top) * (canvas.height / r.height)
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

// Sokong pointer & touch
canvas.addEventListener('pointerdown', startDraw);
canvas.addEventListener('pointermove', moveDraw);
canvas.addEventListener('pointerup', endDraw);
canvas.addEventListener('pointerleave', endDraw);
canvas.addEventListener('touchstart', startDraw, { passive: true });
canvas.addEventListener('touchmove', moveDraw, { passive: true });
canvas.addEventListener('touchend', endDraw);

// ----- Garisan panduan (baseline) -----
function drawGuideLine() {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = '#555555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  ctx.restore();
}

window.addEventListener('load', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGuideLine();
});

// ----- UI elements -----
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

// ----- Toggle Pen/Eraser -----
function setTool(next) {
  tool = next;
  penBtn.classList.toggle('active', tool === 'pen');
  eraserBtn.classList.toggle('active', tool === 'eraser');
}
penBtn.addEventListener('click', () => setTool('pen'));
eraserBtn.addEventListener('click', () => setTool('eraser'));
setTool('pen');

// ----- Clear canvas -----
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  phonemesEl.textContent = '-';
  candidatesEl.textContent = '-';
  bestWordEl.textContent = '-';
  confidenceEl.textContent = '-';
  confBar.style.width = '0%';
  drawGuideLine();
});

// ----- Download lukisan -----
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

// ----- Export CSV -----
exportCsvBtn.addEventListener('click', () => {
  if (!history.length) {
    alert('Tiada sejarah untuk dieksport. Buat beberapa kenalian dahulu.');
    return;
  }
  const header = ['masa','hint','hasil','keyakinan','calon'];
  const rows = history.map(h => [
    h.time,
    h.hint ?? '',
    h.result,
    `${Math.round(h.confidence*100)}%`,
    h.candidates.join(' | ')
  ]);
  const csv = [header, ...rows].map(r => r.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sejarah-trengkas-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// ----- Mock AI Translate -----
function mockTranslate(imageDataUrl, hint) {
  const candidates = [
    'memandikan','pasukan','diputuskan','menguji','membantu',
    'menjaga','menipu','zapin','bajunya','keutamaan',
    'bisik','senyum','memasak','paksa','sembunyi',
    'ketenangan','makan','masing-masing','ketepikan'
  ];

  let pick = candidates[Math.floor(Math.random()*candidates.length)];
  if (hint) {
    const h = hint.toLowerCase();
    const bias = candidates.find(c => c.startsWith(h));
    if (bias) pick = bias;
  }

  const confidence = 0.55 + Math.random()*0.4;
  const list = uniqueList([pick, ...shuffle(candidates).slice(0,5)]);
  return {
    shorthand: 'simbol trengkas',
    fullText: pick,
    confidence,
    candidates: list
  };
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueList(arr) {
  const seen = new Set();
  return arr.filter(x => (seen.has(x) ? false : (seen.add(x), true)));
}

// ----- Kenali -----
recognizeBtn.addEventListener('click', () => {
  const imageDataUrl = canvas.toDataURL('image/png');
  const hint = targetWordEl.value?.trim();
  const { shorthand, fullText, confidence, candidates } = mockTranslate(imageDataUrl, hint);

  phonemesEl.textContent = shorthand;
  bestWordEl.textContent = fullText;
  confidenceEl.textContent = `${Math.round(confidence*100)}%`;
  confBar.style.width = `${Math.round(confidence*100)}%`;
  candidatesEl.textContent = candidates.join(', ');

  history.push({
    time: new Date().toISOString(),
    hint,
    result: fullText,
    confidence,
    candidates
  });
});

// ----- Panduan Trengkas -----
const GUIDE = [
  { symbol: 'Garis ringan lurus →', phonem: 'k / t' },
  { symbol: 'Garis berat lurus ↓', phonem: 'b / p / d' },
  { symbol: 'Bulatan kecil', phonem: 's' },
  { symbol: 'Bulatan besar', phonem: 'z' },
  { symbol: 'Lengkung ringan', phonem: 'm / n' },
  { symbol: 'Lengkung berat', phonem: 'g' },
  { symbol: 'Kombinasi garis + bulatan', phonem: 'suku kata khas' }
];

const guideEl = document.getElementById('guide');

function renderGuide() {
  guideEl.innerHTML = GUIDE.map(item =>
    `<div class="row"><strong>${item.symbol}</strong><span>${item.phonem}</span></div>`
  ).join('');
}
