import React, { useState, useRef, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import {
  Pencil,
  Square,
  Circle,
  ArrowUpRight,
  Minus,
  Type,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  UploadCloud,
  Sparkles,
} from "lucide-react";

type ToolMode =
  | "pen"
  | "rect"
  | "circle"
  | "arrow"
  | "line"
  | "text"
  | "eraser";

export const SubstrataEditor: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [activeTool, setActiveTool] = useState<ToolMode>("pen");
  const [strokeColor, setStrokeColor] = useState<string>("#ef4444");
  const [strokeWidth, setStrokeWidth] = useState<number>(4);
  const [textInput, setTextInput] = useState<string>("Note");
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const snapshotRef = useRef<ImageData | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = 900;
    canvas.height = 560;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialData]);
    setHistoryStep(0);
  }, []);

  const saveHistoryState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHist = history.slice(0, historyStep + 1);
    newHist.push(data);
    setHistory(newHist);
    setHistoryStep(newHist.length - 1);
  };

  const handleUndo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prevStep = historyStep - 1;
    ctx.putImageData(history[prevStep], 0, 0);
    setHistoryStep(prevStep);
  };

  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const nextStep = historyStep + 1;
    ctx.putImageData(history[nextStep], 0, 0);
    setHistoryStep(nextStep);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistoryState();
  };

  const handleLoadSample = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mock UI mockup wireframe
    ctx.fillStyle = "#e2e8f0";
    ctx.fillRect(40, 40, 820, 60);

    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(60, 55, 120, 30);

    ctx.fillStyle = "#94a3b8";
    ctx.fillRect(200, 62, 80, 16);
    ctx.fillRect(300, 62, 80, 16);
    ctx.fillRect(400, 62, 80, 16);

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(40, 120, 820, 400);

    // Red highlight arrow and text
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.strokeRect(55, 50, 130, 40);

    ctx.fillStyle = "#ef4444";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("Check button branding here", 210, 160);

    // Arrow to button
    ctx.beginPath();
    ctx.moveTo(200, 155);
    ctx.lineTo(130, 95);
    ctx.stroke();

    saveHistoryState();
  };

  const handleUploadBg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = Math.max(900, img.naturalWidth);
        canvas.height = Math.max(560, img.naturalHeight);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveHistoryState();
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    isDrawingRef.current = true;
    const { x, y } = getCanvasCoords(e);
    startPosRef.current = { x, y };
    snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

    if (activeTool === "pen" || activeTool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = activeTool === "eraser" ? "#ffffff" : strokeColor;
      ctx.lineWidth = activeTool === "eraser" ? strokeWidth * 3 : strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    } else if (activeTool === "text") {
      ctx.font = `bold ${strokeWidth * 5 + 14}px sans-serif`;
      ctx.fillStyle = strokeColor;
      ctx.fillText(textInput, x, y);
      isDrawingRef.current = false;
      saveHistoryState();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (activeTool === "pen" || activeTool === "eraser") {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      // Shape preview - restore snapshot
      if (snapshotRef.current) {
        ctx.putImageData(snapshotRef.current, 0, 0);
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";

      const sx = startPosRef.current.x;
      const sy = startPosRef.current.y;

      if (activeTool === "rect") {
        ctx.strokeRect(sx, sy, x - sx, y - sy);
      } else if (activeTool === "circle") {
        const rx = Math.abs(x - sx) / 2;
        const ry = Math.abs(y - sy) / 2;
        const cx = Math.min(sx, x) + rx;
        const cy = Math.min(sy, y) + ry;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === "line") {
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (activeTool === "arrow") {
        // Draw line with arrowhead
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(x, y);
        ctx.stroke();

        const angle = Math.atan2(y - sy, x - sx);
        const headLen = strokeWidth * 4 + 10;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - headLen * Math.cos(angle - Math.PI / 6),
          y - headLen * Math.sin(angle - Math.PI / 6),
        );
        ctx.moveTo(x, y);
        ctx.lineTo(
          x - headLen * Math.cos(angle + Math.PI / 6),
          y - headLen * Math.sin(angle + Math.PI / 6),
        );
        ctx.stroke();
      }
    }
  };

  const handleMouseUp = () => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      saveHistoryState();
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, "substrata-drawing.png", "image/png");
      }
    }, "image/png");
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-4">
        {/* Toolbar Card */}
        <Card>
          <CardHeader className="py-2.5 px-4 border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-muted p-1 rounded-md">
                <Button
                  size="sm"
                  variant={activeTool === "pen" ? "default" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => setActiveTool("pen")}
                  title="Pencil"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={activeTool === "rect" ? "default" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => setActiveTool("rect")}
                  title="Rectangle"
                >
                  <Square className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={activeTool === "circle" ? "default" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => setActiveTool("circle")}
                  title="Ellipse"
                >
                  <Circle className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={activeTool === "arrow" ? "default" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => setActiveTool("arrow")}
                  title="Arrow"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={activeTool === "line" ? "default" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => setActiveTool("line")}
                  title="Line"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={activeTool === "text" ? "default" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => setActiveTool("text")}
                  title="Text Annotation"
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={activeTool === "eraser" ? "default" : "ghost"}
                  className="h-8 w-8 p-0"
                  onClick={() => setActiveTool("eraser")}
                  title="Eraser"
                >
                  <Eraser className="h-4 w-4" />
                </Button>
              </div>

              {/* Color & Width controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-7 h-7 rounded border p-0 cursor-pointer"
                    title="Stroke Color"
                  />
                  {["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#0f172a"].map(
                    (c) => (
                      <button
                        key={c}
                        onClick={() => setStrokeColor(c)}
                        className={`w-5 h-5 rounded-full border transition-transform ${
                          strokeColor === c
                            ? "scale-125 ring-2 ring-primary"
                            : ""
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ),
                  )}
                </div>

                <div className="flex items-center gap-1 bg-muted p-1 rounded-md text-xs">
                  {[2, 4, 8, 12].map((w) => (
                    <button
                      key={w}
                      onClick={() => setStrokeWidth(w)}
                      className={`px-2 py-0.5 rounded font-medium ${
                        strokeWidth === w
                          ? "bg-background shadow font-bold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {w}px
                    </button>
                  ))}
                </div>

                {activeTool === "text" && (
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type annotation..."
                    className="h-8 px-2 text-xs border rounded bg-background w-36"
                  />
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={handleUndo}
                  disabled={historyStep <= 0}
                  title="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={handleRedo}
                  disabled={historyStep >= history.length - 1}
                  title="Redo"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  onClick={handleClear}
                  title="Clear Canvas"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>

                <label className="cursor-pointer inline-flex items-center justify-center h-8 px-2.5 border rounded-md text-xs font-medium hover:bg-muted transition-colors">
                  <UploadCloud className="h-3.5 w-3.5 mr-1 text-primary" />{" "}
                  Annotate Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadBg}
                    className="hidden"
                  />
                </label>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={handleLoadSample}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" /> Sample
                </Button>

                <Button
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleDownload}
                >
                  <Download className="h-3.5 w-3.5 mr-1" /> Export PNG
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 bg-muted/20 flex items-center justify-center overflow-auto min-h-[580px]">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="rounded-lg shadow-md border bg-white cursor-crosshair max-w-full"
            />
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default SubstrataEditor;
