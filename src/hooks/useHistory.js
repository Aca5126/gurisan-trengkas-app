import { useState } from "react";
import { saveHistory } from "../lib/api";

export function useHistory() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);

  const stats = {
    correct: records.filter(r => r.accuracy >= 80).length,
    incorrect: records.filter(r => r.accuracy < 80).length,
    successRate: records.length ? Math.round((records.filter(r => r.accuracy >= 80).length / records.length) * 100) : 0,
    averageAccuracy: records.length ? Math.round(records.reduce((sum, r) => sum + r.accuracy, 0) / records.length) : 0,
    skillLevel: records.length === 0 ? "Pemula" :
                stats.averageAccuracy > 90 ? "Mahir" :
                stats.averageAccuracy > 70 ? "Pert
