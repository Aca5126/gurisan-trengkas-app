import { useEffect, useState } from "react";
import { getHistory } from "../lib/api";

export default function HistoryPanel({ userId = "default_user" }) {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      const data = await getHistory(userId);
      setLoading(false);
      if (!data.error) {
        setHistory(data.records || []);
      } else {
        setHistory([]);
      }
    };

    loadHistory();
  }, [userId]);

  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <h2 className="font-semibold mb-2">Rekod Latihan</h2>

      {loading && <p className="text-gray-500 text-sm">Memuatkan rekod...</p>}

      {!loading && history && history.length === 0 && (
        <p className="text-gray-500 text-sm">
          Belum ada rekod latihan. Jom mula menulis gurisan pertama.
        </p>
      )}

      {!loading && history && history.length > 0 && (
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Sasaran</th>
                <th className="text-left py-1">Dikesan</th>
                <th className="text-right py-1">Ketepatan</th>
                <th className="text-right py-1">Masa</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0">
                  <td className="py-1">{item.expected_text}</td>
                  <td className="py-1">{item.detected_text}</td>
                  <td className="py-1 text-right">
                    {item.accuracy != null
                      ? `${item.accuracy.toFixed(1)}%`
                      : "-"}
                  </td>
                  <td className="py-1 text-right text-gray-500">
                    {item.timestamp
                      ? new Date(item.timestamp).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
