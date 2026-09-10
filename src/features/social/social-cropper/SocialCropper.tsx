import React, { useState, useEffect, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { Crop, Download, Trash2, Sparkles, UploadCloud } from "lucide-react";

interface PlatformPreset {
  id: string;
  name: string;
  platform: string;
  w: number;
  h: number;
}

const PRESETS: PlatformPreset[] = [
  {
    id: "ig-sq",
    name: "Square Post (1:1)",
    platform: "Instagram",
    w: 1080,
    h: 1080,
  },
  {
    id: "ig-port",
    name: "Portrait Post (4:5)",
    platform: "Instagram",
    w: 1080,
    h: 1350,
  },
  {
    id: "ig-story",
    name: "Story / Reel / TikTok (9:16)",
    platform: "Instagram / TikTok",
    w: 1080,
    h: 1920,
  },
  {
    id: "x-post",
    name: "Post Image (16:9)",
    platform: "X / Twitter",
    w: 1200,
    h: 675,
  },
  {
    id: "x-header",
    name: "Profile Banner (3:1)",
    platform: "X / Twitter",
    w: 1500,
    h: 500,
  },
  {
    id: "yt-thumb",
    name: "Video Thumbnail (16:9)",
    platform: "YouTube",
    w: 1280,
    h: 720,
  },
  {
    id: "li-banner",
    name: "Profile Cover (4:1)",
    platform: "LinkedIn",
    w: 1584,
    h: 396,
  },
  { id: "fb-cover", name: "Page Cover", platform: "Facebook", w: 820, h: 312 },
];

export const SocialCropper: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PlatformPreset>(
    PRESETS[0],
  );
  const [zoom, setZoom] = useState<number>(100);
  const [offsetX, setOffsetX] = useState<number>(50); // 0-100%
  const [offsetY, setOffsetY] = useState<number>(50); // 0-100%
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 1200, 800);
      grad.addColorStop(0, "#ec4899");
      grad.addColorStop(1, "#6366f1");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 800);

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(600, 400, 180, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#1e1b4b";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CROP ME FOR SOCIAL", 600, 415);

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
      renderCrop();
    };
    img.src = imageSrc;
  }, [imageSrc, selectedPreset, zoom, offsetX, offsetY]);

  const renderCrop = () => {
    const img = imgRef.current;
    if (!img) return;

    const outW = selectedPreset.w;
    const outH = selectedPreset.h;

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill black
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, outW, outH);

    // Compute base scale to cover target aspect ratio
    const baseScale = Math.max(
      outW / img.naturalWidth,
      outH / img.naturalHeight,
    );
    const finalScale = baseScale * (zoom / 100);

    const scaledW = img.naturalWidth * finalScale;
    const scaledH = img.naturalHeight * finalScale;

    // Center plus offset
    const maxShiftX = Math.max(0, scaledW - outW);
    const maxShiftY = Math.max(0, scaledH - outH);

    const drawX =
      (outW - scaledW) / 2 + ((offsetX - 50) / 50) * (maxShiftX / 2);
    const drawY =
      (outH - scaledH) / 2 + ((offsetY - 50) / 50) * (maxShiftY / 2);

    ctx.drawImage(img, drawX, drawY, scaledW, scaledH);
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
    downloadBlob(
      blob,
      `${selectedPreset.id}-${selectedPreset.w}x${selectedPreset.h}.png`,
    );
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Crop className="h-4 w-4 text-primary" />
                Social Media Image Cropper
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
                  Upload photo to crop for social channels
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Preset dimensions for Instagram, X/Twitter, YouTube, TikTok,
                  and LinkedIn
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
                {/* Presets row */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-2">
                    Select Platform Preset
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setSelectedPreset(p)}
                        className={`text-left p-2 rounded-lg border text-xs transition-colors ${
                          selectedPreset.id === p.id
                            ? "bg-primary text-primary-foreground font-semibold border-primary"
                            : "bg-muted/20 hover:bg-muted"
                        }`}
                      >
                        <div className="font-semibold">{p.platform}</div>
                        <div className="opacity-80 text-[11px] truncate">
                          {p.name}
                        </div>
                        <div className="opacity-70 font-mono text-[10px] mt-0.5">
                          {p.w} &times; {p.h}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Adjustments row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/40 p-4 rounded-lg border">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Zoom Scale
                      </label>
                      <span className="text-xs font-mono">{zoom}%</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="250"
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Horizontal Pan
                      </label>
                      <span className="text-xs font-mono">{offsetX}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={offsetX}
                      onChange={(e) => setOffsetX(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Vertical Pan
                      </label>
                      <span className="text-xs font-mono">{offsetY}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={offsetY}
                      onChange={(e) => setOffsetY(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
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
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span>
                    {selectedPreset.platform} - {selectedPreset.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ({selectedPreset.w} &times; {selectedPreset.h} px)
                  </span>
                </CardTitle>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" /> Download Preset PNG
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
                  alt="Cropped Social"
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

export default SocialCropper;
