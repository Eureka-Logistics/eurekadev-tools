import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { Copy, Check, Sparkles } from "lucide-react";

interface IpaTranscriberProps {
  tool: ToolDefinition;
}

// Common dictionary words to IPA
const IPA_DICT: Record<string, string> = {
  the: "ðə",
  of: "ʌv",
  and: "ænd",
  a: "ə",
  to: "tuː",
  in: "ɪn",
  is: "ɪz",
  you: "juː",
  that: "ðæt",
  it: "ɪt",
  he: "hiː",
  was: "wɒz",
  for: "fɔːr",
  on: "ɒn",
  are: "ɑːr",
  as: "æz",
  with: "wɪð",
  his: "hɪz",
  they: "ðeɪ",
  i: "aɪ",
  at: "æt",
  be: "biː",
  this: "ðɪs",
  have: "hæv",
  from: "frɒm",
  or: "ɔːr",
  one: "wʌn",
  had: "hæd",
  by: "baɪ",
  word: "wɜːd",
  but: "bʌt",
  not: "nɒt",
  what: "wɒt",
  all: "ɔːl",
  were: "wɜːr",
  we: "wiː",
  when: "wen",
  your: "jɔːr",
  can: "kæn",
  said: "sed",
  there: "ðeər",
  use: "juːz",
  an: "æn",
  each: "iːtʃ",
  which: "wɪtʃ",
  she: "ʃiː",
  do: "duː",
  how: "haʊ",
  their: "ðeər",
  if: "ɪf",
  will: "wɪl",
  up: "ʌp",
  other: "ˈʌðər",
  about: "əˈbaʊt",
  out: "aʊt",
  many: "ˈmeni",
  then: "ðen",
  them: "ðem",
  these: "ðiːz",
  so: "soʊ",
  some: "sʌm",
  her: "hɜːr",
  would: "wʊd",
  make: "meɪk",
  like: "laɪk",
  him: "hɪm",
  into: "ˈɪntuː",
  time: "taɪm",
  has: "hæz",
  look: "lʊk",
  two: "tuː",
  more: "mɔːr",
  write: "raɪt",
  go: "ɡoʊ",
  see: "siː",
  number: "ˈnʌmbər",
  no: "noʊ",
  way: "weɪ",
  could: "kʊd",
  people: "ˈpiːpl",
  my: "maɪ",
  than: "ðæn",
  first: "fɜːrst",
  water: "ˈwɔːtər",
  been: "bɪn",
  call: "kɔːl",
  who: "huː",
  oil: "ɔɪl",
  its: "ɪts",
  now: "naʊ",
  find: "faɪnd",
  long: "lɒŋ",
  down: "daʊn",
  day: "deɪ",
  did: "dɪd",
  get: "ɡet",
  come: "kʌm",
  made: "meɪd",
  may: "meɪ",
  part: "pɑːrt",
  eureka: "juːˈriːkə",
  dev: "dɛv",
  tools: "tuːlz",
  code: "koʊd",
  assistant: "əˈsɪstənt",
};

// Fallback letter-to-sound rules
const CHAR_RULES: Record<string, string> = {
  th: "θ",
  sh: "ʃ",
  ch: "tʃ",
  ph: "f",
  ng: "ŋ",
  ee: "iː",
  oo: "uː",
  ea: "iː",
  ai: "eɪ",
  oa: "oʊ",
  ou: "aʊ",
  oi: "ɔɪ",
};

export const IpaTranscriber: React.FC<IpaTranscriberProps> = ({ tool }) => {
  const [text, setText] = useState("Eureka dev tools are fast and offline");
  const [copied, setCopied] = useState(false);

  const transcribeWord = (word: string): string => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!clean) return word;
    if (IPA_DICT[clean]) return IPA_DICT[clean];

    // Simple rule-based phonetic approximation
    let res = clean;
    for (const [digraph, ipa] of Object.entries(CHAR_RULES)) {
      res = res.split(digraph).join(ipa);
    }
    res = res
      .replace(/c(?=[eiy])/g, "s")
      .replace(/c/g, "k")
      .replace(/q/g, "k")
      .replace(/x/g, "ks")
      .replace(/j/g, "dʒ");
    return `/${res}/`;
  };

  const transcribeSentence = (input: string): string => {
    return input
      .split(/(\s+|[.,!?;:"])/)
      .map((token) =>
        /^[a-zA-Z]+$/.test(token) ? transcribeWord(token) : token,
      )
      .join("");
  };

  const ipaResult = transcribeSentence(text);

  const handleCopy = () => {
    navigator.clipboard.writeText(ipaResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertIpaSymbol = (sym: string) => {
    setText((prev) => prev + sym);
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
              placeholder="Enter text to transcribe into IPA..."
              className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300">
                IPA Transcription (General American / RP)
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
                <span>{copied ? "Copied" : "Copy IPA"}</span>
              </button>
            </div>
            <textarea
              value={ipaResult}
              readOnly
              rows={6}
              className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-base font-mono text-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        {/* IPA Symbol Insertion Bar */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Common IPA Symbols
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {[
              "θ",
              "ð",
              "ʃ",
              "ʒ",
              "tʃ",
              "dʒ",
              "ŋ",
              "æ",
              "ʌ",
              "ə",
              "ɜː",
              "ɪ",
              "iː",
              "ʊ",
              "uː",
              "ɒ",
              "ɔː",
              "ˈ",
              "ˌ",
            ].map((sym) => (
              <button
                key={sym}
                onClick={() => insertIpaSymbol(sym)}
                className="w-9 h-9 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-sm flex items-center justify-center transition"
              >
                {sym}
              </button>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default IpaTranscriber;
