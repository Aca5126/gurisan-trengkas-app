import { useState } from "react";
import { saveHistory } from "../lib/api";

export function useHistory() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);

  async function record(data) {
    try {
      setError(null);
      const response = await saveHistory(data);
      setStatus(response);
      setRecords(prev => [...prev, data]);
    } catch (err) {
      setError("Tidak dapat menyimpan rekod.");
    }
  }

  // Kira statistik berdasarkan rekod
  const correctCount = records.filter(r => r.accuracy >= 80).length;
  const incorrectCount = records.filter(r => r.accuracy < 80).length;
  const successRate = records.length
    ? Math.round((correctCount / records.length) * 100)
    : 0;
  const averageAccuracy = records.length
    ? Math.round(records.reduce((sum, r) => sum + r.accuracy, 0) / records.length)
    : 0;

  let skillLevel
