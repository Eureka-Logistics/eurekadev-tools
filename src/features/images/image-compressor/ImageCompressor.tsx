import React, { useState, useRef, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";
import {
  UploadCloud,
  Download,
  Trash2,
  Sparkles,
  Sliders,
  ArrowRight,
} from "lucide-react";

export const ImageCompressor: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSize, setOrigSize] = useState<number>(0);
  const [origDimensions, setOrigDimensions] = useState<{
    w: number;
    h: number;
  }>({ w: 0, h: 0 });
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [maxWidth, setMaxWidth] = useState<number>(1920);
  const [format, setFormat] = useState<
    "image/jpeg" | "image/webp" | "image/png"
  >("image/webp");
  const [fileName, setFileName] = useState<string>("image");

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1600;
    canvas.height = 1000;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw rich photo-like gradient
      const grad = ctx.createLinearGradient(0, 0, 1600, 1000);
      grad.addColorStop(0, "#1e3a8a");
      grad.addColorStop(0.5, "#3b82f6");
      grad.addColorStop(1, "#93c5fd");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1600, 1000);

      // Add circles and text
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * 1600,
          Math.random() * 1000,
          50 + Math.random() * 100,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("EUREKA COMPRESSOR TEST", 800, 500);

      canvas.toBlob((blob) => {
        if (blob) {
          setOrigSize(blob.size);
          const url = URL.createObjectURL(blob);
          setImageSrc(url);
          setFileName("sample-banner");
          setOrigDimensions({ w: 1600, h: 1000 });
        }
      }, "image/png");
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setOrigSize(file.size);
    setFileName(file.name.replace(/\.[^/.]+$/, ""));
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  // Compress whenever imageSrc, quality, maxWidth, or format changes
  useEffect(() => {
    if (!imageSrc) {
      setCompressedBlob(null);
      setCompressedUrl(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      setOrigDimensions({ w: img.naturalWidth, h: img.naturalHeight });

      // Scale dimensions if exceeds maxWidth
      let w = img.naturalWidth;
      let h = img.naturalHeight;
      if (w > maxWidth) {
        h = Math.round((h * maxWidth) / w);
        w = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedBlob(blob);
              if (compressedUrl) URL.revokeObjectURL(compressedUrl);
              setCompressedUrl(URL.createObjectURL(blob));
            }
          },
          format,
          quality / 100,
        );
      }
    };
    img.src = imageSrc;
  }, [imageSrc, quality, maxWidth, format]);

  const handleDownload = () => {
    if (!compressedBlob) return;
    const ext =
      format === "image/webp" ? "webp" : format === "image/png" ? "png" : "jpg";
    downloadBlob(compressedBlob, `${fileName}-compressed.${ext}`);
  };

  const handleClear = () => {
    setImageSrc(null);
    setCompressedBlob(null);
    setCompressedUrl(null);
  };

  const percentSaved =
    origSize && compressedBlob
      ? Math.max(
          0,
          Math.round(((origSize - compressedBlob.size) / origSize) * 100),
        )
      : 0;

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          {!imageSrc && (
            <Button variant="outline" size="sm" onClick={handleLoadSample}>
              <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
              Load Sample
            </Button>
          )}
          {imageSrc && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              Clear
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={!compressedBlob}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download (
            {compressedBlob ? formatBytes(compressedBlob.size) : "0 B"})
          </Button>
        </div>
      }
    >
      {!imageSrc ? (
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">
                Drop image to shrink file size
              </h3>
              <p className="text-xs text-muted-foreground">
                Lossy & lossless client-side compression (JPEG, WebP, PNG). Zero
                file uploads.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow">
                <span>Select File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <Button variant="outline" size="sm" onClick={handleLoadSample}>
                Use Sample
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Stats & Compression Results Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-card/60">
              <span className="text-xs text-muted-foreground font-medium">
                Original Size
              </span>
              <p className="text-lg font-bold font-mono mt-1 text-foreground">
                {formatBytes(origSize)}
              </p>
              <span className="text-[11px] text-muted-foreground font-mono">
                {origDimensions.w} x {origDimensions.h} px
              </span>
            </Card>

            <Card className="p-4 bg-card/60 border-primary/40">
              <span className="text-xs text-muted-foreground font-medium">
                Compressed Size
              </span>
              <p className="text-lg font-bold font-mono mt-1 text-primary">
                {compressedBlob
                  ? formatBytes(compressedBlob.size)
                  : "Calculating..."}
              </p>
              <span className="text-[11px] text-muted-foreground font-mono">
                Format: {format.split("/")[1].toUpperCase()}
              </span>
            </Card>

            <Card className="p-4 bg-card/60 border-emerald-500/40 bg-emerald-500/5">
              <span className="text-xs text-muted-foreground font-medium">
                Saved Space
              </span>
              <p className="text-lg font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                {percentSaved}% smaller
              </p>
              <span className="text-[11px] text-emerald-600/80 font-mono">
                -
                {formatBytes(
                  Math.max(0, origSize - (compressedBlob?.size || 0)),
                )}
              </span>
            </Card>
          </div>

          {/* Controls Bar */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary" />
                Compression Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              {/* Quality */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Quality</span>
                  <span className="font-mono text-muted-foreground">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Format */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground">
                  Output Format
                </span>
                <div className="flex rounded-md bg-muted p-0.5">
                  {(["image/webp", "image/jpeg", "image/png"] as const).map(
                    (fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormat(fmt)}
                        className={`flex-1 py-1 px-2 rounded text-xs font-mono transition-colors uppercase ${
                          format === fmt
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {fmt.split("/")[1]}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Max Width */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground">
                  Max Width / Resize
                </span>
                <select
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-md border border-input bg-transparent text-xs font-mono"
                >
                  <option value={3840}>3840 px (4K)</option>
                  <option value={1920}>1920 px (Full HD)</option>
                  <option value={1280}>1280 px (HD 720p)</option>
                  <option value={800}>800 px (Web standard)</option>
                  <option value={400}>400 px (Thumbnail)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Visual Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="py-2.5 px-4 border-b border-border/40">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Original
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center min-h-[300px] bg-muted/20">
                <img
                  src={imageSrc}
                  alt="Original preview"
                  className="max-h-[350px] max-w-full object-contain rounded"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2.5 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-xs font-semibold uppercase text-primary">
                  Compressed Output
                </CardTitle>
                <div className="flex items-center text-xs text-emerald-600 font-bold gap-1">
                  <span>{percentSaved}% Saved</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center min-h-[300px] bg-muted/20">
                {compressedUrl && (
                  <img
                    src={compressedUrl}
                    alt="Compressed preview"
                    className="max-h-[350px] max-w-full object-contain rounded"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ToolShell>
  );
};

export default ImageCompressor;
