export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/src/service-worker.js")
        .catch((err) => console.error("SW registration failed:", err));
    });
  }
}
