import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import { register as registerSW } from "./serviceWorkerRegistration";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// Daftar service worker
registerSW();
