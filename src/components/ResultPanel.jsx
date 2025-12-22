import { useVerify } from "../hooks/useVerify";
import ResultCard from "./ResultCard";

export default function ResultPanel() {
  const { result, loading, error } = useVerify();

  if (loading) return <p className="p-4">Sedang memproses...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!result) return <p className="p-4">Tiada keputusan lagi.</p>;

  return (
    <div className="p-6 border rounded-lg shadow bg-white">
      <h3 className="text-xl font-semibold mb-4">Keputusan</h3>
      <ResultCard result={result} />
    </div>
  );
}
