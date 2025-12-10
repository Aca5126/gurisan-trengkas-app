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

// Garisan panduan
function drawGuideLine() {
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, canvas.height/2);
  ctx.lineTo(canvas.width, canvas.height/2);
  ctx.stroke();
}
window.addEventListener('load', drawGuideLine);

// UI
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
const confBar = document.querySelector('.conf-bar > span');

function setTool(next) {
  tool = next;
  penBtn.classList.toggle('active', tool === 'pen');
  eraserBtn.classList.toggle('active', tool === 'eraser');
}
penBtn.addEventListener('click', () => setTool('pen'));
eraserBtn.addEventListener('click', () => setTool('eraser'));
setTool('pen');

// Clear canvas
clearBtn.addEventListener('click', () => {
  ctx.clearRect(0,0,canvas.width,canvas.height);
