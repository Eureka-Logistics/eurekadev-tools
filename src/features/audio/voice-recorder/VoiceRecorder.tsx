import React, { useState, useRef, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { decodeAudioFile, audioBufferToWav } from "@/lib/audio/wavEncoder";
import { downloadBlob } from "@/lib/download";
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  Trash2,
  RotateCcw,
} from "lucide-react";

interface VoiceRecorderProps {
  tool: ToolDefinition;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ tool }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const startVisualizer = (stream: MediaStream) => {
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioCtxRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#18181b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / dataArray.length) * 2;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = "#10b981";
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
        x += barWidth;
      }
    };

    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setRecordSeconds(0);

      timerRef.current = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);

      startVisualizer(stream);
    } catch (err) {
      console.error(err);
      alert("Microphone access is required to record audio.");
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
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordSeconds(0);
  };

  const downloadWav = async () => {
    if (!audioBlob) return;
    try {
      const buffer = await decodeAudioFile(audioBlob);
      const wav = audioBufferToWav(buffer);
      downloadBlob(wav, `voice-memo-${Date.now()}.wav`);
    } catch {
      // fallback download raw blob
      downloadBlob(audioBlob, `voice-memo-${Date.now()}.webm`);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
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
        <div className="p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-6 max-w-xl mx-auto">
          <div className="space-y-2">
            <span className="text-4xl font-mono font-bold text-zinc-100 block">
              {formatTime(recordSeconds)}
            </span>
            <p className="text-xs text-zinc-400">
              {isRecording
                ? isPaused
                  ? "Recording paused"
                  : "Recording in progress..."
                : audioBlob
                ? "Recording complete"
                : "Click record to begin voice memo"}
            </p>
          </div>

          {/* Visualizer Canvas */}
          <div className="h-24 bg-zinc-950 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={480}
              height={96}
              className={`w-full h-full object-cover ${isRecording ? "opacity-100" : "opacity-30"}`}
            />
          </div>

          {/* Controls */}
          {!audioBlob ? (
            <div className="flex items-center justify-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-medium text-sm transition shadow-lg shadow-rose-900/30"
                >
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span>Start Recording</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={pauseRecording}
                    className="p-3.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition"
                    title={isPaused ? "Resume" : "Pause"}
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/30"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Stop & Save</span>
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {audioUrl && (
                <audio
                  ref={audioElRef}
                  src={audioUrl}
                  controls
                  className="w-full"
                />
              )}

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={downloadWav}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download WAV</span>
                </button>
                <button
                  onClick={resetRecording}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Record Again</span>
                </button>
                <button
                  onClick={resetRecording}
                  className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-500 transition"
                  title="Discard"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
};

export default VoiceRecorder;
