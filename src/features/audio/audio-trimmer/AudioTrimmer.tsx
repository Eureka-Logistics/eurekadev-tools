import React, { useState, useRef, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { decodeAudioFile, sliceAudioBuffer, audioBufferToWav } from "@/lib/audio/wavEncoder";
import { downloadBlob } from "@/lib/download";
import {
  Upload,
  Play,
  Pause,
  Download,
  Scissors,
  Music,
  RotateCcw,
} from "lucide-react";

interface AudioTrimmerProps {
  tool: ToolDefinition;
}

export const AudioTrimmer: React.FC<AudioTrimmerProps> = ({ tool }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Trim settings
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [fadeIn, setFadeIn] = useState(0);
  const [fadeOut, setFadeOut] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const buffer = await decodeAudioFile(file);
      setAudioBuffer(buffer);
      setAudioFile(file);
      setStartTime(0);
      setEndTime(Math.min(buffer.duration, 30));
    } catch (err) {
      console.error("Audio decode error:", err);
      alert("Could not decode audio file.");
    } finally {
      setLoading(false);
    }
  };

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#18181b";
    ctx.fillRect(0, 0, width, height);

    const data = audioBuffer.getChannelData(0);
    const duration = audioBuffer.duration;
    const midY = height / 2;

    // Draw active trim highlight
    const startX = (startTime / duration) * width;
    const endX = (endTime / duration) * width;

    ctx.fillStyle = "rgba(16, 185, 129, 0.15)";
    ctx.fillRect(startX, 0, endX - startX, height);

    // Waveform bars
    const barCount = Math.floor(width / 3);
    const step = Math.floor(data.length / barCount);

    for (let i = 0; i < barCount; i++) {
      let max = 0;
      const pos = i * step;
      for (let j = 0; j < step; j += 15) {
        const val = Math.abs(data[pos + j] || 0);
        if (val > max) max = val;
      }

      const x = i * 3;
      const barHeight = Math.max(2, max * height * 0.85);
      const isSelected = x >= startX && x <= endX;

      ctx.fillStyle = isSelected ? "#10b981" : "#52525b";
      ctx.fillRect(x, midY - barHeight / 2, 2, barHeight);
    }

    // Draw trim boundaries
    ctx.strokeStyle = "#34d399";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.moveTo(endX, 0);
    ctx.lineTo(endX, height);
    ctx.stroke();
  };

  useEffect(() => {
    drawWaveform();
  }, [audioBuffer, startTime, endTime]);

  const stopAudio = () => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch {
        // already stopped
      }
      activeSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playTrimmed = () => {
    if (!audioBuffer) return;
    if (isPlaying) {
      stopAudio();
      return;
    }

    const trimmed = sliceAudioBuffer(audioBuffer, startTime, endTime, fadeIn, fadeOut);
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioCtxRef.current = ctx;
    const source = ctx.createBufferSource();
    source.buffer = trimmed;
    source.connect(ctx.destination);
    source.onended = () => setIsPlaying(false);
    source.start();
    activeSourceRef.current = source;
    setIsPlaying(true);
  };

  const handleExport = () => {
    if (!audioBuffer) return;
    stopAudio();
    const trimmed = sliceAudioBuffer(audioBuffer, startTime, endTime, fadeIn, fadeOut);
    const wavBlob = audioBufferToWav(trimmed);
    const baseName = audioFile?.name.replace(/\.[^/.]+$/, "") || "audio";
    downloadBlob(wavBlob, `${baseName}-trimmed.wav`);
  };

  const resetTrim = () => {
    if (audioBuffer) {
      setStartTime(0);
      setEndTime(audioBuffer.duration);
      setFadeIn(0);
      setFadeOut(0);
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {!audioBuffer ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 rounded-2xl p-12 text-center transition-all bg-zinc-900/40"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 text-emerald-400">
              <Scissors className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200 mb-1">
              Select Audio to Trim
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Crop, slice, add fade in/out, and export pure WAV offline.
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Choose Audio File</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
            {loading && (
              <p className="text-xs text-emerald-400 mt-4 animate-pulse">
                Analyzing audio buffer...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
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
                      Total: {audioBuffer.duration.toFixed(2)}s | Trimmed: {(endTime - startTime).toFixed(2)}s
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={playTrimmed}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? "Stop Preview" : "Preview Cut"}
                  </button>

                  <button
                    onClick={resetTrim}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
                    title="Reset Trim"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Waveform Canvas */}
              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={180}
                  className="w-full h-44 object-contain rounded-xl block"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Start Time (seconds)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, endTime - 0.1)}
                    step="0.05"
                    value={startTime}
                    onChange={(e) => setStartTime(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max={audioBuffer.duration}
                    step="0.1"
                    value={Number(startTime.toFixed(2))}
                    onChange={(e) => setStartTime(Math.max(0, Math.min(Number(e.target.value), endTime - 0.1)))}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  End Time (seconds)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min={startTime + 0.1}
                    max={audioBuffer.duration}
                    step="0.05"
                    value={endTime}
                    onChange={(e) => setEndTime(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max={audioBuffer.duration}
                    step="0.1"
                    value={Number(endTime.toFixed(2))}
                    onChange={(e) => setEndTime(Math.min(audioBuffer.duration, Math.max(startTime + 0.1, Number(e.target.value))))}
                    className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Fade In ({fadeIn}s)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={fadeIn}
                    onChange={(e) => setFadeIn(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-[11px] text-zinc-500">Gradual volume rise from cut start</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">
                  Fade Out ({fadeOut}s)
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={fadeOut}
                    onChange={(e) => setFadeOut(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <p className="text-[11px] text-zinc-500">Smooth decay towards cut end</p>
                </div>
              </div>
            </div>

            {/* Export */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
              >
                <Download className="w-4 h-4" />
                <span>Export Trimmed WAV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default AudioTrimmer;
