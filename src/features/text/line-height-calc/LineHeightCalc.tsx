import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { AlignLeft, Copy, Check } from "lucide-react";

export const LineHeightCalc: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [contentWidth, setContentWidth] = useState<number>(650);
  const [copied, setCopied] = useState<boolean>(false);

  // Optimal line height formula based on font size and measure
  // Larger font size -> tighter line-height (e.g. 1.15 - 1.25 for display)
  // Body text -> 1.45 - 1.6 depending on width
  const { lineHeight, unitlessLineHeight, charPerLine } = useMemo(() => {
    let lhRatio = 1.6;
    if (fontSize > 32) {
      lhRatio = 1.15;
    } else if (fontSize > 24) {
      lhRatio = 1.25;
    } else if (fontSize > 18) {
      lhRatio = 1.4;
    } else {
      // Body text scale: wider columns need slightly more leading
      lhRatio = 1.45 + (contentWidth / 1000) * 0.2;
    }

    const unitless = Number(lhRatio.toFixed(2));
    const pxHeight = Math.round(fontSize * unitless);
    const estCpl = Math.round(contentWidth / (fontSize * 0.52));

    return {
      lineHeight: pxHeight,
      unitlessLineHeight: unitless,
      charPerLine: estCpl,
    };
  }, [fontSize, contentWidth]);

  const cssSnippet = `font-size: ${fontSize}px;\nline-height: ${unitlessLineHeight}; /* ${lineHeight}px */\nmax-width: ${contentWidth}px;`;

  const handleCopy = async () => {
    await copyToClipboard(cssSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlignLeft className="h-4 w-4 text-primary" />
                Line Height & Measure Calculator
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Font Size
                  </label>
                  <span className="text-xs font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="48"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Column Width
                  </label>
                  <span className="text-xs font-mono">{contentWidth}px</span>
                </div>
                <input
                  type="range"
                  min="320"
                  max="900"
                  value={contentWidth}
                  onChange={(e) => setContentWidth(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted/20 border rounded-lg text-center">
                <span className="text-xs text-muted-foreground block">
                  Optimal Line Height
                </span>
                <span className="text-xl font-bold font-mono text-primary">
                  {unitlessLineHeight} ({lineHeight}px)
                </span>
              </div>
              <div className="p-3 bg-muted/20 border rounded-lg text-center">
                <span className="text-xs text-muted-foreground block">
                  Measure (Chars per Line)
                </span>
                <span className="text-xl font-bold font-mono">
                  ~{charPerLine} ch
                </span>
              </div>
              <div className="p-3 bg-muted/20 border rounded-lg text-center">
                <span className="text-xs text-muted-foreground block">
                  Readability Range
                </span>
                <span className="text-sm font-bold mt-1 block">
                  {charPerLine >= 45 && charPerLine <= 75 ? (
                    <span className="text-green-600">Ideal (45-75 ch)</span>
                  ) : charPerLine < 45 ? (
                    <span className="text-amber-500">A bit narrow</span>
                  ) : (
                    <span className="text-amber-500">A bit wide</span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview Block */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Rendered Typography Block
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copied ? "Copied" : "Copy CSS"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex justify-center p-6 bg-muted/10">
            <div
              className="space-y-4 border-l-2 border-primary/30 pl-4 py-1"
              style={{
                maxWidth: `${contentWidth}px`,
                fontSize: `${fontSize}px`,
                lineHeight: unitlessLineHeight,
              }}
            >
              <h3 className="font-bold tracking-tight text-lg">
                Typography in Modern User Interfaces
              </h3>
              <p className="text-muted-foreground">
                Optimal vertical rhythm and measure create effortless reading
                experiences. When lines are too long, the reader’s eye has
                trouble traveling from the end of one line to the beginning of
                the next. Balanced line spacing guides the scan path naturally
                without visual fatigue.
              </p>
              <p className="text-muted-foreground">
                In responsive web layouts, keeping your measure between 45 and
                75 characters ensures consistent reading stamina across desktop
                viewports and compact mobile screens.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default LineHeightCalc;
