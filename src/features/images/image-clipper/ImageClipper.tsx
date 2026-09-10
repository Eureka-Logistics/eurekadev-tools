import React, { useState, useEffect, useCallback } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import {
  UploadCloud,
  Download,
  Trash2,
  Sparkles,
  Scissors,
  RefreshCw,
} from "lucide-react";

export const ImageClipper: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("image.png");
  const [trimMode, setTrimMode] = useState<"transparent" | "color">(
    "transparent",
  );
  const [targetColor, setTargetColor] = useState<string>("#ffffff");
  const [tolerance, setTolerance] = useState<number>(10);
  const [padding, setPadding] = useState<number>(0);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [trimmedDims, setTrimmedDims] = useState<{
    w: number;
    h: number;
    x: number;
    y: number;
  } | null>(null);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 400, 400);
      // Draw centered circle with big transparent margins
      ctx.fillStyle = "#6366f1";
      ctx.beginPath();
      ctx.arc(200, 200, 80, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("CLIP ME", 200, 200);

      setImageSrc(canvas.toDataURL("image/png"));
      setFileName("sample-circle.png");
      setTrimMode("transparent");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  const processTrim = useCallback(() => {
    if (!imageSrc) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setOrigDims({ w, h });

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const [tr, tg, tb] = hexToRgb(targetColor);
      const tolDist = (tolerance / 100) * 441.67; // max distance sqrt(255^2*3)

      const isPixelTrim = (idx: number): boolean => {
        const a = data[idx + 3];
        if (trimMode === "transparent") {
          return a <= tolerance * 2.55;
        } else {
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);
          return dist <= tolDist && a > 0;
        }
      };

      let minX = w;
      let minY = h;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          if (!isPixelTrim(idx)) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX < minX || maxY < minY) {
        // Entire image trimmed or empty
        minX = 0;
        minY = 0;
        maxX = w - 1;
        maxY = h - 1;
      }

      // Add padding
      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropW = Math.min(w - cropX, maxX - minX + 1 + padding * 2);
      const cropH = Math.min(h - cropY, maxY - minY + 1 + padding * 2);

      setTrimmedDims({ w: cropW, h: cropH, x: cropX, y: cropY });

      const outCanvas = document.createElement("canvas");
      outCanvas.width = cropW;
      outCanvas.height = cropH;
      const outCtx = outCanvas.getContext("2d");
      if (outCtx) {
        outCtx.drawImage(
          canvas,
          cropX,
          cropY,
          cropW,
          cropH,
          0,
          0,
          cropW,
          cropH,
        );
        setResultDataUrl(outCanvas.toDataURL("image/png"));
      }
      setIsProcessing(false);
    };
    img.src = imageSrc;
  }, [imageSrc, trimMode, targetColor, tolerance, padding]);

  useEffect(() => {
    if (imageSrc) {
      processTrim();
    }
  }, [imageSrc, trimMode, targetColor, tolerance, padding, processTrim]);

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const base = fileName.replace(/\.[^/.]+$/, "");
    downloadBlob(
      dataUrlToBlob(resultDataUrl),
      `${base}-trimmed.png`,
      "image/png",
    );
  };

  const dataUrlToBlob = (dataUrl: string): Blob => {
    const parts = dataUrl.split(",");
    const byteString = atob(parts[1]);
    const mimeString = parts[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Controls Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Scissors className="h-4 w-4 text-primary" />
                Image Clipper & Auto-Trim
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
                      setOrigDims(null);
                      setTrimmedDims(null);
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
                  Click to upload an image or drop here
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  PNG, WebP, JPG supported
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-lg">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Trim Target
                  </label>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-background rounded-md border text-xs">
                    <button
                      className={`py-1.5 px-2 rounded font-medium transition-colors ${
                        trimMode === "transparent"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setTrimMode("transparent")}
                    >
                      Transparent
                    </button>
                    <button
                      className={`py-1.5 px-2 rounded font-medium transition-colors ${
                        trimMode === "color"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setTrimMode("color")}
                    >
                      Solid Color
                    </button>
                  </div>
                </div>

                {trimMode === "color" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={targetColor}
                        onChange={(e) => setTargetColor(e.target.value)}
                        className="w-9 h-9 p-0 border rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={targetColor}
                        onChange={(e) => setTargetColor(e.target.value)}
                        className="text-xs font-mono h-9 px-2 border rounded bg-background flex-1"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Tolerance
                    </label>
                    <span className="text-xs font-mono">{tolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    value={tolerance}
                    onChange={(e) => setTolerance(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Margin Padding
                    </label>
                    <span className="text-xs font-mono">{padding}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={padding}
                    onChange={(e) => setPadding(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Comparison Card */}
        {imageSrc && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Original Image</span>
                  {origDims && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {origDims.w} &times; {origDims.h} px
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-4 bg-muted/20 min-h-[300px] border-t">
                <div
                  className="max-h-[360px] max-w-full overflow-hidden rounded border shadow-sm"
                  style={{
                    backgroundImage:
                      "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 8px 8px",
                  }}
                >
                  <img
                    src={imageSrc}
                    alt="Original"
                    className="max-h-[360px] object-contain mx-auto"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span>Trimmed Result</span>
                    {trimmedDims && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {trimmedDims.w} &times; {trimmedDims.h} px
                      </span>
                    )}
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    disabled={!resultDataUrl || isProcessing}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download PNG
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-4 bg-muted/20 min-h-[300px] border-t">
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin" /> Processing
                    trim...
                  </div>
                ) : resultDataUrl ? (
                  <div className="space-y-3 flex flex-col items-center">
                    <div
                      className="max-h-[340px] max-w-full overflow-hidden rounded border shadow-sm p-1"
                      style={{
                        backgroundImage:
                          "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 8px 8px",
                      }}
                    >
                      <img
                        src={resultDataUrl}
                        alt="Trimmed"
                        className="max-h-[340px] object-contain mx-auto"
                      />
                    </div>
                    {origDims && trimmedDims && (
                      <div className="text-xs text-muted-foreground text-center">
                        Trimmed {origDims.w - trimmedDims.w}px width and{" "}
                        {origDims.h - trimmedDims.h}px height (
                        {Math.round(
                          (1 -
                            (trimmedDims.w * trimmedDims.h) /
                              (origDims.w * origDims.h)) *
                            100,
                        )}
                        % area reduction)
                      </div>
                    )}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default ImageClipper;
