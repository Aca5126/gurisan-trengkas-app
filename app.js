// =======================================
// KONFIG & DEBUG
// =======================================

const API_BASE = window.API_BASE || 'https://gurisan-trengkas-backend.onrender.com';
const DEBUG = true;

function dlog(...args) {
  if (DEBUG) console.log('[GURISAN DEBUG]', ...args);
}

// =======================================
// GLOBAL STATE
// =======================================

let drawing = false;
let erasing = false;
let lastX = 0;
let lastY = 0;
let canvas, ctx, guidesCanvas, guidesCtx;
let currentMode = 'bebas'; // 'bebas' | 'rawak' | 'ditetapkan'
let speakerOn = true;

let rekod = {
  betul: 0,
  salah: 0,
  jumlah: 0,
  ketepatanTerkumpul: 0
};

// =======================================
// SETUP CANVAS & GARIS PANDUAN
// =======================================

function setupCanvas() {
  canvas = document.getElementById('canvas');
  guidesCanvas = document.getElementById('guidesCanvas');

  ctx = canvas.getContext('2d');
  guidesCtx = guidesCanvas.getContext('2d');

  resizeCanvas();
  attachDrawingEvents();
  drawGuides(); // ✅ lukis masa mula
}

// =========================
// 2. FUNGSI LUKISAN
// =========================

let isDrawing = false;
let lastX = 0;
let lastY = 0;

function startDrawing(e) {
  isDrawing = true;
  const rect = canvas.getBoundingClientRect();
  lastX = (e.clientX - rect.left);
  lastY = (e.clientY - rect.top);
}

function draw(e) {
  if (!isDrawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left);
  const y = (e.clientY - rect.top);

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();

  lastX = x;
  lastY = y;
}

function stopDrawing() {
  isDrawing = false;
}

function resizeCanvas() {
  if (!canvas || !guidesCanvas) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // ✅ Jika rect = 0, jangan resize (elak hilang garisan)
  if (rect.width === 0 || rect.height === 0) {
    console.warn("resizeCanvas skipped: rect=0");
    return;
  }

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  guidesCanvas.width = rect.width * dpr;
  guidesCanvas.height = rect.height * dpr;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  guidesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  drawGuides();
}

function drawGuides() {
  if (!guidesCanvas || !guidesCtx) return;

  const w = guidesCanvas.width;
  const h = guidesCanvas.height;

  guidesCtx.clearRect(0, 0, w, h);

  // Garis putus-putus atas & bawah
  const yTop = h * 0.25;
  const yBot = h * 0.75;

  guidesCtx.strokeStyle = '#cfd8dc';
  guidesCtx.setLineDash([8, 8]);
  guidesCtx.lineWidth = 1;

  guidesCtx.beginPath(); guidesCtx.moveTo(0, yTop); guidesCtx.lineTo(w, yTop); guidesCtx.stroke();
  guidesCtx.beginPath(); guidesCtx.moveTo(0, yBot); guidesCtx.lineTo(w, yBot); guidesCtx.stroke();

  // Baseline
  const yBase = h * 0.60;

  guidesCtx.setLineDash([]);
  guidesCtx.strokeStyle = '#9e9e9e';
  guidesCtx.lineWidth = 2.2;

  guidesCtx.beginPath(); guidesCtx.moveTo(0, yBase); guidesCtx.lineTo(w, yBase); guidesCtx.stroke();
}

// =======================================
// LOGIK LUKIS (PEN & PEMADAM)
// =======================================

function getCanvasPos(e) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;

  if (e.touches && e.touches[0]) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDrawing(e) {
  e.preventDefault();
  drawing = true;
  const pos = getCanvasPos(e);
  lastX = pos.x;
  lastY = pos.y;
}

function draw(e) {
  if (!drawing) return;
  e.preventDefault();

  const pos = getCanvasPos(e);

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // ✅ Saiz pen & pemadam
  ctx.lineWidth = erasing ? 28 : 3;

  // ✅ Pemadam licin (destination-out)
  if (erasing) {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = "#000000";
  }

  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(pos.x, pos.y);
  ctx.stroke();

  lastX = pos.x;
  lastY = pos.y;
}

