export default function ResultCard({ result }) {
  return (
    <div className="p-4 border rounded bg-gray-50 shadow">
      <p><strong>Perkataan:</strong> {result.word}</p>
      <p><strong>AI Kenal:</strong> {result.detected}</p>
      <p><strong>Ketepatan:</strong> {result.accuracy}%</p>
      <div className="mt-3 p-2 bg-white border rounded">
        {result.feedback}
      </div>
    </div>
  );
}
