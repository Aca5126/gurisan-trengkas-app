import { useVerify } from "../hooks/useVerify";
import ResultCard from "./ResultCard";

export default function ResultPanel() {
  const { result, loading, error } = useVerify();

  return (
    <div className="p-6 border rounded-lg shadow-lg bg-white">
      <h3 className="text-xl font-bold text-blue-700 mb-4">Keputusan Semakan</h3>
      {loading && <p className="text-gray-600">Sedang memproses...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}
      {!result && (
        <p className="text-gray-600">
          Tiada semakan lagi. Masukkan perkataan dan lukis gurisan untuk semakan.
        </p>
      )}
      {result && <ResultCard result={result} />}
    </div>
  );
}
