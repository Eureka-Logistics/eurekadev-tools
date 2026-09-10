import React, { useState, useRef, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { decodeAudioFile } from "@/lib/audio/wavEncoder";
import { downloadBlob, downloadDataUrl } from "@/lib/download";
import {
  Upload,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Music,
  Sliders,
  Sparkles,
} from "lucide-react";

interface WaveformGennyProps {
  tool: ToolDefinition;
}

export const WaveformGenny: React.FC<WaveformGennyProps> = ({ tool }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Settings
  const [color, setColor] = useState("#10b981");
  const [bgColor, setBgColor] = useState("#18181b");
  const [transparentBg, setTransparentBg] = useState(false);
  const [style, setStyle] = useState<"bars" | "wave" | "mirror">("bars");
  const [barWidth, setBarWidth] = useState(3);
  const barGap = 1;
  const [rounded, setRounded] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const buffer = await decodeAudioFile(file);
      setAudioBuffer(buffer);
      setAudioFile(file);
    } catch (err) {
      console.error("Failed to decode audio", err);
      alert("Failed to decode audio file. Please ensure it is a valid audio format.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    if (!transparentBg) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    const data = audioBuffer.getChannelData(0);
    const midY = height / 2;
    ctx.fillStyle = color;
    ctx.strokeStyle = color;

    if (style === "bars") {
      const totalBar = barWidth + barGap;
      const barCount = Math.floor(width / totalBar);
      const step = Math.floor(data.length / barCount);

      for (let i = 0; i < barCount; i++) {
        let max = 0;
        const start = i * step;
        for (let j = 0; j < step; j += 15) {
          const val = Math.abs(data[start + j] || 0);
          if (val > max) max = val;
        }

        const barHeight = Math.max(3, max * height * 0.9);
        const x = i * totalBar;
        const y = midY - barHeight / 2;

        if (rounded) {
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
          ctx.fill();
        } else {
          ctx.fillRect(x, y, barWidth, barHeight);
        }
      }
    } else if (style === "mirror") {
      const totalBar = barWidth + barGap;
      const barCount = Math.floor(width / totalBar);
      const step = Math.floor(data.length / barCount);

      for (let i = 0; i < barCount; i++) {
        let max = 0;
        const start = i * step;
        for (let j = 0; j < step; j += 15) {
          const val = Math.abs(data[start + j] || 0);
          if (val > max) max = val;
        }

        const h = Math.max(2, max * (height / 2) * 0.85);
        const x = i * totalBar;

        ctx.fillRect(x, midY - h, barWidth, h);
        ctx.fillRect(x, midY + 1, barWidth, h * 0.5); // softer reflection
      }
    } else {
      // Continuous wave
      ctx.lineWidth = 2;
      ctx.beginPath();
      const step = Math.ceil(data.length / width);
      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;
        const start = i * step;
        for (let j = 0; j < step; j += 10) {
          const datum = data[start + j] || 0;
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }
        const y1 = (1 + min) * 0.5 * height;
        const y2 = (1 + max) * 0.5 * height;
        if (i === 0) {
          ctx.moveTo(i, y1);
        } else {
          ctx.lineTo(i, y1);
          ctx.lineTo(i, y2);
        }
      }
      ctx.stroke();
    }
  };

  useEffect(() => {
    drawWaveform();
  }, [audioBuffer, color, bgColor, transparentBg, style, barWidth, barGap, rounded]);

  const togglePlayback = () => {
    if (!audioBuffer) return;

    if (isPlaying) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      audioSourceRef.current = source;
      setIsPlaying(true);
    }
  };

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    downloadDataUrl(url, `${audioFile?.name.replace(/\.[^/.]+$/, "") || "waveform"}.png`);
  };

  const generateSvg = (): string => {
    if (!audioBuffer) return "";
    const width = 800;
    const height = 240;
    const midY = height / 2;
    const data = audioBuffer.getChannelData(0);
    const totalBar = barWidth + barGap;
    const barCount = Math.floor(width / totalBar);
    const step = Math.floor(data.length / barCount);

    let rects = "";
    for (let i = 0; i < barCount; i++) {
      let max = 0;
      const start = i * step;
      for (let j = 0; j < step; j += 15) {
        const val = Math.abs(data[start + j] || 0);
        if (val > max) max = val;
      }
      const barHeight = Math.max(3, max * height * 0.9);
      const x = i * totalBar;
      const y = midY - barHeight / 2;
      const rx = rounded ? barWidth / 2 : 0;
      rects += `  <rect x="${x}" y="${y.toFixed(1)}" width="${barWidth}" height="${barHeight.toFixed(1)}" rx="${rx}" fill="${color}" />\n`;
    }

    return `<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  ${transparentBg ? "" : `<rect width="100%" height="100%" fill="${bgColor}" />`}
${rects}</svg>`;
  };

  const downloadSVG = () => {
    const svg = generateSvg();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    downloadBlob(blob, `${audioFile?.name.replace(/\.[^/.]+$/, "") || "waveform"}.svg`);
  };

  const copySvg = () => {
    const svg = generateSvg();
    navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {!audioBuffer ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 rounded-2xl p-12 text-center transition-all bg-zinc-900/40"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 text-emerald-400">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200 mb-1">
              Upload an Audio File
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              MP3, WAV, AAC, OGG, FLAC supported. Analyzed 100% offline.
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition shadow-lg shadow-emerald-900/20">
              <Upload className="w-4 h-4" />
              <span>Choose Audio</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
            {loading && (
              <p className="text-xs text-emerald-400 mt-4 animate-pulse">
                Decoding audio stream...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Waveform Display */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-zinc-200 truncate max-w-xs md:max-w-md">
                      {audioFile?.name}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      {audioBuffer.duration.toFixed(2)}s • {audioBuffer.sampleRate} Hz • {audioBuffer.numberOfChannels} ch
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlayback}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>

                  <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium cursor-pointer transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change</span>
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={240}
                  className="w-full max-h-60 object-contain rounded-xl block"
                />
              </div>
            </div>

            {/* Customization Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Style
                </label>
                <div className="flex rounded-lg bg-zinc-800/80 p-1 border border-zinc-700/60 text-xs">
                  <button
                    onClick={() => setStyle("bars")}
                    className={`flex-1 py-1.5 rounded text-center transition font-medium ${
                      style === "bars" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Bars
                  </button>
                  <button
                    onClick={() => setStyle("mirror")}
                    className={`flex-1 py-1.5 rounded text-center transition font-medium ${
                      style === "mirror" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Mirror
                  </button>
                  <button
                    onClick={() => setStyle("wave")}
                    className={`flex-1 py-1.5 rounded text-center transition font-medium ${
                      style === "wave" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Line
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Wave Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-zinc-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    disabled={transparentBg}
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-zinc-700 cursor-pointer bg-transparent disabled:opacity-30"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={transparentBg}
                      onChange={(e) => setTransparentBg(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-emerald-500 focus:ring-0"
                    />
                    Transparent
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Bar Width & Gap ({barWidth}px / {barGap}px)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={barWidth}
                    onChange={(e) => setBarWidth(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <label className="flex items-center gap-1 text-xs text-zinc-400 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={rounded}
                      onChange={(e) => setRounded(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                    />
                    Round
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={downloadPNG}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
              >
                <Download className="w-4 h-4" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={downloadSVG}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition border border-zinc-700"
              >
                <Download className="w-4 h-4" />
                <span>Download SVG</span>
              </button>

              <button
                onClick={copySvg}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition border border-zinc-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied SVG" : "Copy SVG Code"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default WaveformGenny;
