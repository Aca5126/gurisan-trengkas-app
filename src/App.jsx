import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Verify from "./pages/Verify";

export default function App() {
  return (
    <Router basename="/gurisan-trengkas-app">
      <Routes>
        <Route path="/" element={<Verify />} />
      </Routes>
    </Router>
  );
}
