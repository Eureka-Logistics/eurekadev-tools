import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Palette, Copy, Check, Sparkles } from "lucide-react";

export const ColourConverter: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [hexInput, setHexInput] = useState<string>("#3b82f6");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Normalize hex
  const cleanHex = useMemo(() => {
    let h = hexInput.trim().replace("#", "");
    if (h.length === 3) {
      h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    }
    if (/^[0-9a-fA-F]{6}$/.test(h)) {
      return `#${h.toLowerCase()}`;
    }
    return "#3b82f6";
  }, [hexInput]);

  // Conversions
  const { r, g, b } = useMemo(() => {
    const num = parseInt(cleanHex.slice(1), 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  }, [cleanHex]);

  const hsl = useMemo(() => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn:
          h = (gn - bn) / d + (gn < bn ? 6 : 0);
          break;
        case gn:
          h = (bn - rn) / d + 2;
          break;
        case bn:
          h = (rn - gn) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }, [r, g, b]);

  const hsv = useMemo(() => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
      switch (max) {
        case rn:
          h = (gn - bn) / d + (gn < bn ? 6 : 0);
          break;
        case gn:
          h = (bn - rn) / d + 2;
          break;
        case bn:
          h = (rn - gn) / d + 4;
          break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  }, [r, g, b]);

  const cmyk = useMemo(() => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const k = 1 - Math.max(rn, gn, bn);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = (1 - rn - k) / (1 - k);
    const m = (1 - gn - k) / (1 - k);
    const y = (1 - bn - k) / (1 - k);
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100),
    };
  }, [r, g, b]);

  const formats = [
    { label: "HEX", val: cleanHex.toUpperCase() },
    { label: "RGB", val: `rgb(${r}, ${g}, ${b})` },
    { label: "RGBA", val: `rgba(${r}, ${g}, ${b}, 1)` },
    { label: "HSL", val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "HSV", val: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
    {
      label: "CMYK",
      val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
    },
    { label: "CSS Variables", val: `--color: ${r}, ${g}, ${b};` },
  ];

  const handleCopy = async (val: string, key: string) => {
    await copyToClipboard(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRandom = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    setHexInput(randomHex);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Color Format Converter
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleRandom}>
                <Sparkles className="h-4 w-4 mr-1 text-primary" /> Random Color
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Color preview banner */}
            <div
              className="h-28 rounded-xl border shadow-inner flex items-center justify-center transition-colors"
              style={{ backgroundColor: cleanHex }}
            >
              <div className="bg-black/50 backdrop-blur-xs text-white px-4 py-2 rounded-lg font-mono text-lg font-bold shadow-md">
                {cleanHex.toUpperCase()}
              </div>
            </div>

            {/* Input & Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  HEX Code or Picker
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={cleanHex}
                    onChange={(e) => setHexInput(e.target.value)}
                    className="w-10 h-10 rounded border p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={hexInput}
                    onChange={(e) => setHexInput(e.target.value)}
                    placeholder="#3b82f6"
                    className="flex-1 font-mono text-sm px-3 h-10 border rounded bg-background"
                  />
                </div>
              </div>

              {/* RGB Channel Sliders */}
              <div className="space-y-2 bg-muted/30 p-3 rounded-lg border text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 font-bold text-red-500">R</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={r}
                    onChange={(e) => {
                      const newR = Number(e.target.value);
                      const hex = `#${((1 << 24) + (newR << 16) + (g << 8) + b).toString(16).slice(1)}`;
                      setHexInput(hex);
                    }}
                    className="flex-1 h-1.5 bg-muted rounded appearance-none cursor-pointer"
                  />
                  <span className="w-8 font-mono text-right">{r}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 font-bold text-green-500">G</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={g}
                    onChange={(e) => {
                      const newG = Number(e.target.value);
                      const hex = `#${((1 << 24) + (r << 16) + (newG << 8) + b).toString(16).slice(1)}`;
                      setHexInput(hex);
                    }}
                    className="flex-1 h-1.5 bg-muted rounded appearance-none cursor-pointer"
                  />
                  <span className="w-8 font-mono text-right">{g}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 font-bold text-blue-500">B</span>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={b}
                    onChange={(e) => {
                      const newB = Number(e.target.value);
                      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + newB).toString(16).slice(1)}`;
                      setHexInput(hex);
                    }}
                    className="flex-1 h-1.5 bg-muted rounded appearance-none cursor-pointer"
                  />
                  <span className="w-8 font-mono text-right">{b}</span>
                </div>
              </div>
            </div>

            {/* Converted Formats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {formats.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/10 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground block">
                      {f.label}
                    </span>
                    <span className="font-mono text-sm">{f.val}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => handleCopy(f.val, f.label)}
                  >
                    {copiedKey === f.label ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 opacity-70" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default ColourConverter;
