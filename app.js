(function () {
  const canvas = document.getElementById('pad');
  const ctx = canvas.getContext('2d');
  const penBtn = document.getElementById('penBtn');
  const eraserBtn = document.getElementById('eraserBtn');
  const clearBtn = document.getElementById('clearBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const confirmBtn = document.getElementById('confirmBtn');
  const resultText = document.getElementById('resultText');

  // State
  let drawing = false;
  let mode = 'pen'; // 'pen' | 'eraser'
  const penColor = '#e6e6e6';
  const eraserColor = '#111318';
  const penSize = 4;
  const eraserSize = 18;

  // Baseline
  function drawBaseline() {
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#2b3038';
    ctx.lineWidth = 1;
    const gaps = [80, 160, 240, 320, 400];
    ctx.beginPath();
    gaps.forEach(y => {
      ctx.moveTo(16, y);
      ctx.lineTo(canvas.width - 16, y);
    });
    ctx.stroke();
  }

  // Init
  drawBaseline();

  // Mode toggles
  function setMode(next) {
    mode = next;
    if (next === 'pen') {
      penBtn.classList.add('active');
      eraserBtn.classList.remove('active');
    } else {
      eraserBtn.classList.add('active');
      penBtn.classList.remove('active');
    }
  }
  penBtn.addEventListener('click', () => setMode('pen'));
  eraserBtn.addEventListener('click', () => setMode('eraser'));

  // Clear + baseline
  clearBtn.addEventListener('click', drawBaseline);

  // Drawing
  function startDraw(e) {
    drawing = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function moveDraw(e) {
    if (!drawing) return;
    const { x, y } = pos(e);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (mode === 'pen') {
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
    } else {
      ctx.strokeStyle = eraserColor;
      ctx.lineWidth = eraserSize;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  }
  function endDraw() {
    drawing = false;
    ctx.closePath();
  }

  function pos(e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
    return { x, y };
  }

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: true });
  canvas.addEventListener('touchmove', moveDraw, { passive: true });
  canvas.addEventListener('touchend', endDraw);

  // Download PNG
  downloadBtn.addEventListener('click', () => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `trengkas-${Date.now()}.png`;
    a.click();
  });

  // Confirm (translate)
  confirmBtn.addEventListener('click', async () => {
    resultText.textContent = 'Memproses gurisan…';
    try {
      const base64 = canvas.toDataURL('image/png'); // data:image/png;base64,xxxxx
      const res = await fetch(`${window.API_BASE}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          guidance: 'Tafsirkan gurisan trengkas Pitman ke dalam teks Melayu yang jelas. Jika ragu, jelaskan ketidakpastian.'
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      resultText.textContent = (data.translation || '').trim() || '(Tiada output diterima)';
    } catch (e) {
      resultText.textContent = `Ralat: ${e.message}`;
    }
  });
})();
