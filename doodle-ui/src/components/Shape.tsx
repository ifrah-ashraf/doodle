"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { CiEraser } from "react-icons/ci";
//import { io } from "socket.io-client";

// Setup socket (adjust your server URL)
//const socket = io("http://localhost:3001");

function Shape() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);

  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");

  // Handle tool change
  const getStrokeStyle = () => (tool === "pencil" ? "#000" : "#fff");
  const getLineWidth = () => (tool === "pencil" ? 2 : 20);

  // Broadcast the drawing action
  /* const broadcastDrawing = (type: "start" | "draw", x: number, y: number) => {
    socket.emit("draw", {
      type,
      x,
      y,
      color: getStrokeStyle(),
      width: getLineWidth(),
    });
  }; */

  // Mouse events
  const startDrawing = (e: MouseEvent) => {
    if (!ctxRef.current) return;
    isDrawing.current = true;

    const x = e.offsetX;
    const y = e.offsetY;

    ctxRef.current.strokeStyle = getStrokeStyle();
    ctxRef.current.lineWidth = getLineWidth();
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);

    //broadcastDrawing("start", x, y);
  };

  const draw = (e: MouseEvent) => {
    if (!isDrawing.current || !ctxRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();

    //broadcastDrawing("draw", x, y);
  };

  const endDrawing = () => {
    isDrawing.current = false;
  };

  // WebSocket drawing listener
  /* useEffect(() => {
    socket.on("receive-draw", ({ type, x, y, color, width }) => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.strokeStyle = color;
      ctx.lineWidth = width;

      if (type === "start") {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (type === "draw") {
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    });

    return () => {
      socket.off("receive-draw");
    };
  }, []); */

  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) ctxRef.current = ctx;

    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", endDrawing);
    canvas.addEventListener("mouseleave", endDrawing);

    return () => {
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", endDrawing);
      canvas.removeEventListener("mouseleave", endDrawing);
    };
  }, [tool]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Drawing canvas */}
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        className="border border-black bg-white rounded-md"
      />

      {/* Tools at bottom */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={() => setTool("pencil")}
          className={`w-16 h-16 border-2 rounded-md flex items-center justify-center ${
            tool === "pencil" ? "bg-yellow-300" : "bg-white"
          }`}
        >
          <FaPencil size={20} />
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`w-16 h-16 border-2 rounded-md flex items-center justify-center ${
            tool === "eraser" ? "bg-yellow-300" : "bg-white"
          }`}
        >
          <CiEraser size={24} />
        </button>
      </div>
    </div>
  );
}

export default Shape;
