import React, { useState, useEffect, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { Stamp, Download, Trash2, Sparkles, UploadCloud } from "lucide-react";

type Position =
  | "center"
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left"
  | "tiled";

export const Watermarker: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [watermarkText, setWatermarkText] = useState<string>("© Eureka Group");
  const [position, setPosition] = useState<Position>("bottom-right");
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [opacity, setOpacity] = useState<number>(60);
  const [fontSize, setFontSize] = useState<number>(36);
  const [rotation, setRotation] = useState<number>(-25);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 500;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 800, 500);
      grad.addColorStop(0, "#0f172a");
      grad.addColorStop(0.5, "#1e293b");
      grad.addColorStop(1, "#334155");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 800, 500);

      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(400, 250, 120, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CONFIDENTIAL ASSET", 400, 260);

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
      renderWatermark();
    };
    img.src = imageSrc;
  }, [
    imageSrc,
    watermarkText,
    position,
    textColor,
    opacity,
    fontSize,
    rotation,
  ]);

  const renderWatermark = () => {
    const img = imgRef.current;
    if (!img) return;

    const w = img.naturalWidth;
    const h = img.naturalHeight;

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    ctx.save();
    ctx.globalAlpha = opacity / 100;
    ctx.fillStyle = textColor;
    ctx.font = `bold ${fontSize}px sans-serif`;

    if (position === "tiled") {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const stepX = Math.max(160, fontSize * 6);
      const stepY = Math.max(120, fontSize * 4);

      for (let y = -h; y < h * 2; y += stepY) {
        for (let x = -w; x < w * 2; x += stepX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(watermarkText, 0, 0);
          ctx.restore();
        }
      }
    } else {
      const pad = 30;
      let tx = w - pad;
      let ty = h - pad;
      let align: CanvasTextAlign = "right";
      let baseline: CanvasTextBaseline = "bottom";

      if (position === "center") {
        tx = w / 2;
        ty = h / 2;
        align = "center";
        baseline = "middle";
      } else if (position === "bottom-left") {
        tx = pad;
        ty = h - pad;
        align = "left";
        baseline = "bottom";
      } else if (position === "top-right") {
        tx = w - pad;
        ty = pad;
        align = "right";
        baseline = "top";
      } else if (position === "top-left") {
        tx = pad;
        ty = pad;
        align = "left";
        baseline = "top";
      }

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.fillText(watermarkText, 0, 0);
      ctx.restore();
    }

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
    downloadBlob(blob, "watermarked-image.png");
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Stamp className="h-4 w-4 text-primary" />
                Image Watermarker
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
                  Upload photo to watermark
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Protects intellectual property with custom positioned or
                  repeating tiled watermarks
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-lg border">
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    className="w-full h-8 px-2 text-xs border rounded bg-background"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Placement Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value as Position)}
                    className="w-full h-8 px-2 text-xs border rounded bg-background"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="center">Centered</option>
                    <option value="tiled">Repeating Tiled Pattern</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded border p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="text-xs font-mono h-8 px-2 border rounded bg-background flex-1"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Opacity
                    </label>
                    <span className="text-xs font-mono">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Font Size
                    </label>
                    <span className="text-xs font-mono">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="14"
                    max="120"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Rotation
                    </label>
                    <span className="text-xs font-mono">{rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-90"
                    max="90"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
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
                  Watermarked Preview
                </CardTitle>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" /> Download Watermarked PNG
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 bg-muted/20 min-h-[380px]">
              <div
                className="max-h-[420px] max-w-full rounded border shadow-lg overflow-hidden flex items-center justify-center"
                style={{
                  backgroundImage:
                    "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 8px 8px",
                }}
              >
                <img
                  src={resultDataUrl}
                  alt="Watermarked"
                  className="max-h-[400px] max-w-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolShell>
  );
};

export default Watermarker;
