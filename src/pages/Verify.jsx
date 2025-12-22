import Canvas from "../components/Canvas";
import ResultPanel from "../components/ResultPanel";
import HistoryPanel from "../components/HistoryPanel";
import GuidePanel from "../components/GuidePanel";

export default function Verify() {
  return (
    <div className="p-6 grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-6">
        <Canvas />
        <ResultPanel />
        <GuidePanel />
      </div>
      <HistoryPanel />
    </div>
  );
}
