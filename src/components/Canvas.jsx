import React, { useRef, useEffect } from "react";
import useCanvasScaling from "../hooks/useCanvasScaling";
import useDisableScroll from "../hooks/useDisableScroll";

export default function Canvas({ setImageData }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useCanvasScaling(canvasRef);
  useDisableScroll();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
  }, []);

  const startDraw = (x, y) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
  };

  const draw = (x, y) => {
    if (!isDrawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => {
    isDrawing.current = false;
    const dataURL = canvasRef.current.toDataURL("image/png");
    setImageData(dataURL);
  };

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={300}
      className="border rounded bg-white touch-none"
      onMouseDown={(e) => startDraw(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
      onMouseMove={(e) => draw(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
      onMouseUp={endDraw}
      onMouseLeave={endDraw}
      onTouchStart={(e) => {
        const touch = e.touches[0];
        startDraw(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        draw(touch.clientX, touch.clientY);
      }}
      onTouchEnd={endDraw}
    />
  );
}
