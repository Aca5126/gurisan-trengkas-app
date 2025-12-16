export default function ResultCard({ result }) {
  return (
    <div className="w-full max-w-sm p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-bold mb-2">Keputusan AI</h2>

      <p><strong>Perkataan:</strong> {result.word}</p>
      <p><strong>AI Kenal:</strong> {result.detected}</p>
      <p><strong>Ketepatan:</strong> {result.accuracy}%</p>

      <div className="mt-3 p-2 bg-white border rounded">
        {result.feedback}
      </div>
    </div>
  );
}
