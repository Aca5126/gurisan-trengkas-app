import mongoose from 'mongoose';

const TranslationSchema = new mongoose.Schema({
  time: { type: Date, default: Date.now },
  hint: { type: String },
  shorthand: { type: String },   // deskripsi simbol/fonem (hasil OpenAI)
  fullText: { type: String, required: true },
  confidence: { type: Number, min: 0, max: 1, required: true },
  candidates: { type: [String], default: [] },
  imageRef: { type: String }     // optional: simpan dataURL pendek atau pointer storage
}, { timestamps: true });

export default mongoose.model('Translation', TranslationSchema);
