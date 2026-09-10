import React, { useState, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import {
  Pipette,
  Copy,
  Check,
  Sparkles,
  UploadCloud,
  Trash2,
} from "lucide-react";

interface ExtractedColor {
  hex: string;
  rgb: string;
  count: number;
  percentage: number;
}

export const PaletteExtractor: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Landscape artwork with multiple rich colors
      const grad = ctx.createLinearGradient(0, 0, 600, 400);
      grad.addColorStop(0, "#38bdf8"); // sky blue
      grad.addColorStop(0.4, "#fbbf24"); // golden sun
      grad.addColorStop(0.6, "#f97316"); // orange hills
      grad.addColorStop(1, "#15803d"); // deep forest
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);

      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(300, 200, 80, 0, Math.PI * 2);
      ctx.fill();

      setImageSrc(canvas.toDataURL("image/png"));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 200;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, 200, 150);
      const imgData = ctx.getImageData(0, 0, 200, 150);
      const data = imgData.data;

      // Color quantization map (5-bit grouping)
      const colorMap = new Map<
        string,
        { r: number; g: number; b: number; count: number }
      >();

      for (let i = 0; i < data.length; i += 16) {
        // sample every 4th pixel for speed
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a > 128) {
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;
          const key = `${qr},${qg},${qb}`;

          const existing = colorMap.get(key);
          if (existing) {
            existing.count++;
          } else {
            colorMap.set(key, { r: qr, g: qg, b: qb, count: 1 });
          }
        }
      }

      const sorted = Array.from(colorMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      const totalSampled = sorted.reduce((sum, c) => sum + c.count, 0) || 1;

      const extracted: ExtractedColor[] = sorted.map((c) => {
        const hex = `#${((1 << 24) + (c.r << 16) + (c.g << 8) + c.b).toString(16).slice(1)}`;
        return {
          hex,
          rgb: `rgb(${c.r}, ${c.g}, ${c.b})`,
          count: c.count,
          percentage: Math.round((c.count / totalSampled) * 100),
        };
      });

      setColors(extracted);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCopyCssVariables = async () => {
    const cssVars = colors
      .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
      .join("\n");
    const snippet = `:root {\n${cssVars}\n}`;
    await copyToClipboard(snippet);
    setCopiedKey("css-vars");
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Pipette className="h-4 w-4 text-primary" />
                Image Color Palette Extractor
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                </Button>
                {imageSrc && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setImageSrc(null);
                      setColors([]);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!imageSrc ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium">
                  Upload photo or artwork to extract colors
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Extracts dominant, vibrant, and theme palette colors
                  client-side
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="flex items-center justify-center p-3 bg-muted/20 border rounded-xl">
                  <img
                    src={imageSrc}
                    alt="Uploaded"
                    className="max-h-[260px] max-w-full object-contain rounded-lg shadow-sm"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Extracted Palette ({colors.length} Colors)
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={handleCopyCssVariables}
                    >
                      {copiedKey === "css-vars" ? (
                        <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 mr-1" />
                      )}
                      {copiedKey === "css-vars" ? "Copied" : "CSS Variables"}
                    </Button>
                  </div>

                  {/* Connected palette strip */}
                  <div className="flex h-14 rounded-lg overflow-hidden border shadow-inner">
                    {colors.map((c) => (
                      <div
                        key={c.hex}
                        className="flex-1 h-full"
                        style={{ backgroundColor: c.hex }}
                        title={`${c.hex} (${c.percentage}%)`}
                      />
                    ))}
                  </div>

                  {/* Individual Swatch list */}
                  <div className="grid grid-cols-2 gap-2">
                    {colors.map((c) => (
                      <div
                        key={c.hex}
                        className="flex items-center justify-between p-2 rounded-lg border bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-6 h-6 rounded border shadow-xs"
                            style={{ backgroundColor: c.hex }}
                          />
                          <div>
                            <span className="font-mono text-xs font-semibold block">
                              {c.hex.toUpperCase()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {c.percentage}% prominence
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => handleCopy(c.hex, c.hex)}
                        >
                          {copiedKey === c.hex ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 opacity-60" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default PaletteExtractor;
