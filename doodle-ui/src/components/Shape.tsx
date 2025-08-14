"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaPencil } from "react-icons/fa6";
import { CiEraser } from "react-icons/ci";
import useSocketStore from "@/store/socketStore";
import useUserDataStore from "@/store/useUserDataStore";

type DrawingData = {
  type: string;
  roomid: string;
  userid: string;
  data: {
    x: number;
    y: number;
    tool: string;
    color: string;
    width: number;
  };
};

function Shape() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil");

  const socket = useSocketStore((state) => state.socket);
  const userId = useUserDataStore((state) => state.userid);
  const roomId = useUserDataStore((state) => state.roomid);

  const getLineWidth = () => (tool === "pencil" ? 4 : 20);
  const getStrokeStyle = () => "#000"; // pencil color

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctxRef.current) return;

    isDrawing.current = true;
    const { offsetX, offsetY } = e.nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);

    broadcastDrawing("start", offsetX, offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current || !ctxRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === "pencil") {
      ctxRef.current.globalCompositeOperation = "source-over";
      ctxRef.current.strokeStyle = getStrokeStyle();
    } else if (tool === "eraser") {
      ctxRef.current.globalCompositeOperation = "destination-out";
    }

    ctxRef.current.lineWidth = getLineWidth();
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();

    broadcastDrawing("draw", offsetX, offsetY);
  };

  const endDrawing = () => {
    isDrawing.current = false;
    ctxRef.current?.closePath();
    broadcastDrawing("end", 0, 0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;
    }
  }, []);

  const broadcastDrawing = (
    type: "start" | "draw" | "end",
    x: number,
    y: number
  ) => {
    if (!socket || !roomId || !userId) return;

    const drawingPayload: DrawingData = {
      type,
      roomid: roomId,
      userid: userId,
      data: {
        x,
        y,
        tool,
        color: getStrokeStyle(),
        width: getLineWidth(),
      },
    };

    socket.send(JSON.stringify(drawingPayload));
  };
  useEffect(() => {
    if (!socket || !ctxRef.current) return;

    const ctx = ctxRef.current;

    socket.onmessage = (event) => {
      try {
        const parsed: DrawingData = JSON.parse(event.data);

        if (parsed.type === "start") {
          ctx.beginPath();
          ctx.moveTo(parsed.data.x, parsed.data.y);
        } else if (parsed.type === "draw") {
          if (parsed.data.tool === "pencil") {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = parsed.data.color;
          } else if (parsed.data.tool === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
          }

          ctx.lineWidth = parsed.data.width;
          ctx.lineTo(parsed.data.x, parsed.data.y);
          ctx.stroke();
        } else if (parsed.type === "end") {
          ctx.closePath();
        }
      } catch (err) {
        console.error("Invalid drawing data received:", err);
      }
    };
  }, [socket]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        className="border border-black bg-purple-200 rounded-md"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
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
