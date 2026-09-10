import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight } from "lucide-react";

const COMMON_VALUES = [
  4, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96,
];

export const PxToRem: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [baseSize, setBaseSize] = useState<number>(16);
  const [pxValue, setPxValue] = useState<string>("24");
  const [remValue, setRemValue] = useState<string>("1.5");

  const handlePxChange = (val: string) => {
    setPxValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && baseSize > 0) {
      setRemValue(Number((num / baseSize).toFixed(4)).toString());
    } else {
      setRemValue("");
    }
  };

  const handleRemChange = (val: string) => {
    setRemValue(val);
    const num = parseFloat(val);
    if (!isNaN(num) && baseSize > 0) {
      setPxValue(Number((num * baseSize).toFixed(2)).toString());
    } else {
      setPxValue("");
    }
  };

  const handleBaseChange = (base: number) => {
    setBaseSize(base);
    const num = parseFloat(pxValue);
    if (!isNaN(num) && base > 0) {
      setRemValue(Number((num / base).toFixed(4)).toString());
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ArrowLeftRight className="h-4 w-4 text-primary" />
                PX to REM Converter
              </CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground font-medium">
                  Root Base Size:
                </span>
                <div className="flex gap-1 bg-muted p-1 rounded-md">
                  {[12, 14, 16, 18, 20].map((b) => (
                    <button
                      key={b}
                      onClick={() => handleBaseChange(b)}
                      className={`px-2 py-0.5 rounded font-mono font-medium ${
                        baseSize === b
                          ? "bg-background shadow text-foreground font-bold"
                          : "text-muted-foreground hover:bg-background/50"
                      }`}
                    >
                      {b}px
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interactive Bidirectional Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-muted/20 p-6 rounded-xl border">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Pixels (px)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={pxValue}
                    onChange={(e) => handlePxChange(e.target.value)}
                    className="w-full text-2xl font-bold font-mono px-4 py-3 border rounded-lg bg-background"
                  />
                  <span className="absolute right-4 top-4 font-mono text-sm text-muted-foreground">
                    px
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground block">
                  REM Units (rem)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={remValue}
                    onChange={(e) => handleRemChange(e.target.value)}
                    className="w-full text-2xl font-bold font-mono px-4 py-3 border rounded-lg bg-background"
                  />
                  <span className="absolute right-4 top-4 font-mono text-sm text-muted-foreground">
                    rem
                  </span>
                </div>
              </div>
            </div>

            {/* Quick conversion reference table */}
            <div className="space-y-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Common CSS & Tailwind Conversion Scale
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {COMMON_VALUES.map((px) => {
                  const rem = Number((px / baseSize).toFixed(4));
                  const isCurrent = Number(pxValue) === px;
                  return (
                    <button
                      key={px}
                      onClick={() => handlePxChange(px.toString())}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                        isCurrent
                          ? "bg-primary text-primary-foreground font-bold border-primary"
                          : "bg-muted/10 hover:bg-muted/30"
                      }`}
                    >
                      <span className="font-mono text-xs">{px}px</span>
                      <span className="font-mono text-xs opacity-80">
                        {rem}rem
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default PxToRem;