function attachDrawingEvents() {
  // =========================
  // MOUSE
  // =========================
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  // =========================
  // TOUCH (mobile)
  // =========================
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const t = e.touches[0];
    startDrawing({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: false });

  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    const t = e.touches[0];
    draw({ clientX: t.clientX, clientY: t.clientY });
  }, { passive: false });

  canvas.addEventListener("touchend", stopDrawing);
}

// =======================================
// UTILITI UI & PRESTASI
// =======================================

function setMode(mode) {
  currentMode = mode;
  dlog('Mode ditukar kepada:', mode);
}

function bersihkanCanvas() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGuides();

  const hasil = document.getElementById('hasil');
  const deteksi = document.getElementById('deteksiGurisan');
  if (hasil) hasil.textContent = 'Tiada semakan lagi';
  if (deteksi) deteksi.textContent = 'Status gurisan: belum dianalisis';
}

function kemaskiniRekod(status, ketepatan) {
  // status: "betul" | "salah" | "tidak pasti"
  rekod.jumlah += 1;

  if (status === 'betul') rekod.betul += 1;
  else if (status === 'salah') rekod.salah += 1;

  if (typeof ketepatan === 'number') {
    rekod.ketepatanTerkumpul += ketepatan;
  }

  const kadarKejayaan = rekod.jumlah > 0 ? Math.round((rekod.betul / rekod.jumlah) * 100) : 0;
  const purataKetepatan = rekod.jumlah > 0 ? Math.round(rekod.ketepatanTerkumpul / rekod.jumlah) : 0;

  const betulEl = document.getElementById('betul');
  const salahEl = document.getElementById('salah');
  const kejayaanEl = document.getElementById('kejayaan');
  const kejayaanInfoEl = document.getElementById('kejayaanInfo');
  const ketepatanEl = document.getElementById('ketepatan');
  const tahapEl = document.getElementById('tahap');

  if (betulEl) betulEl.textContent = rekod.betul;
  if (salahEl) salahEl.textContent = rekod.salah;
  if (kejayaanEl) kejayaanEl.textContent = `${kadarKejayaan}%`;
  if (kejayaanInfoEl) kejayaanInfoEl.textContent = `${rekod.jumlah} cubaan keseluruhan`;
  if (ketepatanEl) ketepatanEl.textContent = `${purataKetepatan}%`;

  let tahap = 'Pemula';
  if (kadarKejayaan >= 80 && purataKetepatan >= 80) tahap = 'Mahir';
  else if (kadarKejayaan >= 50) tahap = 'Pertengahan';

  if (tahapEl) tahapEl.textContent = tahap;

  dlog('Rekod dikemaskini:', { ...rekod, kadarKejayaan, purataKetepatan, tahap, status });
}

// =======================================
// SEMAKAN GURISAN & BACKEND (VERSI BAHARU)
// =======================================

