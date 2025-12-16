import { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import ResultPanel from "./components/ResultPanel";
import HistoryPanel from "./components/HistoryPanel";
import { pingServer } from "./lib/api";

export default function App() {
  const [targetWord, setTargetWord] = useState("");
  const [result, setResult] = useState(null);
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
    const checkServer = async () => {
      const status = await pingServer();
      setServerStatus(status);
    };
    checkServer();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-blue-100">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-blue-800">
            Gurisan Trengkas AI
          </h1>
          <p className="text-sm text-gray-600">
            Latih tulisan trengkas, lihat maklum balas, dan jejak kemajuan Aca.
          </p>

          {serverStatus && (
            <p className="mt-2 text-xs">
              Status server:{" "}
              {serverStatus.status === "ok" ? (
                <span className="text-green-700 font-semibold">Online</span>
              ) : (
                <span className="text-red-700 font-semibold">Offline</span>
              )}
            </p>
          )}
        </header>

        <main className="grid md:grid-cols-2 gap-6 items-start">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Perkataan sasaran
            </label>
            <input
              type="text"
              value={targetWord}
              onChange={(e) => setTargetWord(e.target.value)}
              placeholder="Contoh: buku"
              className="w-full border rounded px-3 py-2 mb-4 focus:outline-none focus:ring focus:border-blue-400"
            />

            <Canvas targetWord={targetWord} onResult={setResult} />
          </div>

          <div>
            <ResultPanel result={result} targetWord={targetWord} />
            <HistoryPanel userId="default_user" />
          </div>
        </main>
      </div>
    </div>
  );
}
