import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import {
  Clock,
  Plus,
  Minus,
  Calculator,
} from "lucide-react";

interface TimecodeCalcProps {
  tool: ToolDefinition;
}

type FrameRate = 23.976 | 24 | 25 | 29.97 | 30 | 50 | 59.94 | 60;

export const TimecodeCalc: React.FC<TimecodeCalcProps> = ({ tool }) => {
  const [fps, setFps] = useState<FrameRate>(24);
  const [isDropFrame, setIsDropFrame] = useState(false);

  // Timecode inputs
  const [tc1, setTc1] = useState("01:00:00:00");
  const [tc2, setTc2] = useState("00:05:30:12");
  const [operation, setOperation] = useState<"+" | "-">("+");

  // Converter input
  const [convertTc, setConvertTc] = useState("01:23:45:10");

  const parseTimecodeToFrames = (tc: string, rate: number, df: boolean): number => {
    const parts = tc.trim().split(/[:;]/).map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return 0;
    const [h, m, s, f] = parts;

    if (df && (rate === 29.97 || rate === 59.94)) {
      const dropFrames = rate === 29.97 ? 2 : 4;
      const totalMinutes = h * 60 + m;
      const nominalFps = Math.round(rate);
      const frameCount =
        (totalMinutes * 60 + s) * nominalFps +
        f -
        dropFrames * (totalMinutes - Math.floor(totalMinutes / 10));
      return Math.max(0, frameCount);
    }

    const totalSeconds = h * 3600 + m * 60 + s;
    return Math.max(0, Math.round(totalSeconds * rate + f));
  };

  const framesToTimecode = (frames: number, rate: number, df: boolean): string => {
    if (frames < 0) frames = 0;
    const nominalFps = Math.round(rate);

    if (df && (rate === 29.97 || rate === 59.94)) {
      const dropFrames = rate === 29.97 ? 2 : 4;
      const framesPer10Min = Math.round(nominalFps * 600 - dropFrames * 9);
      const framesPerHour = framesPer10Min * 6;
      const framesPer24Hours = framesPerHour * 24;

      frames = frames % framesPer24Hours;

      const d = Math.floor(frames / framesPer10Min);
      const m = frames % framesPer10Min;

      let f = frames;
      if (m > dropFrames) {
        f += dropFrames * 9 * d + dropFrames * Math.floor((m - dropFrames) / (nominalFps * 60 - dropFrames));
      } else {
        f += dropFrames * 9 * d;
      }

      const hours = Math.floor(f / (nominalFps * 3600)) % 24;
      const minutes = Math.floor((f % (nominalFps * 3600)) / (nominalFps * 60));
      const seconds = Math.floor((f % (nominalFps * 60)) / nominalFps);
      const ff = Math.floor(f % nominalFps);

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")};${ff.toString().padStart(2, "0")}`;
    }

    const totalSecs = Math.floor(frames / rate);
    const ff = Math.floor(frames % rate);
    const s = totalSecs % 60;
    const m = Math.floor(totalSecs / 60) % 60;
    const h = Math.floor(totalSecs / 3600);

    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}:${ff.toString().padStart(2, "0")}`;
  };

  // Perform calculation
  const frames1 = parseTimecodeToFrames(tc1, fps, isDropFrame);
  const frames2 = parseTimecodeToFrames(tc2, fps, isDropFrame);
  const resultFrames = operation === "+" ? frames1 + frames2 : Math.max(0, frames1 - frames2);
  const resultTc = framesToTimecode(resultFrames, fps, isDropFrame);
  const resultSeconds = (resultFrames / fps).toFixed(3);

  // Conversion
  const convertedFrames = parseTimecodeToFrames(convertTc, fps, isDropFrame);
  const convertedSeconds = (convertedFrames / fps).toFixed(3);
  const convertedMs = Math.round((convertedFrames / fps) * 1000);

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Frame Rate & Settings Bar */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-zinc-200">Frame Rate</span>
            <select
              value={fps}
              onChange={(e) => {
                const newFps = Number(e.target.value) as FrameRate;
                setFps(newFps);
                if (newFps !== 29.97 && newFps !== 59.94) setIsDropFrame(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
            >
              <option value={23.976}>23.976 fps (Film / NTSC)</option>
              <option value={24}>24 fps (Standard Film)</option>
              <option value={25}>25 fps (PAL / Broadcast)</option>
              <option value={29.97}>29.97 fps (NTSC Broadcast)</option>
              <option value={30}>30 fps (Web / Video)</option>
              <option value={50}>50 fps (PAL High)</option>
              <option value={59.94}>59.94 fps (NTSC High)</option>
              <option value={60}>60 fps (Digital Video)</option>
            </select>
          </div>

          {(fps === 29.97 || fps === 59.94) && (
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDropFrame}
                onChange={(e) => setIsDropFrame(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
              />
              Drop Frame (DF)
            </label>
          )}
        </div>

        {/* Timecode Arithmetic Section */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-6">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-400" />
            Timecode Arithmetic (Addition & Subtraction)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
            {/* TC 1 */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs text-zinc-400">Timecode A (HH:MM:SS:FF)</label>
              <input
                type="text"
                value={tc1}
                onChange={(e) => setTc1(e.target.value)}
                placeholder="00:00:00:00"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-lg text-zinc-100 focus:border-emerald-500"
              />
              <span className="text-[11px] font-mono text-zinc-500">
                {frames1.toLocaleString()} frames
              </span>
            </div>

            {/* Operator */}
            <div className="md:col-span-1 flex justify-center">
              <button
                onClick={() => setOperation(operation === "+" ? "-" : "+")}
                className="p-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-emerald-400 transition font-bold"
                title="Toggle Addition / Subtraction"
              >
                {operation === "+" ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
              </button>
            </div>

            {/* TC 2 */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs text-zinc-400">Timecode B (HH:MM:SS:FF)</label>
              <input
                type="text"
                value={tc2}
                onChange={(e) => setTc2(e.target.value)}
                placeholder="00:00:00:00"
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-lg text-zinc-100 focus:border-emerald-500"
              />
              <span className="text-[11px] font-mono text-zinc-500">
                {frames2.toLocaleString()} frames
              </span>
            </div>
          </div>

          {/* Result Box */}
          <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-zinc-400 block mb-1">Resulting Timecode</span>
              <span className="text-3xl font-bold font-mono text-emerald-400 tracking-wider">
                {resultTc}
              </span>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs font-mono text-zinc-400 block">
                Total Frames: <span className="text-zinc-200 font-bold">{resultFrames.toLocaleString()}</span>
              </span>
              <span className="text-xs font-mono text-zinc-400 block">
                Real Duration: <span className="text-zinc-200 font-bold">{resultSeconds}s</span>
              </span>
            </div>
          </div>
        </div>

        {/* Timecode to Frames / Milliseconds Converter */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">
            Timecode &lt;=&gt; Frames & Milliseconds Converter
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Timecode</label>
              <input
                type="text"
                value={convertTc}
                onChange={(e) => setConvertTc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Total Frames</label>
              <input
                type="number"
                value={convertedFrames}
                onChange={(e) => {
                  const f = Number(e.target.value);
                  setConvertTc(framesToTimecode(f, fps, isDropFrame));
                }}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-zinc-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Real Time</label>
              <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-400">
                {convertedSeconds}s ({convertedMs.toLocaleString()} ms)
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default TimecodeCalc;
