import React, { useState, useEffect, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { Frame, Download, Trash2, Sparkles, UploadCloud } from "lucide-react";

const RATIOS = [
  { label: "1:1 (Square)", w: 1, h: 1, pxW: 1080, pxH: 1080 },
  { label: "4:5 (Portrait)", w: 4, h: 5, pxW: 1080, pxH: 1350 },
  { label: "16:9 (Landscape)", w: 16, h: 9, pxW: 1920, pxH: 1080 },
  { label: "9:16 (Stories/Reels)", w: 9, h: 16, pxW: 1080, pxH: 1920 },
];

export const MatteGenny: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [aspectIndex, setAspectIndex] = useState<number>(0);
  const [matteType, setMatteType] = useState<"solid" | "blur">("solid");
  const [solidColor, setSolidColor] = useState<string>("#ffffff");
  const [padding, setPadding] = useState<number>(40);
  const [borderRadius, setBorderRadius] = useState<number>(16);
  const [dropShadow, setDropShadow] = useState<boolean>(true);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 600, 400);
      grad.addColorStop(0, "#06b6d4");
      grad.addColorStop(1, "#3b82f6");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 32px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sample Photography", 300, 200);

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
      imgRef.current = img;
      renderMatte();
    };
    img.src = imageSrc;
  }, [
    imageSrc,
    aspectIndex,
    matteType,
    solidColor,
    padding,
    borderRadius,
    dropShadow,
  ]);

  const renderMatte = () => {
    const img = imgRef.current;
    if (!img) return;

    const targetRatio = RATIOS[aspectIndex];
    const outW = targetRatio.pxW;
    const outH = targetRatio.pxH;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background Matte
    if (matteType === "blur") {
      ctx.save();
      // Draw zoomed blurred background
      ctx.filter = "blur(30px) brightness(0.9)";
      const scale =
        Math.max(outW / img.naturalWidth, outH / img.naturalHeight) * 1.2;
      const bgW = img.naturalWidth * scale;
      const bgH = img.naturalHeight * scale;
      ctx.drawImage(img, (outW - bgW) / 2, (outH - bgH) / 2, bgW, bgH);
      ctx.restore();
    } else {
      ctx.fillStyle = solidColor;
      ctx.fillRect(0, 0, outW, outH);
    }

    // Calculate inner image dimensions with padding
    const availW = outW - padding * 2;
    const availH = outH - padding * 2;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const availAspect = availW / availH;

    let drawW: number;
    let drawH: number;

    if (imgAspect > availAspect) {
      drawW = availW;
      drawH = availW / imgAspect;
    } else {
      drawH = availH;
      drawW = availH * imgAspect;
    }

    const drawX = (outW - drawW) / 2;
    const drawY = (outH - drawH) / 2;

    // Draw inner shadow
    if (dropShadow) {
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = "#000000";
      // Path for rounded rect
      ctx.beginPath();
      ctx.roundRect(drawX, drawY, drawW, drawH, borderRadius);
      ctx.fill();
      ctx.restore();
    }

    // Draw clipped inner image with rounded corners
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, drawW, drawH, borderRadius);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();

    setResultDataUrl(canvas.toDataURL("image/png"));
  };

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const parts = resultDataUrl.split(",");
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: "image/png" });
    downloadBlob(
      blob,
      `matte-${RATIOS[aspectIndex].label.split(" ")[0].replace(":", "x")}.png`,
    );
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Frame className="h-4 w-4 text-primary" />
                Matte & Frame Generator
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
                      setResultDataUrl(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!imageSrc ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium">
                  Upload photo to frame and letterbox
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Adds perfect aspect ratio mats, blurred backgrounds, and
                  border padding for social feeds
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Target Format
                  </label>
                  <select
                    value={aspectIndex}
                    onChange={(e) => setAspectIndex(Number(e.target.value))}
                    className="w-full h-8 text-xs border rounded bg-background px-2 font-medium"
                  >
                    {RATIOS.map((r, i) => (
                      <option key={r.label} value={i}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Matte Style
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-background rounded-md border text-xs">
                    <button
                      className={`py-1 rounded font-medium ${
                        matteType === "solid"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setMatteType("solid")}
                    >
                      Solid Color
                    </button>
                    <button
                      className={`py-1 rounded font-medium ${
                        matteType === "blur"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setMatteType("blur")}
                    >
                      Blurred Photo
                    </button>
                  </div>
                </div>

                {matteType === "solid" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Matte Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={solidColor}
                        onChange={(e) => setSolidColor(e.target.value)}
                        className="w-8 h-8 rounded border p-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={solidColor}
                        onChange={(e) => setSolidColor(e.target.value)}
                        className="text-xs font-mono h-8 px-2 border rounded bg-background flex-1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Padding
                    </label>
                    <span className="text-xs font-mono">{padding}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Corner Radius
                    </label>
                    <span className="text-xs font-mono">{borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dropShadow}
                      onChange={(e) => setDropShadow(e.target.checked)}
                      className="rounded border-primary"
                    />
                    <span>Drop Shadow</span>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Card */}
        {resultDataUrl && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {RATIOS[aspectIndex].label} Preview
                </CardTitle>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" /> Download High-Res
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 bg-muted/20 min-h-[420px]">
              <div
                className="max-h-[440px] max-w-full rounded border shadow-lg overflow-hidden flex items-center justify-center"
                style={{
                  backgroundImage:
                    "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 8px 8px",
                }}
              >
                <img
                  src={resultDataUrl}
                  alt="Matted"
                  className="max-h-[420px] max-w-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolShell>
  );
};

export default MatteGenny;
