import { useHistory } from "../hooks/useHistory";
import { useVerify } from "../hooks/useVerify";

export default function HistoryPanel() {
  const { result } = useVerify();
  const { record, status, stats } = useHistory();

  function saveRecord() {
    if (!result) return;
    record({
      detected_text: result.detected_text ?? result.detected,
      accuracy: result.accuracy,
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-bold text-blue-700 mb-4">Rekod Prestasi</h3>
      <p>Betul: {stats.correct}</p>
      <p>Salah: {stats.incorrect}</p>
      <p>Kadar Kejayaan: {stats.successRate}%</p>
      <p>Purata Ketepatan: {stats.averageAccuracy}%</p>
      <p>Tahap Kemahiran: {stats.skillLevel}</p>
      <p className="mt-2 text-sm text-gray-600 italic">
        Jangan putus asa! Latihan membawa kejayaan.
      </p>
      <button
        onClick={saveRecord}
        className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
      >
        Simpan Rekod
      </button>
      {status && (
        <p className="mt-2 text-green-600 font-semibold">Rekod berjaya disimpan.</p>
      )}
    </div>
  );
}
