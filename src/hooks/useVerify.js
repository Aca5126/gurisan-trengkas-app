import { useState } from 'react';
import { verifyTrengkas } from '../lib/api';

export function useVerify() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function submit(inputText) {
    try {
      setLoading(true);
      setError(null);

      const response = await verifyTrengkas(inputText);
      setResult(response);

    } catch (err) {
      setError('Ralat semasa menghubungi pelayan.');
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, submit };
}
