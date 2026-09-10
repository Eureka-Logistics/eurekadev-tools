import React, { useState, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadBlob } from "@/lib/download";
import { Copy, Check, RotateCcw, ShieldCheck, Download } from "lucide-react";

interface PasswordGennyProps {
  tool: ToolDefinition;
}

const WORD_LIST = [
  "apple",
  "amber",
  "anchor",
  "arrow",
  "beacon",
  "breeze",
  "bridge",
  "canyon",
  "castle",
  "cedar",
  "cipher",
  "cliff",
  "clover",
  "copper",
  "crane",
  "crystal",
  "dawn",
  "delta",
  "desert",
  "dragon",
  "drift",
  "echo",
  "ember",
  "falcon",
  "feather",
  "flame",
  "flint",
  "forest",
  "frost",
  "galaxy",
  "glacier",
  "glade",
  "granite",
  "harbor",
  "haven",
  "hawk",
  "horizon",
  "island",
  "jasper",
  "jungle",
  "kinetic",
  "lagoon",
  "lantern",
  "legend",
  "lunar",
  "marble",
  "meadow",
  "meteor",
  "mirage",
  "mountain",
  "nebula",
  "nexus",
  "oasis",
  "ocean",
  "orbit",
  "peak",
  "phoenix",
  "pillar",
  "planet",
  "plasma",
  "polar",
  "quartz",
  "quiver",
  "radiant",
  "rapids",
  "raven",
  "reef",
  "ridge",
  "river",
  "ruby",
  "saffron",
  "sage",
  "shadow",
  "shield",
  "sierra",
  "silver",
  "solar",
  "spark",
  "summit",
  "tempest",
  "timber",
  "topaz",
  "valley",
  "vapor",
  "velvet",
  "vortex",
  "willow",
  "zenith",
];