async function semakGurisan() {
  if (!canvas) return;

  const hasil = document.getElementById('hasil');
  const deteksi = document.getElementById('deteksiGurisan');

  const perkataan = getPerkataan();
  const mode = getMode();

async function hantarKeBackend(perkataan, hasil, deteksi) {
  const dataUrl = canvas.toDataURL('image/png');

  try {
    dlog('Hantar ke backend /semak');

    const res = await fetch(`${API_BASE}/semak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: dataUrl, perkataan })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    dlog('Respon /semak:', data);

    const mesej = data.mesej || 'Semakan siap.';
    const status = data.status || 'tidak pasti';
    const ketepatan = typeof data.ketepatan === 'number' ? data.ketepatan : null;

    hasil.textContent = mesej;

    let statusText = `Status gurisan: ${status}`;
    if (ketepatan !== null) statusText += ` (${ketepatan}%)`;
    deteksi.textContent = statusText;

    // ✅ Kemas kini rekod prestasi
    if (status === 'betul' || status === 'salah' || status === 'tidak pasti') {
      kemaskiniRekod(status, ketepatan ?? 0);
    }

  } catch (err) {
    console.error(err);
    hasil.textContent = 'Ralat ketika menyemak gurisan.';
    deteksi.textContent = 'Status gurisan: ralat.';
  }
}
  
  // ============================
  // ✅ MODE BEBAS
  // ============================
  if (mode === "bebas") {
    if (!perkataan) {
      hasil.textContent = "Tidak dapat dikenal pasti.";
      deteksi.textContent = "Gurisan tidak dapat dikenal pasti.";
      return;
    }

    // Jika ada input → terus hantar ke backend
    return await hantarKeBackend(perkataan, hasil, deteksi);
  }

  // ============================
  // ✅ MODE RAWAK
  // ============================
  if (mode === "rawak") {
    if (!perkataan) {
      hasil.textContent = "Sila tekan butang Rawak dahulu.";
      deteksi.textContent = "Input kosong.";
      return;
    }

    return await hantarKeBackend(perkataan, hasil, deteksi);
  }

  // ============================
  // ✅ MODE DITETAPKAN
  // ============================
  if (mode === "ditetapkan") {
    if (!perkataan) {
      hasil.textContent = "Sila pilih perkataan dari senarai.";
      deteksi.textContent = "Input kosong.";
      return;
    }

    return await hantarKeBackend(perkataan, hasil, deteksi);
  }
}

// =======================================
// Teka Suku Kata (BAHARU: sokong mode bebas)
// =======================================

async function tekaSukuKata() {
  if (!canvas) return;

  const perkataanInput = document.getElementById('perkataan');
  const perkataan = perkataanInput.value.trim();
  const dataUrl = canvas.toDataURL('image/png');

  if (!dataUrl) {
    alert('Sila buat gurisan dahulu sebelum meneka suku kata.');
    return;
  }

  const mode = perkataan ? 'guided' : 'freeform';

  try {
    dlog('Panggil /api/guess-syllables', { mode, hasWord: !!perkataan });

    const res = await fetch(`${API_BASE}/api/guess-syllables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: dataUrl,
        perkataan: perkataan || null,
        mode
      })
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    dlog('Respon /api/guess-syllables:', data);

    const suku = data.suku_kata || data.sukuKata || null;
    if (suku && Array.isArray(suku) && suku.length > 0) {
      alert(`Suku kata: ${suku.join(' · ')}`);
    } else if (suku && typeof suku === 'string') {
      alert(`Suku kata: ${suku}`);
    } else {
      alert('Suku kata tidak dapat dikenal pasti. Cuba gurisan yang lebih jelas.');
    }
  } catch (err) {
    console.error(err);
    alert('Ralat ketika mendapatkan suku kata.');
  }
}

// =======================================
// AUDIO SEBUTAN
// =======================================

function ulangSebutan() {
  const perkataanInput = document.getElementById('perkataan');
  const perkataan = perkataanInput.value.trim();
  if (!perkataan) {
    alert('Tiada perkataan untuk disebut.');
    return;
  }

  if (!speakerOn) {
    alert('Speaker dimatikan. Hidupkan semula untuk guna fungsi ini.');
    return;
  }

  const utter = new SpeechSynthesisUtterance(perkataan);
  utter.lang = 'ms-MY';
  speechSynthesis.speak(utter);
}

// =======================================
// MUAT TURUN PNG
// =======================================

