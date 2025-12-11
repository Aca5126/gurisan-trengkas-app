// ==============================
// words.js — Senarai Perkataan
// ==============================

// Untuk mod RAWAK
window.WORDS = [
  "buku", "rumah", "lusa", "matahari", "kereta", "telefon", "pantai", "awan", "pokok", "air",
  "jalan", "belajar", "guru", "pelajar", "kelas", "meja", "kerusi", "papan", "kapur", "pen",
  "daun", "langit", "hujan", "petir", "angin", "laut", "ombak", "pasir", "gunung", "bukit",
  "jam", "masa", "cepat", "lambat", "awal", "lewat", "hari", "minggu", "bulan", "tahun",
  "tulis", "baca", "dengar", "sebut", "faham", "ingat", "latih", "ulang", "teka", "semak"
];

// Untuk mod DITETAPKAN
window.WORDS_DITETAPKAN = [
  { label: "Kata Mudah", words: ["buku", "rumah", "matahari", "awan", "air", "pokok", "jalan", "kelas", "pen", "meja"] },
  { label: "Kata Kerja", words: ["tulis", "baca", "dengar", "sebut", "faham", "ingat", "latih", "ulang", "teka", "semak"] },
  { label: "Kata Masa", words: ["hari", "minggu", "bulan", "tahun", "jam", "masa", "awal", "lewat", "cepat", "lambat"] }
];

// Auto-populate <select id="senaraiDitETapkan">
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
