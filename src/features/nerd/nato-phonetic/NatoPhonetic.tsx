import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { Volume2, Copy, Check } from "lucide-react";

interface NatoPhoneticProps {
  tool: ToolDefinition;
}

const NATO_MAP: Record<string, { call: string; pron: string }> = {
  A: { call: "Alfa", pron: "AL-fah" },
  B: { call: "Bravo", pron: "BRAH-voh" },
  C: { call: "Charlie", pron: "CHAR-lee" },
  D: { call: "Delta", pron: "DELL-tah" },
  E: { call: "Echo", pron: "ECK-oh" },
  F: { call: "Foxtrot", pron: "FOKS-trot" },
  G: { call: "Golf", pron: "GOLF" },
  H: { call: "Hotel", pron: "hoh-TELL" },
  I: { call: "India", pron: "IN-dee-ah" },
  J: { call: "Juliett", pron: "JEW-lee-ett" },
  K: { call: "Kilo", pron: "KEY-loh" },
  L: { call: "Lima", pron: "LEE-mah" },
  M: { call: "Mike", pron: "MIKE" },
  N: { call: "November", pron: "no-VEM-ber" },
  O: { call: "Oscar", pron: "OSS-cah" },
  P: { call: "Papa", pron: "pah-PAH" },
  Q: { call: "Quebec", pron: "keh-BECK" },
  R: { call: "Romeo", pron: "ROW-me-oh" },
  S: { call: "Sierra", pron: "see-AIR-rah" },
  T: { call: "Tango", pron: "TANG-go" },
  U: { call: "Uniform", pron: "YOU-nee-form" },
  V: { call: "Victor", pron: "VIK-tah" },
  W: { call: "Whiskey", pron: "WISS-key" },
  X: { call: "X-ray", pron: "ECKS-ray" },
  Y: { call: "Yankee", pron: "YANG-key" },
  Z: { call: "Zulu", pron: "ZOO-loo" },
  "0": { call: "Zero", pron: "ZEE-ro" },
  "1": { call: "One", pron: "WUN" },
  "2": { call: "Two", pron: "TOO" },
  "3": { call: "Three", pron: "TREE" },
  "4": { call: "Four", pron: "FOW-er" },
  "5": { call: "Five", pron: "FIFE" },
  "6": { call: "Six", pron: "SIX" },
  "7": { call: "Seven", pron: "SEV-en" },
  "8": { call: "Eight", pron: "AIT" },
  "9": { call: "Niner", pron: "NIN-er" },
};

const DIN5009_MAP: Record<string, string> = {
  A: "Anton", B: "Berta", C: "Cäsar", D: "Dora", E: "Emil",
  F: "Friedrich", G: "Gustav", H: "Heinrich", I: "Ida", J: "Julius",
  K: "Kaufmann", L: "Ludwig", M: "Martha", N: "Nordpol", O: "Otto",
  P: "Paula", Q: "Quelle", R: "Richard", S: "Samuel", T: "Theodor",
  U: "Ulrich", V: "Viktor", W: "Wilhelm", X: "Xanthippe", Y: "Ypsilon",
  Z: "Zacharias",
};

export const NatoPhonetic: React.FC<NatoPhoneticProps> = ({ tool }) => {
  const [text, setText] = useState("EUREKA 2026");
  const [standard, setStandard] = useState<"nato" | "din">("nato");
  const [copied, setCopied] = useState(false);

  const getPhoneticWords = (): { char: string; word: string; pron?: string }[] => {
    const list: { char: string; word: string; pron?: string }[] = [];
    const upper = text.toUpperCase();

    for (const ch of upper) {
      if (standard === "nato") {
        if (NATO_MAP[ch]) {
          list.push({ char: ch, word: NATO_MAP[ch].call, pron: NATO_MAP[ch].pron });
        } else if (ch === " ") {
          list.push({ char: " ", word: "[SPACE]" });
        } else {
          list.push({ char: ch, word: ch });
        }
      } else {
        if (DIN5009_MAP[ch]) {
          list.push({ char: ch, word: DIN5009_MAP[ch] });
        } else if (ch === " ") {
          list.push({ char: " ", word: "[LEERZEICHEN]" });
        } else {
          list.push({ char: ch, word: ch });
        }
      }
    }
    return list;
  };

  const phoneticItems = getPhoneticWords();
  const fullTextResult = phoneticItems.map((item) => item.word).join(" ");

  const handleCopy = () => {
    navigator.clipboard.writeText(fullTextResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakPhonetic = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(fullTextResult);
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Controls */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-xl bg-zinc-800 p-1 border border-zinc-700 text-xs font-medium">
            <button
              onClick={() => setStandard("nato")}
              className={`px-4 py-1.5 rounded-lg transition ${
                standard === "nato" ? "bg-emerald-600 text-white" : "text-zinc-400"
              }`}
            >
              NATO / ICAO (International)
            </button>
            <button
              onClick={() => setStandard("din")}
              className={`px-4 py-1.5 rounded-lg transition ${
                standard === "din" ? "bg-emerald-600 text-white" : "text-zinc-400"
              }`}
            >
              DIN 5009 (German)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={speakPhonetic}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Listen</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Text Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Input Text or Call Sign</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-base text-zinc-100 uppercase focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Phonetic Call Card Badges */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h4 className="text-xs font-semibold text-zinc-400">Phonetic Spelling Breakdown</h4>
          <div className="flex flex-wrap gap-2.5">
            {phoneticItems.map((item, idx) => (
              <div
                key={idx}
                className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center gap-2.5"
              >
                <span className="font-mono font-bold text-emerald-400 text-sm">{item.char}</span>
                <span className="text-zinc-200 font-medium text-xs">{item.word}</span>
                {item.pron && (
                  <span className="text-[10px] text-zinc-500 font-mono">({item.pron})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default NatoPhonetic;
