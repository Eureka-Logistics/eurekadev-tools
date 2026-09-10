import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { Copy, Check, Sparkles, LockOpen } from "lucide-react";

interface DecoderProps {
  tool: ToolDefinition;
}

// English letter frequency table
const ENGLISH_FREQ: Record<string, number> = {
  a: 8.2,
  b: 1.5,
  c: 2.8,
  d: 4.3,
  e: 12.7,
  f: 2.2,
  g: 2.0,
  h: 6.1,
  i: 7.0,
  j: 0.15,
  k: 0.77,
  l: 4.0,
  m: 2.4,
  n: 6.7,
  o: 7.5,
  p: 1.9,
  q: 0.09,
  r: 6.0,
  s: 6.3,
  t: 9.1,
  u: 2.8,
  v: 0.98,
  w: 2.4,
  x: 0.15,
  y: 2.0,
  z: 0.07,
};

function scoreEnglishText(text: string): number {
  const clean = text.toLowerCase().replace(/[^a-z]/g, "");
  if (clean.length < 5) return 0;

  const counts: Record<string, number> = {};
  for (const c of clean) counts[c] = (counts[c] || 0) + 1;

  let score = 0;
  for (const [char, freq] of Object.entries(ENGLISH_FREQ)) {
    const observed = ((counts[char] || 0) / clean.length) * 100;
    // Lower chi-squared is better, so return inverse
    score += Math.abs(observed - freq);
  }
  return Math.max(0, 100 - score / 2);
}

// Classical Ciphers
function caesarShift(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return text.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + s) % 26) + base);
  });
}

function atbashCipher(text: string): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    if (code >= 97 && code <= 122)
      return String.fromCharCode(122 - (code - 97));
    if (code >= 65 && code <= 90) return String.fromCharCode(90 - (code - 65));
    return c;
  });
}

function vigenereDecode(text: string, key: string): string {
  if (!key) return text;
  const cleanKey = key.toLowerCase().replace(/[^a-z]/g, "");
  if (!cleanKey) return text;

  let kIdx = 0;
  return text.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    const shift = cleanKey.charCodeAt(kIdx % cleanKey.length) - 97;
    kIdx++;
    return String.fromCharCode(((code - base - shift + 26) % 26) + base);
  });
}

function decodeBase64Safe(text: string): string | null {
  try {
    return atob(text.trim());
  } catch {
    return null;
  }
}

function decodeHexSafe(text: string): string | null {
  try {
    const clean = text.trim().replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(clean) || clean.length % 2 !== 0) return null;
    let res = "";
    for (let i = 0; i < clean.length; i += 2) {
      res += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16));
    }
    return res;
  } catch {
    return null;
  }
}

function decodeBinarySafe(text: string): string | null {
  try {
    const clean = text
      .trim()
      .replace(/[^01\s]/g, "")
      .split(/\s+/);
    if (clean.length === 0 || clean[0].length === 0) return null;
    let res = "";
    for (const b of clean) {
      if (b.length > 0) res += String.fromCharCode(parseInt(b, 2));
    }
    return res;
  } catch {
    return null;
  }
}

