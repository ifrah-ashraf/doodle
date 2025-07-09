"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { CiEraser } from "react-icons/ci";

function Shape() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [pencil, setPencil] = useState<boolean>(true);
  const [eraser, setEraser] = useState<boolean>(false);
  const isDrawing = useRef<boolean>(false);

  const handleMousedown = (e: MouseEvent) => {
    isDrawing.current = true;
    if (pencil && ctxRef.current) {
      ctxRef.current.strokeStyle = "black"; // Pencil color
      ctxRef.current.lineWidth = 2; // Pencil size
    } else if (eraser && ctxRef.current) {
      ctxRef.current.strokeStyle = "#ccc"; // Same as canvas background
      ctxRef.current.lineWidth = 20; // Eraser size (thicker)
    }

    ctxRef.current?.beginPath();
    ctxRef.current?.moveTo(e.offsetX, e.offsetY);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDrawing.current || !ctxRef.current ) return;

    ctxRef.current.lineWidth = eraser ? 20 : 2;
    ctxRef.current.strokeStyle = eraser ? "#fff" : "#000";
    ctxRef.current.lineTo(e.offsetX, e.offsetY);
    ctxRef.current.stroke();
  };
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) ctxRef.current = ctx;

    canvas.addEventListener("mousedown", handleMousedown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    // 🧹 Cleanup
    return () => {
      canvas.removeEventListener("mousedown", handleMousedown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [pencil]);

  return (
    <div className="flex justify-center items-center min-h-screen gap-8">
      {/* Canvas container */}
      <div className="border border-black">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="w-[600px] h-[600px] bg-white block"
        />
      </div>

      {/* Tools panel */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => {
            setPencil(true);
            setEraser(false);
          }}
          className="w-32 h-28 border-2 border-black flex items-center justify-center text-xl bg-white cursor-pointer"
        >
          <FaPencil />
        </button>
        <button
          onClick={() => {
            setEraser(true);
            setPencil(false);
          }}
          className="w-32 h-28 border-2 border-black flex items-center justify-center text-xl bg-white cursor-pointer"
        >
          <CiEraser />
        </button>
      </div>
    </div>
  );
}

export default Shape;
