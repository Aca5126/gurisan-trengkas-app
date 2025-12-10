// --- Canvas & alat lukisan ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let tool = 'pen'; // 'pen' atau 'eraser'

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

function pointerPosition(ev) {
  const r = canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - r.left) * (canvas.width / r.width),
    y: (ev.clientY - r.top) * (canvas.height / r.height)
  };
}

canvas.addEventListener('pointerdown', startDraw);
canvas.addEventListener('pointermove', moveDraw);
canvas.addEventListener('pointerup', endDraw);
canvas.addEventListener('pointerleave', endDraw);

// --- Elemen UI ---
const phonemesEl = document.getElementById('phonemes');
const candidatesEl = document.getElementById('candidates');
const bestWordEl = document.getElementById('bestWord');
const confidenceEl = document.getElementById('confidence');
const historyList = document.getElementById('historyList');
const penBtn = document.getElementById('penBtn');
const eraserBtn = document.getElementById('eraserBtn');
const recognizeBtn = document.getElementById('recognizeBtn');
const clearBtn = document.getElementById('clearBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const downloadBtn = document.getElementById('downloadBtn');
const targetWordEl = document.getElementById('targetWord');

// Bar keyakinan (sedia dalam HTML)
const confBar = document.querySelector('.conf-bar > span');

// Toggle Pen/Eraser
function setTool(next) {
  tool = next;
  penBtn.classList.toggle('active', tool === 'pen');
  eraserBtn.classList.toggle('active', tool === 'eraser');
}
penBtn.addEventListener('click', () => setTool('pen'));
eraserBtn.addEventListener('click', () => setTool('eraser'));
setTool('pen'); // default

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

// Bersih canvas
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // reset paparan
  phonemesEl.textContent = '-';
  candidatesEl.textContent = '-';
  bestWordEl.textContent = '-';
  confidenceEl.textContent = '-';
  confBar.style.width = '0%';
});

// Export CSV daripada sejarah
exportCsvBtn.addEventListener('click', () => {
  const rows = Array.from(historyList.querySelectorAll('li')).map(li => {
    const parts = Array.from(li.querySelectorAll('div')).map(d => d.textContent.split(': ').pop());
    const ts = li.querySelector('small')?.textContent || '';
    const [sh, full, conf] = parts;
    return { shorthand: sh, fullText: full, confidence: conf, timestamp: ts };
  });

  const header = ['shorthand','fullText','confidence','timestamp'];
  const csv = [header.join(','), ...rows.map(o => header.map(k => `"${String(o[k]).replace(/"/g,'""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'sejarah.csv'; a.click();
  URL.revokeObjectURL(url);
});

// --- Mock AI Translate ---
function mockTranslate(imageDataUrl, hint) {
  const candidates = ['yang','dengan','untuk','makan','buku','balik','malam','buka','lama','lusa'];
  let pick = candidates[Math.floor(Math.random()*candidates.length)];
  if (hint) {
    const h = hint.toLowerCase();
    const bias = candidates.find(c => c.startsWith(h));
    if (bias) pick = bias;
  }
  const confidence = 0.5 + Math.random()*0.45; // 50–95%
  return { shorthand:'yg', fullText:pick, confidence, candidates: [pick, ...shuffle(candidates).slice(0,4)] };
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
  // ambil imej canvas
  const imageDataUrl = canvas.toDataURL('image/png');
  const hint = targetWordEl.value?.trim();

  const { shorthand, fullText, confidence, candidates } = mockTranslate(imageDataUrl, hint);

  phonemesEl.textContent = shorthand;
  bestWordEl.textContent = fullText;
  confidenceEl.textContent = `${Math.round(confidence*100)}%`;
  confBar.style.width = `${Math.round(confidence*100)}%`;
  candidatesEl.textContent = candidates.join(', ');

  const li = document.createElement('li');
  li.innerHTML = `
    <div><strong>Shorthand:</strong> ${shorthand}</div>
    <div><strong>Terjemahan:</strong> ${fullText}</div>
    <div><strong>Keyakinan:</strong> ${Math.round(confidence*100)}%</div>
    <div><small>${new Date().toLocaleString()}</small></div>
  `;
  // pratinjau imej (opsyenal)
  const img = new Image();
  img.src = imageDataUrl;
  img.style.maxWidth = '100%';
  img.style.borderRadius = '6px';
  img.style.marginTop = '6px';
  li.appendChild(img);

  historyList.prepend(li);
});

// --- Panduan Shorthand (mock) ---
const GUIDE = {
  bm: [
    { short: 'yg', full: 'yang' },
    { short: 'dgn', full: 'dengan' },
    { short: 'utk', full: 'untuk' },
    { short: 'blh', full: 'boleh' }
  ],
  pitman: [
    { symbol: 'Garis ringan →', phonem: 'k' },
    { symbol: 'Garis berat ↓', phonem: 'b/p' },
    { symbol: 'Bulatan kecil', phonem: 's' },
    { symbol: 'Lengkung besar', phonem: 'm' }
  ]
};

const guideEl = document.getElementById('guide');
const tabBm = document.getElementById('tabBm');
const tabPitman = document.getElementById('tabPitman');

function renderGuide(tab='bm') {
  const data = GUIDE[tab];
  guideEl.innerHTML = data.map(item => {
    return tab === 'bm'
      ? `<div class="row"><strong>${item.short}</strong> <span>${item.full}</span></div>`
      : `<div class="row"><strong>${item.symbol}</strong> <span>${item.phonem}</span></div>`;
  }).join('');
}
function setGuideTab(tab) {
  tabBm.classList.toggle('active', tab==='bm');
  tabPitman.classList.toggle('active', tab==='pitman');
  renderGuide(tab);
}
tabBm.addEventListener('click', () => setGuideTab('bm'));
tabPitman.addEventListener('click', () => setGuideTab('pitman'));
setGuideTab('bm'); // lalai

// --- Service Worker ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}
