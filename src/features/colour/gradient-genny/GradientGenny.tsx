import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Palette, Copy, Check, Plus, Trash2, Sparkles } from "lucide-react";

interface Stop {
  id: string;
  color: string;
  pos: number;
}

const PRESETS = [
  {
    name: "Hyper",
    type: "linear",
    angle: 90,
    stops: [
      { id: "1", color: "#ec4899", pos: 0 },
      { id: "2", color: "#ef4444", pos: 50 },
      { id: "3", color: "#f59e0b", pos: 100 },
    ],
  },
  {
    name: "Oceanic",
    type: "linear",
    angle: 135,
    stops: [
      { id: "1", color: "#06b6d4", pos: 0 },
      { id: "2", color: "#3b82f6", pos: 100 },
    ],
  },
  {
    name: "Neon Glow",
    type: "radial",
    angle: 0,
    stops: [
      { id: "1", color: "#a855f7", pos: 0 },
      { id: "2", color: "#0f172a", pos: 100 },
    ],
  },
  {
    name: "Sunset",
    type: "linear",
    angle: 45,
    stops: [
      { id: "1", color: "#f43f5e", pos: 0 },
      { id: "2", color: "#fb923c", pos: 100 },
    ],
  },
  {
    name: "Emerald",
    type: "linear",
    angle: 90,
    stops: [
      { id: "1", color: "#10b981", pos: 0 },
      { id: "2", color: "#047857", pos: 100 },
    ],
  },
];

export const GradientGenny: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [gradType, setGradType] = useState<"linear" | "radial" | "conic">(
    "linear",
  );
  const [angle, setAngle] = useState<number>(90);
  const [stops, setStops] = useState<Stop[]>([
    { id: "1", color: "#3b82f6", pos: 0 },
    { id: "2", color: "#8b5cf6", pos: 100 },
  ]);
  const [copied, setCopied] = useState<boolean>(false);

  const cssGradient = useMemo(() => {
    const sortedStops = [...stops].sort((a, b) => a.pos - b.pos);
    const stopStr = sortedStops.map((s) => `${s.color} ${s.pos}%`).join(", ");

    if (gradType === "linear") {
      return `linear-gradient(${angle}deg, ${stopStr})`;
    } else if (gradType === "radial") {
      return `radial-gradient(circle at center, ${stopStr})`;
    } else {
      return `conic-gradient(from ${angle}deg at center, ${stopStr})`;
    }
  }, [gradType, angle, stops]);

  const cssCode = `background: ${cssGradient};`;

  const handleAddStop = () => {
    if (stops.length >= 6) return;
    const newStop: Stop = {
      id: Math.random().toString(36).slice(2, 7),
      color: "#ec4899",
      pos:
        Math.round(
          (stops[0]?.pos || 0) + (stops[stops.length - 1]?.pos || 100),
        ) / 2,
    };
    setStops([...stops, newStop]);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const handleUpdateStop = (id: string, updates: Partial<Stop>) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleCopy = async () => {
    await copyToClipboard(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyPreset = (p: (typeof PRESETS)[0]) => {
    setGradType(p.type as any);
    setAngle(p.angle);
    setStops(p.stops);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                CSS Gradient Generator
              </CardTitle>
              <div className="flex gap-1.5">
                {PRESETS.map((p) => (
                  <Button
                    key={p.name}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7 px-2"
                    onClick={() => applyPreset(p)}
                  >
                    <Sparkles className="h-3 w-3 mr-1 text-primary" />
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual gradient display */}
            <div
              className="h-48 rounded-xl border shadow-inner flex items-end justify-between p-4 transition-all"
              style={{ background: cssGradient }}
            >
              <div className="bg-black/60 backdrop-blur-xs text-white px-3 py-1.5 rounded-md font-mono text-xs shadow-md">
                {gradType.toUpperCase()} {gradType !== "radial" && `${angle}°`}
              </div>
              <Button size="sm" variant="secondary" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-1" />
                )}
                {copied ? "CSS Copied" : "Copy CSS"}
              </Button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Types & Angle */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Gradient Type
                  </label>
                  <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-md border text-xs">
                    {(["linear", "radial", "conic"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setGradType(t)}
                        className={`py-1 rounded font-medium capitalize transition-colors ${
                          gradType === t
                            ? "bg-background shadow text-foreground font-bold"
                            : "text-muted-foreground hover:bg-background/50"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {gradType !== "radial" && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Angle
                      </label>
                      <span className="text-xs font-mono">{angle}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={angle}
                      onChange={(e) => setAngle(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Color Stops Manager */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">
                    Color Stops
                  </label>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    onClick={handleAddStop}
                    disabled={stops.length >= 6}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Stop
                  </Button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {stops.map((stop) => (
                    <div
                      key={stop.id}
                      className="flex items-center gap-2 p-2 bg-muted/30 border rounded-lg"
                    >
                      <input
                        type="color"
                        value={stop.color}
                        onChange={(e) =>
                          handleUpdateStop(stop.id, { color: e.target.value })
                        }
                        className="w-7 h-7 rounded border p-0 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={stop.color}
                        onChange={(e) =>
                          handleUpdateStop(stop.id, { color: e.target.value })
                        }
                        className="w-20 font-mono text-xs h-7 px-1.5 border rounded bg-background"
                      />
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stop.pos}
                        onChange={(e) =>
                          handleUpdateStop(stop.id, {
                            pos: Number(e.target.value),
                          })
                        }
                        className="flex-1 h-1.5 bg-muted rounded appearance-none cursor-pointer"
                      />
                      <span className="w-8 font-mono text-xs text-right">
                        {stop.pos}%
                      </span>
                      <button
                        onClick={() => handleRemoveStop(stop.id)}
                        disabled={stops.length <= 2}
                        className="text-muted-foreground hover:text-destructive disabled:opacity-30 p-1"
                        title="Remove Stop"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated CSS code block */}
            <div className="bg-muted/40 p-3 rounded-lg border font-mono text-xs flex items-center justify-between">
              <code className="text-primary truncate mr-4">{cssCode}</code>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default GradientGenny;
