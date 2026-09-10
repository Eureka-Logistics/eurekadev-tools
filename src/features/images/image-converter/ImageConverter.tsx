import React, { useState } from "react";
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
  RefreshCw,
} from "lucide-react";

const FORMATS = [
  { id: "image/png", ext: "png", label: "PNG" },
  { id: "image/jpeg", ext: "jpg", label: "JPEG" },
  { id: "image/webp", ext: "webp", label: "WebP" },
  { id: "image/bmp", ext: "bmp", label: "BMP" },
];

export const ImageConverter: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("image/png");
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [fileName, setFileName] = useState<string>("converted-image");
  const [resizePercent, setResizePercent] = useState<number>(100);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#10b981";
      ctx.fillRect(0, 0, 800, 600);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CONVERT ME", 400, 300);
      canvas.toBlob((blob) => {
        if (blob) {
          setImageSrc(URL.createObjectURL(blob));
          setFileName("sample-badge");
          convert(URL.createObjectURL(blob), targetFormat, resizePercent);
        }
      }, "image/png");
    }
  };

  const convert = (src: string, fmt: string, scale: number) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const w = Math.round((img.naturalWidth * scale) / 100);
      const h = Math.round((img.naturalHeight * scale) / 100);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (fmt === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, w, h);
        }
        ctx.drawImage(img, 0, 0, w, h);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setConvertedBlob(blob);
              setConvertedUrl(URL.createObjectURL(blob));
            }
          },
          fmt,
          0.92,
        );
      }
    };
    img.src = src;
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    setFileName(baseName);
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    convert(url, targetFormat, resizePercent);
  };

  const handleFormatChange = (fmt: string) => {
    setTargetFormat(fmt);
    if (imageSrc) convert(imageSrc, fmt, resizePercent);
  };

  const handleResizeChange = (scale: number) => {
    setResizePercent(scale);
    if (imageSrc) convert(imageSrc, targetFormat, scale);
  };

  const handleDownload = () => {
    if (!convertedBlob) return;
    const item = FORMATS.find((f) => f.id === targetFormat);
    const ext = item ? item.ext : "png";
    downloadBlob(convertedBlob, `${fileName}.${ext}`);
  };

  const handleClear = () => {
    setImageSrc(null);
    setConvertedBlob(null);
    setConvertedUrl(null);
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
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              Clear
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={!convertedBlob}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download Converted
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
                Upload Image to Convert
              </h3>
              <p className="text-xs text-muted-foreground">
                Convert between PNG, JPEG, WebP, BMP locally in your browser.
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
          {/* Options */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" />
                Target Format & Resize
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <span className="font-semibold text-foreground">
                  Convert to:
                </span>
                <div className="flex rounded-md bg-muted p-0.5">
                  {FORMATS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleFormatChange(f.id)}
                      className={`flex-1 py-1.5 px-3 rounded font-mono text-xs transition-colors ${
                        targetFormat === f.id
                          ? "bg-background text-foreground shadow-sm font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-foreground">
                  Scale / Resolution:
                </span>
                <div className="flex rounded-md bg-muted p-0.5">
                  {[100, 75, 50, 25].map((scale) => (
                    <button
                      key={scale}
                      onClick={() => handleResizeChange(scale)}
                      className={`flex-1 py-1.5 px-3 rounded font-mono text-xs transition-colors ${
                        resizePercent === scale
                          ? "bg-background text-foreground shadow-sm font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {scale}%
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="py-2.5 px-4 border-b border-border/40">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Original Input
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center min-h-[320px] bg-muted/20">
                <img
                  src={imageSrc}
                  alt="Original"
                  className="max-h-[350px] max-w-full object-contain rounded"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2.5 px-4 border-b border-border/40">
                <CardTitle className="text-xs font-semibold uppercase text-primary">
                  Converted Output (
                  {FORMATS.find((f) => f.id === targetFormat)?.label})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center min-h-[320px] bg-muted/20">
                {convertedUrl && (
                  <img
                    src={convertedUrl}
                    alt="Converted"
                    className="max-h-[350px] max-w-full object-contain rounded shadow-sm"
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

export default ImageConverter;
