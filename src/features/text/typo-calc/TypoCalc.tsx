import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Type, Copy, Check } from "lucide-react";

interface TypoScale {
  name: string;
  ratio: number;
}

const SCALES: TypoScale[] = [
  { name: "Minor Second (1.067)", ratio: 1.067 },
  { name: "Major Second (1.125)", ratio: 1.125 },
  { name: "Minor Third (1.200)", ratio: 1.2 },
  { name: "Major Third (1.250)", ratio: 1.25 },
  { name: "Perfect Fourth (1.333)", ratio: 1.333 },
  { name: "Augmented Fourth (1.414)", ratio: 1.414 },
  { name: "Perfect Fifth (1.500)", ratio: 1.5 },
  { name: "Golden Ratio (1.618)", ratio: 1.618 },
];

const STEPS = [
  { label: "xs", step: -2 },
  { label: "sm", step: -1 },
  { label: "base", step: 0 },
  { label: "lg", step: 1 },
  { label: "xl", step: 2 },
  { label: "2xl", step: 3 },
  { label: "3xl", step: 4 },
  { label: "4xl", step: 5 },
  { label: "5xl", step: 6 },
];

export const TypoCalc: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [baseSize, setBaseSize] = useState<number>(16);
  const [selectedRatio, setSelectedRatio] = useState<number>(1.25);
  const [sampleText, setSampleText] = useState<string>(
    "Visual Typographic Hierarchy",
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const calculatedSteps = useMemo(() => {
    return STEPS.map((s) => {
      const px =
        Math.round(baseSize * Math.pow(selectedRatio, s.step) * 100) / 100;
      const rem = Number((px / 16).toFixed(3));
      return {
        ...s,
        px,
        rem,
      };
    });
  }, [baseSize, selectedRatio]);

  const cssSnippet = useMemo(() => {
    const lines = calculatedSteps
      .map((s) => `  --font-${s.label}: ${s.rem}rem; /* ${s.px}px */`)
      .join("\n");
    return `:root {\n${lines}\n}`;
  }, [calculatedSteps]);

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                Modular Typographic Scale Calculator
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border">
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Base Font Size (px)
                </label>
                <input
                  type="number"
                  min="10"
                  max="32"
                  value={baseSize}
                  onChange={(e) =>
                    setBaseSize(Math.max(8, Number(e.target.value)))
                  }
                  className="w-full text-sm font-mono px-3 h-9 border rounded bg-background"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Typographic Scale Ratio
                </label>
                <select
                  value={selectedRatio}
                  onChange={(e) => setSelectedRatio(Number(e.target.value))}
                  className="w-full text-xs h-9 px-2 border rounded bg-background font-medium"
                >
                  {SCALES.map((s) => (
                    <option key={s.name} value={s.ratio}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Preview Sentence
                </label>
                <input
                  type="text"
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  className="w-full text-sm px-3 h-9 border rounded bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hierarchy Visualizer */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Computed Modular Scale
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy(cssSnippet, "css-snippet")}
              >
                {copiedKey === "css-snippet" ? (
                  <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copiedKey === "css-snippet" ? "Copied" : "Copy CSS Tokens"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            {calculatedSteps.map((s) => (
              <div
                key={s.label}
                className="flex flex-col sm:flex-row sm:items-baseline justify-between p-3 rounded-lg border bg-muted/10 hover:bg-muted/30 transition-colors gap-2"
              >
                <div className="flex items-center gap-3 shrink-0 sm:w-48">
                  <span className="font-mono text-xs font-bold uppercase w-10 px-1 py-0.5 bg-muted rounded text-center">
                    {s.label}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {s.px}px / {s.rem}rem
                  </span>
                </div>

                <div
                  className="truncate font-semibold tracking-tight"
                  style={{ fontSize: `${s.px}px`, lineHeight: 1.2 }}
                >
                  {sampleText}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default TypoCalc;
