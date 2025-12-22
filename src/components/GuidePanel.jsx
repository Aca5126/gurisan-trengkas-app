import { useState } from "react";

export default function GuidePanel() {
  const [tab, setTab] = useState("gurisan");

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-bold text-blue-700 mb-4">Panduan Trengkas</h3>

      <div className="flex gap-4 mb-4">
        {["gurisan", "vokal", "contoh"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
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
        <p className="text-gray-700">
          Vokal diwakili dengan titik atau garis kecil: a, e, i, o, u.
        </p>
      )}

      {tab === "contoh" && (
        <p className="text-gray-700">
          Contoh: "buku" → gurisan b + vokal u + gurisan k + vokal u.
        </p>
      )}
    </div>
  );
}
