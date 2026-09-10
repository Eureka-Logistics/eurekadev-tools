import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { copyToClipboard } from "@/lib/utils";
import {
  UploadCloud,
  Download,
  Trash2,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";

const ICON_SIZES = [
  { size: 16, label: "16x16 (Browser tab)", filename: "favicon-16x16.png" },
  { size: 32, label: "32x32 (Browser tab)", filename: "favicon-32x32.png" },
  {
    size: 48,
    label: "48x48 (Desktop shortcut)",
    filename: "favicon-48x48.png",
  },
  {
    size: 180,
    label: "180x180 (Apple Touch Icon)",
    filename: "apple-touch-icon.png",
  },
  {
    size: 192,
    label: "192x192 (Android / PWA)",
    filename: "android-chrome-192x192.png",
  },
  {
    size: 512,
    label: "512x512 (PWA Splash)",
    filename: "android-chrome-512x512.png",
  },
];

export const FaviconGenny: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [padding, setPadding] = useState<number>(0);
  const [shape, setShape] = useState<"square" | "rounded" | "circle">(
    "rounded",
  );
  const [copied, setCopied] = useState<boolean>(false);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#2563eb";
      ctx.fillRect(0, 0, 512, 512);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 280px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("E", 256, 260);

      setImageSrc(canvas.toDataURL("image/png"));
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  const generateIconBlob = (size: number): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!imageSrc) return resolve(null);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);

        // Apply clip shape if needed
        if (shape === "circle") {
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.clip();
        } else if (shape === "rounded") {
          const r = size * 0.18;
          ctx.beginPath();
          ctx.roundRect(0, 0, size, size, r);
          ctx.clip();
        }

        // Draw with padding
        const padPx = (padding / 100) * size;
        const drawSize = size - padPx * 2;
        ctx.drawImage(img, padPx, padPx, drawSize, drawSize);

        canvas.toBlob((blob) => resolve(blob), "image/png");
      };
      img.src = imageSrc;
    });
  };

  const handleDownloadSingle = async (size: number, filename: string) => {
    const blob = await generateIconBlob(size);
    if (blob) downloadBlob(blob, filename);
  };

  const handleDownloadAll = async () => {
    for (const item of ICON_SIZES) {
      const blob = await generateIconBlob(item.size);
      if (blob) downloadBlob(blob, item.filename);
    }
  };

  const htmlTags = `<!-- Favicon & Touch Icons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

  const handleCopyTags = async () => {
    const ok = await copyToClipboard(htmlTags);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          {!imageSrc && (
            <Button variant="outline" size="sm" onClick={handleLoadSample}>
              <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
              Load Sample Logo
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
            onClick={handleDownloadAll}
            disabled={!imageSrc}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download All Icons
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
                Drop your logo or brand asset
              </h3>
              <p className="text-xs text-muted-foreground">
                Generates 16x16, 32x32, 48x48, Apple Touch Icon, and PWA sizes +
                HTML link tags.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow">
                <span>Select Logo File</span>
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
                Generate Initial Logo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Options */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">
                Favicon Shape & Padding
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground">
                  Shape Cutout
                </span>
                <div className="flex rounded-md bg-muted p-0.5">
                  {(["square", "rounded", "circle"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setShape(s)}
                      className={`flex-1 py-1 px-2 rounded capitalize font-medium transition-colors ${
                        shape === s
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    Inner Padding
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {padding}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Grid of Generated Favicons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ICON_SIZES.map((item) => (
              <Card
                key={item.size}
                className="flex flex-col items-center justify-between p-4 space-y-3 bg-card/60"
              >
                <span className="text-[11px] font-mono text-muted-foreground">
                  {item.size}x{item.size}
                </span>
                <div className="w-16 h-16 flex items-center justify-center p-2 rounded-lg bg-muted/40 border border-border/50">
                  <img
                    src={imageSrc}
                    alt={item.label}
                    className={`max-w-full max-h-full object-contain ${
                      shape === "circle"
                        ? "rounded-full"
                        : shape === "rounded"
                          ? "rounded-md"
                          : "rounded-none"
                    }`}
                    style={{ padding: `${padding * 0.4}px` }}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSingle(item.size, item.filename)}
                  className="w-full text-xs h-7 gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>PNG</span>
                </Button>
              </Card>
            ))}
          </div>

          {/* HTML Link Tags */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-semibold">
                HTML Header Tags
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyTags}
                className="h-7 text-xs gap-1"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copied ? "Copied" : "Copy HTML"}
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-4 bg-muted/20 font-mono text-xs text-foreground overflow-x-auto">
                {htmlTags}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </ToolShell>
  );
};

export default FaviconGenny;
