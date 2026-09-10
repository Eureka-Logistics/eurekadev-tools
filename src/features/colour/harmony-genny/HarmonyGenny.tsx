import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Sparkles, Copy, Check, SlidersHorizontal } from "lucide-react";

interface HarmonyRule {
  name: string;
  desc: string;
  getAngles: (base: number) => number[];
}

const HARMONIES: HarmonyRule[] = [
  {
    name: "Complementary",
    desc: "Directly opposite on the color wheel (180°)",
    getAngles: (b) => [b, (b + 180) % 360],
  },
  {
    name: "Analogous",
    desc: "Adjacent colors for serene, natural palettes (±30°)",
    getAngles: (b) => [(b + 330) % 360, b, (b + 30) % 360],
  },
  {
    name: "Triadic",
    desc: "Evenly spaced triangles for vibrant balance (120°)",
    getAngles: (b) => [b, (b + 120) % 360, (b + 240) % 360],
  },
  {
    name: "Split-Complementary",
    desc: "Base plus the two colors adjacent to its complement (150°, 210°)",
    getAngles: (b) => [b, (b + 150) % 360, (b + 210) % 360],
  },
  {
    name: "Tetradic / Square",
    desc: "Four colors arranged into two complementary pairs (90°)",
    getAngles: (b) => [b, (b + 90) % 360, (b + 180) % 360, (b + 270) % 360],
  },
];

export const HarmonyGenny: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [baseHue, setBaseHue] = useState<number>(220);
  const [saturation, setSaturation] = useState<number>(80);
  const [lightness, setLightness] = useState<number>(55);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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

  const currentHex = hslToHex(baseHue, saturation, lightness);

  const results = useMemo(() => {
    return HARMONIES.map((h) => {
      const angles = h.getAngles(baseHue);
      const colors = angles.map((ang) => hslToHex(ang, saturation, lightness));
      return {
        ...h,
        colors,
      };
    });
  }, [baseHue, saturation, lightness]);

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRandom = () => {
    setBaseHue(Math.floor(Math.random() * 360));
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-primary" />
                Color Harmony Explorer
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleRandom}>
                <Sparkles className="h-4 w-4 mr-1 text-primary" /> Random Base
                Color
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border items-center">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Base Color
                </label>
                <div className="flex items-center gap-2">
                  <span
                    className="w-8 h-8 rounded border shadow-xs shrink-0"
                    style={{ backgroundColor: currentHex }}
                  />
                  <span className="font-mono text-sm font-bold">
                    {currentHex.toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Base Hue
                  </label>
                  <span className="text-xs font-mono">{baseHue}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={baseHue}
                  onChange={(e) => setBaseHue(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Saturation
                  </label>
                  <span className="text-xs font-mono">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Lightness
                  </label>
                  <span className="text-xs font-mono">{lightness}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  value={lightness}
                  onChange={(e) => setLightness(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Harmonies list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((harm) => (
            <Card key={harm.name}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {harm.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">{harm.desc}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() =>
                      handleCopy(harm.colors.join(", "), harm.name)
                    }
                  >
                    {copiedKey === harm.name ? (
                      <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    {copiedKey === harm.name ? "Copied" : "Copy All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex h-16 rounded-lg overflow-hidden border shadow-inner">
                  {harm.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopy(c, `${harm.name}-${i}`)}
                      className="flex-1 h-full flex flex-col justify-end p-2 transition-transform hover:scale-105 relative group"
                      style={{ backgroundColor: c }}
                      title={`Click to copy ${c}`}
                    >
                      <span className="bg-black/60 text-white font-mono text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedKey === `${harm.name}-${i}`
                          ? "COPIED"
                          : c.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground px-1">
                  {harm.colors.map((c, i) => (
                    <span key={i}>{c.toUpperCase()}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ToolShell>
  );
};

export default HarmonyGenny;
