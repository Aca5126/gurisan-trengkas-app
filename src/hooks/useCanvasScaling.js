import { useEffect } from "react";

export default function useCanvasScaling(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const scale = window.devicePixelRatio || 1;

    canvas.width = 300 * scale;
    canvas.height = 300 * scale;

    canvas.style.width = "300px";
    canvas.style.height = "300px";

    ctx.scale(scale, scale);
  }, [canvasRef]);
}
