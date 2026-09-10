import React, { useState, useRef, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadDataUrl } from "@/lib/download";
import {
  Plus,
  Trash2,
  Download,
} from "lucide-react";

interface GraphCalcProps {
  tool: ToolDefinition;
}

interface FunctionItem {
  id: string;
  expr: string;
  color: string;
  visible: boolean;
}

export const GraphCalc: React.FC<GraphCalcProps> = ({ tool }) => {
  const [functions, setFunctions] = useState<FunctionItem[]>([
    { id: "1", expr: "Math.sin(x)", color: "#10b981", visible: true },
    { id: "2", expr: "0.2 * x * x - 2", color: "#38bdf8", visible: true },
  ]);

  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);

  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const compileExpr = (expr: string): ((x: number) => number) | null => {
    try {
      // Allow sin, cos, tan, sqrt, abs, exp, log directly without Math. prefix
      const sanitized = expr
        .replace(/\bsin\b/g, "Math.sin")
        .replace(/\bcos\b/g, "Math.cos")
        .replace(/\btan\b/g, "Math.tan")
        .replace(/\bsqrt\b/g, "Math.sqrt")
        .replace(/\babs\b/g, "Math.abs")
        .replace(/\bexp\b/g, "Math.exp")
        .replace(/\bpi\b/gi, "Math.PI")
        .replace(/\^/g, "**");

      const fn = new Function("x", `"use strict"; return (${sanitized});`) as (x: number) => number;
      // Test evaluation
      fn(1);
      return fn;
    } catch {
      return null;
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Background
    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, width, height);

    // Coordinate mapping functions
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Grid lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#27272a";

    // Vertical grid lines
    const xStep = (xMax - xMin) / 10;
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, height);
      ctx.stroke();

      // Axis label
      ctx.fillStyle = "#71717a";
      ctx.font = "10px monospace";
      ctx.fillText(x.toFixed(1), cx + 2, toCanvasY(0) + 12);
    }

    // Horizontal grid lines
    const yStep = (yMax - yMin) / 10;
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      const cy = toCanvasY(y);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      // Axis label
      ctx.fillStyle = "#71717a";
      ctx.font = "10px monospace";
      ctx.fillText(y.toFixed(1), toCanvasX(0) + 4, cy - 2);
    }

    // Main Axes X & Y
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#52525b";

    // X-axis (y = 0)
    const zeroY = toCanvasY(0);
    ctx.beginPath();
    ctx.moveTo(0, zeroY);
    ctx.lineTo(width, zeroY);
    ctx.stroke();

    // Y-axis (x = 0)
    const zeroX = toCanvasX(0);
    ctx.beginPath();
    ctx.moveTo(zeroX, 0);
    ctx.lineTo(zeroX, height);
    ctx.stroke();

    // Plot functions
    functions.forEach((f) => {
      if (!f.visible) return;
      const fn = compileExpr(f.expr);
      if (!fn) return;

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = f.color;
      ctx.beginPath();

      let started = false;
      const points = width * 2;
      const dx = (xMax - xMin) / points;

      for (let i = 0; i <= points; i++) {
        const x = xMin + i * dx;
        try {
          const y = fn(x);
          if (isNaN(y) || !isFinite(y)) {
            started = false;
            continue;
          }

          const cx = toCanvasX(x);
          const cy = toCanvasY(y);

          if (!started) {
            ctx.moveTo(cx, cy);
            started = true;
          } else {
            ctx.lineTo(cx, cy);
          }
        } catch {
          started = false;
        }
      }
      ctx.stroke();
    });
  };

  useEffect(() => {
    drawGraph();
  }, [functions, xMin, xMax, yMin, yMax]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    const x = xMin + (cx / canvas.width) * (xMax - xMin);
    const y = yMax - (cy / canvas.height) * (yMax - yMin);

    setHoverCoord({ x, y });
  };

  const addFunction = () => {
    const colors = ["#a855f7", "#f59e0b", "#ec4899", "#10b981"];
    setFunctions((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        expr: "Math.cos(x)",
        color: colors[prev.length % colors.length],
        visible: true,
      },
    ]);
  };

  const removeFunction = (id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  const downloadPlot = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    downloadDataUrl(url, "graph-plot.png");
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-300">Functions</h4>
              <button
                onClick={addFunction}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Curve</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {functions.map((fn, idx) => (
                <div
                  key={fn.id}
                  className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">f{idx + 1}(x)=</span>
                    <input
                      type="text"
                      value={fn.expr}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFunctions((prev) =>
                          prev.map((item) => (item.id === fn.id ? { ...item, expr: val } : item))
                        );
                      }}
                      className="flex-1 px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-100 focus:border-emerald-500"
                    />
                    <input
                      type="color"
                      value={fn.color}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFunctions((prev) =>
                          prev.map((item) => (item.id === fn.id ? { ...item, color: val } : item))
                        );
                      }}
                      className="w-6 h-6 rounded border-0 bg-transparent cursor-pointer"
                    />
                    {functions.length > 1 && (
                      <button
                        onClick={() => removeFunction(fn.id)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Viewport Range Settings */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
              <h5 className="text-xs font-medium text-zinc-400">Graph Viewport Bounds</h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-zinc-500 block">X Min</label>
                  <input
                    type="number"
                    value={xMin}
                    onChange={(e) => setXMin(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-800 font-mono text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block">X Max</label>
                  <input
                    type="number"
                    value={xMax}
                    onChange={(e) => setXMax(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-800 font-mono text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block">Y Min</label>
                  <input
                    type="number"
                    value={yMin}
                    onChange={(e) => setYMin(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-800 font-mono text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-zinc-500 block">Y Max</label>
                  <input
                    type="number"
                    value={yMax}
                    onChange={(e) => setYMax(Number(e.target.value))}
                    className="w-full px-2 py-1 rounded bg-zinc-950 border border-zinc-800 font-mono text-zinc-200"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={downloadPlot}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition border border-zinc-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Plot PNG</span>
            </button>
          </div>

          {/* Graph Canvas */}
          <div className="lg:col-span-2 space-y-2">
            <div className="aspect-[4/3] bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 relative">
              <canvas
                ref={canvasRef}
                width={800}
                height={600}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoverCoord(null)}
                className="w-full h-full object-contain cursor-crosshair block"
              />
              {hoverCoord && (
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-700 font-mono text-xs text-emerald-400 shadow-lg">
                  x: {hoverCoord.x.toFixed(3)}, y: {hoverCoord.y.toFixed(3)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default GraphCalc;
