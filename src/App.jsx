import React, { useState } from "react";
import Canvas from "./components/Canvas";
import ResultCard from "./components/ResultCard";
import { verifyShorthand } from "./lib/api";

export default function App() {
  const [targetWord, setTargetWord] = useState("");
  const [imageData, setImageData] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    if (!targetWord || !imageData) return;
    const response = await verifyShorthand({ targetWord, imageData });
    setResult(response);
  };

  return (
    <main className="min-h-screen bg-white text-gray-800 p-4 flex flex-col items-center gap-6">
      <h1 className="text-2xl font-bold text-center">Gurisan Trengkas AI</h1>

      <input
        type="text"
        value={targetWord}
        onChange={(e) => setTargetWord(e.target.value)}
        placeholder="Masukkan perkataan"
        className="border p-2 rounded w-full max-w-sm"
      />

      <Canvas setImageData={setImageData} />

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Hantar ke AI
      </button>

      {result && <ResultCard result={result} />}
    </main>
  );
}
