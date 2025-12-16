export async function verifyShorthand({ targetWord, imageData }) {
  const response = await fetch("http://localhost:8000/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetWord, imageData }),
  });

  return await response.json();
}
