import { useState } from "react";
import { useVerify } from "../hooks/useVerify";

export default function Canvas() {
  const [inputText, setInputText] = useState("");
  const { submit, loading } = useVerify();

  function handleVerify() {
    if (!inputText.trim()) return;
    submit(inputText);
  }

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-bold text-blue-700 mb-4">Latihan Gurisan Trengkas</h3>
      <p className="mb-2 text-gray-700">Belajar menulis gurisan trengkas dengan bimbingan AI</p>
      <label className="block mb-1 font-semibold">Perkataan Sasaran (Latihan)</label>
      <input
        type="text"
        className="w-full p-2 border rounded mb-3"
        placeholder="Contoh: lusa, buku, rumah..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />
      <p className="mb-2 text-sm text-gray-600">
        Masukkan perkataan yang anda ingin guna, kemudian lukis gurisan trengkas di bawah.
      </p>
      <div className="h-40 border rounded mb-3 flex items-center justify-center text-gray-400">
        Lukis Gurisan (ruang lukisan simulasi)
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleVerify}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          {loading ? "Memproses..." : "Semak Gurisan"}
        </button>
        <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-black rounded">
          Bersihkan
        </button>
      </div>
    </div>
  );
}
