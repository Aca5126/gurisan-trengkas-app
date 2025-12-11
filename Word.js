// =====================================================
// words.js — Senarai Perkataan untuk Mod Rawak & Ditetapkan
// =====================================================

// Senarai perkataan untuk mod RAWAK
window.WORDS = [
  // Kata dasar mudah
  "buku", "rumah", "lusa", "mata", "padi", "batu", "kayu", "awan", "laut", "jalan",
  "meja", "kerusi", "pintu", "tingkap", "pokok", "air", "api", "bulan", "bintang", "awan",

  // Kata kerja asas
  "tulis", "baca", "dengar", "sebut", "faham", "ingat", "latih", "ulang", "teka", "semak",

  // Kata nama am
  "kereta", "telefon", "pantai", "gunung", "bukit", "sungai", "kampung", "bandar", "sekolah", "kelas",

  // Kata adjektif
  "cepat", "lambat", "besar", "kecil", "tinggi", "rendah", "baru", "lama", "panas", "sejuk",

  // Kata masa
  "hari", "minggu", "bulan", "tahun", "pagi", "petang", "malam", "esok", "semalam", "lusa",

  // Kata kerja lanjutan
  "berlari", "berjalan", "melompat", "menulis", "membaca", "mengira", "mengajar", "belajar", "menyebut", "mendengar",

  // Kata nama khas (neutral)
  "Malaysia", "Selangor", "Putrajaya", "Johor", "Sabah", "Sarawak"
];


// =====================================================
// Senarai perkataan untuk mod DITETAPKAN
// =====================================================

window.WORDS_DITETAPKAN = [
  { label: "Perkataan Mudah", words: [
      "buku", "rumah", "lusa", "mata", "padi", "awan", "laut", "jalan", "pokok", "air"
  ]},

  { label: "Kata Kerja", words: [
      "tulis", "baca", "dengar", "sebut", "faham", "ingat", "latih", "ulang", "teka", "semak"
  ]},

  { label: "Kata Nama Am", words: [
      "kereta", "telefon", "pantai", "gunung", "bukit", "sungai", "kampung", "bandar", "sekolah", "kelas"
  ]},

  { label: "Kata Adjektif", words: [
      "cepat", "lambat", "besar", "kecil", "tinggi", "rendah", "baru", "lama", "panas", "sejuk"
  ]},

  { label: "Kata Masa", words: [
      "hari", "minggu", "bulan", "tahun", "pagi", "petang", "malam", "esok", "semalam", "lusa"
  ]}
];


// =====================================================
// Auto-populate <select id="senaraiDitETapkan">
// =====================================================

(function populateSelect() {
  const select = document.getElementById("senaraiDitETapkan");
  if (!select || !window.WORDS_DITETAPKAN) return;

  window.WORDS_DITETAPKAN.forEach(group => {
    const optGroup = document.createElement("optgroup");
    optGroup.label = group.label;

    group.words.forEach(w => {
      const opt = document.createElement("option");
      opt.value = w;
      opt.textContent = w;
      optGroup.appendChild(opt);
    });

    select.appendChild(optGroup);
  });
})();
