import React, { useState, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import {
  UploadCloud,
  Copy,
  Check,
  Sparkles,
  Trash2,
  Pipette,
} from "lucide-react";

interface PickedColor {
  id: string;
  hex: string;
  rgb: string;
  time: string;
}

export const PixelPicker: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [hoverColor, setHoverColor] = useState<{
    hex: string;
    rgb: string;
  } | null>(null);
  const [history, setHistory] = useState<PickedColor[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loupeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 350;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Intricate geometric pixel artwork
      const grad = ctx.createLinearGradient(0, 0, 500, 350);
      grad.addColorStop(0, "#4f46e5");
      grad.addColorStop(0.5, "#06b6d4");
      grad.addColorStop(1, "#10b981");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 500, 350);

      // Rainbow disc
      const colors = [
        "#ef4444",
        "#f97316",
        "#eab308",
        "#22c55e",
        "#3b82f6",
        "#a855f7",
      ];
      colors.forEach((c, idx) => {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(250, 175, 120 - idx * 18, 0, Math.PI * 2);
        ctx.fill();
      });

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

  const handleImageLoaded = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
  };

  // Loupe magnification on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const loupe = loupeCanvasRef.current;
    if (!canvas || !loupe) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

    setHoverColor({ hex, rgb });

    // Draw magnified 9x9 pixel grid onto loupe
    const lCtx = loupe.getContext("2d");
    if (!lCtx) return;
    loupe.width = 120;
    loupe.height = 120;
    lCtx.imageSmoothingEnabled = false;

    // Draw 9x9 crop scaled up
    lCtx.drawImage(canvas, x - 4, y - 4, 9, 9, 0, 0, 120, 120);

    // Crosshair in center
    lCtx.strokeStyle = "#ffffff";
    lCtx.lineWidth = 2;
    lCtx.strokeRect(53, 53, 14, 14);
    lCtx.strokeStyle = "#000000";
    lCtx.lineWidth = 1;
    lCtx.strokeRect(52, 52, 16, 16);
  };

  const handleCanvasClick = () => {
    if (!hoverColor) return;
    const item: PickedColor = {
      id: Math.random().toString(36).slice(2, 7),
      hex: hoverColor.hex,
      rgb: hoverColor.rgb,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
    setHistory((prev) => [item, ...prev.slice(0, 19)]);
  };

  const handleNativeEyeDropper = async () => {
    if ("EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const res = await eyeDropper.open();
        if (res?.sRGBHex) {
          const num = parseInt(res.sRGBHex.replace("#", ""), 16);
          const r = (num >> 16) & 255;
          const g = (num >> 8) & 255;
          const b = num & 255;
          const item: PickedColor = {
            id: Math.random().toString(36).slice(2, 7),
            hex: res.sRGBHex,
            rgb: `rgb(${r}, ${g}, ${b})`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
          };
          setHistory((prev) => [item, ...prev.slice(0, 19)]);
        }
      } catch {
        // User cancelled eyedropper
      }
    }
  };

  const handleCopy = async (val: string, key: string) => {
    await copyToClipboard(val);
    setCopiedKey(key);
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
                Pixel Color Loupe & Eyedropper
              </CardTitle>
              <div className="flex items-center gap-2">
                {"EyeDropper" in window && (
                  <Button size="sm" onClick={handleNativeEyeDropper}>
                    <Pipette className="h-4 w-4 mr-1" /> Pick from Screen
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                </Button>
                {imageSrc && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setImageSrc(null)}
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
                  Upload photo to inspect pixels
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Hover to view magnified pixel loupe and click to collect
                  colors
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main canvas inspection */}
                <div className="lg:col-span-2 flex flex-col items-center justify-center p-3 bg-muted/20 border rounded-xl relative">
                  <img
                    src={imageSrc}
                    alt="Inspection Source"
                    onLoad={(e) => handleImageLoaded(e.currentTarget)}
                    className="hidden"
                  />
                  <canvas
                    ref={canvasRef}
                    onMouseMove={handleMouseMove}
                    onClick={handleCanvasClick}
                    className="max-h-[360px] max-w-full object-contain rounded shadow-sm cursor-crosshair border"
                  />
                  <span className="text-xs text-muted-foreground mt-2">
                    Click anywhere on the image to save pixel color
                  </span>
                </div>

                {/* Loupe & Current Pixel */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Magnifier Loupe
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-3">
                      <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-primary shadow-md flex items-center justify-center bg-black/80">
                        <canvas
                          ref={loupeCanvasRef}
                          className="w-full h-full"
                        />
                      </div>
                      {hoverColor && (
                        <div className="text-center space-y-1">
                          <div className="flex items-center justify-center gap-2">
                            <span
                              className="w-4 h-4 rounded-full border shadow-xs"
                              style={{ backgroundColor: hoverColor.hex }}
                            />
                            <span className="font-mono text-sm font-bold">
                              {hoverColor.hex.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {hoverColor.rgb}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* History */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Picked History ({history.length})
                        </CardTitle>
                        {history.length > 0 && (
                          <button
                            onClick={() => setHistory([])}
                            className="text-[11px] text-destructive hover:underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {history.length === 0 ? (
                        <div className="text-xs text-muted-foreground text-center py-4">
                          No colors picked yet. Click pixels on the canvas.
                        </div>
                      ) : (
                        history.map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between p-1.5 rounded border bg-muted/20 text-xs font-mono"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="w-5 h-5 rounded border shadow-2xs"
                                style={{ backgroundColor: c.hex }}
                              />
                              <span className="font-bold">
                                {c.hex.toUpperCase()}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => handleCopy(c.hex, c.id)}
                            >
                              {copiedKey === c.id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3 opacity-60" />
                              )}
                            </Button>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default PixelPicker;
