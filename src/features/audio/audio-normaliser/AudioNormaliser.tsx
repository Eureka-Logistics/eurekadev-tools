import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { decodeAudioFile, normaliseAudioBuffer, audioBufferToWav } from "@/lib/audio/wavEncoder";
import { downloadBlob } from "@/lib/download";
import {
  Upload,
  Play,
  Pause,
  Download,
  Volume2,
  Sliders,
  Music,
} from "lucide-react";

interface AudioNormaliserProps {
  tool: ToolDefinition;
}

export const AudioNormaliser: React.FC<AudioNormaliserProps> = ({ tool }) => {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentPeakDb, setCurrentPeakDb] = useState(0);
  const [targetPeakDb, setTargetPeakDb] = useState(-0.5);

  const activeSourceRef = React.useRef<AudioBufferSourceNode | null>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const buffer = await decodeAudioFile(file);
      setAudioBuffer(buffer);
      setAudioFile(file);

      // Calculate peak
      let peak = 0;
      for (let c = 0; c < buffer.numberOfChannels; c++) {
        const d = buffer.getChannelData(c);
        for (let i = 0; i < d.length; i++) {
          const abs = Math.abs(d[i]);
          if (abs > peak) peak = abs;
        }
      }
      const peakDb = peak > 0 ? 20 * Math.log10(peak) : -100;
      setCurrentPeakDb(peakDb);
    } catch (err) {
      console.error(err);
      alert("Failed to decode audio file.");
    } finally {
      setLoading(false);
    }
  };

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

  const playNormalised = () => {
    if (!audioBuffer) return;
    if (isPlaying) {
      stopAudio();
      return;
    }

    const normalised = normaliseAudioBuffer(audioBuffer, targetPeakDb);
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const source = ctx.createBufferSource();
    source.buffer = normalised;
    source.connect(ctx.destination);
    source.onended = () => setIsPlaying(false);
    source.start();
    activeSourceRef.current = source;
    setIsPlaying(true);
  };

  const handleExport = () => {
    if (!audioBuffer) return;
    stopAudio();
    const normalised = normaliseAudioBuffer(audioBuffer, targetPeakDb);
    const blob = audioBufferToWav(normalised);
    const baseName = audioFile?.name.replace(/\.[^/.]+$/, "") || "audio";
    downloadBlob(blob, `${baseName}-normalised.wav`);
  };

  const gainDelta = targetPeakDb - currentPeakDb;

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
              <Volume2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200 mb-1">
              Upload Audio to Normalise
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Adjust peak levels, prevent clipping, and match standard streaming targets.
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Select Audio File</span>
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
                Analyzing audio peak & levels...
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
                      Duration: {audioBuffer.duration.toFixed(2)}s • Original Peak: {currentPeakDb.toFixed(1)} dBFS
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={playNormalised}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isPlaying ? "Stop Preview" : "Preview Normalised"}
                  </button>
                </div>
              </div>

              {/* Levels display */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">Current Peak</span>
                  <span className="text-xl font-bold font-mono text-zinc-200">
                    {currentPeakDb.toFixed(2)} <span className="text-xs font-normal text-zinc-500">dBFS</span>
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">Target Peak</span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {targetPeakDb.toFixed(2)} <span className="text-xs font-normal text-zinc-500">dBFS</span>
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">Applied Gain</span>
                  <span className={`text-xl font-bold font-mono ${gainDelta >= 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {gainDelta >= 0 ? `+${gainDelta.toFixed(2)}` : gainDelta.toFixed(2)} <span className="text-xs font-normal text-zinc-500">dB</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Target Settings */}
            <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  Target Peak Level: <span className="font-mono text-emerald-400">{targetPeakDb.toFixed(1)} dBFS</span>
                </label>
                <div className="flex gap-1.5">
                  {[
                    { label: "Max (-0.1 dB)", val: -0.1 },
                    { label: "Streaming (-1.0 dB)", val: -1.0 },
                    { label: "Broadcast (-2.0 dB)", val: -2.0 },
                    { label: "Headroom (-3.0 dB)", val: -3.0 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      onClick={() => setTargetPeakDb(p.val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        targetPeakDb === p.val
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="range"
                min="-12"
                max="-0.1"
                step="0.1"
                value={targetPeakDb}
                onChange={(e) => setTargetPeakDb(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Export */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
              >
                <Download className="w-4 h-4" />
                <span>Export Normalised WAV</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default AudioNormaliser;
