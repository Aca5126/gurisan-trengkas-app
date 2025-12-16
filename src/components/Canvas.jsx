import { useRef, useState, useEffect } from "react";
import { verifyShorthand } from "../lib/api";

export default function Canvas({ targetWord, onResult }) {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 300;

    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctxRef.current = ctx;
  }, []);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctxRef.current.fillStyle = "#fff";
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
  };

  const getBase64Image = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL("image/png");
    return dataURL.split(",")[1];
  };

  const handleSubmit = async () => {
    if (!targetWord || targetWord.trim() === "") {
      alert("Sila masukkan perkataan sasaran.");
      return;
    }

    const imageData = getBase64Image();

    setLoading(true);
    const result = await verifyShorthand({
      targetWord,
      imageData,
    });
    setLoading(false);

    if (onResult) {
      onResult(result);
    }
  };

  return (
    <div className="canvas-section">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border rounded bg-white shadow"
        style={{ touchAction: "none" }}
      />

      <div className="flex gap-3 mt-3">
        <button
          onClick={clearCanvas}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Padam
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Menganalisis..." : "Hantar"}
        </button>
      </div>
    </div>
  );
}
