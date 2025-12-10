// 300 perkataan asas latihan (gabungan kata umum untuk latihan gurisan)
window.WORDS = [
  "buku","rumah","lusa","kamu","saya","dia","kita","mereka","hari","malam",
  "pagi","petang","sekolah","kelas","guru","murid","belajar","tulis","baca","dengar",
  "soalan","jawapan","nota","pensel","pen","pemadam","kertas","meja","kerusi","tingkap",
  "pintu","laman","bilik","dapur","tandas","taman","pokok","bunga","daun","air",
  "makan","minum","nasi","roti","ikan","ayam","daging","sayur","buah","susu",
  "gula","garam","pedas","manis","masin","pahit","masak","goreng","kukus","rebus",
  "panas","sejuk","angin","hujan","ribut","cerah","mendung","awan","matahari","bulan",
  "bintang","langit","laut","pantai","pulau","gunung","bukit","sungai","tasik","hutan",
  "jalan","kereta","bas","motor","kapal","kapal terbang","bot","tren","stesen","tiket",
  "jam","minit","saat","cepat","lambat","awal","lewat","sekarang","nanti","kelmarin",
  "esok","lusa","minggu","bulan","tahun","musim","cuti","kerja","pejabat","kedai",
  "pasar","harga","murah","mahal","jual","beli","bayar","terima","beri","ambil",
  "hantar","pos","telefon","mesej","emel","internet","laman web","kata laluan","akaun","log masuk",
  "daftar","keluar","masuk","pilih","tutup","buka","cari","jumpa","tunggu","lihat",
  "tonton","gambar","video","suara","muzik","lagu","main","berhenti","mula","tamat",
  "naik","turun","kanan","kiri","depan","belakang","atas","bawah","besar","kecil",
  "panjang","pendek","tebal","nipis","ringan","berat","penuh","kosong","baru","lama",
  "cantik","jelek","baik","jahat","betul","salah","mudah","sukar","kuat","lemah",
  "cekal","tenang","tegas","lembut","senang","susah","seronok","bosan","sihat","sakit",
  "ubat","hospital","klinik","doktor","jururawat","demam","batuk","selsema","kulit","mata",
  "telinga","hidung","mulut","tangan","kaki","kepala","bahu","perut","kawan","rakan",
  "keluarga","ayah","ibu","anak","abang","kakak","adik","datuk","nenek","saudara",
  "tetamu","jiran","komuniti","kampung","bandar","negeri","negara","Malaysia","bahasa","Melayu",
  "Inggeris","Arab","Cina","Tamil","sebut","ejaan","bunyi","konsonan","vokal","gurisan",
  "trengkas","latihan","ujian","panduan","kelas","universiti","pensyarah","pelajar","tugas","projek",
  "markah","gred","lulus","gagal","ulang kaji","penerangan","contoh","gambar rajah","garis","baseline",
  "panduan","saiz","biasa","separuh","tebal","nipis","lengkung","lurus","melintang","ke bawah",
  "ke atas","pantas","perlahan","gigih","fokus","teknik","kaedah","proses","langkah","tujuan",
  "matlamat","hasil","data","rekod","prestasi","kadar","ketepatan","kemahiran","pemula","mahir",
  "pakar","senarai","rawak","ditetapkan","pilihan","butang","antara muka","aplikasi","web","mudah alih",
  "akses","selamat","terbuka","sumber","fail","muat turun","eksport","import","CSV","PNG",
  "base64","imej","kanvas","kelas asas","amalan","disiplin","usaha","minat","semangat","ilmu",
  "bimbingan","ajar","belajar","soal","jawab","latih","ulang","catat","ringkas","panjang",
  "isi","tajuk","subtajuk","nota ringkas","rujukan","penerbitan","dokumen","rekabentuk","susun atur","kemas",
  "bersih","mesra","pelajar","guru","pandai","mari","ke","sekolah","pergi","datang"
];

window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('senaraiDitETapkan');
  if (select) {
    window.WORDS.forEach((w) => {
      const opt = document.createElement('option');
      opt.value = w;
      opt.textContent = w;
      select.appendChild(opt);
    });
    const ul = document.getElementById('contohList');
    if (ul) window.WORDS.slice(0, 60).forEach(w => {
      const li = document.createElement('li');
      li.textContent = w;
      ul.appendChild(li);
    });
  }
});
