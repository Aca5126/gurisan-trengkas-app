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
    <div className="p-4">
      <textarea
        className="w-full p-2 border rounded"
        placeholder="Tulis teks trengkas di sini..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      />

      <button
        onClick={handleVerify}
        disabled={loading}
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? "Memproses..." : "Semak Tulisan"}
      </button>
    </div>
  );
}
