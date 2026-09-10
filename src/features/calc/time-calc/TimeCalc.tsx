import React, { useState, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import {
  Clock,
  Calendar,
  Copy,
  Check,
  Globe,
  Plus,
} from "lucide-react";

interface TimeCalcProps {
  tool: ToolDefinition;
}

export const TimeCalc: React.FC<TimeCalcProps> = ({ tool }) => {
  const [currentEpoch, setCurrentEpoch] = useState(Math.floor(Date.now() / 1000));
  const [inputEpoch, setInputEpoch] = useState(currentEpoch.toString());

  // Date Diff
  const [date1, setDate1] = useState(new Date().toISOString().slice(0, 16));
  const [date2, setDate2] = useState(new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 16));

  // Date Add / Sub
  const [baseDate, setBaseDate] = useState(new Date().toISOString().slice(0, 16));
  const [deltaDays, setDeltaDays] = useState(30);
  const [deltaHours, setDeltaHours] = useState(0);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parsedDate = !isNaN(Number(inputEpoch))
    ? new Date(Number(inputEpoch) * (inputEpoch.length > 11 ? 1 : 1000))
    : new Date();

  // Diff calculation
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();
  const diffMs = Math.abs(d2 - d1);
  const diffDays = (diffMs / (1000 * 60 * 60 * 24)).toFixed(2);
  const diffHours = (diffMs / (1000 * 60 * 60)).toFixed(1);

  // Arithmetic
  const resDate = new Date(new Date(baseDate).getTime() + (deltaDays * 86400000 + deltaHours * 3600000));

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const TIMEZONES = [
    { city: "UTC / GMT", zone: "UTC" },
    { city: "New York (EST/EDT)", zone: "America/New_York" },
    { city: "London (GMT/BST)", zone: "Europe/London" },
    { city: "Jakarta (WIB)", zone: "Asia/Jakarta" },
    { city: "Tokyo (JST)", zone: "Asia/Tokyo" },
    { city: "Sydney (AEST)", zone: "Australia/Sydney" },
  ];

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Live Unix Epoch Card */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Current Unix Epoch Timestamp
            </span>
            <span className="text-3xl font-mono font-bold text-emerald-400">
              {currentEpoch}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(currentEpoch.toString(), "live")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
            >
              {copiedKey === "live" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>Copy Timestamp</span>
            </button>
            <button
              onClick={() => setInputEpoch(currentEpoch.toString())}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-900/20"
            >
              Set to Now
            </button>
          </div>
        </div>

        {/* Timestamp to Date Converter */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">Timestamp ⇄ Human Date Converter</h3>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-400">Unix Timestamp (Seconds or Milliseconds)</label>
            <input
              type="text"
              value={inputEpoch}
              onChange={(e) => setInputEpoch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-base text-zinc-100 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
              <span className="text-[11px] text-zinc-500 block mb-0.5">ISO 8601</span>
              <span className="text-xs font-mono text-zinc-200 break-all select-all">
                {parsedDate.toISOString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
              <span className="text-[11px] text-zinc-500 block mb-0.5">Local Time</span>
              <span className="text-xs font-mono text-zinc-200 break-all select-all">
                {parsedDate.toLocaleString()}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
              <span className="text-[11px] text-zinc-500 block mb-0.5">UTC Time</span>
              <span className="text-xs font-mono text-emerald-400 break-all select-all">
                {parsedDate.toUTCString()}
              </span>
            </div>
          </div>
        </div>

        {/* Date Arithmetic & Difference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difference */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              Date Difference Calculator
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={date1}
                  onChange={(e) => setDate1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={date2}
                  onChange={(e) => setDate2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Difference</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {diffDays} days <span className="text-xs font-normal text-zinc-500">({diffHours} hours)</span>
              </span>
            </div>
          </div>

          {/* Add / Subtract */}
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" />
              Add / Subtract From Date
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Starting Date</label>
                <input
                  type="datetime-local"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Days to Add (+/-)</label>
                  <input
                    type="number"
                    value={deltaDays}
                    onChange={(e) => setDeltaDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Hours to Add (+/-)</label>
                  <input
                    type="number"
                    value={deltaHours}
                    onChange={(e) => setDeltaHours(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-zinc-200"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-xs text-zinc-400 block mb-1">Resulting Date</span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {resDate.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Global Timezones */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            World Clock (Live)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {TIMEZONES.map((tz) => (
              <div key={tz.zone} className="p-3 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-[11px] text-zinc-500 block truncate">{tz.city}</span>
                <span className="text-sm font-mono font-bold text-zinc-200 block mt-1">
                  {new Date().toLocaleTimeString("en-US", { timeZone: tz.zone, hour12: false })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default TimeCalc;
