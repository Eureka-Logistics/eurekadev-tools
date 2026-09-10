import React, { useState, useEffect, useCallback } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Sparkles, Lock, Unlock, Copy, Check, RefreshCw } from "lucide-react";

interface PaletteSlot {
  id: string;
  hex: string;
  locked: boolean;
}

export const PaletteGenny: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [slots, setSlots] = useState<PaletteSlot[]>([
    { id: "1", hex: "#264653", locked: false },
    { id: "2", hex: "#2a9d8f", locked: false },
    { id: "3", hex: "#e9c46a", locked: false },
    { id: "4", hex: "#f4a261", locked: false },
    { id: "5", hex: "#e76f51", locked: false },
  ]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getRandomHarmoniousHex = (baseHue?: number): string => {
    const h =
      baseHue !== undefined
        ? (baseHue + Math.floor(Math.random() * 60) - 30 + 360) % 360
        : Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 40) + 50; // 50-90%
    const l = Math.floor(Math.random() * 50) + 25; // 25-75%

    const sDec = s / 100;
    const lDec = l / 100;
    const a = sDec * Math.min(lDec, 1 - lDec);
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = lDec - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const generateNewPalette = useCallback(() => {
    const randomBaseHue = Math.floor(Math.random() * 360);
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.locked) return slot;
        return {
          ...slot,
          hex: getRandomHarmoniousHex(randomBaseHue),
        };
      }),
    );
  }, []);

  // Listen to spacebar keydown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        (e.target as HTMLElement)?.tagName !== "INPUT"
      ) {
        e.preventDefault();
        generateNewPalette();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generateNewPalette]);

  const toggleLock = (id: string) => {
    setSlots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s)),
    );
  };

  const handleCopy = async (hex: string, key: string) => {
    await copyToClipboard(hex);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCopyAll = async () => {
    const hexList = slots.map((s) => s.hex);
    await copyToClipboard(JSON.stringify(hexList, null, 2));
    setCopiedKey("all");
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Dynamic Palette Generator
              </CardTitle>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-muted-foreground">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 border rounded bg-muted font-mono text-[10px]">
                    Space
                  </kbd>{" "}
                  to generate
                </span>
                <Button size="sm" variant="outline" onClick={handleCopyAll}>
                  {copiedKey === "all" ? (
                    <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copiedKey === "all" ? "Copied" : "Export JSON"}
                </Button>
                <Button size="sm" onClick={generateNewPalette}>
                  <RefreshCw className="h-3.5 w-3.5 mr-1" /> Roll New
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* 5 Column interactive interactive palette cards */}
            <div className="grid grid-cols-1 sm:grid-cols-5 h-[380px] rounded-xl overflow-hidden border shadow-inner">
              {slots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex-1 flex flex-col justify-between p-4 transition-all relative group"
                  style={{ backgroundColor: slot.hex }}
                >
                  {/* Top Lock button */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => toggleLock(slot.id)}
                      className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors shadow-sm"
                      title={slot.locked ? "Click to Unlock" : "Click to Lock"}
                    >
                      {slot.locked ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <Unlock className="h-4 w-4 opacity-70" />
                      )}
                    </button>
                  </div>

                  {/* Bottom Hex details & copy */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleCopy(slot.hex, slot.id)}
                      className="w-full py-2 px-3 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-xs text-white font-mono text-sm font-bold flex items-center justify-between transition-colors"
                    >
                      <span>{slot.hex.toUpperCase()}</span>
                      {copiedKey === slot.id ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 opacity-70" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default PaletteGenny;
