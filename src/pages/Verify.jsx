import Canvas from "../components/Canvas";
import ResultPanel from "../components/ResultPanel";
import HistoryPanel from "../components/HistoryPanel";

export default function Verify() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Latihan Pengenalan Trengkas</h2>

      <Canvas />
      <ResultPanel />
      <HistoryPanel />
    </div>
  );
}
