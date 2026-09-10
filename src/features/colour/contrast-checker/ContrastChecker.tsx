import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, CheckCircle2, XCircle } from "lucide-react";

export const ContrastChecker: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [fgColor, setFgColor] = useState<string>("#ffffff");
  const [bgColor, setBgColor] = useState<string>("#2563eb");

  const getLuminance = (hex: string): number => {
    let clean = hex.replace("#", "");
    if (clean.length === 3)
      clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
    const num = parseInt(clean, 16) || 0;
    const r = ((num >> 16) & 255) / 255;
    const g = ((num >> 8) & 255) / 255;
    const b = (num & 255) / 255;

    const transform = (c: number) =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    return (
      0.2126 * transform(r) + 0.7152 * transform(g) + 0.0722 * transform(b)
    );
  };

  const ratio = useMemo(() => {
    const l1 = getLuminance(fgColor);
    const l2 = getLuminance(bgColor);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }, [fgColor, bgColor]);

  const formattedRatio = ratio.toFixed(2);

  const passes = {
    normalAA: ratio >= 4.5,
    normalAAA: ratio >= 7.0,
    largeAA: ratio >= 3.0,
    largeAAA: ratio >= 4.5,
    uiComponents: ratio >= 3.0,
  };

  const handleSwap = () => {
    const temp = fgColor;
    setFgColor(bgColor);
    setBgColor(temp);
  };

  const handlePreset = (fg: string, bg: string) => {
    setFgColor(fg);
    setBgColor(bg);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Colors selector card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                WCAG Color Contrast Checker
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreset("#0f172a", "#f8fafc")}
                >
                  Dark on Light
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreset("#ffffff", "#0f172a")}
                >
                  Light on Dark
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePreset("#ffffff", "#2563eb")}
                >
                  Primary Brand
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Text (Foreground) Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded border p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 font-mono text-sm px-3 h-10 border rounded bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-center sm:pt-4">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleSwap}
                  title="Swap Colors"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground block">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded border p-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 font-mono text-sm px-3 h-10 border rounded bg-background"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ratio & Compliance Badges */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contrast Ratio
            </span>
            <div className="text-5xl font-black font-mono tracking-tight text-primary">
              {formattedRatio}:1
            </div>
            <div className="text-xs font-medium">
              {ratio >= 7.0 ? (
                <span className="text-green-600 font-bold">
                  Excellent — Enhanced AAA
                </span>
              ) : ratio >= 4.5 ? (
                <span className="text-green-600 font-bold">
                  Good — Passes Minimum AA
                </span>
              ) : ratio >= 3.0 ? (
                <span className="text-amber-500 font-bold">
                  Fair — Large text only
                </span>
              ) : (
                <span className="text-destructive font-bold">
                  Fails WCAG 2.1 Criteria
                </span>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                WCAG 2.1 Compliance Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                  <div>
                    <div className="font-semibold text-xs">
                      Normal Text (AA)
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Requires 4.5:1 ratio
                    </div>
                  </div>
                  {passes.normalAA ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> PASS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-destructive">
                      <XCircle className="h-4 w-4" /> FAIL
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                  <div>
                    <div className="font-semibold text-xs">
                      Normal Text (AAA)
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Requires 7.0:1 ratio
                    </div>
                  </div>
                  {passes.normalAAA ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> PASS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-destructive">
                      <XCircle className="h-4 w-4" /> FAIL
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                  <div>
                    <div className="font-semibold text-xs">
                      Large Text &gt; 18pt (AA)
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Requires 3.0:1 ratio
                    </div>
                  </div>
                  {passes.largeAA ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> PASS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-destructive">
                      <XCircle className="h-4 w-4" /> FAIL
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg border bg-muted/20">
                  <div>
                    <div className="font-semibold text-xs">
                      UI Components & Icons
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Requires 3.0:1 ratio
                    </div>
                  </div>
                  {passes.uiComponents ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> PASS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-destructive">
                      <XCircle className="h-4 w-4" /> FAIL
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Mockup Preview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Live Render Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="p-8 rounded-xl border space-y-4 transition-colors shadow-inner"
              style={{ backgroundColor: bgColor, color: fgColor }}
            >
              <h2 className="text-2xl font-bold tracking-tight">
                Empowering teams with seamless internal tools
              </h2>
              <p className="text-sm leading-relaxed opacity-95 max-w-2xl">
                Accessibility ensures everyone can read and interact with
                developer tools comfortably. This container renders your
                foreground color directly on your chosen background color.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span
                  className="px-3 py-1.5 rounded-md text-xs font-semibold border"
                  style={{ borderColor: fgColor }}
                >
                  Outlined Component
                </span>
                <span className="text-xs font-medium">
                  Sample link reference &rarr;
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default ContrastChecker;
