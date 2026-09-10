import React, { useState, useRef, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import {
  encodeCode128,
  encodeCode39,
  encodeEan13,
} from "@/lib/barcode/barcode";
import { downloadBlob, downloadDataUrl } from "@/lib/download";
import { Download, Copy, Check } from "lucide-react";

interface CodeGennyProps {
  tool: ToolDefinition;
}

export const CodeGenny: React.FC<CodeGennyProps> = ({ tool }) => {
  const [format, setFormat] = useState<"code128" | "ean13" | "code39">(
    "code128",
  );
  const [text, setText] = useState("EUREKA-2026");
  const [barHeight, setBarHeight] = useState(80);
  const [barWidth, setBarWidth] = useState(2);
  const [showLabel, setShowLabel] = useState(true);
  const [copied, setCopied] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getBarcodeData = (): { bits: string; label: string } => {
    if (format === "code128") {
      return { bits: encodeCode128(text.trim() || " "), label: text };
    } else if (format === "code39") {
      return {
        bits: encodeCode39(text.trim() || "TEST"),
        label: text.toUpperCase(),
      };
    } else {
      const ean = encodeEan13(text);
      return { bits: ean.bits, label: ean.full };
    }
  };

  const drawBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { bits, label } = getBarcodeData();
    const quietZone = 20;
    const labelHeight = showLabel ? 24 : 0;
    const totalW = bits.length * barWidth + quietZone * 2;
    const totalH = barHeight + labelHeight + 20;

    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, totalW, totalH);

    ctx.fillStyle = "#000000";
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === "1") {
        ctx.fillRect(quietZone + i * barWidth, 10, barWidth, barHeight);
      }
    }

    if (showLabel) {
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#18181b";
      ctx.fillText(label, totalW / 2, barHeight + 26);
    }
  };

  useEffect(() => {
    drawBarcode();
  }, [format, text, barHeight, barWidth, showLabel]);

  const generateSvg = (): string => {
    const { bits, label } = getBarcodeData();
    const quietZone = 20;
    const labelHeight = showLabel ? 24 : 0;
    const totalW = bits.length * barWidth + quietZone * 2;
    const totalH = barHeight + labelHeight + 20;

    let rects = "";
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === "1") {
        rects += `  <rect x="${quietZone + i * barWidth}" y="10" width="${barWidth}" height="${barHeight}" fill="#000" />\n`;
      }
    }

    const textTag = showLabel
      ? `  <text x="${totalW / 2}" y="${barHeight + 26}" font-family="monospace" font-size="14" text-anchor="middle" fill="#000">${label}</text>\n`
      : "";

    return `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 ${totalW} ${totalH}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#fff" />
${rects}${textTag}</svg>`;
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    downloadDataUrl(url, `barcode-${text}.png`);
  };

  const handleDownloadSvg = () => {
    const svg = generateSvg();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    downloadBlob(blob, `barcode-${text}.svg`);
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(generateSvg());
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
                Barcode Format
              </label>
              <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
                {[
                  { id: "code128", label: "Code 128 (Alphanumeric)" },
                  { id: "ean13", label: "EAN-13 (12/13 Digits)" },
                  { id: "code39", label: "Code 39 (Standard)" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFormat(f.id as typeof format);
                      if (f.id === "ean13" && !/^\d+$/.test(text)) {
                        setText("590123412345");
                      }
                    }}
                    className={`flex-1 py-2 rounded-lg transition font-medium ${
                      format === f.id
                        ? "bg-emerald-600 text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                Barcode Value {format === "ean13" && "(12-digit number)"}
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Bar Height ({barHeight}px)
                </label>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={barHeight}
                  onChange={(e) => setBarHeight(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Scale Width ({barWidth}px)
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={barWidth}
                  onChange={(e) => setBarWidth(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1.5 flex flex-col justify-center">
                <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLabel}
                    onChange={(e) => setShowLabel(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                  />
                  Show Text Label
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-xl bg-white shadow-xl max-w-full overflow-x-auto flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto object-contain"
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
                title="Copy SVG"
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

export default CodeGenny;
