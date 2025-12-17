import { useHistory } from "../hooks/useHistory";
import { useVerify } from "../hooks/useVerify";

export default function HistoryPanel() {
  const { result } = useVerify();
  const { record, status } = useHistory();

  function saveRecord() {
    if (!result) return;

    record({
      detected_text: result.detected_text,
      accuracy: result.accuracy,
      timestamp: new Date().toISOString(),
    });
  }

  return (
    <div className="p-4">
      <button
        onClick={saveRecord}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Simpan Rekod
      </button>

      {status && (
        <p className="mt-2 text-green-700">
          Rekod berjaya disimpan.
        </p>
      )}
    </div>
  );
}
