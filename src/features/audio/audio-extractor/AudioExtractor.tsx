import React, { useState, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { decodeAudioFile, audioBufferToWav } from "@/lib/audio/wavEncoder";
import { downloadBlob } from "@/lib/download";
import {
  Upload,
  Music,
  Download,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

interface AudioExtractorProps {
  tool: ToolDefinition;
}

export const AudioExtractor: React.FC<AudioExtractorProps> = ({ tool }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [extractedBuffer, setExtractedBuffer] = useState<AudioBuffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setVideoFile(file);
    try {
      const buffer = await decodeAudioFile(file);
      setExtractedBuffer(buffer);

      // Render waveform
      setTimeout(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          const w = canvas.width;
          const h = canvas.height;
          ctx.fillStyle = "#18181b";
          ctx.fillRect(0, 0, w, h);

          const d = buffer.getChannelData(0);
          const step = Math.floor(d.length / w);
          ctx.fillStyle = "#10b981";
          const mid = h / 2;

          for (let x = 0; x < w; x++) {
            let max = 0;
            const start = x * step;
            for (let j = 0; j < step; j += 15) {
              const val = Math.abs(d[start + j] || 0);
              if (val > max) max = val;
            }
            const barH = Math.max(2, max * h * 0.9);
            ctx.fillRect(x, mid - barH / 2, 1, barH);
          }
        }
      }, 50);
    } catch (err) {
      console.error(err);
      alert("Could not extract audio from this video file. It may not contain a recognized audio track.");
    } finally {
      setLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!extractedBuffer) return;
    if (isPlaying) {
      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
        } catch {}
        activeSourceRef.current = null;
      }
      setIsPlaying(false);
    } else {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = ctx.createBufferSource();
      source.buffer = extractedBuffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
      activeSourceRef.current = source;
      setIsPlaying(true);
    }
  };

  const handleDownloadWav = () => {
    if (!extractedBuffer) return;
    const wavBlob = audioBufferToWav(extractedBuffer);
    const baseName = videoFile?.name.replace(/\.[^/.]+$/, "") || "extracted-audio";
    downloadBlob(wavBlob, `${baseName}.wav`);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {!extractedBuffer ? (
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
              <Music className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200 mb-1">
              Extract Audio from Video
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Rip audio tracks from MP4, WebM, MOV, and MKV to uncompressed 16-bit WAV.
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Choose Video File</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
            {loading && (
              <p className="text-xs text-emerald-400 mt-4 animate-pulse">
                Demuxing and decoding audio stream...
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
                      {videoFile?.name}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      Duration: {extractedBuffer.duration.toFixed(2)}s • Sample Rate: {extractedBuffer.sampleRate} Hz • {extractedBuffer.numberOfChannels} ch
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
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Change</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Waveform */}
              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={160}
                  className="w-full h-36 object-contain rounded-xl block"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleDownloadWav}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Extracted WAV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default AudioExtractor;