function muatTurunPNG() {
  if (!canvas) return;
  const perkataan = (document.getElementById('perkataan').value.trim() || 'gurisan').replace(/\s+/g, '_');
  const link = document.createElement('a');
  link.download = `${perkataan}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// =======================================
// MOD PERKATAAN: BEBAS / RAWAK / DITETAPKAN
// =======================================

function pilihRawak() {
  if (!window.WORDS || !Array.isArray(window.WORDS) || window.WORDS.length === 0) {
    alert('Senarai perkataan rawak tidak dijumpai.');
    return;
  }
  const idx = Math.floor(Math.random() * window.WORDS.length);
  const perkataan = window.WORDS[idx];
  const input = document.getElementById('perkataan');
  input.value = perkataan;
  dlog('Pilih rawak:', perkataan);
}

function initDitETapkanSelect() {
  const select = document.getElementById('senaraiDitETapkan');
  if (!select) return;

  if (select.options.length > 0) {
    dlog('senaraiDitETapkan sudah terisi daripada words.js');
    return;
  }

  if (window.WORDS && window.WORDS.length > 0) {
    window.WORDS.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = w;
      select.appendChild(opt);
    });
    dlog('senaraiDitETapkan diisi fallback dari WORDS');
  }
}

// =======================================
// REKOD PRESTASI: RESET & CSV
// =======================================

function resetPrestasi() {
  rekod = { betul: 0, salah: 0, jumlah: 0, ketepatanTerkumpul: 0 };
  // Paksa kemaskini paparan ke 0
  const betulEl = document.getElementById('betul');
  const salahEl = document.getElementById('salah');
  const kejayaanEl = document.getElementById('kejayaan');
  const kejayaanInfoEl = document.getElementById('kejayaanInfo');
  const ketepatanEl = document.getElementById('ketepatan');
  const tahapEl = document.getElementById('tahap');

  if (betulEl) betulEl.textContent = '0';
  if (salahEl) salahEl.textContent = '0';
  if (kejayaanEl) kejayaanEl.textContent = '0%';
  if (kejayaanInfoEl) kejayaanInfoEl.textContent = '0 cubaan keseluruhan';
  if (ketepatanEl) ketepatanEl.textContent = '0%';
  if (tahapEl) tahapEl.textContent = 'Pemula';

  dlog('Rekod prestasi direset');
}

function eksportCSV() {
  const purataKetepatan = rekod.jumlah > 0 ? Math.round(rekod.ketepatanTerkumpul / rekod.jumlah) : 0;
  const rows = [
    ['Betul', 'Salah', 'Jumlah', 'PurataKetepatan(%)'],
    [rekod.betul, rekod.salah, rekod.jumlah, purataKetepatan]
  ];

  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'rekod_prestasi.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// =======================================
// TOGGLE SPEAKER
// =======================================

function toggleSpeaker() {
  const btn = document.getElementById('toggleSpeakerBtn');
  speakerOn = !speakerOn;
  if (btn) btn.textContent = speakerOn ? '🔊 Speaker On' : '🔇 Speaker Off';
  dlog('SpeakerOn:', speakerOn);
}

// =======================================
// INIT SEMUA EVENT LISTENER
// =======================================

function initEvents() {
  dlog('initEvents() called');

  document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', e => {
      setMode(e.target.value);
    });
  });

  const penBtn = document.getElementById('penBtn');
  const padamBtn = document.getElementById('padamBtn');
  const bersihBtn = document.getElementById('bersihBtn');
  const semakBtn = document.getElementById('semakBtn');
  const tekaSukuKataBtn = document.getElementById('tekaSukuKataBtn');
  const ulangSebutanBtn = document.getElementById('ulangSebutanBtn');
  const muatTurunBtn = document.getElementById('muatTurunBtn');
  const pilihRawakBtn = document.getElementById('pilihRawakBtn');
  const senaraiDitETapkan = document.getElementById('senaraiDitETapkan');
  const resetPrestasiBtn = document.getElementById('resetPrestasiBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');
  const toggleGuidesCb = document.getElementById('toggleGuides');
  const toggleBaselineCb = document.getElementById('toggleBaseline');
  const toggleSpeakerBtn = document.getElementById('toggleSpeakerBtn');

  if (penBtn) penBtn.addEventListener('click', () => { erasing = false; dlog('Pen mode'); });
  if (padamBtn) padamBtn.addEventListener('click', () => { erasing = true; dlog('Padam mode'); });
  if (bersihBtn) bersihBtn.addEventListener('click', bersihkanCanvas);
  if (semakBtn) semakBtn.addEventListener('click', semakGurisan);
  if (tekaSukuKataBtn) tekaSukuKataBtn.addEventListener('click', tekaSukuKata);
  if (ulangSebutanBtn) ulangSebutanBtn.addEventListener('click', ulangSebutan);
  if (muatTurunBtn) muatTurunBtn.addEventListener('click', muatTurunPNG);
  if (pilihRawakBtn) pilihRawakBtn.addEventListener('click', pilihRawak);
  if (senaraiDitETapkan) senaraiDitETapkan.addEventListener('change', e => {
    document.getElementById('perkataan').value = e.target.value;
    dlog('Ditetapkan pilih:', e.target.value);
  });
  if (resetPrestasiBtn) resetPrestasiBtn.addEventListener('click', resetPrestasi);
  if (exportCsvBtn) exportCsvBtn.addEventListener('click', eksportCSV);
  if (toggleSpeakerBtn) toggleSpeakerBtn.addEventListener('click', toggleSpeaker);

  if (toggleGuidesCb) toggleGuidesCb.addEventListener('change', e => {
    guidesCanvas.style.display = e.target.checked ? 'block' : 'none';
  });

  const labelBaseline = document.getElementById('labelBaseline');
  if (toggleBaselineCb && labelBaseline) {
    toggleBaselineCb.addEventListener('change', e => {
      labelBaseline.style.display = e.target.checked ? 'inline' : 'none';
    });
  }

  initDitETapkanSelect();
}

// =======================================
// WINDOW LOAD
// =======================================

window.addEventListener('load', () => {
  dlog('Window load');
  setupCanvas();
  initEvents();
  window.addEventListener('resize', resizeCanvas);
});


/* ============================================================
   INPUT BOX + DROPDOWN + RAWAK (KOMPONEN BARU)
   ============================================================ */

// ✅ Elemen
const inputBox = document.getElementById("perkataan");
const dropdownToggle = document.getElementById("dropdownToggle");
const dropdownList = document.getElementById("dropdownList");
const pilihRawakBtn = document.getElementById("pilihRawakBtn");

// ✅ Senarai perkataan (ambil dari words.js)
let senarai = [];
if (typeof wordsList !== "undefined") {
    senarai = wordsList;
}

// ✅ Buka/Tutup dropdown bila klik ikon ▼
dropdownToggle.addEventListener("click", () => {
    const visible = dropdownList.style.display === "block";
    dropdownList.style.display = visible ? "none" : "block";
    if (!visible) renderDropdown(senarai);
});

// ✅ Bila klik input → buka dropdown
inputBox.addEventListener("click", () => {
    dropdownList.style.display = "block";
    renderDropdown(senarai);
});

// ✅ Bila taip → filter dropdown
inputBox.addEventListener("input", () => {
    const q = inputBox.value.toLowerCase();
    const filtered = senarai.filter(w => w.toLowerCase().includes(q));
    dropdownList.style.display = "block";
    renderDropdown(filtered);
});

// ✅ Render dropdown
function renderDropdown(list) {
    dropdownList.innerHTML = "";

    if (list.length === 0) {
        const empty = document.createElement("div");
        empty.className = "dropdown-item";
        empty.textContent = "Tiada padanan";
        dropdownList.appendChild(empty);
        return;
    }

    list.forEach(item => {
        const div = document.createElement("div");
        div.className = "dropdown-item";
        div.textContent = item;

        div.onclick = () => {
            inputBox.value = item;
            dropdownList.style.display = "none";
        };

        dropdownList.appendChild(div);
    });
}

// ✅ Rawak → isi input box
pilihRawakBtn.addEventListener("click", () => {
    if (senarai.length === 0) return;
    const rawak = senarai[Math.floor(Math.random() * senarai.length)];
    inputBox.value = rawak;
    dropdownList.style.display = "none";
});

// ✅ Klik luar → tutup dropdown
document.addEventListener("click", (e) => {
    if (!e.target.closest(".input-dropdown-container")) {
        dropdownList.style.display = "none";
    }
});

/* ============================================================
   LOGIK MODE BAHARU (BEBAS / RAWAK / DITETAPKAN)
   ============================================================ */

function getMode() {
    return document.querySelector("input[name='mode']:checked").value;
}

function getPerkataan() {
    return inputBox.value.trim();
}

window.addEventListener("load", setupCanvas);
