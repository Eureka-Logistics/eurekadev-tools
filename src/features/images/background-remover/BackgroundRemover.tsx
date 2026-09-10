import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { removeBackground } from "./utils";
import { downloadBlob } from "@/lib/download";
import {
  UploadCloud,
  Download,
  Trash2,
  Sparkles,
  Pipette,
  Sliders,
  CheckCircle2,
} from "lucide-react";

export const BackgroundRemover: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState<number>(25);
  const [feather, setFeather] = useState<number>(2);
  const [pickedColor, setPickedColor] = useState<{
    x: number;
    y: number;
    rgb?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const originalImageRef = useRef<HTMLImageElement | null>(null);

  // Load sample image on demand
  const handleLoadSample = () => {
    // Generate a test canvas with a solid white background and a colorful Eureka badge
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Solid background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 600, 600);

      // Draw stylized badge
      ctx.fillStyle = "#2563eb";
      ctx.beginPath();
      ctx.arc(300, 300, 180, 0, Math.PI * 2);
      ctx.fill();

      // Inner star/circle
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(300, 300, 110, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("EUREKA", 300, 300);

      const url = canvas.toDataURL("image/png");
      setImageSrc(url);
      setPickedColor(null);
    }
  };

  const processImage = useCallback(() => {
    const img = originalImageRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return;

    setIsProcessing(true);
    // Use requestAnimationFrame so UI remains responsive
    requestAnimationFrame(() => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const originalData = ctx.getImageData(0, 0, width, height);

      // Process removal
      const processed = removeBackground(originalData, {
        tolerance,
        feather,
        sampleX: pickedColor?.x,
        sampleY: pickedColor?.y,
      });

      ctx.putImageData(processed, 0, 0);
      setResultDataUrl(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    });
  }, [tolerance, feather, pickedColor]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        originalImageRef.current = img;
        processImage();
      };
      img.src = imageSrc;
    } else {
      originalImageRef.current = null;
      setResultDataUrl(null);
    }
  }, [imageSrc, processImage]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setPickedColor(null);
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = originalCanvasRef.current;
    const img = originalImageRef.current;
    if (!canvas || !img) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Sample color
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const p = ctx.getImageData(clickX, clickY, 1, 1).data;
      setPickedColor({
        x: clickX,
        y: clickY,
        rgb: `rgb(${p[0]}, ${p[1]}, ${p[2]})`,
      });
    }
  };

  const handleDownload = () => {
    if (!resultDataUrl) return;
    fetch(resultDataUrl)
      .then((res) => res.blob())
      .then((blob) => downloadBlob(blob, "background-removed.png"));
  };

  const handleClear = () => {
    setImageSrc(null);
    setResultDataUrl(null);
    setPickedColor(null);
  };

  // Draw original preview
  useEffect(() => {
    if (imageSrc && originalCanvasRef.current && originalImageRef.current) {
      const canvas = originalCanvasRef.current;
      const img = originalImageRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
      }
    }
  }, [imageSrc]);

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          {!imageSrc && (
            <Button variant="outline" size="sm" onClick={handleLoadSample}>
              <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
              Load Sample Image
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
            disabled={!resultDataUrl}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download Transparent PNG
          </Button>
        </div>
      }
    >
      {/* Upload Dropzone if no image */}
      {!imageSrc ? (
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">
                Upload an image to remove background
              </h3>
              <p className="text-xs text-muted-foreground">
                Supports PNG, JPEG, WebP. 100% client-side processing — your
                image never leaves your computer.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow">
                <span>Select Image</span>
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
                Use Sample Badge
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Controls Bar */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  Keying & Tolerance Controls
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Pipette className="w-3.5 h-3.5 text-primary" />
                  <span>
                    Click anywhere on the Original image to sample that
                    background color
                  </span>
                  {pickedColor?.rgb && (
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-border shadow-sm ml-1"
                      style={{ backgroundColor: pickedColor.rgb }}
                      title={`Sampled: ${pickedColor.rgb}`}
                    />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              {/* Tolerance */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    Color Match Tolerance
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {tolerance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  Increase if background remnants remain; decrease if subject
                  parts are cut out.
                </p>
              </div>

              {/* Feathering */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    Edge Feathering & Smoothing
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {feather}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={feather}
                  onChange={(e) => setFeather(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-[11px] text-muted-foreground">
                  Softens transparent boundaries to eliminate pixelated fringes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comparison Views: Original vs Removed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Original Canvas (Click to sample) */}
            <Card>
              <CardHeader className="py-2.5 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-sm font-semibold">
                  Original Image (Click to sample color)
                </CardTitle>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {originalImageRef.current?.naturalWidth}x
                  {originalImageRef.current?.naturalHeight}
                </span>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center min-h-[360px] bg-muted/20 overflow-auto">
                <canvas
                  ref={originalCanvasRef}
                  onClick={handleCanvasClick}
                  className="max-h-[420px] max-w-full object-contain cursor-crosshair rounded shadow-sm border border-border/50"
                  title="Click anywhere to set the background color target"
                />
              </CardContent>
            </Card>

            {/* Result Canvas (Checkered transparent pattern) */}
            <Card>
              <CardHeader className="py-2.5 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <CardTitle className="text-sm font-semibold">
                    Background Removed (Transparent PNG)
                  </CardTitle>
                </div>
                {isProcessing && (
                  <span className="text-[11px] text-primary animate-pulse font-mono">
                    Processing...
                  </span>
                )}
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center min-h-[360px] overflow-auto relative">
                {/* CSS Checkered pattern for transparency */}
                <div
                  className="w-full h-full min-h-[340px] flex items-center justify-center rounded border border-border/50 p-4"
                  style={{
                    backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                  }}
                >
                  {resultDataUrl && (
                    <img
                      src={resultDataUrl}
                      alt="Background removed output"
                      className="max-h-[400px] max-w-full object-contain select-none shadow-md"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ToolShell>
  );
};

export default BackgroundRemover;
