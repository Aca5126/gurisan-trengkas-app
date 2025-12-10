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

// Placeholder hilang bila ada input
perkataanInput.addEventListener('input', () => { perkataanInput.placeholder = ''; });

// Mod lukisan
penBtn.addEventListener('click', () => { mode = 'pen'; penBtn.classList.add('primary'); padamBtn.classList.remove('primary'); });
padamBtn.addEventListener('click', () => { mode = 'padam'; padamBtn.classList.add('primary'); penBtn.classList.remove('primary'); });

// Saiz gurisan dan garis panduan
saizGurisan.addEventListener('change', drawGuides);
toggleGuides.addEventListener('change', drawGuides);
toggleBaseline.addEventListener('change', drawGuides);

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

// Garis panduan + baseline
function drawGuides() {
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const h = canvas.height;
  const yTop = h * 0.25;
  const yBase = h * 0.5;
  const yBot = h * 0.75;

  // Garis atas (putus-putus)
  if (toggleGuides.checked) {
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, yTop); ctx.lineTo(canvas.width, yTop); ctx.stroke();
  }

  // Baseline (tebal)
  if (toggleBaseline.checked) {
    ctx.setLineDash([]);
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, yBase); ctx.lineTo(canvas.width, yBase); ctx.stroke();
  }

  // Garis bawah (putus-putus)
  if (toggleGuides.checked) {
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, yBot); ctx.lineTo(canvas.width, yBot); ctx.stroke();
  }

  ctx.setLineDash([]);

  // Label posisi
  labelAtas.style.top = `${yTop - 18}px`;
  labelBaseline.style.top = `${yBase - 18}px`;
  labelBawah.style.top = `${yBot - 18}px`;

  // Pulih lukisan
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

// Mod pilihan (bebas/rawak/ditetapkan)
document.querySelectorAll('input[name="mode"]').forEach(r => {
  r.addEventListener('change', (e) => {
    const v = e.target.value;
    pilihRawakBtn.disabled = v !== 'rawak';
    senaraiDitETapkan.disabled = v !== 'ditetapkan';
    perkataanInput.disabled = v !== 'bebas';
  });
});
(function initModes() {
  pilihRawakBtn.disabled = true;
  senaraiDitETapkan.disabled = true;
  perkataanInput.disabled = false;
})();
pilihRawakBtn.addEventListener('click', () => {
  const idx = Math.floor(Math.random() * window.WORDS.length);
  perkataanInput.value = window.WORDS[idx];
});
senaraiDitETapkan.addEventListener('change', (e) => {
  perkataanInput.value = e.target.value;
});

// Analisis gurisan vs lorekan (ringkas di frontend)
function analyzeStroke() {
  try {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let darkPixels = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i], g = imgData.data[i + 1], b = imgData.data[i + 2];
      const lum = (r + g + b) / 3;
      if (lum < 60) darkPixels++;
    }
    const density = darkPixels / (canvas.width * canvas.height);
    if (density > 0.12) {
      deteksiEl.textContent = 'Status gurisan: Lorekan/contengan (ketumpatan tinggi)';
    } else if (density > 0.02) {
      deteksiEl.textContent = 'Status gurisan: Gurisan sah';
    } else {
      deteksiEl.textContent = 'Status gurisan: Sangat sedikit (mungkin belum siap)';
    }
  } catch (e) {
    deteksiEl.textContent = 'Status gurisan: tidak dapat dianalisis';
  }
}

