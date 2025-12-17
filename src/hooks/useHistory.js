import { useState } from 'react';
import { saveHistory } from '../lib/api';

export function useHistory() {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  async function record(data) {
    try {
      setError(null);
      const response = await saveHistory(data);
      setStatus(response);
    } catch (err) {
      setError('Tidak dapat menyimpan rekod.');
    }
  }

  return { status, error, record };
}
