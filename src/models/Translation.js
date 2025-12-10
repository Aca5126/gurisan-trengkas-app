// Optional: jika mahu simpan sejarah ke DB (contoh MongoDB).
// Buat sambungan Mongoose di server.js jika diperlukan.
// Buat masa ini, fail ini hanya template.

const mongoose = require('mongoose');

const TranslationSchema = new mongoose.Schema({
  imageHash: { type: String },
  output: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Translation || mongoose.model('Translation', TranslationSchema);
