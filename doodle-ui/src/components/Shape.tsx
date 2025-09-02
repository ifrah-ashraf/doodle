"use client";
import React, { useEffect, useRef, useState } from "react";
import useSocketStore from "@/store/socketStore";
import useUserDataStore from "@/store/useUserDataStore";
import Tools from "./toolbox/Tools";

type Tool = "pencil" | "eraser";

type DrawingData = {
  type: string;
  roomid: string;
  userid: string;
  data: {
    x: number;
    y: number;
    currentTool: string;
    color: string;
    width: number;
  };
};

function Shape() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);
  //const [tool, setTool] = useState<"pencil" | "eraser">("pencil")

  const [currentTool, setCurrentTool] = useState<Tool>("pencil");

  const socket = useSocketStore((state) => state.socket);
  const userId = useUserDataStore((state) => state.userid);
  const roomId = useUserDataStore((state) => state.roomid);

  const getLineWidth = () => (currentTool === "pencil" ? 4 : 20);
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

    if (currentTool === "pencil") {
      ctxRef.current.globalCompositeOperation = "source-over";
      ctxRef.current.strokeStyle = getStrokeStyle();
    } else if (currentTool === "eraser") {
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
        currentTool,
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
          if (parsed.data.currentTool === "pencil") {
            ctx.globalCompositeOperation = "source-over";
            ctx.strokeStyle = parsed.data.color;
          } else if (parsed.data.currentTool === "eraser") {
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
    <div>
      <canvas
        ref={canvasRef}
        width={700}
        height={500}
        className="border border-black bg-white rounded-md"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
      />
      <div className="mt-4 p-3 bg-white shadow-md rounded-md border w-max">
        <Tools selectedTool={currentTool} onSelectTool={setCurrentTool} />
      </div>
    </div>
  );
}

export default Shape;
