import { useRef } from "react";

export default function DrawingCanvas() {
  const canvasRef = useRef(null);

  return (
    <div
      ref={canvasRef}
      className="border rounded bg-white h-40 flex items-center justify-center text-gray-400"
    >
      Lukis Gurisan (Canvas interaktif di sini)
    </div>
  );
}
