// Senarai 300 perkataan asas latihan (anda boleh tambah/mengubah mengikut kurikulum)
window.WORDS = [
  "buku","rumah","lusa","kereta","jalan","guru","pelajar","sekolah","makan","minum",
  "ayah","ibu","anak","adik","abang","kakak","datang","pergi","lihat","dengar",
  "cakap","tulis","baca","belajar","kerja","cuti","pagi","petang","malam","hari",
  "minggu","bulan","tahun","jam","minit","saat","besar","kecil","panjang","pendek",
  "tebal","nipis","cepat","lambat","kuat","lemah","cantik","kemas","kemas kini","warna",
  "hitam","putih","merah","biru","kuning","hijau","ungu","oren","kelabu","coklat",
  "laut","pantai","gunung","hutan","sungai","tasik","udara","api","air","tanah",
  "mata","telinga","mulut","hidung","tangan","kaki","kepala","bahu","lutut","jari",
  "meja","kerusi","papan","pintu","tingkap","bilik","dapur","bilik air","tandas","ruang tamu",
  "telefon","komputer","internet","kamera","radio","televisyen","lampu","kipas","peti sejuk","dawai",
  "beli","jual","harga","murah","mahal","kedai","pasar","bank","duit","bayar",
  "pintu masuk","keluar","naik","turun","kiri","kanan","depan","belakang","atas","bawah",
  "sepanjang","sebelah","seberang","sekitar","antara","dalam","luar","bersama","sendiri","ramai",
  "membaca","menulis","mengira","mengukur","melukis","mewarna","menjahit","memasak","mengemas","mencuci",
  "berlari","berjalan","berenang","melompat","memanjat","menari","menyanyi","bermain","berehat","tidur",
  "bangun","mandi","gosok gigi","sarapan","makan tengah hari","makan malam","minum teh","minum kopi","air kosong","jus",
  "buah","sayur","nasi","roti","mi","susu","telur","ikan","ayam","daging",
  "masin","manis","masam","pahit","pedas","lemak","rangup","lembut","keras","segar",
  "pencil","pen","pemadam","pembaris","pembaris besi","peta","buku nota","fail","kertas","gam",
  "kuliah","bengkel","ujian","peperiksaan","markah","keputusan","lulus","gagal","ulang kaji","projek",
  "bahasa","tatabahasa","sebutan","fonetik","suku kata","perkataan","ayat","perenggan","esei","dialog",
  "soalan","jawapan","contoh","latihan","aktiviti","penilaian","rujukan","panduan","jadual","rekod",
  "mingguan","bulanan","tahunan","harian","sekolah rendah","menengah","universiti","guru besar","pengetua","pensyarah",
  "murid","pelajar","rakan","kawan","jiran","pasukan","kelab","persatuan","kelas","bilik darjah",
  "projek sains","projek seni","projek bahasa","projek muzik","projek sukan","projek ICT","projek komuniti","projek khas","projek mini","projek akhir",
  "latihan asas","latihan lanjutan","latihan praktikal","latihan teori","latihan harian","latihan mingguan","latihan bulanan","latihan intensif","latihan kendiri","latihan kumpulan",
  "pitman","trengkas","gurisan","garisan","baseline","panduan","kanvas","lukis","padam","semak",
  "teka","sebut","muat turun","import","eksport","reset","rekod","prestasi","kejayaan","ketepatan"
];

// Isi dropdown Ditetapkan setelah halaman dimuat
(function populateDropdown() {
  const select = document.getElementById('senaraiDitETapkan');
  if (!select) return;
  select.innerHTML = '';
  window.WORDS.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.textContent = w;
    select.appendChild(opt);
  });
})();
