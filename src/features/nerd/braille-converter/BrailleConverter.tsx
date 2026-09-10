import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { Copy, Check } from "lucide-react";

interface BrailleConverterProps {
  tool: ToolDefinition;
}

// Grade 1 Braille Mapping (Unicode Braille Patterns U+2800..U+28FF)
const BRAILLE_LETTERS: Record<string, string> = {
  a: "⠁",
  b: "⠃",
  c: "⠉",
  d: "⠙",
  e: "⠑",
  f: "⠋",
  g: "⠛",
  h: "⠓",
  i: "⠊",
  j: "⠚",
  k: "⠅",
  l: "⠇",
  m: "⠍",
  n: "⠝",
  o: "⠕",
  p: "⠏",
  q: "⠟",
  r: "⠗",
  s: "⠎",
  t: "⠞",
  u: "⠥",
  v: "⠧",
  w: "⠺",
  x: "⠭",
  y: "⠽",
  z: "⠵",
  " ": "⠀",
  ",": "⠂",
  ";": "⠆",
  ":": "⠒",
  ".": "⠲",
  "!": "⠖",
  "?": "⠦",
  "'": "⠄",
  "-": "⠤",
};

const BRAILLE_DIGITS: Record<string, string> = {
  "1": "⠁",
  "2": "⠃",
  "3": "⠉",
  "4": "⠙",
  "5": "⠑",
  "6": "⠋",
  "7": "⠛",
  "8": "⠓",
  "9": "⠊",
  "0": "⠚",
};

const CAPITAL_INDICATOR = "⠠";
const NUMBER_INDICATOR = "⠼";

export const BrailleConverter: React.FC<BrailleConverterProps> = ({ tool }) => {
  const [text, setText] = useState("Eureka Dev Tools");
  const [copied, setCopied] = useState(false);

  const textToBraille = (input: string): string => {
    let result = "";
    let inNumber = false;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (/[0-9]/.test(char)) {
        if (!inNumber) {
          result += NUMBER_INDICATOR;
          inNumber = true;
        }
        result += BRAILLE_DIGITS[char] || "";
      } else {
        inNumber = false;
        if (/[A-Z]/.test(char)) {
          result += CAPITAL_INDICATOR;
          result += BRAILLE_LETTERS[char.toLowerCase()] || char;
        } else {
          result += BRAILLE_LETTERS[char] || char;
        }
      }
    }
    return result;
  };

  const braille = textToBraille(text);

  const handleCopy = () => {
    navigator.clipboard.writeText(braille);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">
              English Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Enter text to translate to Braille..."
              className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                Unicode Braille (UEB)
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
                <span>{copied ? "Copied" : "Copy Braille"}</span>
              </button>
            </div>
            <textarea
              value={braille}
              readOnly
              rows={6}
              className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-2xl font-mono text-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Visual Reference Guide */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300">
            Braille Alphabet (A-Z)
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-9 gap-2 text-center">
            {Object.entries(BRAILLE_LETTERS)
              .filter(([k]) => /^[a-z]$/.test(k))
              .map(([k, b]) => (
                <div
                  key={k}
                  className="p-2 rounded-lg bg-zinc-950 border border-zinc-850"
                >
                  <span className="text-xl text-emerald-400 block">{b}</span>
                  <span className="text-xs text-zinc-500 uppercase font-mono">
                    {k}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default BrailleConverter;
