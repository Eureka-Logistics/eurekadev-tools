import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadBlob } from "@/lib/download";
import {
  Upload,
  Clock,
  Download,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";

interface SubtitleConverterProps {
  tool: ToolDefinition;
}

interface SubtitleCue {
  id: number;
  startMs: number;
  endMs: number;
  text: string;
}

export const SubtitleConverter: React.FC<SubtitleConverterProps> = ({ tool }) => {
  const [inputText, setInputText] = useState("");
  const [outputFormat, setOutputFormat] = useState<"srt" | "vtt">("vtt");
  const [shiftMs, setShiftMs] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);
  const [copied, setCopied] = useState(false);

  // Time formatting helpers
  const msToSrtTime = (ms: number): string => {
    if (ms < 0) ms = 0;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const msec = Math.floor(ms % 1000);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${msec.toString().padStart(3, "0")}`;
  };

  const msToVttTime = (ms: number): string => {
    if (ms < 0) ms = 0;
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const msec = Math.floor(ms % 1000);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}.${msec.toString().padStart(3, "0")}`;
  };

  const parseTimeToMs = (timeStr: string): number => {
    const parts = timeStr.trim().replace(",", ".").split(":");
    if (parts.length === 3) {
      const h = parseFloat(parts[0]);
      const m = parseFloat(parts[1]);
      const s = parseFloat(parts[2]);
      return Math.round((h * 3600 + m * 60 + s) * 1000);
    } else if (parts.length === 2) {
      const m = parseFloat(parts[0]);
      const s = parseFloat(parts[1]);
      return Math.round((m * 60 + s) * 1000);
    }
    return 0;
  };

  const parseSubtitles = (content: string): SubtitleCue[] => {
    const clean = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    const blocks = clean.split(/\n\s*\n/);
    const cues: SubtitleCue[] = [];
    let cueId = 1;

    for (const block of blocks) {
      const lines = block.trim().split("\n");
      if (lines.length === 0 || lines[0] === "WEBVTT") continue;

      let timeLineIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("-->")) {
          timeLineIdx = i;
          break;
        }
      }

      if (timeLineIdx === -1) continue;

      const timeLine = lines[timeLineIdx];
      const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim().split(" ")[0]);
      const startMs = parseTimeToMs(startStr);
      const endMs = parseTimeToMs(endStr);
      const text = lines.slice(timeLineIdx + 1).join("\n");

      cues.push({
        id: cueId++,
        startMs,
        endMs,
        text,
      });
    }

    return cues;
  };

  const cues = parseSubtitles(inputText);

  // Processed output
  const processedCues = cues.map((cue) => ({
    ...cue,
    startMs: Math.max(0, Math.round(cue.startMs * speedMultiplier + shiftMs)),
    endMs: Math.max(0, Math.round(cue.endMs * speedMultiplier + shiftMs)),
  }));

  const generateOutput = (): string => {
    if (processedCues.length === 0) return "";

    if (outputFormat === "vtt") {
      let out = "WEBVTT\n\n";
      processedCues.forEach((cue) => {
        out += `${cue.id}\n`;
        out += `${msToVttTime(cue.startMs)} --> ${msToVttTime(cue.endMs)}\n`;
        out += `${cue.text}\n\n`;
      });
      return out.trim();
    } else {
      let out = "";
      processedCues.forEach((cue) => {
        out += `${cue.id}\n`;
        out += `${msToSrtTime(cue.startMs)} --> ${msToSrtTime(cue.endMs)}\n`;
        out += `${cue.text}\n\n`;
      });
      return out.trim();
    }
  };

  const outputText = generateOutput();

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setInputText((e.target?.result as string) || "");
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `subtitles.${outputFormat}`);
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Upload / Controls Bar */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium cursor-pointer transition">
              <Upload className="w-4 h-4" />
              <span>Load SRT / VTT File</span>
              <input
                type="file"
                accept=".srt,.vtt,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f);
                }}
              />
            </label>
            <span className="text-xs text-zinc-400">
              {cues.length} {cues.length === 1 ? "cue" : "cues"} parsed
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-zinc-800 p-1 border border-zinc-700 text-xs font-medium">
              <button
                onClick={() => setOutputFormat("vtt")}
                className={`px-3 py-1 rounded transition ${
                  outputFormat === "vtt" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                WebVTT (.vtt)
              </button>
              <button
                onClick={() => setOutputFormat("srt")}
                className={`px-3 py-1 rounded transition ${
                  outputFormat === "srt" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                SubRip (.srt)
              </button>
            </div>
          </div>
        </div>

        {/* Adjustments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Time Offset Shift
              </span>
              <span className="font-mono text-emerald-400">
                {shiftMs >= 0 ? `+${shiftMs}` : shiftMs} ms
              </span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="-5000"
                max="5000"
                step="50"
                value={shiftMs}
                onChange={(e) => setShiftMs(Number(e.target.value))}
                className="flex-1 accent-emerald-500"
              />
              <button
                onClick={() => setShiftMs(0)}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                title="Reset Shift"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
              <span>Frame Rate Rescale Multiplier</span>
              <span className="font-mono text-emerald-400">{speedMultiplier.toFixed(4)}x</span>
            </label>
            <div className="flex gap-2">
              {[
                { label: "1:1", val: 1.0 },
                { label: "23.976→25", val: 25 / 23.976 },
                { label: "25→23.976", val: 23.976 / 25 },
                { label: "24→25", val: 25 / 24 },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => setSpeedMultiplier(m.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    Math.abs(speedMultiplier - m.val) < 0.001
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Editors Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Input Subtitles (SRT or VTT)</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste SRT or VTT content here, or upload a file above...
1
00:00:01,000 --> 00:00:04,000
Hello from Eureka Dev Tools!"
              rows={14}
              className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 resize-none focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">
              Processed Output ({outputFormat.toUpperCase()})
            </label>
            <textarea
              value={outputText}
              readOnly
              rows={14}
              className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-emerald-400 resize-none focus:outline-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={!outputText}
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-sm transition shadow-lg shadow-emerald-900/20"
          >
            <Download className="w-4 h-4" />
            <span>Download .{outputFormat}</span>
          </button>

          <button
            disabled={!outputText}
            onClick={copyOutput}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-medium text-sm transition border border-zinc-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? "Copied" : "Copy to Clipboard"}</span>
          </button>
        </div>
      </div>
    </ToolShell>
  );
};

export default SubtitleConverter;
