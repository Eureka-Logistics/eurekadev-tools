import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadDataUrl } from "@/lib/download";
import {
  Upload,
  Film,
  Activity,
  Download,
  RotateCcw,
} from "lucide-react";

interface VideoAtlasProps {
  tool: ToolDefinition;
}

interface VideoMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
  estimatedBitrateMbps: number;
  hasAudioTrack: boolean;
  thumbnails: { timeSec: number; dataUrl: string }[];
}

export const VideoAtlas: React.FC<VideoAtlasProps> = ({ tool }) => {
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateAspectRatio = (w: number, h: number): string => {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(w, h);
    const rW = w / divisor;
    const rH = h / divisor;
    if (Math.abs(w / h - 16 / 9) < 0.02) return "16:9 (Widescreen)";
    if (Math.abs(w / h - 9 / 16) < 0.02) return "9:16 (Vertical/Story)";
    if (Math.abs(w / h - 4 / 3) < 0.02) return "4:3 (Standard)";
    if (Math.abs(w / h - 1) < 0.02) return "1:1 (Square)";
    if (Math.abs(w / h - 21 / 9) < 0.02) return "21:9 (Ultrawide)";
    return `${rW}:${rH}`;
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;

    await new Promise<void>((resolve) => {
      video.onloadedmetadata = () => resolve();
    });

    const duration = video.duration;
    const width = video.videoWidth;
    const height = video.videoHeight;
    const aspect = calculateAspectRatio(width, height);
    const bitrateMbps = (file.size * 8) / duration / 1_000_000;

    // Detect audio track
    const hasAudio = (video as unknown as { mozHasAudio?: boolean; webkitAudioDecodedByteCount?: number }).mozHasAudio !== undefined
      ? Boolean((video as unknown as { mozHasAudio: boolean }).mozHasAudio)
      : true;

    // Capture 5 representative stills
    const timestamps = [
      0,
      duration * 0.25,
      duration * 0.5,
      duration * 0.75,
      Math.max(0, duration - 0.5),
    ];

    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = Math.round(320 * (height / width));
    const ctx = canvas.getContext("2d");

    const thumbnails: { timeSec: number; dataUrl: string }[] = [];

    if (ctx) {
      for (const time of timestamps) {
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };
          video.addEventListener("seeked", onSeeked);
          video.currentTime = time;
        });
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        thumbnails.push({
          timeSec: time,
          dataUrl: canvas.toDataURL("image/jpeg", 0.7),
        });
      }
    }

    setMetadata({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "video/*",
      duration,
      width,
      height,
      aspectRatio: aspect,
      estimatedBitrateMbps: bitrateMbps,
      hasAudioTrack: hasAudio,
      thumbnails,
    });
    setLoading(false);
  };

  const exportJson = () => {
    if (!metadata) return;
    const json = JSON.stringify(
      {
        ...metadata,
        thumbnails: metadata.thumbnails.map((t) => ({ timeSec: t.timeSec })),
      },
      null,
      2,
    );
    const blobUrl = "data:application/json;charset=utf-8," + encodeURIComponent(json);
    downloadDataUrl(blobUrl, `${metadata.fileName}-video-atlas.json`);
  };

  const formatFileSize = (bytes: number) => {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins}m ${s}s (${secs.toFixed(2)}s)`;
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {!metadata ? (
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
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200 mb-1">
              Select Video for Atlas Inspection
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Complete container diagnostics: dimensions, bitrate, aspect ratio, audio stream, and keyframe snapshots.
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
                Extracting video metadata and rendering contact keyframes...
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Film className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">{metadata.fileName}</h3>
                  <p className="text-xs text-zinc-400">
                    {formatFileSize(metadata.fileSize)} • {metadata.mimeType}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={exportJson}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Video Atlas</span>
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

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Resolution</span>
                <span className="text-lg font-bold font-mono text-zinc-200 block">
                  {metadata.width} × {metadata.height}
                </span>
                <span className="text-[11px] text-zinc-500">{metadata.aspectRatio}</span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Duration</span>
                <span className="text-lg font-bold font-mono text-emerald-400 block">
                  {formatTime(metadata.duration)}
                </span>
                <span className="text-[11px] text-zinc-500">
                  ~{Math.round(metadata.duration * 30)} frames @ 30fps
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Estimated Bitrate</span>
                <span className="text-lg font-bold font-mono text-zinc-200 block">
                  {metadata.estimatedBitrateMbps.toFixed(2)} <span className="text-xs font-normal text-zinc-500">Mbps</span>
                </span>
                <span className="text-[11px] text-zinc-500">
                  {Math.round(metadata.estimatedBitrateMbps * 1000)} kbps
                </span>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <span className="text-xs text-zinc-400 block mb-1">Audio Track</span>
                <span className="text-lg font-bold font-mono text-emerald-400 block">
                  {metadata.hasAudioTrack ? "Present" : "Muted / None"}
                </span>
                <span className="text-[11px] text-zinc-500">Available for extraction</span>
              </div>
            </div>

            {/* Keyframe Stills Timeline */}
            <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <h4 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Contact Sheet & Keyframes</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {metadata.thumbnails.map((thumb, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800">
                      <img
                        src={thumb.dataUrl}
                        alt={`Still at ${thumb.timeSec}s`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 block text-center">
                      {thumb.timeSec.toFixed(1)}s
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default VideoAtlas;
