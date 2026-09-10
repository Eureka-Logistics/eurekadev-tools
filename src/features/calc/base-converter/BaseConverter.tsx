import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { Copy, Check, Binary, Hash } from "lucide-react";

interface BaseConverterProps {
  tool: ToolDefinition;
}

export const BaseConverter: React.FC<BaseConverterProps> = ({ tool }) => {
  const [dec, setDec] = useState("255");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // BigInt parse safe
  let bigNum = 0n;
  let isValid = true;
  try {
    bigNum = BigInt(dec || "0");
  } catch {
    isValid = false;
  }

  const hexVal = isValid ? bigNum.toString(16).toUpperCase() : "Invalid";
  const binVal = isValid ? bigNum.toString(2) : "Invalid";
  const octVal = isValid ? bigNum.toString(8) : "Invalid";
  const base36Val = isValid ? bigNum.toString(36).toUpperCase() : "Invalid";

  // Group binary into nibbles
  const formatBinary = (bin: string) => {
    if (bin === "Invalid") return bin;
    const pad = bin.padStart(Math.ceil(bin.length / 4) * 4, "0");
    return pad.match(/.{1,4}/g)?.join(" ") || bin;
  };

  const handleCopy = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Base values list */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-emerald-400" />
              Decimal (Base 10)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={dec}
                onChange={(e) => setDec(e.target.value.replace(/[^0-9-]/g, ""))}
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-base text-zinc-100 focus:border-emerald-500"
              />
              <button
                onClick={() => handleCopy(dec, "dec")}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
              >
                {copiedKey === "dec" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Hexadecimal (Base 16)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-base text-emerald-400 select-all overflow-x-auto">
                0x{hexVal}
              </div>
              <button
                onClick={() => handleCopy(`0x${hexVal}`, "hex")}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
              >
                {copiedKey === "hex" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Binary className="w-3.5 h-3.5 text-emerald-400" />
              Binary (Base 2 - Nibbles)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-base text-cyan-400 select-all overflow-x-auto">
                {formatBinary(binVal)}
              </div>
              <button
                onClick={() => handleCopy(binVal, "bin")}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
              >
                {copiedKey === "bin" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Octal (Base 8)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-base text-zinc-200 select-all overflow-x-auto">
                0o{octVal}
              </div>
              <button
                onClick={() => handleCopy(`0o${octVal}`, "oct")}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
              >
                {copiedKey === "oct" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">
              Base 36 (Alphanumeric)
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-base text-zinc-200 select-all overflow-x-auto">
                {base36Val}
              </div>
              <button
                onClick={() => handleCopy(base36Val, "b36")}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition"
              >
                {copiedKey === "b36" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bitwise Breakdown */}
        {isValid && (
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
            <h4 className="text-xs font-semibold text-zinc-300">Bitwise Integer Representation</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">8-bit Unsigned</span>
                <span className="text-zinc-200 font-bold">{Number(BigInt.asUintN(8, bigNum))}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">8-bit Signed (2's)</span>
                <span className="text-zinc-200 font-bold">{Number(BigInt.asIntN(8, bigNum))}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">16-bit Unsigned</span>
                <span className="text-zinc-200 font-bold">{Number(BigInt.asUintN(16, bigNum))}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                <span className="text-zinc-500 block">32-bit Signed</span>
                <span className="text-zinc-200 font-bold">{Number(BigInt.asIntN(32, bigNum))}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default BaseConverter;
