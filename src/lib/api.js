// ===============================
// API Client untuk Backend Render
// ===============================

// ✅ URL backend Render Aca
const API_BASE = "https://gurisan-trengkas-backend.onrender.com";

// ===============================
// Hantar shorthand untuk verifikasi
// ===============================
export async function verifyShorthand({ targetWord, imageData }) {
  try {
    const response = await fetch(`${API_BASE}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetWord, imageData }),
    });

    if (!response.ok) {
      throw new Error("Gagal menerima respons dari server");
    }

    return await response.json();
  } catch (error) {
    console.error("Ralat API:", error);
    return { error: "Tidak dapat berhubung dengan server" };
  }
}

// ===============================
// Ping server untuk pastikan online
// ===============================
export async function pingServer() {
  try {
    const response = await fetch(`${API_BASE}/ping`);
    return await response.json();
  } catch (error) {
    return { status: "offline" };
  }
}
