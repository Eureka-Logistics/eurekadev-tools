import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Palette, Copy, Check, Sparkles, Code2 } from "lucide-react";

interface Shade {
  stop: number;
  hex: string;
}

const SHADE_STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

export const TailwindShades: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [baseHex, setBaseHex] = useState<string>("#3b82f6");
  const [colorName, setColorName] = useState<string>("brand");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Convert Hex to HSL
  const hexToHsl = (hex: string): [number, number, number] => {
    let clean = hex.replace("#", "");
    if (clean.length === 3)
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    const num = parseInt(clean, 16) || 0;
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  // Generate 11 shades curve
  const shades: Shade[] = useMemo(() => {
    const [h, s] = hexToHsl(baseHex);
    // Standard lightness curve for Tailwind stops
    const lightnessMap: Record<number, number> = {
      50: 97,
      100: 93,
      200: 86,
      300: 74,
      400: 62,
      500: 48,
      600: 40,
      700: 32,
      800: 24,
      900: 16,
      950: 10,
    };

    return SHADE_STOPS.map((stop) => {
      const l = lightnessMap[stop];
      // Slight saturation adjustment at extreme ends
      const satAdjust = stop <= 100 ? s * 0.75 : stop >= 900 ? s * 0.9 : s;
      return {
        stop,
        hex: hslToHex(h, Math.round(satAdjust), l),
      };
    });
  }, [baseHex]);

  const tailwindConfigSnippet = useMemo(() => {
    const entries = shades
      .map((s) => `      ${s.stop}: '${s.hex}',`)
      .join("\n");
    return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        ${colorName}: {\n${entries}\n        }\n      }\n    }\n  }\n}`;
  }, [shades, colorName]);

  const cssVarsSnippet = useMemo(() => {
    const lines = shades
      .map((s) => `  --${colorName}-${s.stop}: ${s.hex};`)
      .join("\n");
    return `:root {\n${lines}\n}`;
  }, [shades, colorName]);

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleRandom = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    setBaseHex(randomHex);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Tailwind CSS Color Shades Generator
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleRandom}>
                <Sparkles className="h-4 w-4 mr-1 text-primary" /> Random Color
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Base 500 Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={baseHex}
                    onChange={(e) => setBaseHex(e.target.value)}
                    className="w-10 h-10 rounded border p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={baseHex}
                    onChange={(e) => setBaseHex(e.target.value)}
                    className="flex-1 font-mono text-sm px-3 h-10 border rounded bg-background"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Color Token Key Name
                </label>
                <input
                  type="text"
                  value={colorName}
                  onChange={(e) =>
                    setColorName(
                      e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                    )
                  }
                  placeholder="brand"
                  className="w-full font-mono text-sm px-3 h-10 border rounded bg-background"
                />
              </div>
            </div>

            {/* Shades palette list */}
            <div className="space-y-1.5 pt-2">
              {shades.map((shade) => {
                const isLight = shade.stop <= 400;
                return (
                  <div
                    key={shade.stop}
                    className="flex items-center justify-between p-2.5 rounded-lg border shadow-xs transition-transform hover:scale-[1.01]"
                    style={{
                      backgroundColor: shade.hex,
                      color: isLight ? "#0f172a" : "#ffffff",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm w-12">
                        {shade.stop}
                      </span>
                      <span className="font-mono text-xs opacity-90">
                        {shade.hex.toUpperCase()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2"
                      style={{ color: isLight ? "#0f172a" : "#ffffff" }}
                      onClick={() =>
                        handleCopy(shade.hex, `shade-${shade.stop}`)
                      }
                    >
                      {copiedKey === `shade-${shade.stop}` ? (
                        <Check className="h-3.5 w-3.5 mr-1 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1 opacity-70" />
                      )}
                      {copiedKey === `shade-${shade.stop}` ? "Copied" : "Copy"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Code exports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  tailwind.config.js
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(tailwindConfigSnippet, "tw-config")}
                >
                  {copiedKey === "tw-config" ? (
                    <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copiedKey === "tw-config" ? "Copied" : "Copy Config"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                readOnly
                value={tailwindConfigSnippet}
                className="w-full h-52 font-mono text-xs p-3 rounded-md bg-muted/40 border resize-none focus:outline-none"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  CSS Variables
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(cssVarsSnippet, "css-vars")}
                >
                  {copiedKey === "css-vars" ? (
                    <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copiedKey === "css-vars" ? "Copied" : "Copy CSS"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                readOnly
                value={cssVarsSnippet}
                className="w-full h-52 font-mono text-xs p-3 rounded-md bg-muted/40 border resize-none focus:outline-none"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolShell>
  );
};

export default TailwindShades;
