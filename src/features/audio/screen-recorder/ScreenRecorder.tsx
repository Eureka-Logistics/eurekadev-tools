import React, { useState, useRef, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadBlob } from "@/lib/download";
import {
  Monitor,
  Mic,
  Square,
  Play,
  Pause,
  Download,
  RotateCcw,
} from "lucide-react";

interface ScreenRecorderProps {
  tool: ToolDefinition;
}

export const ScreenRecorder: React.FC<ScreenRecorderProps> = ({ tool }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [includeMic, setIncludeMic] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const startScreenRecording = async () => {
    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 } },
        audio: true,
      });

      let combinedStream = displayStream;

      if (includeMic) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
          const dest = audioCtx.createMediaStreamDestination();

          if (displayStream.getAudioTracks().length > 0) {
            const displaySource = audioCtx.createMediaStreamSource(displayStream);
            displaySource.connect(dest);
          }
          const micSource = audioCtx.createMediaStreamSource(micStream);
          micSource.connect(dest);

          combinedStream = new MediaStream([
            ...displayStream.getVideoTracks(),
            ...dest.stream.getAudioTracks(),
          ]);
        } catch (micErr) {
          console.warn("Could not capture microphone, proceeding with screen audio only", micErr);
        }
      }

      streamRef.current = combinedStream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = combinedStream;
        videoPreviewRef.current.play().catch(() => {});
      }

      const chunks: Blob[] = [];
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);

        // Stop all tracks
        combinedStream.getTracks().forEach((t) => t.stop());
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };

      // Stop if user clicks browser "Stop sharing" button
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      recorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Permission to capture screen was denied or unavailable.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    stopRecording();
    setRecordedBlob(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setRecordSeconds(0);
  };

  const downloadVideo = () => {
    if (!recordedBlob) return;
    downloadBlob(recordedBlob, `screen-recording-${Date.now()}.webm`);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-200">
                  {isRecording ? "Recording in progress..." : "Browser Screen Capture"}
                </h4>
                <p className="text-xs text-zinc-400">
                  Record tab, window, or full desktop with microphone audio offline.
                </p>
              </div>
            </div>

            {isRecording && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-400 text-xs font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  REC {formatTime(recordSeconds)}
                </span>
                <button
                  onClick={pauseRecording}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                  title={isPaused ? "Resume" : "Pause"}
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition shadow-lg shadow-rose-900/20"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Finish Recording</span>
                </button>
              </div>
            )}
          </div>

          {/* Video Preview or Recorded Video */}
          <div className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center relative">
            {!recordedBlob ? (
              <>
                <video
                  ref={videoPreviewRef}
                  muted
                  playsInline
                  className={`w-full h-full object-contain ${isRecording ? "block" : "hidden"}`}
                />
                {!isRecording && (
                  <div className="text-center p-8 space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-zinc-800/80 flex items-center justify-center text-zinc-400">
                      <Monitor className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-300">Ready to Record</p>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                        Zero server uploads. Your recording stays entirely in your browser memory.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <video
                src={videoUrl || undefined}
                controls
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Footer Controls */}
          {!isRecording && !recordedBlob && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMic}
                  onChange={(e) => setIncludeMic(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                />
                <Mic className="w-4 h-4 text-zinc-400" />
                Include Microphone Audio
              </label>

              <button
                onClick={startScreenRecording}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
              >
                <Monitor className="w-4 h-4" />
                <span>Start Screen Capture</span>
              </button>
            </div>
          )}

          {recordedBlob && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <span className="text-xs text-zinc-400">
                Duration: {formatTime(recordSeconds)} • Size: {(recordedBlob.size / 1024 / 1024).toFixed(2)} MB
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={downloadVideo}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Recording</span>
                </button>
                <button
                  onClick={resetRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium text-sm transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>New Recording</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
};

export default ScreenRecorder;
