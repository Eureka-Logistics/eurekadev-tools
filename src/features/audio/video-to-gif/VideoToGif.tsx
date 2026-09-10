import React, { useState, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { encodeGif, GifFrame } from "@/lib/video/gifEncoder";
import { downloadBlob } from "@/lib/download";
import {
  Upload,
  Film,
  Download,
  Sliders,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface VideoToGifProps {
  tool: ToolDefinition;
}

export const VideoToGif: React.FC<VideoToGifProps> = ({ tool }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // GIF options
  const [startTime, setStartTime] = useState(0);
  const [clipDuration, setClipDuration] = useState(3);
  const [fps, setFps] = useState(10);
  const [targetWidth, setTargetWidth] = useState(320);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setGifBlob(null);
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setStartTime(0);
      setClipDuration(Math.min(dur, 3));
    }
  };

  const convertToGif = async () => {
    if (!videoRef.current) return;
    setProcessing(true);
    setProgress(0);

    const video = videoRef.current;
    const aspect = (video.videoHeight || 9) / (video.videoWidth || 16);
    const width = targetWidth;
    const height = Math.round(width * aspect);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setProcessing(false);
      return;
    }

    const totalFrames = Math.max(1, Math.round(clipDuration * fps));
    const interval = clipDuration / totalFrames;
    const delayMs = Math.round(1000 / fps);
    const frames: GifFrame[] = [];

    const seekTo = (sec: number): Promise<void> => {
      return new Promise((resolve) => {
        const onSeeked = () => {
          video.removeEventListener("seeked", onSeeked);
          resolve();
        };
        video.addEventListener("seeked", onSeeked);
        video.currentTime = sec;
      });
    };

    try {
      for (let i = 0; i < totalFrames; i++) {
        const time = startTime + i * interval;
        await seekTo(time);
        ctx.drawImage(video, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        frames.push({ imageData: imgData, delayMs });
        setProgress(Math.round(((i + 1) / totalFrames) * 100));
      }

      // Encode frames into GIF
      const blob = encodeGif(frames, width, height);
      setGifBlob(blob);
      setGifUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
      alert("Error generating GIF from video frames.");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!gifBlob) return;
    const baseName = videoFile?.name.replace(/\.[^/.]+$/, "") || "clip";
    downloadBlob(gifBlob, `${baseName}.gif`);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {!videoUrl ? (
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
              Select Video to Convert to GIF
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              MP4, WebM, MOV supported. Fast client-side conversion.
            </p>
            <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Choose Video</span>
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
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Preview */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-medium text-zinc-400">Original Video</h4>
                <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={handleLoadedMetadata}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-zinc-500">
                  Total duration: {duration.toFixed(2)}s
                </p>
              </div>

              {/* GIF Output Preview */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-medium text-zinc-400">Generated GIF</h4>
                <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                  {gifUrl ? (
                    <img
                      src={gifUrl}
                      alt="Generated GIF"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-zinc-600">
                      Configure clip settings below and click Convert.
                    </p>
                  )}
                </div>
                {gifBlob && (
                  <p className="text-xs text-zinc-500">
                    File size: {(gifBlob.size / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                  <span>Start Time</span>
                  <span className="font-mono text-emerald-400">{startTime.toFixed(2)}s</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, duration - 0.5)}
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                  <span>Clip Duration</span>
                  <span className="font-mono text-emerald-400">{clipDuration.toFixed(1)}s</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max={Math.min(10, Math.max(1, duration - startTime))}
                  step="0.5"
                  value={clipDuration}
                  onChange={(e) => setClipDuration(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Frame Rate (FPS)
                </label>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
                >
                  <option value={5}>5 fps (Tiny file size)</option>
                  <option value={8}>8 fps (Standard)</option>
                  <option value={10}>10 fps (Balanced)</option>
                  <option value={15}>15 fps (Smooth)</option>
                  <option value={20}>20 fps (Very smooth)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Width</label>
                <select
                  value={targetWidth}
                  onChange={(e) => setTargetWidth(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
                >
                  <option value={240}>240 px (Small)</option>
                  <option value={320}>320 px (Medium)</option>
                  <option value={480}>480 px (Large)</option>
                  <option value={640}>640 px (HD)</option>
                </select>
              </div>
            </div>

            {/* Progress */}
            {processing && (
              <div className="space-y-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Rendering GIF frames...</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={processing}
                onClick={convertToGif}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>{processing ? "Processing..." : "Generate GIF"}</span>
              </button>

              {gifBlob && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition border border-zinc-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download GIF</span>
                </button>
              )}

              <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium cursor-pointer transition ml-auto">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Change Video</span>
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
        )}
      </div>
    </ToolShell>
  );
};

export default VideoToGif;
