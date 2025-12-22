import { useState } from "react";

export default function GuidePanel() {
  const [tab, setTab] = useState("gurisan");

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-bold text-blue-700 mb-4">Panduan Trengkas</h3>

      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setTab("gurisan")}
          className={`px-3 py-1 rounded ${tab === "gurisan" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Gurisan
        </button>
        <button
          onClick={() => setTab("vokal")}
          className={`px-3 py-1 rounded ${tab === "vokal" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Vokal
        </button>
        <button
          onClick={() => setTab("contoh")}
          className={`px-3 py-1 rounded ${tab === "contoh" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Contoh
        </button>
      </div>

      {tab === "gurisan" && (
        <>
          <p className="mb-3 text-gray-700">
            Sistem Trengkas Pitman 2000 Malaysia menggunakan gurisan untuk mewakili bunyi konsonan.
          </p>
          <ul className="list-disc pl-5 mb-3 text-gray-700">
            <li><strong>Gurisan ke bawah:</strong> t, d, p, b</li>
            <li><strong>Gurisan melintang:</strong> k, g, s, z</li>
            <li><strong>Gurisan ke atas:</strong> m, n, l, r</li>
            <li><strong>Gurisan lengkung:</strong> f, v, th</li>
          </ul>
          <p className="text-gray-700">
            <strong>Saiz Gurisan:</strong> Biasa (0.5 cm), Separuh (0.25 cm)
          </p>
        </>
      )}

      {tab === "vokal" && (
        <p className="text-gray-700">Panduan vokal akan ditambah di sini.</p>
      )}

      {tab === "contoh" && (
        <p className="text-gray-700">Contoh penggunaan gurisan
