import React, { useState, useEffect, useCallback, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import {
  Sparkles,
  Download,
  Trash2,
  UploadCloud,
  RefreshCw,
} from "lucide-react";

export const ArtworkEnhancer: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [grain, setGrain] = useState<number>(25);
  const [vignette, setVignette] = useState<number>(30);
  const [contrast, setContrast] = useState<number>(115);
  const [brightness, setBrightness] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(110);
  const [filterPreset, setFilterPreset] = useState<
    "none" | "vintage" | "sepia" | "cyberpunk" | "bw"
  >("none");
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 640, 420);
      grad.addColorStop(0, "#f97316");
      grad.addColorStop(0.5, "#ec4899");
      grad.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 640, 420);

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(320, 210, 100, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e1b4b";
      ctx.font = "bold 28px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SUNSET RETRO", 320, 220);

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

  const processEnhance = useCallback(() => {
    const img = imgRef.current;
    if (!img || !imageSrc) return;
    setIsProcessing(true);

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Apply CSS filters first (brightness, contrast, saturation)
    let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (filterPreset === "sepia") filterStr += " sepia(70%)";
    if (filterPreset === "bw") filterStr += " grayscale(100%)";
    ctx.filter = filterStr;
    ctx.drawImage(img, 0, 0, w, h);
    ctx.filter = "none";

    // Apply pixel-level procedural effects (Film Grain & Vignette)
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.sqrt(cx * cx + cy * cy);
    const vigStrength = vignette / 100;
    const grainAmount = grain * 0.6;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;

        // Film grain noise
        if (grain > 0) {
          const noise = (Math.random() - 0.5) * grainAmount;
          data[idx] = Math.min(255, Math.max(0, data[idx] + noise));
          data[idx + 1] = Math.min(255, Math.max(0, data[idx + 1] + noise));
          data[idx + 2] = Math.min(255, Math.max(0, data[idx + 2] + noise));
        }

        // Vignette falloff
        if (vignette > 0) {
          const dist = Math.hypot(x - cx, y - cy);
          const factor = Math.max(0, 1 - (dist / maxRadius) * vigStrength);
          data[idx] *= factor;
          data[idx + 1] *= factor;
          data[idx + 2] *= factor;
        }

        // Cyberpunk tint
        if (filterPreset === "cyberpunk") {
          data[idx] = Math.min(255, data[idx] * 0.8 + 30);
          data[idx + 2] = Math.min(255, data[idx + 2] * 1.2 + 20);
        } else if (filterPreset === "vintage") {
          data[idx] = Math.min(255, data[idx] * 1.1 + 10);
          data[idx + 1] = Math.min(255, data[idx + 1] * 0.95);
          data[idx + 2] = Math.min(255, data[idx + 2] * 0.85);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
    setResultDataUrl(canvas.toDataURL("image/png"));
    setIsProcessing(false);
  }, [
    imageSrc,
    grain,
    vignette,
    contrast,
    brightness,
    saturation,
    filterPreset,
  ]);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      processEnhance();
    };
    img.src = imageSrc;
  }, [imageSrc, processEnhance]);

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
    downloadBlob(blob, "enhanced-artwork.png", "image/png");
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Artwork & Film Grain Enhancer
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
                  Upload an image or artwork
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Adds procedural film grain, analog textures, vignettes, and
                  chromatic styles
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-4">
                {/* Sliders grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Film Grain
                      </label>
                      <span className="text-xs font-mono">{grain}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grain}
                      onChange={(e) => setGrain(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Vignette
                      </label>
                      <span className="text-xs font-mono">{vignette}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={vignette}
                      onChange={(e) => setVignette(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Contrast
                      </label>
                      <span className="text-xs font-mono">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Brightness
                      </label>
                      <span className="text-xs font-mono">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Saturation
                      </label>
                      <span className="text-xs font-mono">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Color Mood Preset
                    </label>
                    <div className="flex gap-1">
                      {(
                        ["none", "vintage", "sepia", "cyberpunk", "bw"] as const
                      ).map((p) => (
                        <button
                          key={p}
                          onClick={() => setFilterPreset(p)}
                          className={`text-xs px-2 py-1 rounded border capitalize flex-1 truncate transition-colors ${
                            filterPreset === p
                              ? "bg-primary text-primary-foreground font-semibold"
                              : "bg-background hover:bg-muted"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {imageSrc && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Original Artwork
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center bg-muted/20 min-h-[360px]">
                <img
                  src={imageSrc}
                  alt="Original"
                  className="max-h-[340px] max-w-full object-contain rounded border shadow-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    Enhanced Analog Result
                  </CardTitle>
                  <Button
                    size="sm"
                    onClick={handleDownload}
                    disabled={!resultDataUrl || isProcessing}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download Result
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center bg-muted/20 min-h-[360px]">
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin" /> Rendering
                    analog grain...
                  </div>
                ) : resultDataUrl ? (
                  <img
                    src={resultDataUrl}
                    alt="Enhanced"
                    className="max-h-[340px] max-w-full object-contain rounded border shadow-sm"
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

export default ArtworkEnhancer;
