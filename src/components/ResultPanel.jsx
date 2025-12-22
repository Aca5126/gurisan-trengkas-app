import { useVerify } from "../hooks/useVerify";
import ResultCard from "./ResultCard";

export default function ResultPanel() {
  const { result, loading, error } = useVerify();

  if (loading) return <p className="p-4">Sedang memproses...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!result) return <p className="p-4">Tiada keputusan lagi.</p>;

  return (
    <div className="p-4">
      <ResultCard result={result} />
    </div>
  );
}
