import React, { useState, useEffect, useCallback } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { copyToClipboard } from "@/lib/utils";
import {
  Wand2,
  Download,
  Copy,
  Check,
  Sparkles,
  UploadCloud,
  Trash2,
  RefreshCw,
} from "lucide-react";

export const ImageTracer: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [threshold, setThreshold] = useState<number>(128);
  const [invert, setInvert] = useState<boolean>(false);
  const [pathFill, setPathFill] = useState<string>("#0f172a");
  const [svgOutput, setSvgOutput] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isTracing, setIsTracing] = useState<boolean>(false);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 300, 300);

      // Draw star / emblem
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      const cx = 150;
      const cy = 150;
      const spikes = 5;
      const outerR = 90;
      const innerR = 40;
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerR;
        y = cy + Math.sin(rot) * outerR;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerR;
        y = cy + Math.sin(rot) * innerR;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerR);
      ctx.closePath();
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

  // Convert image pixels to simplified SVG polygon paths via run-length horizontal bands
  const traceImage = useCallback(() => {
    if (!imageSrc) return;
    setIsTracing(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const maxDim = 320; // scale for performant tracing
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsTracing(false);
        return;
      }

      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Group contiguous horizontal runs into SVG rectangle rects / paths
      const pathSegments: string[] = [];

      for (let y = 0; y < h; y++) {
        let runStart = -1;
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          // Perceived brightness
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          let isFilled = a > 50 && lum < threshold;
          if (invert) isFilled = !isFilled;

          if (isFilled) {
            if (runStart === -1) runStart = x;
          } else {
            if (runStart !== -1) {
              const runW = x - runStart;
              pathSegments.push(`M${runStart},${y}h${runW}v1h-${runW}z`);
              runStart = -1;
            }
          }
        }
        if (runStart !== -1) {
          const runW = w - runStart;
          pathSegments.push(`M${runStart},${y}h${runW}v1h-${runW}z`);
        }
      }

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <path fill="${pathFill}" d="${pathSegments.join("")}" />
</svg>`;

      setSvgOutput(svg);
      setIsTracing(false);
    };
    img.src = imageSrc;
  }, [imageSrc, threshold, invert, pathFill]);

  useEffect(() => {
    if (imageSrc) {
      traceImage();
    }
  }, [imageSrc, threshold, invert, pathFill, traceImage]);

  const handleCopy = async () => {
    await copyToClipboard(svgOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([svgOutput], { type: "image/svg+xml" });
    downloadBlob(blob, "traced-vector.svg", "image/svg+xml");
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                Bitmap to Vector SVG Tracer
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
                      setSvgOutput("");
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
                  Upload raster image (logo, icon, or drawing)
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Vectorizes bitmap into crisp scalable SVG vector paths
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
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Luminance Threshold
                    </label>
                    <span className="text-xs font-mono">{threshold}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="245"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Fill Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={pathFill}
                      onChange={(e) => setPathFill(e.target.value)}
                      className="w-8 h-8 rounded border p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={pathFill}
                      onChange={(e) => setPathFill(e.target.value)}
                      className="text-xs font-mono h-8 px-2 border rounded bg-background flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={invert}
                      onChange={(e) => setInvert(e.target.checked)}
                      className="rounded border-primary"
                    />
                    <span>Invert Colors</span>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {imageSrc && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Original Bitmap
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center bg-muted/20 min-h-[360px]">
                <img
                  src={imageSrc}
                  alt="Original raster"
                  className="max-h-[320px] max-w-full object-contain rounded border shadow-sm"
                />
              </CardContent>
            </Card>

            {/* Traced SVG */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Traced Vector SVG
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopy}
                      disabled={!svgOutput}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1 text-primary" />
                      )}
                      {copied ? "Copied" : "Copy SVG"}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDownload}
                      disabled={!svgOutput}
                    >
                      <Download className="h-4 w-4 mr-1" /> Download SVG
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center bg-muted/20 min-h-[360px]">
                {isTracing ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin" /> Vectorizing
                    paths...
                  </div>
                ) : svgOutput ? (
                  <div
                    className="max-h-[320px] max-w-full p-2 rounded border shadow-sm flex items-center justify-center"
                    style={{
                      backgroundImage:
                        "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 8px 8px",
                    }}
                    dangerouslySetInnerHTML={{ __html: svgOutput }}
                  />
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default ImageTracer;
