import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Sparkles } from "lucide-react";

interface Deficiency {
  id: string;
  name: string;
  desc: string;
  matrix: number[];
}

// Vienot / Brettel simulation transformation matrices (3x3 row-major)
const DEFICIENCIES: Deficiency[] = [
  {
    id: "normal",
    name: "Normal Vision",
    desc: "Standard trichromatic color perception",
    matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  },
  {
    id: "deuteranomaly",
    name: "Deuteranomaly (Green-Weak)",
    desc: "Most common deficiency (~5% of men)",
    matrix: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858],
  },
  {
    id: "deuteranopia",
    name: "Deuteranopia (Green-Blind)",
    desc: "Absence of green photoreceptor cones (~1% of men)",
    matrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  },
  {
    id: "protanopia",
    name: "Protanopia (Red-Blind)",
    desc: "Absence of red photoreceptor cones (~1% of men)",
    matrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  },
  {
    id: "tritanopia",
    name: "Tritanopia (Blue-Blind)",
    desc: "Absence of blue photoreceptor cones (rare)",
    matrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  },
  {
    id: "achromatopsia",
    name: "Achromatopsia (Monochromacy)",
    desc: "Complete absence of color perception",
    matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
  },
];

export const ColorblindSim: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [baseHex, setBaseHex] = useState<string>("#ef4444");

  const simulateColor = (hex: string, matrix: number[]): string => {
    let clean = hex.replace("#", "");
    if (clean.length === 3)
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    const num = parseInt(clean, 16) || 0;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;

    const simR = Math.min(
      255,
      Math.max(0, Math.round(r * matrix[0] + g * matrix[1] + b * matrix[2])),
    );
    const simG = Math.min(
      255,
      Math.max(0, Math.round(r * matrix[3] + g * matrix[4] + b * matrix[5])),
    );
    const simB = Math.min(
      255,
      Math.max(0, Math.round(r * matrix[6] + g * matrix[7] + b * matrix[8])),
    );

    return `#${((1 << 24) + (simR << 16) + (simG << 8) + simB).toString(16).slice(1)}`;
  };

  const palette = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

  const simulatedCards = useMemo(() => {
    return DEFICIENCIES.map((def) => ({
      ...def,
      simBase: simulateColor(baseHex, def.matrix),
      simPalette: palette.map((c) => simulateColor(c, def.matrix)),
    }));
  }, [baseHex]);

  const handleLoadSample = () => {
    setBaseHex("#10b981");
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Color Blindness Perception Simulator
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleLoadSample}>
                <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Test
                Pattern
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 bg-muted/30 p-4 rounded-lg border">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Test Single Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={baseHex}
                    onChange={(e) => setBaseHex(e.target.value)}
                    className="w-9 h-9 rounded border p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={baseHex}
                    onChange={(e) => setBaseHex(e.target.value)}
                    className="w-28 font-mono text-xs h-9 px-2 border rounded bg-background"
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Quick Palette Test
                </label>
                <div className="flex gap-2">
                  {palette.map((c) => (
                    <button
                      key={c}
                      onClick={() => setBaseHex(c)}
                      className={`h-9 flex-1 rounded border transition-transform ${
                        baseHex.toLowerCase() === c.toLowerCase()
                          ? "ring-2 ring-primary scale-105"
                          : ""
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparative Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {simulatedCards.map((def) => (
            <Card
              key={def.id}
              className={def.id === "normal" ? "border-primary/50" : ""}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center justify-between">
                  <span>{def.name}</span>
                  {def.id === "normal" && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono">
                      ORIGINAL
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{def.desc}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Simulated test color */}
                <div
                  className="h-16 rounded-lg border shadow-inner flex items-center justify-center font-mono text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: def.simBase }}
                >
                  <span className="bg-black/50 px-2 py-1 rounded backdrop-blur-xs">
                    {def.simBase.toUpperCase()}
                  </span>
                </div>

                {/* Simulated palette strip */}
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Palette Appearance
                  </span>
                  <div className="grid grid-cols-5 gap-1">
                    {def.simPalette.map((col, idx) => (
                      <div
                        key={idx}
                        className="h-7 rounded border shadow-2xs"
                        style={{ backgroundColor: col }}
                        title={col}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ToolShell>
  );
};

export default ColorblindSim;