// Rekod prestasi (localStorage + eksport/import CSV)
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
  const total = s.betul + s.salah;
  const kejayaan = total ? Math.round((s.betul / total) * 100) : 0;
  const tahap = kejayaan >= 80 ? 'Mahir' : (kejayaan >= 50 ? 'Pertengahan' : 'Pemula');
  betulEl.textContent = s.betul;
  salahEl.textContent = s.salah;
  kejayaanEl.textContent = `${kejayaan}%`;
  tahapEl.textContent = tahap;
}
exportCsvBtn.addEventListener('click', () => {
  const s = getStats();
  const rows = [
    ['tarikh','perkataan','betul','salah','kadarKejayaan'],
    [new Date().toISOString(), perkataanInput.value.trim(), s.betul, s.salah,
      (s.betul + s.salah) ? Math.round((s.betul/(s.betul+s.salah))*100) : 0]
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'rekod_prestasi.csv'; a.click();
  URL.revokeObjectURL(url);
});
importCsvInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result.toString();
    const lines = text.trim().split('\n');
    if (lines.length >= 2) {
      const cols = lines[1].split(',');
      const betul = parseInt(cols[2] || '0');
      const salah = parseInt(cols[3] || '0');
      const s = { betul, salah, attempts: betul + salah };
      setStats(s);
      updatePrestasi(true);
      alert('Import CSV berjaya. Rekod dikemas kini.');
    } else { alert('CSV tidak sah.'); }
  };
  reader.readAsText(file);
});
resetPrestasiBtn.addEventListener('click', () => {
  localStorage.removeItem('betul');
  localStorage.removeItem('salah');
  localStorage.removeItem('attempts');
  betulEl.textContent = '0';
  salahEl.textContent = '0';
  kejayaanEl.textContent = '0%';
  tahapEl.textContent = 'Pemula';
});

// SEMAK GURISAN (perkataan penuh + suku kata + fonetik + audio)
semakBtn.addEventListener('click', async () => {
  const perkataan = perkataanInput.value.trim();
  const imageBase64 = canvas.toDataURL('image/png');
  hasilEl.textContent = 'Menyemak...';
  semakBtn.disabled = true;

  try {
    const res = await fetch(`${window.API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });
    const data = await res.json();

    const kata = data.perkataan || data.translation || '';
    const suku = Array.isArray(data.sukuKata) ? data.sukuKata.join(' - ') : (data.sukuKata || '');
    const fonetik = data.fonetik || '';
    const textOut = [
      kata ? `Perkataan dijangka: ${kata}` : '',
      suku ? `Suku kata: ${suku}` : '',
      fonetik ? `Fonetik: ${fonetik}` : ''
    ].filter(Boolean).join(' | ');
    hasilEl.textContent = textOut || 'Tiada terjemahan diterima.';

    // Auto bunyi
    sebut(kata || suku);

    // Betul/salah berdasar input sasaran (jika diisi)
    const betul = perkataan && kata ? (kata.toLowerCase() === perkataan.toLowerCase()) : false;
    updatePrestasi(betul);
  } catch (err) {
    hasilEl.textContent = 'Ralat semakan. Sila cuba lagi.';
  } finally {
    semakBtn.disabled = false;
  }
});

// TEKA SUKU KATA (single stroke)
tekaSukuKataBtn.addEventListener('click', async () => {
  const imageBase64 = canvas.toDataURL('image/png');
  hasilEl.textContent = 'Meneka suku kata...';
  try {
    const res = await fetch(`${window.API_BASE}/api/suku-kata`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });
    const data = await res.json();
    const suku = data.sukuKata || '';
    const fonetik = data.fonetik || '';
    hasilEl.textContent = suku
      ? `Suku kata dijangka: ${suku}${fonetik ? ` | Fonetik: ${fonetik}` : ''}`
      : 'Tiada ramalan suku kata.';
    sebut(suku);
  } catch (e) {
    hasilEl.textContent = 'Ralat ramalan suku kata.';
  }
});

// Ulang sebutan
ulangSebutanBtn.addEventListener('click', () => {
  const txt = hasilEl.textContent;
  const matchKata = txt.match(/Perkataan dijangka:\s*([^|]+)/);
  const matchSuku = txt.match(/Suku kata(?: dijangka)?:\s*([^|]+)/);
  const toSpeak = (matchKata && matchKata[1].trim()) || (matchSuku && matchSuku[1].trim()) || '';
  sebut(toSpeak);
});
