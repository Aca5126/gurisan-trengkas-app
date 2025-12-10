// Keadaan lukisan
let mode = 'pen';
let lineWidthNormal = 6;
let lineWidthSeparuh = 3;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;
let last = null;

const penBtn = document.getElementById('penBtn');
const padamBtn = document.getElementById('padamBtn');
const toggleGuides = document.getElementById('toggleGuides');
const toggleBaseline = document.getElementById('toggleBaseline');
const saizGurisan = document.getElementById('saizGurisan');

const semakBtn = document.getElementById('semakBtn');
const bersihBtn = document.getElementById('bersihBtn');
const muatTurunBtn = document.getElementById('muatTurunBtn');

const perkataanInput = document.getElementById('perkataan');
const pilihRawakBtn = document.getElementById('pilihRawakBtn');
const senaraiDitETapkan = document.getElementById('senaraiDitETapkan');

const hasilEl = document.getElementById('hasil');
const betulEl = document.getElementById('betul');
const salahEl = document.getElementById('salah');
const kejayaanEl = document.getElementById('kejayaan');
const ketepatanEl = document.getElementById('ketepatan');
const tahapEl = document.getElementById('tahap');

const exportCsvBtn = document.getElementById('exportCsvBtn');
const importCsvInput = document.getElementById('importCsvInput');
const resetPrestasiBtn = document.getElementById('resetPrestasiBtn');

// Placeholder hilang bila ada input
perkataanInput.addEventListener('input', () => {
  perkataanInput.placeholder = '';
});

// Mod lukisan
penBtn.addEventListener('click', () => { mode = 'pen'; penBtn.classList.add('primary'); padamBtn.classList.remove('primary'); });
padamBtn.addEventListener('click', () => { mode = 'padam'; padamBtn.classList.add('primary'); penBtn.classList.remove('primary'); });

// Saiz gurisan
saizGurisan.addEventListener('change', () => drawGuides());
toggleGuides.addEventListener('change', () => drawGuides());
toggleBaseline.addEventListener('change', () => drawGuides());

// Event kanvas
canvas.addEventListener('mousedown', (e) => { drawing = true; last = { x: e.offsetX, y: e.offsetY }; });
canvas.addEventListener('mouseup', () => { drawing = false; last = null; });
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
  // Simpan lukisan semasa
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Reset
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Lukis guides
  if (toggleGuides.checked) {
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 1;
    // Garis atas (±25%)
    ctx.beginPath(); ctx.moveTo(0, canvas.height * 0.25); ctx.lineTo(canvas.width, canvas.height * 0.25); ctx.stroke();
    // Garis bawah (±75%)
    ctx.beginPath(); ctx.moveTo(0, canvas.height * 0.75); ctx.lineTo(canvas.width, canvas.height * 0.75); ctx.stroke();
    ctx.setLineDash([]);
  }
  if (toggleBaseline.checked) {
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, canvas.height * 0.5); ctx.lineTo(canvas.width, canvas.height * 0.5); ctx.stroke();
  }
  // Pulih lukisan di atas guides
  ctx.putImageData(img, 0, 0);
}
drawGuides();

// Kawalan butang
bersihBtn.addEventListener('click', () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGuides();
  hasilEl.textContent = 'Tiada semakan lagi';
});

muatTurunBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'gurisan.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

pilihRawakBtn.addEventListener('click', () => {
  const idx = Math.floor(Math.random() * window.WORDS.length);
  perkataanInput.value = window.WORDS[idx];
});

// Mod ditetapkan
senaraiDitETapkan.addEventListener('change', (e) => {
  perkataanInput.value = e.target.value;
});

// Mod pilihan
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

// Semak gurisan
semakBtn.addEventListener('click', async () => {
  const perkataan = perkataanInput.value.trim();
  if (!perkataan) {
    alert('Masukkan perkataan sasaran dahulu.');
    return;
  }

  // Hasil imej (PNG, base64)
  const imageBase64 = canvas.toDataURL('image/png');

  hasilEl.textContent = 'Menyemak gurisan...';
  semakBtn.disabled = true;

  try {
    const res = await fetch(`${window.API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 })
    });
    const data = await res.json();
    const translation = (data && data.translation) ? String(data.translation).trim() : '';
    const betul = translation.toLowerCase() === perkataan.toLowerCase();

    hasilEl.textContent = translation
      ? `Hasil: ${translation} (${betul ? 'Betul' : 'Salah'})`
      : 'Tiada terjemahan diterima.';

    updatePrestasi(betul, translation ? 100 : 0);
  } catch (err) {
    hasilEl.textContent = 'Ralat semakan. Sila cuba lagi.';
  } finally {
    semakBtn.disabled = false;
  }
});

// Rekod prestasi (localStorage + eksport/import CSV)
function getStats() {
  return {
    betul: parseInt(localStorage.getItem('betul') || '0'),
    salah: parseInt(localStorage.getItem('salah') || '0'),
    attempts: parseInt(localStorage.getItem('attempts') || '0')
  };
}
function setStats(s) {
  localStorage.setItem('betul', s.betul);
  localStorage.setItem('salah', s.salah);
  localStorage.setItem('attempts', s.attempts);
}
function updatePrestasi(betul, ketepatanItem = 0) {
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
  ketepatanEl.textContent = `${ketepatanItem}%`;
  tahapEl.textContent = tahap;
}

// Eksport CSV
exportCsvBtn.addEventListener('click', () => {
  const s = getStats();
  const rows = [
    ['tarikh','perkataan','betul','salah','kadarKejayaan','purataKetepatan'],
    [new Date().toISOString(), perkataanInput.value.trim(), s.betul, s.salah,
      (s.betul + s.salah) ? Math.round((s.betul/(s.betul+s.salah))*100) : 0,
      ketepatanEl.textContent.replace('%','')]
  ];
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'rekod_prestasi.csv'; a.click();
  URL.revokeObjectURL(url);
});

// Import CSV (ringkas: hanya betul/salah)
importCsvInput.addEventListener('change', (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const text = reader.result.toString();
    const lines = text.trim().split('\n');
    // cuba baca header + satu baris data
    if (lines.length >= 2) {
      const cols = lines[1].split(',');
      const betul = parseInt(cols[2] || '0');
      const salah = parseInt(cols[3] || '0');
      const s = { betul, salah, attempts: betul + salah };
      setStats(s);
      updatePrestasi(true, parseInt(cols[5] || '0'));
      alert('Import CSV berjaya. Rekod dikemas kini.');
    } else {
      alert('CSV tidak sah.');
    }
  };
  reader.readAsText(file);
});

// Reset
resetPrestasiBtn.addEventListener('click', () => {
  localStorage.removeItem('betul');
  localStorage.removeItem('salah');
  localStorage.removeItem('attempts');
  betulEl.textContent = '0';
  salahEl.textContent = '0';
  kejayaanEl.textContent = '0%';
  ketepatanEl.textContent = '0%';
  tahapEl.textContent = 'Pemula';
});

// Nota penyimpanan:
// GitHub Pages tidak ada storan server-side. Kita gunakan localStorage (peranti pengguna).
// Untuk “penyimpanan”, pelajar boleh eksport CSV dan import semula untuk kesinambungan rekod.
