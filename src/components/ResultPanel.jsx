export default function ResultPanel({ result, targetWord }) {
  if (!result) {
    return (
      <div className="p-4 bg-white rounded shadow mt-4">
        <p className="text-gray-500">
          Hasil analisis akan dipaparkan di sini selepas Aca hantar tulisan.
        </p>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded shadow mt-4">
        {result.error}
      </div>
    );
  }

  const {
    success,
    message,
    detected_text,
    expected_text,
    accuracy,
    mistakes,
  } = result;

  const isGood = success && accuracy >= 80;

  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <h2 className="font-semibold mb-2">Keputusan Analisis</h2>

      <p className="text-sm text-gray-600 mb-2">{message}</p>

      <div className="mb-2">
        <span className="font-semibold">Perkataan sasaran:</span>{" "}
        <span className="text-blue-700">
          {expected_text || targetWord || "-"}
        </span>
      </div>

      <div className="mb-2">
        <span className="font-semibold">Teks yang dikesan:</span>{" "}
        <span className="text-green-700">{detected_text || "-"}</span>
      </div>

      <div className="mb-3">
        <span className="font-semibold">Ketepatan:</span>{" "}
        <span className={isGood ? "text-green-700" : "text-orange-700"}>
          {accuracy != null ? `${accuracy.toFixed(1)}%` : "-"}
        </span>
      </div>

      {mistakes && mistakes.length > 0 && (
        <div className="mt-2">
          <div className="font-semibold mb-1">Perincian kesilapan:</div>
          <ul className="list-disc list-inside text-sm text-gray-700">
            {mistakes.map((m, idx) => (
              <li key={idx}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3">
        {isGood ? (
          <p className="text-green-700 font-semibold">
            Bagus! Tulisan Aca sangat hampir atau sepadan dengan jangkaan.
          </p>
        ) : (
          <p className="text-orange-700 font-semibold">
            Tak mengapa. Ini peluang untuk Aca perbaiki gurisan dan cuba lagi.
          </p>
        )}
      </div>
    </div>
  );
}
