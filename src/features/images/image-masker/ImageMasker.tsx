import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { UploadCloud, Download, Trash2, Sparkles, Shapes } from "lucide-react";

const SHAPES = [
  { id: "circle", label: "Circle" },
  { id: "squircle", label: "Squircle" },
  { id: "heart", label: "Heart" },
  { id: "star", label: "Star" },
  { id: "hexagon", label: "Hexagon" },
  { id: "diamond", label: "Diamond" },
];

export const ImageMasker: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [shape, setShape] = useState<string>("circle");
  const [borderWidth, setBorderWidth] = useState<number>(4);
  const [borderColor, setBorderColor] = useState<string>("#2563eb");
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 600, 600);
      grad.addColorStop(0, "#ec4899");
      grad.addColorStop(1, "#8b5cf6");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 600);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 50px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("MASK ME", 300, 300);

      setImageSrc(canvas.toDataURL("image/png"));
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  const renderMask = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const size = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - borderWidth;

    ctx.beginPath();
    if (shape === "circle") {
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (shape === "squircle") {
      ctx.roundRect(
        borderWidth,
        borderWidth,
        size - borderWidth * 2,
        size - borderWidth * 2,
        r * 0.4,
      );
    } else if (shape === "heart") {
      const topCurveHeight = r * 0.3;
      ctx.moveTo(cx, cy + r * 0.7);
      ctx.bezierCurveTo(cx - r, cy, cx - r, cy - r, cx, cy - topCurveHeight);
      ctx.bezierCurveTo(cx + r, cy - r, cx + r, cy, cx, cy + r * 0.7);
    } else if (shape === "star") {
      const spikes = 5;
      const step = Math.PI / spikes;
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      ctx.moveTo(cx, cy - r);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * r;
        y = cy + Math.sin(rot) * r;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * (r * 0.45);
        y = cy + Math.sin(rot) * (r * 0.45);
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - r);
    } else if (shape === "hexagon") {
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else if (shape === "diamond") {
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
    }

    ctx.save();
    ctx.clip();

    // Draw centered square crop of original image
    const sx = (img.naturalWidth - size) / 2;
    const sy = (img.naturalHeight - size) / 2;
    ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
    ctx.restore();

    // Draw border
    if (borderWidth > 0) {
      ctx.lineWidth = borderWidth * 2;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    setResultDataUrl(canvas.toDataURL("image/png"));
  }, [shape, borderWidth, borderColor]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgRef.current = img;
        renderMask();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, renderMask]);

  const handleDownload = () => {
    if (!resultDataUrl) return;
    fetch(resultDataUrl)
      .then((res) => res.blob())
      .then((blob) => downloadBlob(blob, `masked-${shape}.png`));
  };

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
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImageSrc(null)}
            >
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
            Download Masked PNG
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
                Upload Image to Mask into Shapes
              </h3>
              <p className="text-xs text-muted-foreground">
                Cut your pictures into circles, hearts, stars, squircles with
                stroke borders.
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
                    if (file) handleFile(file);
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
          {/* Shape Selector & Controls */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shapes className="w-4 h-4 text-primary" />
                Shape & Border Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              {/* Shapes */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground">
                  Select Shape
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {SHAPES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setShape(s.id)}
                      className={`py-1.5 px-2 rounded font-medium transition-colors ${
                        shape === s.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Width */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    Border Width
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {borderWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={borderWidth}
                  onChange={(e) => setBorderWidth(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Border Color */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground">
                  Border Color
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-8 h-8 rounded border border-input cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="h-8 flex-1 px-2 rounded-md border border-input bg-transparent font-mono text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview Canvas with Checkered Background */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-border/40">
              <CardTitle className="text-xs font-semibold uppercase text-primary">
                Masked Result Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex items-center justify-center min-h-[380px] bg-muted/10">
              <div
                className="p-6 rounded-xl border border-border/60 shadow-sm flex items-center justify-center"
                style={{
                  backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                  backgroundSize: "20px 20px",
                  backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                }}
              >
                {resultDataUrl && (
                  <img
                    src={resultDataUrl}
                    alt="Masked"
                    className="max-h-[360px] max-w-full object-contain"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ToolShell>
  );
};

export default ImageMasker;