export const PasswordGenny: React.FC<PasswordGennyProps> = ({ tool }) => {
  const [mode, setMode] = useState<"random" | "passphrase">("random");

  // Random settings
  const [length, setLength] = useState(20);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  // Passphrase settings
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");
  const [capitalizeWords, setCapitalizeWords] = useState(false);

  // Generated passwords
  const [passwords, setPasswords] = useState<string[]>([]);
  const [bulkCount, setBulkCount] = useState(5);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const getRandomInt = (max: number): number => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  };

  const generateSinglePassword = (): string => {
    if (mode === "passphrase") {
      const selectedWords: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        let w = WORD_LIST[getRandomInt(WORD_LIST.length)];
        if (capitalizeWords) {
          w = w.charAt(0).toUpperCase() + w.slice(1);
        }
        selectedWords.push(w);
      }
      return selectedWords.join(separator);
    }

    let charset = "";
    if (useUpper)
      charset += excludeAmbiguous
        ? "ABCDEFGHJKLMNPQRSTUVWXYZ"
        : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useLower)
      charset += excludeAmbiguous
        ? "abcdefghijkmnopqrstuvwxyz"
        : "abcdefghijklmnopqrstuvwxyz";
    if (useNumbers) charset += excludeAmbiguous ? "23456789" : "0123456789";
    if (useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    if (!charset) charset = "abcdefghijklmnopqrstuvwxyz";

    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[getRandomInt(charset.length)];
    }
    return result;
  };

  const regenerate = () => {
    const list: string[] = [];
    for (let i = 0; i < bulkCount; i++) {
      list.push(generateSinglePassword());
    }
    setPasswords(list);
  };

  useEffect(() => {
    regenerate();
  }, [
    mode,
    length,
    useUpper,
    useLower,
    useNumbers,
    useSymbols,
    excludeAmbiguous,
    wordCount,
    separator,
    capitalizeWords,
    bulkCount,
  ]);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const calculateEntropy = (pw: string): number => {
    if (!pw) return 0;
    let poolSize = 0;
    if (mode === "passphrase") {
      poolSize = WORD_LIST.length;
      return Math.round(wordCount * Math.log2(poolSize));
    }
    if (/[a-z]/.test(pw)) poolSize += 26;
    if (/[A-Z]/.test(pw)) poolSize += 26;
    if (/[0-9]/.test(pw)) poolSize += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) poolSize += 32;
    return Math.round(pw.length * Math.log2(Math.max(2, poolSize)));
  };

  const primaryPassword = passwords[0] || "";
  const entropy = calculateEntropy(primaryPassword);

  const getStrengthLabel = (bits: number) => {
    if (bits < 40)
      return { label: "Weak", color: "text-rose-400", bg: "bg-rose-500" };
    if (bits < 60)
      return { label: "Fair", color: "text-amber-400", bg: "bg-amber-500" };
    if (bits < 80)
      return { label: "Good", color: "text-blue-400", bg: "bg-blue-500" };
    if (bits < 100)
      return {
        label: "Strong",
        color: "text-emerald-400",
        bg: "bg-emerald-500",
      };
    return {
      label: "Very Strong",
      color: "text-emerald-300",
      bg: "bg-emerald-400",
    };
  };

  const strength = getStrengthLabel(entropy);

  const exportAll = () => {
    const textData = passwords.join("\n");
    const blob = new Blob([textData], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `passwords-${Date.now()}.txt`);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Mode Switcher */}
        <div className="flex items-center justify-between">
          <div className="flex rounded-xl bg-zinc-900 p-1 border border-zinc-800 text-xs">
            <button
              onClick={() => setMode("random")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mode === "random"
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Random Password
            </button>
            <button
              onClick={() => setMode("passphrase")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                mode === "passphrase"
                  ? "bg-emerald-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Memorable Passphrase
            </button>
          </div>

          <button
            onClick={regenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </button>
        </div>

        {/* Hero Password Display */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xl sm:text-2xl font-mono font-bold text-zinc-100 tracking-wide break-all select-all">
              {primaryPassword}
            </span>

            <button
              onClick={() => copyToClipboard(primaryPassword, 0)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-900/20"
            >
              {copiedIndex === 0 ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{copiedIndex === 0 ? "Copied!" : "Copy Password"}</span>
            </button>
          </div>

          {/* Strength Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Strength:{" "}
                <strong className={strength.color}>{strength.label}</strong>
              </span>
              <span className="font-mono text-zinc-400">
                ~{entropy} bits of entropy
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strength.bg}`}
                style={{ width: `${Math.min(100, (entropy / 120) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
          {mode === "random" ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                  <span>Password Length</span>
                  <span className="font-mono text-emerald-400">
                    {length} characters
                  </span>
                </label>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    label: "Uppercase (A-Z)",
                    checked: useUpper,
                    set: setUseUpper,
                  },
                  {
                    label: "Lowercase (a-z)",
                    checked: useLower,
                    set: setUseLower,
                  },
                  {
                    label: "Numbers (0-9)",
                    checked: useNumbers,
                    set: setUseNumbers,
                  },
                  {
                    label: "Symbols (!@#$)",
                    checked: useSymbols,
                    set: setUseSymbols,
                  },
                  {
                    label: "Exclude Ambiguous (0/O, 1/l/I)",
                    checked: excludeAmbiguous,
                    set: setExcludeAmbiguous,
                  },
                ].map((opt) => (
                  <label
                    key={opt.label}
                    className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={opt.checked}
                      onChange={(e) => opt.set(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400 flex items-center justify-between">
                  <span>Word Count</span>
                  <span className="font-mono text-emerald-400">
                    {wordCount} words
                  </span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-400">
                    Separator
                  </label>
                  <div className="flex gap-2">
                    {[
                      { label: "Hyphen (-)", val: "-" },
                      { label: "Underscore (_)", val: "_" },
                      { label: "Space ( )", val: " " },
                      { label: "Dot (.)", val: "." },
                    ].map((s) => (
                      <button
                        key={s.val}
                        onClick={() => setSeparator(s.val)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          separator === s.val
                            ? "bg-emerald-600 text-white"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={capitalizeWords}
                      onChange={(e) => setCapitalizeWords(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-800 text-emerald-500"
                    />
                    Capitalize each word
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bulk List */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-zinc-400">
              Additional Generated Passwords
            </h4>
            <div className="flex items-center gap-2">
              <select
                value={bulkCount}
                onChange={(e) => setBulkCount(Number(e.target.value))}
                className="px-2 py-1 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
              >
                <option value={3}>3 total</option>
                <option value={5}>5 total</option>
                <option value={10}>10 total</option>
                <option value={20}>20 total</option>
              </select>
              <button
                onClick={exportAll}
                className="flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export TXT</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {passwords.slice(1).map((pw, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4"
              >
                <span className="font-mono text-xs text-zinc-300 break-all">
                  {pw}
                </span>
                <button
                  onClick={() => copyToClipboard(pw, idx + 1)}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                  title="Copy"
                >
                  {copiedIndex === idx + 1 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default PasswordGenny;
