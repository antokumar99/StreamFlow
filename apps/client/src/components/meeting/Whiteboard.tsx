"use client";

import {
  PointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { socket } from "@/lib/socket";

interface Props {
  roomId: string;
  onShareWhiteboard: (
    canvas: HTMLCanvasElement
  ) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  from: Point;
  to: Point;
  color: string;
  size: number;
  tool: "pen" | "eraser";
}

const colors = [
  "#111827",
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#f87171",
  "#a78bfa",
];

export default function Whiteboard({
  roomId,
  onShareWhiteboard,
}: Props) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    );
  const lastPointRef =
    useRef<Point | null>(null);
  const [color, setColor] =
    useState(colors[0]);
  const [size, setSize] =
    useState(4);
  const [tool, setTool] =
    useState<"pen" | "eraser">(
      "pen"
    );

  const fillWhite = useCallback(() => {
    const canvas =
      canvasRef.current;
    const context =
      canvas?.getContext("2d");

    if (!canvas || !context) return;

    context.save();
    context.globalCompositeOperation =
      "source-over";
    context.fillStyle = "#ffffff";
    context.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
    context.restore();
  }, []);

  const drawStroke = (
    stroke: Stroke
  ) => {
    const canvas =
      canvasRef.current;
    const context =
      canvas?.getContext("2d");

    if (!canvas || !context) return;

    context.globalCompositeOperation =
      "source-over";
    context.strokeStyle =
      stroke.tool === "eraser"
        ? "#ffffff"
        : stroke.color;
    context.lineWidth =
      stroke.size;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(
      stroke.from.x * canvas.width,
      stroke.from.y * canvas.height
    );
    context.lineTo(
      stroke.to.x * canvas.width,
      stroke.to.y * canvas.height
    );
    context.stroke();
    context.globalCompositeOperation =
      "source-over";
  };

  const clearBoard = useCallback(() => {
    const canvas =
      canvasRef.current;
    const context =
      canvas?.getContext("2d");
    if (!canvas || !context) return;

    fillWhite();
  }, [fillWhite]);

  const getPoint = (
    event: PointerEvent<HTMLCanvasElement>
  ): Point => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    return {
      x:
        (event.clientX - rect.left) /
        rect.width,
      y:
        (event.clientY - rect.top) /
        rect.height,
    };
  };

  useEffect(() => {
    const canvas =
      canvasRef.current;

    if (!canvas) return;

    const resize = () => {
      const rect =
        canvas.getBoundingClientRect();
      canvas.width =
        rect.width * window.devicePixelRatio;
      canvas.height =
        rect.height * window.devicePixelRatio;

      fillWhite();
    };

    resize();
    window.addEventListener(
      "resize",
      resize
    );

    return () =>
      window.removeEventListener(
        "resize",
        resize
      );
  }, [fillWhite]);

  const shareBoard = () => {
    const canvas =
      canvasRef.current;
    if (!canvas) return;

    onShareWhiteboard(canvas);
  };

  useEffect(() => {
    const handleDraw = (
      stroke: Stroke
    ) => drawStroke(stroke);

    const handleClear = () =>
      clearBoard();

    socket.on(
      "whiteboard-draw",
      handleDraw
    );
    socket.on(
      "whiteboard-clear",
      handleClear
    );

    return () => {
      socket.off(
        "whiteboard-draw",
        handleDraw
      );
      socket.off(
        "whiteboard-clear",
        handleClear
      );
    };
  }, [clearBoard]);

  return (
    <section className="mt-4 overflow-hidden rounded-lg border border-gray-800 bg-[#0f172a] shadow-2xl">
      <div className="border-b border-gray-800 bg-[#111827] px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Whiteboard
            </h2>
            <p className="text-sm text-gray-400">
              {tool === "eraser"
                ? "Eraser active"
                : "Drawing active"}{" "}
              · Brush {size}px
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex overflow-hidden rounded-md border border-gray-700 bg-[#0b0f19]">
            <button
              onClick={() =>
                setTool("pen")
              }
              className={[
                "px-4 py-2 text-sm font-medium",
                tool === "pen"
                  ? "bg-indigo-600"
                  : "bg-white/10 hover:bg-white/20",
              ].join(" ")}
            >
              Pen
            </button>
            <button
              onClick={() =>
                setTool("eraser")
              }
              className={[
                "px-4 py-2 text-sm font-medium",
                tool === "eraser"
                  ? "bg-indigo-600"
                  : "bg-white/10 hover:bg-white/20",
              ].join(" ")}
            >
              Eraser
            </button>
          </div>

            <div className="flex items-center gap-2 rounded-md border border-gray-700 bg-[#0b0f19] px-3 py-2">
            {colors.map((item) => (
              <button
                key={item}
                onClick={() =>
                  setColor(item)
                }
                className={[
                  "h-7 w-7 rounded-full border transition",
                  color === item
                    ? "border-white ring-2 ring-white/40"
                    : "border-white/20 hover:border-white/60",
                ].join(" ")}
                style={{
                  backgroundColor: item,
                }}
                aria-label={`Use ${item}`}
              />
            ))}
          </div>

            <label className="flex items-center gap-3 rounded-md border border-gray-700 bg-[#0b0f19] px-3 py-2 text-sm text-gray-300">
              Size
              <input
                type="range"
                min="2"
                max="18"
                value={size}
                onChange={(event) =>
                  setSize(
                    Number(
                      event.target.value
                    )
                  )
                }
              />
            </label>

            <button
              onClick={shareBoard}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-700"
            >
              Share Board
            </button>

            <button
              onClick={() => {
                clearBoard();
                socket.emit(
                  "whiteboard-clear",
                  roomId
                );
              }}
              className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#e5e7eb] p-4">
        <div className="overflow-hidden rounded-md border border-gray-300 bg-white shadow-inner">
          <canvas
            ref={canvasRef}
            className="h-[440px] w-full cursor-crosshair touch-none bg-white"
            style={{
              backgroundImage:
                "linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)",
              backgroundSize:
                "32px 32px",
            }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(
                event.pointerId
              );
              lastPointRef.current =
                getPoint(event);
            }}
            onPointerMove={(event) => {
              if (!lastPointRef.current) {
                return;
              }

              const nextPoint =
                getPoint(event);
              const stroke = {
                from: lastPointRef.current,
                to: nextPoint,
                color,
                size,
                tool,
              };

              drawStroke(stroke);
              socket.emit(
                "whiteboard-draw",
                {
                  roomId,
                  stroke,
                }
              );
              lastPointRef.current =
                nextPoint;
            }}
            onPointerUp={() => {
              lastPointRef.current =
                null;
            }}
            onPointerCancel={() => {
              lastPointRef.current =
                null;
            }}
          />
        </div>
      </div>
    </section>
  );
}
