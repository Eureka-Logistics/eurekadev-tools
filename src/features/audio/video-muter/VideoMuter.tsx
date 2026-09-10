import React, { useState, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadBlob } from "@/lib/download";
import {
  Upload,
  VolumeX,
  Download,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface VideoMuterProps {
  tool: ToolDefinition;
}

export const VideoMuter: React.FC<VideoMuterProps> = ({ tool }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mutedBlob, setMutedBlob] = useState<Blob | null>(null);
  const [mutedUrl, setMutedUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setMutedBlob(null);
    if (mutedUrl) URL.revokeObjectURL(mutedUrl);
    setMutedUrl(null);
  };

  const muteVideo = async () => {
    if (!videoRef.current || !videoUrl) return;
    setProcessing(true);
    setProgress(0);

    const video = videoRef.current;
    video.muted = true;
    video.currentTime = 0;

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

    const stream = canvas.captureStream(30);
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      setMutedBlob(blob);
      setMutedUrl(URL.createObjectURL(blob));
      setProcessing(false);
    };

    let animId: number;
    const drawFrame = () => {
      if (!video.paused && !video.ended) {
        ctx.drawImage(video, 0, 0, width, height);
        setProgress(Math.round((video.currentTime / video.duration) * 100));
        animId = requestAnimationFrame(drawFrame);
      }
    };

    recorder.start();

    video.onended = () => {
      cancelAnimationFrame(animId);
      recorder.stop();
    };

    await video.play();
    drawFrame();
  };

  const handleDownload = () => {
    if (!mutedBlob) return;
    const baseName = videoFile?.name.replace(/\.[^/.]+$/, "") || "video";
    downloadBlob(mutedBlob, `${baseName}-muted.webm`);
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
              <VolumeX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200 mb-1">
              Select Video to Strip Audio
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Remove audio tracks entirely from MP4, WebM, and MOV videos offline.
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
              {/* Original */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-medium text-zinc-400">Original Video</h4>
                <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Muted */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                <h4 className="text-xs font-medium text-zinc-400">Muted Output</h4>
                <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
                  {mutedUrl ? (
                    <video
                      src={mutedUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-zinc-600">
                      Click "Strip Audio Track" below to generate muted video.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Progress */}
            {processing && (
              <div className="space-y-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Re-encoding video without audio...</span>
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
                onClick={muteVideo}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>{processing ? "Stripping..." : "Strip Audio Track"}</span>
              </button>

              {mutedBlob && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition border border-zinc-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Muted Video</span>
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

export default VideoMuter;
