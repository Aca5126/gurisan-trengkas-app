// ===============================
// API Client untuk Backend Baru
// ===============================

const API_BASE = import.meta.env.VITE_BACKEND_URL;

// ===============================
// Verify tulisan pelajar
// ===============================
export async function verifyTrengkas(inputText) {
  try {
    const response = await fetch(`${API_BASE}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input_text: inputText }),
    });

    if (!response.ok) {
      throw new Error("Gagal menerima respons dari server");
    }

    return await response.json();
  } catch (error) {
    console.error("Ralat API verifyTrengkas:", error);
    return { error: "Tidak dapat berhubung dengan server" };
  }
}

// ===============================
// Simpan sejarah latihan pelajar
// ===============================
export async function saveHistory(record) {
  try {
    const response = await fetch(`${API_BASE}/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });

    if (!response.ok) {
      throw new Error("Gagal menyimpan sejarah latihan");
    }

    return await response.json();
  } catch (error) {
    console.error("Ralat API saveHistory:", error);
    return { error: "Tidak dapat menyimpan sejarah latihan" };
  }
}

// ===============================
// Ping server untuk pastikan online
// ===============================
export async function pingServer() {
  try {
    const response = await fetch(`${API_BASE}/status`);
    return await response.json();
  } catch (error) {
    return { status: "offline" };
  }
}
