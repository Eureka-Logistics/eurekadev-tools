import React, { useState, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadBlob } from "@/lib/download";
import {
  Upload,
  Play,
  Pause,
  Download,
  Scissors,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface VideoTrimmerProps {
  tool: ToolDefinition;
}

export const VideoTrimmer: React.FC<VideoTrimmerProps> = ({ tool }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [trimmedBlob, setTrimmedBlob] = useState<Blob | null>(null);
  const [trimmedUrl, setTrimmedUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setTrimmedBlob(null);
    if (trimmedUrl) URL.revokeObjectURL(trimmedUrl);
    setTrimmedUrl(null);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(dur, 10));
    }
  };

  const previewTrim = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    video.currentTime = startTime;
    video.play();
    setIsPlaying(true);

    const checkTime = () => {
      if (video.currentTime >= endTime || video.paused) {
        video.pause();
        setIsPlaying(false);
      } else {
        requestAnimationFrame(checkTime);
      }
    };
    requestAnimationFrame(checkTime);
  };

  const trimVideo = async () => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    setProcessing(true);
    setProgress(0);

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 360;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setProcessing(false);
      return;
    }

    // Set up canvas capture stream
    const canvasStream = canvas.captureStream(30);

    // Audio stream from video element if captureStream available
    let combinedStream = canvasStream;
    try {
      const videoElementWithCapture = video as HTMLVideoElement & { captureStream?: () => MediaStream; mozCaptureStream?: () => MediaStream };
      const rawStream = videoElementWithCapture.captureStream
        ? videoElementWithCapture.captureStream()
        : videoElementWithCapture.mozCaptureStream
        ? videoElementWithCapture.mozCaptureStream()
        : null;

      if (rawStream && rawStream.getAudioTracks().length > 0) {
        combinedStream = new MediaStream([
          ...canvasStream.getVideoTracks(),
          ...rawStream.getAudioTracks(),
        ]);
      }
    } catch (e) {
      console.warn("Audio capture not supported in this browser context:", e);
    }

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(combinedStream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      setTrimmedBlob(blob);
      setTrimmedUrl(URL.createObjectURL(blob));
      setProcessing(false);
      video.pause();
    };

    const trimDuration = endTime - startTime;
    video.currentTime = startTime;

    let animId: number;
    const renderLoop = () => {
      if (video.currentTime >= endTime || video.ended) {
        cancelAnimationFrame(animId);
        if (recorder.state === "recording") recorder.stop();
      } else {
        ctx.drawImage(video, 0, 0, width, height);
        const elapsed = Math.max(0, video.currentTime - startTime);
        setProgress(Math.min(100, Math.round((elapsed / trimDuration) * 100)));
        animId = requestAnimationFrame(renderLoop);
      }
    };

    recorder.start();
    await video.play();
    renderLoop();
  };

  const handleDownload = () => {
    if (!trimmedBlob) return;
    const baseName = videoFile?.name.replace(/\.[^/.]+$/, "") || "clip";
    downloadBlob(trimmedBlob, `${baseName}-trimmed.webm`);
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
              <Scissors className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200 mb-1">
              Select Video to Trim
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Cut video start and end points directly in the browser offline.
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
              {/* Video Player */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-zinc-400">Source Video</h4>
                  <button
                    onClick={previewTrim}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? "Pause" : "Preview Cut"}
                  </button>
                </div>
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
                  Total length: {duration.toFixed(2)}s | Selected: {(endTime - startTime).toFixed(2)}s
                </p>
              </div>

              {/* Trimmed Output Preview */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-medium text-zinc-400">Trimmed Output</h4>
                <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                  {trimmedUrl ? (
                    <video
                      src={trimmedUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-zinc-600">
                      Configure cut points and click "Export Trimmed Video".
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* In / Out Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                  <span>Start Time (In Point)</span>
                  <span className="font-mono text-emerald-400">{startTime.toFixed(2)}s</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max={Math.max(0, endTime - 0.2)}
                  step="0.05"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                  <span>End Time (Out Point)</span>
                  <span className="font-mono text-emerald-400">{endTime.toFixed(2)}s</span>
                </label>
                <input
                  type="range"
                  min={startTime + 0.2}
                  max={duration}
                  step="0.05"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Progress */}
            {processing && (
              <div className="space-y-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Processing cut segment...</span>
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
                onClick={trimVideo}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>{processing ? "Trimming..." : "Export Trimmed Video"}</span>
              </button>

              {trimmedBlob && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition border border-zinc-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download WebM</span>
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

export default VideoTrimmer;
