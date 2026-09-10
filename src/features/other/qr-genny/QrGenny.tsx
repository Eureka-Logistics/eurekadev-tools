import React, { useState, useRef, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { generateQrMatrix } from "@/lib/qr/qrCode";
import { downloadBlob, downloadDataUrl } from "@/lib/download";
import { Download, Copy, Check } from "lucide-react";

interface QrGennyProps {
  tool: ToolDefinition;
}

export const QrGenny: React.FC<QrGennyProps> = ({ tool }) => {
  const [text, setText] = useState("https://eureka.tools");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dotShape, setDotShape] = useState<"square" | "rounded" | "dots">(
    "rounded",
  );
  const margin = 3;
  const size = 300;
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawQr = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const matrix = generateQrMatrix(text.trim() || " ");
      const n = matrix.length;
      const totalCells = n + margin * 2;
      const cellSize = size / totalCells;

      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      ctx.fillStyle = fgColor;

      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (matrix[r][c]) {
            const x = (c + margin) * cellSize;
            const y = (r + margin) * cellSize;

            // Check if finder pattern corner
            const isFinder =
              (r < 7 && c < 7) ||
              (r < 7 && c >= n - 7) ||
              (r >= n - 7 && c < 7);

            if (isFinder || dotShape === "square") {
              ctx.fillRect(x, y, cellSize + 0.5, cellSize + 0.5);
            } else if (dotShape === "dots") {
              ctx.beginPath();
              ctx.arc(
                x + cellSize / 2,
                y + cellSize / 2,
                (cellSize / 2) * 0.9,
                0,
                Math.PI * 2,
              );
              ctx.fill();
            } else {
              // Rounded
              ctx.beginPath();
              ctx.roundRect(
                x,
                y,
                cellSize + 0.5,
                cellSize + 0.5,
                cellSize * 0.35,
              );
              ctx.fill();
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    drawQr();
  }, [text, fgColor, bgColor, dotShape, margin, size]);

  const generateSvg = (): string => {
    const matrix = generateQrMatrix(text.trim() || " ");
    const n = matrix.length;
    const totalCells = n + margin * 2;
    const cellSize = 10;
    const svgDim = totalCells * cellSize;

    let rects = "";
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (matrix[r][c]) {
          const x = (c + margin) * cellSize;
          const y = (r + margin) * cellSize;
          const rx = dotShape === "rounded" ? 3 : dotShape === "dots" ? 5 : 0;
          rects += `  <rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${rx}" fill="${fgColor}" />\n`;
        }
      }
    }

    return `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 ${svgDim} ${svgDim}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bgColor}" />
${rects}</svg>`;
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    downloadDataUrl(url, "qrcode.png");
  };

  const handleDownloadSvg = () => {
    const svg = generateSvg();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    downloadBlob(blob, "qrcode.svg");
  };

  const handleCopySvg = () => {
    const svg = generateSvg();
    navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="md:col-span-2 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                QR Content (URL, Text, Contact, Wi-Fi)
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter URL or text..."
                rows={3}
                className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Dot Style
                </label>
                <div className="flex rounded-lg bg-zinc-800 p-1 border border-zinc-700 text-xs">
                  {(["square", "rounded", "dots"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setDotShape(s)}
                      className={`flex-1 py-1 rounded capitalize transition ${
                        dotShape === s
                          ? "bg-emerald-600 text-white"
                          : "text-zinc-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  QR Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-zinc-500">Quick Themes:</span>
              {[
                { name: "Default", fg: "#000000", bg: "#ffffff" },
                { name: "Emerald Dark", fg: "#10b981", bg: "#09090b" },
                { name: "Ocean", fg: "#0284c7", bg: "#f0f9ff" },
                { name: "Midnight", fg: "#e2e8f0", bg: "#0f172a" },
              ].map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => {
                    setFgColor(theme.fg);
                    setBgColor(theme.bg);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition"
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>

          {/* QR Preview Card */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-xl bg-white shadow-xl max-w-[280px] aspect-square flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-2">
              <button
                onClick={handleDownloadPng}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-900/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG</span>
              </button>
              <button
                onClick={handleDownloadSvg}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition border border-zinc-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>SVG</span>
              </button>
              <button
                onClick={handleCopySvg}
                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition border border-zinc-700"
                title="Copy SVG code"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default QrGenny;
