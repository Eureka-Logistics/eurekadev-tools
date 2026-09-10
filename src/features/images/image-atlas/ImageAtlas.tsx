import React, { useState, useEffect, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import {
  Activity,
  Sparkles,
  UploadCloud,
  Trash2,
  Copy,
  Check,
  Eye,
} from "lucide-react";

interface ColorSample {
  hex: string;
  count: number;
  pct: number;
}

export const ImageAtlas: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    width: number;
    height: number;
    megapixels: string;
    aspectRatio: string;
  } | null>(null);
  const [dominantColors, setDominantColors] = useState<ColorSample[]>([]);
  const [hoverColor, setHoverColor] = useState<{
    r: number;
    g: number;
    b: number;
    hex: string;
  } | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const histCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 320;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Create rich color composition
      const grad = ctx.createLinearGradient(0, 0, 480, 320);
      grad.addColorStop(0, "#0284c7");
      grad.addColorStop(0.5, "#10b981");
      grad.addColorStop(1, "#f59e0b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 480, 320);

      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.arc(140, 160, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#6366f1";
      ctx.fillRect(280, 100, 120, 120);

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
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const mp = ((w * h) / 1000000).toFixed(2);
      const gcd = (a: number, b: number): number =>
        b === 0 ? a : gcd(b, a % b);
      const div = gcd(w, h);
      setMeta({
        width: w,
        height: h,
        megapixels: mp,
        aspectRatio: `${w / div}:${h / div}`,
      });

      // Draw to internal inspection canvas
      const canvas = mainCanvasRef.current;
      if (!canvas) return;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Calculate RGB & Lum histograms
      const rHist = new Uint32Array(256);
      const gHist = new Uint32Array(256);
      const bHist = new Uint32Array(256);
      const lHist = new Uint32Array(256);

      const colorBuckets = new Map<string, number>();
      const totalPixels = w * h;

      // Sample step for performance
      const step = Math.max(1, Math.floor(totalPixels / 25000));

      for (let i = 0; i < data.length; i += 4 * step) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        rHist[r]++;
        gHist[g]++;
        bHist[b]++;
        lHist[lum]++;

        // Quantize colors to 5-bit for palette clustering
        const qr = (r >> 4) << 4;
        const qg = (g >> 4) << 4;
        const qb = (b >> 4) << 4;
        const hex = `#${((1 << 24) + (qr << 16) + (qg << 8) + qb).toString(16).slice(1)}`;
        colorBuckets.set(hex, (colorBuckets.get(hex) || 0) + 1);
      }

      // Top dominant colors
      const sorted = Array.from(colorBuckets.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      const sumSamples = sorted.reduce((acc, curr) => acc + curr[1], 0);
      setDominantColors(
        sorted.map(([hex, count]) => ({
          hex,
          count,
          pct: Math.round((count / sumSamples) * 100),
        })),
      );

      // Render Histogram Canvas
      const hCanvas = histCanvasRef.current;
      if (!hCanvas) return;
      const hCtx = hCanvas.getContext("2d");
      if (!hCtx) return;

      const hw = hCanvas.width;
      const hh = hCanvas.height;
      hCtx.clearRect(0, 0, hw, hh);

      // Max value for scaling
      let maxVal = 1;
      for (let i = 0; i < 256; i++) {
        if (rHist[i] > maxVal) maxVal = rHist[i];
        if (gHist[i] > maxVal) maxVal = gHist[i];
        if (bHist[i] > maxVal) maxVal = bHist[i];
      }

      // Draw R, G, B channels
      const drawChannel = (hist: Uint32Array, color: string) => {
        hCtx.strokeStyle = color;
        hCtx.lineWidth = 1.5;
        hCtx.beginPath();
        for (let i = 0; i < 256; i++) {
          const x = (i / 255) * hw;
          const y = hh - (hist[i] / maxVal) * (hh - 10);
          if (i === 0) hCtx.moveTo(x, y);
          else hCtx.lineTo(x, y);
        }
        hCtx.stroke();
      };

      hCtx.globalCompositeOperation = "screen";
      drawChannel(rHist, "rgba(239, 68, 68, 0.8)");
      drawChannel(gHist, "rgba(34, 197, 94, 0.8)");
      drawChannel(bHist, "rgba(59, 130, 246, 0.8)");
      hCtx.globalCompositeOperation = "source-over";
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = [pixel[0], pixel[1], pixel[2]];
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    setHoverColor({ r, g, b, hex });
  };

  const copyHex = async (hex: string) => {
    await copyToClipboard(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Image Atlas & Color Inspector
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
                      setMeta(null);
                      setDominantColors([]);
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
                  Upload an image to inspect details
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Generates RGB histograms, color palettes, and pixel color
                  loupe
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : meta ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Dimensions
                  </span>
                  <span className="text-base font-bold font-mono">
                    {meta.width} &times; {meta.height} px
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Aspect Ratio
                  </span>
                  <span className="text-base font-bold font-mono">
                    {meta.aspectRatio}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Resolution
                  </span>
                  <span className="text-base font-bold font-mono">
                    {meta.megapixels} MP
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Raw Buffer
                  </span>
                  <span className="text-base font-bold font-mono">
                    {((meta.width * meta.height * 4) / (1024 * 1024)).toFixed(
                      1,
                    )}{" "}
                    MB
                  </span>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {imageSrc && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main image with loupe hover */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" /> Hover to Inspect
                    Pixel Color
                  </CardTitle>
                  {hoverColor && (
                    <div className="flex items-center gap-2 bg-muted px-2.5 py-1 rounded-full border text-xs font-mono">
                      <span
                        className="w-3.5 h-3.5 rounded-full border shadow-sm"
                        style={{ backgroundColor: hoverColor.hex }}
                      />
                      <span>{hoverColor.hex}</span>
                      <span className="text-muted-foreground">
                        rgb({hoverColor.r}, {hoverColor.g}, {hoverColor.b})
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center bg-muted/20 min-h-[360px]">
                <canvas
                  ref={mainCanvasRef}
                  onMouseMove={handleMouseMove}
                  className="max-h-[340px] max-w-full object-contain rounded border shadow-sm cursor-crosshair"
                />
              </CardContent>
            </Card>

            {/* Histogram & Palette column */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    RGB Color Histogram
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="bg-slate-950 p-3 rounded-lg border">
                    <canvas
                      ref={histCanvasRef}
                      width={280}
                      height={120}
                      className="w-full h-[120px]"
                    />
                  </div>
                  <div className="flex justify-between text-xs px-1 text-muted-foreground font-mono">
                    <span className="text-red-500 font-semibold">● Red</span>
                    <span className="text-green-500 font-semibold">
                      ● Green
                    </span>
                    <span className="text-blue-500 font-semibold">● Blue</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Dominant Color Palette
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {dominantColors.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => copyHex(c.hex)}
                        className="flex items-center gap-2 p-1.5 rounded border bg-muted/20 hover:bg-muted text-xs font-mono transition-colors"
                      >
                        <span
                          className="w-5 h-5 rounded border shadow-xs shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="truncate">{c.hex}</span>
                        <span className="ml-auto text-muted-foreground">
                          {copiedHex === c.hex ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-60" />
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default ImageAtlas;
