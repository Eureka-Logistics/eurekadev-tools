import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { decodeAudioFile } from "@/lib/audio/wavEncoder";
import { downloadDataUrl } from "@/lib/download";
import {
  Upload,
  Music,
  Activity,
  BarChart2,
  Download,
  RotateCcw,
} from "lucide-react";

interface AudioAtlasProps {
  tool: ToolDefinition;
}

interface AudioAnalysis {
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration: number;
  sampleRate: number;
  channels: number;
  peakLinear: number;
  peakDb: number;
  rmsDb: number;
  dynamicRangeDb: number;
  clippedSamples: number;
  leftRmsDb?: number;
  rightRmsDb?: number;
}

export const AudioAtlas: React.FC<AudioAtlasProps> = ({ tool }) => {
  const [analysis, setAnalysis] = useState<AudioAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const buffer = await decodeAudioFile(file);
      const channels = buffer.numberOfChannels;
      const length = buffer.length;

      let peak = 0;
      let sumSquares = 0;
      let clippedCount = 0;

      const channelRms: number[] = [];

      for (let c = 0; c < channels; c++) {
        const data = buffer.getChannelData(c);
        let chSumSq = 0;
        for (let i = 0; i < length; i++) {
          const val = data[i];
          const abs = Math.abs(val);
          if (abs > peak) peak = abs;
          if (abs >= 0.999) clippedCount++;
          chSumSq += val * val;
        }
        sumSquares += chSumSq;
        const chRms = Math.sqrt(chSumSq / length);
        channelRms.push(chRms > 0 ? 20 * Math.log10(chRms) : -100);
      }

      const totalSamples = length * channels;
      const overallRms = Math.sqrt(sumSquares / totalSamples);
      const peakDb = peak > 0 ? 20 * Math.log10(peak) : -100;
      const rmsDb = overallRms > 0 ? 20 * Math.log10(overallRms) : -100;
      const dynamicRange = peakDb - rmsDb;

      const result: AudioAnalysis = {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || "audio/*",
        duration: buffer.duration,
        sampleRate: buffer.sampleRate,
        channels: channels,
        peakLinear: peak,
        peakDb: peakDb,
        rmsDb: rmsDb,
        dynamicRangeDb: dynamicRange,
        clippedSamples: clippedCount,
        leftRmsDb: channelRms[0],
        rightRmsDb: channelRms[1],
      };

      setAnalysis(result);

      // Draw waveform preview
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
            for (let j = 0; j < step; j += 10) {
              const val = Math.abs(d[start + j] || 0);
              if (val > max) max = val;
            }
            const barH = Math.max(1, max * h * 0.9);
            ctx.fillRect(x, mid - barH / 2, 1, barH);
          }
        }
      }, 50);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze audio file. Please check format.");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!analysis) return;
    const jsonStr = JSON.stringify(analysis, null, 2);
    const blobUrl = "data:application/json;charset=utf-8," + encodeURIComponent(jsonStr);
    downloadDataUrl(blobUrl, `${analysis.fileName}-audio-atlas.json`);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = (secs % 60).toFixed(2);
    return `${mins}m ${s}s (${secs.toFixed(3)}s)`;
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {!analysis ? (
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
              <Activity className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200 mb-1">
              Select Audio File for Atlas Analysis
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Complete technical diagnostics: peak levels, RMS, dynamic range, sample rate, and channels.
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
                Inspecting audio streams and calculating dynamic range...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header info */}
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Music className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">{analysis.fileName}</h3>
                  <p className="text-xs text-zinc-400">
                    {formatFileSize(analysis.fileSize)} • {analysis.mimeType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportReport}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Export JSON Atlas</span>
                </button>
                <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium cursor-pointer transition">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Analyze Another</span>
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
              </div>
            </div>

            {/* Waveform Overview */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
              <span className="text-xs font-medium text-zinc-400 block">Full Waveform Envelope</span>
              <canvas
                ref={canvasRef}
                width={800}
                height={120}
                className="w-full h-28 bg-zinc-950 rounded-xl border border-zinc-800 block"
              />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Duration</span>
                <span className="text-lg font-bold font-mono text-zinc-200 block">
                  {formatDuration(analysis.duration)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Sampling Rate</span>
                <span className="text-lg font-bold font-mono text-emerald-400 block">
                  {analysis.sampleRate} <span className="text-xs font-normal text-zinc-500">Hz</span>
                </span>
                <span className="text-[11px] text-zinc-500">
                  {analysis.channels === 1 ? "Mono" : analysis.channels === 2 ? "Stereo" : `${analysis.channels} Channels`}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Peak Amplitude</span>
                <span className="text-lg font-bold font-mono text-zinc-200 block">
                  {analysis.peakDb.toFixed(2)} <span className="text-xs font-normal text-zinc-500">dBFS</span>
                </span>
                <span className="text-[11px] text-zinc-500">
                  Linear: {analysis.peakLinear.toFixed(4)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Average RMS</span>
                <span className="text-lg font-bold font-mono text-zinc-200 block">
                  {analysis.rmsDb.toFixed(2)} <span className="text-xs font-normal text-zinc-500">dBFS</span>
                </span>
                <span className="text-[11px] text-zinc-500">
                  Dynamic Range: {analysis.dynamicRangeDb.toFixed(2)} dB
                </span>
              </div>
            </div>

            {/* Detailed Diagnostics Table */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                <span>Audio Diagnostics & Integrity</span>
              </h4>
              <div className="divide-y divide-zinc-800 text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-400">Clipping Occurrences (≥ 0.999 peak)</span>
                  <span className={`font-mono font-medium ${analysis.clippedSamples > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {analysis.clippedSamples === 0 ? "0 (Clean)" : `${analysis.clippedSamples} samples clipped`}
                  </span>
                </div>
                {analysis.leftRmsDb !== undefined && (
                  <div className="py-2.5 flex justify-between">
                    <span className="text-zinc-400">Left Channel RMS</span>
                    <span className="font-mono text-zinc-200">{analysis.leftRmsDb.toFixed(2)} dBFS</span>
                  </div>
                )}
                {analysis.rightRmsDb !== undefined && (
                  <div className="py-2.5 flex justify-between">
                    <span className="text-zinc-400">Right Channel RMS</span>
                    <span className="font-mono text-zinc-200">{analysis.rightRmsDb.toFixed(2)} dBFS</span>
                  </div>
                )}
                <div className="py-2.5 flex justify-between">
                  <span className="text-zinc-400">Estimated Bitrate</span>
                  <span className="font-mono text-zinc-200">
                    {Math.round((analysis.fileSize * 8) / analysis.duration / 1000)} kbps
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default AudioAtlas;