export const Decoder: React.FC<DecoderProps> = ({ tool }) => {
  const [cipherText, setCipherText] = useState("Uryyb Sebz Rherxn Qri Gbbyf!");
  const [selectedMethod, setSelectedMethod] = useState<string>("auto");
  const [caesarShiftVal, setCaesarShiftVal] = useState(13);
  const [vigenereKey, setVigenereKey] = useState("KEY");
  const [copied, setCopied] = useState(false);

  // Auto-detection results
  const candidates = useMemo(() => {
    if (!cipherText.trim()) return [];

    const list: { name: string; decoded: string; score: number }[] = [];

    // Check Base64
    const b64 = decodeBase64Safe(cipherText);
    if (b64 && /^[\x20-\x7E\s]+$/.test(b64)) {
      list.push({
        name: "Base64",
        decoded: b64,
        score: scoreEnglishText(b64) + 20,
      });
    }

    // Check Hex
    const hex = decodeHexSafe(cipherText);
    if (hex && /^[\x20-\x7E\s]+$/.test(hex)) {
      list.push({
        name: "Hexadecimal ASCII",
        decoded: hex,
        score: scoreEnglishText(hex) + 15,
      });
    }

    // Check Binary
    const bin = decodeBinarySafe(cipherText);
    if (bin && /^[\x20-\x7E\s]+$/.test(bin)) {
      list.push({
        name: "Binary ASCII",
        decoded: bin,
        score: scoreEnglishText(bin) + 15,
      });
    }

    // Check Atbash
    const atbash = atbashCipher(cipherText);
    list.push({
      name: "Atbash Cipher",
      decoded: atbash,
      score: scoreEnglishText(atbash),
    });

    // Check ROT13
    const rot13 = caesarShift(cipherText, 13);
    list.push({
      name: "ROT13",
      decoded: rot13,
      score: scoreEnglishText(rot13) + 10,
    });

    // Check all other Caesar shifts
    for (let s = 1; s < 26; s++) {
      if (s === 13) continue;
      const dec = caesarShift(cipherText, s);
      list.push({
        name: `Caesar (Shift ${26 - s})`,
        decoded: dec,
        score: scoreEnglishText(dec),
      });
    }

    return list.sort((a, b) => b.score - a.score);
  }, [cipherText]);

  // Manual output
  const manualDecoded = useMemo(() => {
    switch (selectedMethod) {
      case "caesar":
        return caesarShift(cipherText, caesarShiftVal);
      case "rot13":
        return caesarShift(cipherText, 13);
      case "atbash":
        return atbashCipher(cipherText);
      case "vigenere":
        return vigenereDecode(cipherText, vigenereKey);
      case "base64":
        return decodeBase64Safe(cipherText) || "Invalid Base64 string";
      case "hex":
        return decodeHexSafe(cipherText) || "Invalid Hex string";
      case "binary":
        return decodeBinarySafe(cipherText) || "Invalid Binary string";
      default:
        return candidates[0]?.decoded || "";
    }
  }, [selectedMethod, cipherText, caesarShiftVal, vigenereKey, candidates]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300">
            Encrypted / Encoded Ciphertext
          </label>
          <textarea
            value={cipherText}
            onChange={(e) => setCipherText(e.target.value)}
            placeholder="Paste ciphertext to decode..."
            rows={4}
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Decoder Method Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Method:</span>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-200"
            >
              <option value="auto">✨ Auto-Detect Cipher</option>
              <option value="caesar">Caesar Shift (Manual Shift)</option>
              <option value="rot13">ROT13</option>
              <option value="atbash">Atbash Cipher</option>
              <option value="vigenere">Vigenère Cipher (Keyed)</option>
              <option value="base64">Base64</option>
              <option value="hex">Hexadecimal</option>
              <option value="binary">Binary</option>
            </select>
          </div>

          {selectedMethod === "caesar" && (
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-400">
                Shift: {caesarShiftVal}
              </span>
              <input
                type="range"
                min="1"
                max="25"
                value={caesarShiftVal}
                onChange={(e) => setCaesarShiftVal(Number(e.target.value))}
                className="w-32 accent-emerald-500"
              />
            </div>
          )}

          {selectedMethod === "vigenere" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Key:</span>
              <input
                type="text"
                value={vigenereKey}
                onChange={(e) => setVigenereKey(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-xs font-mono text-zinc-200"
              />
            </div>
          )}
        </div>

        {/* Results */}
        {selectedMethod === "auto" ? (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Auto-Detected Decryptions (Ranked by English Confidence)
            </h4>

            <div className="space-y-3">
              {candidates.slice(0, 5).map((cand, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition ${
                    idx === 0
                      ? "bg-emerald-950/20 border-emerald-500/40"
                      : "bg-zinc-900 border-zinc-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-200">
                        {cand.name}
                      </span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-medium">
                          Best Match
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(cand.decoded)}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                      title="Copy decoded"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-mono text-sm text-zinc-100 break-all select-all">
                    {cand.decoded}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                <LockOpen className="w-3.5 h-3.5 text-emerald-400" />
                Decoded Result ({selectedMethod.toUpperCase()})
              </h4>
              <button
                onClick={() => handleCopy(manualDecoded)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-zinc-100 select-all break-all min-h-24">
              {manualDecoded}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default Decoder;
