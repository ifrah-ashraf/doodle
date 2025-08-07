"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { CiEraser } from "react-icons/ci";
import useSocketStore from "@/store/socketStore";
import useUserDataStore from "@/store/useUserDataStore";

type DrawingData = {
  type: "draw";
  roomid: string;
  userid: string;
  data: {
    x: number;
    y: number;
    color: string;
    size: number;
    tool: "pencil" | "eraser";
  };
};

function Shape() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);

  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");

  const socket = useSocketStore((state) => state.socket);
  const roomId = useUserDataStore((state) => state.roomid);
  const userId = useUserDataStore((state) => state.userid);

  const getStrokeStyle = useCallback(
    () => (tool === "pencil" ? "#000" : "#fff"),
    [tool]
  );
  const getLineWidth = useCallback(() => (tool === "pencil" ? 2 : 20), [tool]);

  const broadcastDrawing = useCallback(
    (x: number, y: number) => {
      if (!socket) return;

      const drawPayload: DrawingData = {
        type: "draw",
        roomid: roomId,
        userid: userId,
        data: {
          x,
          y,
          color: getStrokeStyle(),
          size: getLineWidth(),
          tool,
        },
      };

      socket.send(JSON.stringify(drawPayload));
    },
    [socket, roomId, userId, tool, getLineWidth, getStrokeStyle]
  );

  const startDrawing = useCallback(
    (e: MouseEvent) => {
      if (!ctxRef.current) return;

      const x = e.offsetX;
      const y = e.offsetY;

      isDrawing.current = true;

      ctxRef.current.strokeStyle = getStrokeStyle();
      ctxRef.current.lineWidth = getLineWidth();
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);

      broadcastDrawing(x, y);
    },
    [broadcastDrawing, getLineWidth, getStrokeStyle]
  );

  const draw = useCallback(
    (e: MouseEvent) => {
      if (!isDrawing.current || !ctxRef.current || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (tool === "eraser") {
        ctxRef.current.clearRect(x - 10, y - 10, 20, 20);
      } else {
        ctxRef.current.lineTo(x, y);
        ctxRef.current.stroke();
      }

      broadcastDrawing(x, y);
    },
    [broadcastDrawing, tool]
  );

  const endDrawing = useCallback(() => {
    isDrawing.current = false;
  }, []);

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
  }, [startDrawing, draw, endDrawing]);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "draw") {
        const { x, y, color, size } = message.data;
        const ctx = ctxRef.current;
        if (!ctx) return;

        if (tool === "eraser") {
          ctx.clearRect(x - size / 2, y - size / 2, size, size);
        } else {
          ctx.strokeStyle = color;
          ctx.lineWidth = size;
          ctx.lineTo(x, y);
          ctx.stroke();
        }
      }
    };
  }, [socket, tool]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        className="border border-black bg-white rounded-md"
      />

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
