import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { Copy, Check, Sparkles } from "lucide-react";

interface ShavianTransliteratorProps {
  tool: ToolDefinition;
}

// Shavian dictionary for common English words
const SHAVIAN_DICT: Record<string, string> = {
  the: "𐑞", of: "𐑝", and: "𐑯", to: "𐑑", a: "𐑩", in: "𐑦𐑯", is: "𐑦𐑟",
  you: "𐑿", that: "𐑞𐑨𐑑", it: "𐑦𐑑", he: "𐑣𐑰", was: "𐑢𐑪𐑟", for: "𐑓",
  on: "𐑪𐑯", are: "𐑸", as: "𐑨𐑟", with: "𐑢𐑦𐑞", his: "𐑣𐑦𐑟", they: "𐑞𐑱",
  i: "𐑲", at: "𐑨𐑑", be: "𐑚𐑰", this: "𐑞𐑦𐑕", have: "𐑣𐑨𐑝", from: "𐑓𐑮𐑪𐑥",
  or: "𐑹", one: "𐑢𐑳𐑯", had: "𐑣𐑨𐑛", by: "𐑚𐑲", word: "𐑢𐑻𐑛", but: "𐑚𐑳𐑑",
  not: "𐑯𐑪𐑑", what: "𐑢𐑪𐑑", all: "𐑷𐑤", were: "𐑢𐑻", we: "𐑢𐑰", when: "𐑢𐑧𐑯",
  your: "𐑘𐑹", can: "𐑒𐑨𐑯", said: "𐑕𐑧𐑛", there: "𐑞𐑺", use: "𐑿𐑟", an: "𐑩𐑯",
  each: "𐑰𐑗", which: "𐑢𐑦𐑗", she: "𐑖𐑰", do: "𐑛𐑵", how: "𐑣𐑬", their: "𐑞𐑺",
  if: "𐑦𐑓", will: "𐑢𐑦𐑤", up: "𐑳𐑐", other: "𐑳𐑞𐑼", about: "𐑩𐑚𐑬𐑑", out: "𐑬𐑑",
  many: "𐑥𐑧𐑯𐑦", then: "𐑞𐑧𐑯", them: "𐑞𐑧𐑥", these: "𐑞𐑰𐑟", so: "𐑕𐑴", some: "𐑕𐑳𐑥",
  time: "𐑑𐑲𐑥", has: "𐑣𐑨𐑟", look: "𐑤𐑫𐑒", two: "𐑑𐑵", more: "𐑥𐑹", write: "𐑮𐑲𐑑",
  go: "𐑜𐑴", see: "𐑕𐑰", number: "𐑯𐑳𐑥𐑚𐑼", no: "𐑯𐑴", way: "𐑢𐑱", could: "𐑒𐑫𐑛",
  people: "𐑐𐑰𐑐𐑩𐑤", my: "𐑥𐑲", than: "𐑞𐑨𐑯", first: "𐑓𐑻𐑕𐑑", water: "𐑢𐑷𐑑𐑼",
  day: "𐑛𐑱", get: "𐑜𐑧𐑑", eureka: "𐑿𐑮𐑰𐑒𐑩", tools: "𐑑𐑵𐑤𐑟", dev: "𐑛𐑧𐑝",
};

// Letter mapping heuristic fallback
const SHAVIAN_CHAR_MAP: Record<string, string> = {
  p: "𐑐", b: "𐑚", t: "𐑑", d: "𐑛", k: "𐑒", g: "𐑜",
  f: "𐑓", v: "𐑝", s: "𐑕", z: "𐑟", h: "𐑣", m: "𐑥",
  n: "𐑯", l: "𐑤", r: "𐑮", w: "𐑢", y: "𐑘",
  a: "𐑨", e: "𐑧", i: "𐑦", o: "𐑪", u: "𐑳",
};

export const ShavianTransliterator: React.FC<ShavianTransliteratorProps> = ({ tool }) => {
  const [text, setText] = useState("Eureka dev tools are fast and free");
  const [copied, setCopied] = useState(false);

  const transliterateWord = (w: string): string => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, "");
    if (!clean) return w;
    if (SHAVIAN_DICT[clean]) return SHAVIAN_DICT[clean];

    let res = "";
    for (const char of clean) {
      res += SHAVIAN_CHAR_MAP[char] || char;
    }
    return res;
  };

  const transliterateText = (input: string): string => {
    return input
      .split(/(\s+|[.,!?;:"])/)
      .map((token) => (/^[a-zA-Z]+$/.test(token) ? transliterateWord(token) : token))
      .join("");
  };

  const shavian = transliterateText(text);

  const handleCopy = () => {
    navigator.clipboard.writeText(shavian);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300">Latin English Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder="Enter English text..."
              className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                Shavian Alphabet (𐑖𐑱𐑝𐑾𐑯)
              </label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Shavian"}</span>
              </button>
            </div>
            <textarea
              value={shavian}
              readOnly
              rows={6}
              className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xl font-mono text-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Shavian Alphabet Reference */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Key Shavian Characters Reference
          </h4>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 text-center text-xs">
            {[
              { char: "𐑐", name: "peep (p)" },
              { char: "𐑑", name: "tot (t)" },
              { char: "𐑒", name: "kick (k)" },
              { char: "𐑓", name: "fee (f)" },
              { char: "𐑔", name: "thigh (th)" },
              { char: "𐑕", name: "so (s)" },
              { char: "𐑖", name: "sure (sh)" },
              { char: "𐑗", name: "church (ch)" },
              { char: "𐑚", name: "bib (b)" },
              { char: "𐑛", name: "dead (d)" },
              { char: "𐑜", name: "gag (g)" },
              { char: "𐑝", name: "vow (v)" },
              { char: "𐑞", name: "they (dh)" },
              { char: "𐑟", name: "zoo (z)" },
              { char: "𐑤", name: "loll (l)" },
              { char: "𐑥", name: "mime (m)" },
            ].map((item) => (
              <div key={item.char} className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-850">
                <span className="text-2xl text-emerald-400 block mb-0.5">{item.char}</span>
                <span className="text-[10px] text-zinc-500 font-mono">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default ShavianTransliterator;
