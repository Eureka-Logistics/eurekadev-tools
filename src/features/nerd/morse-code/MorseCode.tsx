import React, { useState, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { Copy, Check, Play, Square } from "lucide-react";

interface MorseCodeProps {
  tool: ToolDefinition;
}

const MORSE_MAP: Record<string, string> = {
  a: ".-",
  b: "-...",
  c: "-.-.",
  d: "-..",
  e: ".",
  f: "..-.",
  g: "--.",
  h: "....",
  i: "..",
  j: ".---",
  k: "-.-",
  l: ".-..",
  m: "--",
  n: "-.",
  o: "---",
  p: ".--.",
  q: "--.-",
  r: ".-.",
  s: "...",
  t: "-",
  u: "..-",
  v: "...-",
  w: ".--",
  x: "-..-",
  y: "-.--",
  z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  ".": ".-.-.-",
  ",": "--..--",
  "?": "..--..",
  "'": ".----.",
  "!": "-.-.--",
  "/": "-..-.",
  "(": "-.--.",
  ")": "-.--.-",
  "&": ".-...",
  ":": "---...",
  ";": "-.-.-.",
  "=": "-...-",
  "+": ".-.-.",
  "-": "-....-",
  _: "..--.-",
  '"': ".-..-.",
  $: "...-..-",
  "@": ".--.-.",
  " ": "/",
};

const REVERSE_MORSE: Record<string, string> = Object.entries(MORSE_MAP).reduce(
  (acc, [k, v]) => ({ ...acc, [v]: k }),
  {},
);

export const MorseCode: React.FC<MorseCodeProps> = ({ tool }) => {
  const [text, setText] = useState("EUREKA DEV TOOLS");
  const [morse, setMorse] = useState("... --- ...");
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const stopFlagRef = useRef(false);

  const textToMorse = (input: string): string => {
    return input
      .toLowerCase()
      .split("")
      .map((c) => MORSE_MAP[c] || "")
      .filter(Boolean)
      .join(" ");
  };

  const morseToText = (input: string): string => {
    return input
      .trim()
      .split(/\s+/)
      .map((code) => (code === "/" ? " " : REVERSE_MORSE[code] || "?"))
      .join("")
      .toUpperCase();
  };

  const handleTextChange = (val: string) => {
    setText(val);
    setMorse(textToMorse(val));
  };

  const handleMorseChange = (val: string) => {
    setMorse(val);
    setText(morseToText(val));
  };

  const playMorseAudio = async () => {
    if (isPlaying) {
      stopFlagRef.current = true;
      setIsPlaying(false);
      return;
    }

    stopFlagRef.current = false;
    setIsPlaying(true);

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioCtx();
    audioCtxRef.current = ctx;

    const dotMs = 70;
    const dashMs = dotMs * 3;
    const freq = 650;

    const playTone = (durationMs: number): Promise<void> => {
      return new Promise((resolve) => {
        if (stopFlagRef.current) {
          resolve();
          return;
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.005);
        gain.gain.linearRampToValueAtTime(
          0,
          ctx.currentTime + durationMs / 1000,
        );

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        setTimeout(() => {
          try {
            osc.stop();
          } catch {}
          resolve();
        }, durationMs);
      });
    };

    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    for (const char of morse) {
      if (stopFlagRef.current) break;
      if (char === ".") {
        await playTone(dotMs);
        await sleep(dotMs);
      } else if (char === "-") {
        await playTone(dashMs);
        await sleep(dotMs);
      } else if (char === " ") {
        await sleep(dashMs);
      } else if (char === "/") {
        await sleep(dotMs * 7);
      }
    }

    setIsPlaying(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(morse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plain Text */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                Plain Text
              </label>
            </div>
            <textarea
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              rows={6}
              placeholder="Enter text to translate to Morse..."
              className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Morse Code */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                Morse Code (. and -)
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <textarea
              value={morse}
              onChange={(e) => handleMorseChange(e.target.value)}
              rows={6}
              placeholder="... --- ..."
              className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm font-mono text-emerald-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={playMorseAudio}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-900/20"
          >
            {isPlaying ? (
              <Square className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>{isPlaying ? "Stop Audio" : "Play Morse Beeps"}</span>
          </button>

          <span className="text-xs text-zinc-400">
            Dot: 70ms • Dash: 210ms • Frequency: 650 Hz (Sine)
          </span>
        </div>

        {/* Reference Sheet */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300">
            International Morse Code Reference
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-xs font-mono">
            {Object.entries(MORSE_MAP)
              .filter(([k]) => /[a-z0-9]/.test(k))
              .map(([k, v]) => (
                <div
                  key={k}
                  className="p-2 rounded-lg bg-zinc-950 border border-zinc-850 flex justify-between"
                >
                  <span className="text-zinc-400 uppercase font-bold">{k}</span>
                  <span className="text-emerald-400">{v}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default MorseCode;
