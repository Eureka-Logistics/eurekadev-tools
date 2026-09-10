import React, { useState, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadBlob } from "@/lib/download";
import {
  Upload,
  Subtitles,
  Play,
  Pause,
  Download,
  Sparkles,
  RotateCcw,
} from "lucide-react";

interface SubtitleStudioProps {
  tool: ToolDefinition;
}

interface Cue {
  startSec: number;
  endSec: number;
  text: string;
}

export const SubtitleStudio: React.FC<SubtitleStudioProps> = ({ tool }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [cues, setCues] = useState<Cue[]>([
    { startSec: 0.5, endSec: 3.5, text: "Welcome to Eureka Dev Tools!" },
    { startSec: 4.0, endSec: 8.0, text: "Burn and style subtitles completely in your browser." },
  ]);
  const [subtitleInput, setSubtitleInput] = useState(
    "00:00:00.500 --> 00:00:03.500\nWelcome to Eureka Dev Tools!\n\n00:00:04.000 --> 00:00:08.000\nBurn and style subtitles completely in your browser."
  );

  // Styling options
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState("#ffffff");
  const [bgColor, setBgColor] = useState("rgba(0, 0, 0, 0.75)");
  const [position, setPosition] = useState<"bottom" | "top" | "center">("bottom");

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Burning / export state
  const [burning, setBurning] = useState(false);
  const [burnProgress, setBurnProgress] = useState(0);
  const [burnedBlob, setBurnedBlob] = useState<Blob | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const parseInputToCues = (text: string) => {
    const blocks = text.trim().split(/\n\s*\n/);
    const parsed: Cue[] = [];

    for (const b of blocks) {
      const lines = b.trim().split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("-->")) {
          const [sStr, eStr] = lines[i].split("-->").map((s) => s.trim().split(" ")[0]);
          const toSec = (str: string) => {
            const p = str.replace(",", ".").split(":");
            if (p.length === 3) return parseFloat(p[0]) * 3600 + parseFloat(p[1]) * 60 + parseFloat(p[2]);
            if (p.length === 2) return parseFloat(p[0]) * 60 + parseFloat(p[1]);
            return 0;
          };
          const startSec = toSec(sStr);
          const endSec = toSec(eStr);
          const cueText = lines.slice(i + 1).join(" ");
          if (cueText) parsed.push({ startSec, endSec, text: cueText });
          break;
        }
      }
    }
    setCues(parsed);
  };

  const handleVideoFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setBurnedBlob(null);
  };

  // Find active cue
  const activeCue = cues.find((c) => currentTime >= c.startSec && currentTime <= c.endSec);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const drawSubtitleFrame = (ctx: CanvasRenderingContext2D, width: number, height: number, text?: string) => {
    if (!text) return;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const padding = 12;
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSize * 1.2;

    const x = width / 2;
    let y = height - fontSize * 2.5;
    if (position === "top") y = fontSize * 2.5;
    if (position === "center") y = height / 2;

    // Draw background box
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(
      x - textWidth / 2 - padding,
      y - textHeight / 2 - padding / 2,
      textWidth + padding * 2,
      textHeight + padding,
      6
    );
    ctx.fill();

    // Draw text
    ctx.fillStyle = textColor;
    ctx.fillText(text, x, y);
  };

  const burnSubtitles = async () => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    setBurning(true);
    setBurnProgress(0);

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 360;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setBurning(false);
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
      setBurnedBlob(blob);
      setBurning(false);
    };

    video.currentTime = 0;
    recorder.start();

    let animId: number;
    const render = () => {
      if (video.ended || video.paused) {
        cancelAnimationFrame(animId);
        if (recorder.state === "recording") recorder.stop();
      } else {
        ctx.drawImage(video, 0, 0, width, height);

        // Find cue
        const cur = video.currentTime;
        const c = cues.find((item) => cur >= item.startSec && cur <= item.endSec);
        if (c) {
          drawSubtitleFrame(ctx, width, height, c.text);
        }

        setBurnProgress(Math.round((video.currentTime / video.duration) * 100));
        animId = requestAnimationFrame(render);
      }
    };

    await video.play();
    render();
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
              if (f) handleVideoFile(f);
            }}
            className="border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 rounded-2xl p-12 text-center transition-all bg-zinc-900/40"
          >
            <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800 flex items-center justify-center mb-4 text-emerald-400">
              <Subtitles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-zinc-200 mb-1">
              Select Video for Subtitle Studio
            </h3>
            <p className="text-sm text-zinc-400 mb-6">
              Burn, style, and synchronize subtitles permanently into your video clips.
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
                  if (f) handleVideoFile(f);
                }}
              />
            </label>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Video Player with Subtitle Overlay */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-zinc-400">Live Preview</h4>
                  <button
                    onClick={togglePlay}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                </div>

                <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 relative flex items-center justify-center">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onTimeUpdate={() => {
                      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
                    }}
                    onEnded={() => setIsPlaying(false)}
                    controls
                    className="w-full h-full object-contain"
                  />

                  {/* HTML Overlay preview */}
                  {activeCue && (
                    <div
                      className={`absolute left-0 right-0 px-6 flex justify-center pointer-events-none transition-all ${
                        position === "top"
                          ? "top-6"
                          : position === "center"
                          ? "top-1/2 -translate-y-1/2"
                          : "bottom-12"
                      }`}
                    >
                      <span
                        style={{
                          fontSize: `${fontSize}px`,
                          color: textColor,
                          backgroundColor: bgColor,
                        }}
                        className="px-4 py-1.5 rounded-lg font-bold text-center leading-snug shadow-lg"
                      >
                        {activeCue.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitle Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-400">Subtitle Cues (SRT / VTT format)</label>
                  <label className="text-xs text-emerald-400 hover:underline cursor-pointer">
                    Upload .srt
                    <input
                      type="file"
                      accept=".srt,.vtt,.txt"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          const r = new FileReader();
                          r.onload = (ev) => {
                            const val = (ev.target?.result as string) || "";
                            setSubtitleInput(val);
                            parseInputToCues(val);
                          };
                          r.readAsText(f);
                        }
                      }}
                    />
                  </label>
                </div>

                <textarea
                  value={subtitleInput}
                  onChange={(e) => {
                    setSubtitleInput(e.target.value);
                    parseInputToCues(e.target.value);
                  }}
                  rows={10}
                  className="w-full p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 resize-none focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Styling Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Font Size ({fontSize}px)</label>
                <input
                  type="range"
                  min="14"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded-lg border border-zinc-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Position</label>
                <div className="flex rounded-lg bg-zinc-800 p-1 border border-zinc-700 text-xs">
                  {(["bottom", "center", "top"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPosition(p)}
                      className={`flex-1 py-1 rounded capitalize transition ${
                        position === p ? "bg-emerald-600 text-white" : "text-zinc-400"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Background Box</label>
                <select
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
                >
                  <option value="rgba(0, 0, 0, 0.75)">Black 75%</option>
                  <option value="rgba(0, 0, 0, 0.95)">Black Solid</option>
                  <option value="rgba(16, 185, 129, 0.85)">Emerald Box</option>
                  <option value="transparent">None (Transparent)</option>
                </select>
              </div>
            </div>

            {/* Progress */}
            {burning && (
              <div className="space-y-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                <div className="flex justify-between text-xs text-zinc-300">
                  <span>Burning subtitles into video stream...</span>
                  <span className="font-mono">{burnProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-150"
                    style={{ width: `${burnProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                disabled={burning}
                onClick={burnSubtitles}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>{burning ? "Burning..." : "Burn Subtitles & Export"}</span>
              </button>

              {burnedBlob && (
                <button
                  onClick={() => downloadBlob(burnedBlob, `${videoFile?.name || "subtitled"}-burned.webm`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm transition border border-zinc-700"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Subtitled Video</span>
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
                    if (f) handleVideoFile(f);
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

export default SubtitleStudio;
