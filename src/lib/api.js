// ===============================
// API Client untuk Backend Render
// ===============================

const API_BASE = "https://gurisan-trengkas-backend.onrender.com";

// ===============================
// Verify tulisan pelajar
// ===============================
export async function verifyShorthand({ targetWord, imageData }) {
  try {
    const response = await fetch(`${API_BASE}/api/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        expected_text: targetWord,
        image_base64: imageData,
      }),
    });

    if (!response.ok) {
      throw new Error("Gagal menerima respons dari server");
    }

    return await response.json();
  } catch (error) {
    console.error("Ralat API verifyShorthand:", error);
    return { error: "Tidak dapat berhubung dengan server" };
  }
}

// ===============================
// Dapatkan sejarah latihan pelajar
// ===============================
export async function getHistory(userId = "default_user") {
  try {
    const response = await fetch(`${API_BASE}/api/history/${userId}`);

    if (!response.ok) {
      throw new Error("Gagal menerima sejarah latihan");
    }

    return await response.json();
  } catch (error) {
    console.error("Ralat API getHistory:", error);
    return { error: "Tidak dapat mengambil sejarah latihan" };
  }
}

// ===============================
// Ping server untuk pastikan online
// ===============================
export async function pingServer() {
  try {
    const response = await fetch(`${API_BASE}/api/status`);
    return await response.json();
  } catch (error) {
    return { status: "offline" };
  }
}
