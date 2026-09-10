import React, { useState, useEffect, useCallback } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { UploadCloud, Download, Trash2, Sparkles, Combine } from "lucide-react";

interface ImageItem {
  id: string;
  name: string;
  src: string;
}

export const ImageStitcher: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [direction, setDirection] = useState<"horizontal" | "vertical">(
    "horizontal",
  );
  const [gap, setGap] = useState<number>(10);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);

  const handleLoadSample = () => {
    const makeSample = (text: string, color: string): string => {
      const c = document.createElement("canvas");
      c.width = 300;
      c.height = 300;
      const ctx = c.getContext("2d");
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 300, 300);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 150, 150);
      }
      return c.toDataURL("image/png");
    };

    setImages([
      { id: "1", name: "Sample A", src: makeSample("Panel 1", "#2563eb") },
      { id: "2", name: "Sample B", src: makeSample("Panel 2", "#10b981") },
      { id: "3", name: "Sample C", src: makeSample("Panel 3", "#f59e0b") },
    ]);
  };

  const handleFiles = (files: FileList) => {
    const items: ImageItem[] = [];
    Array.from(files).forEach((file, idx) => {
      if (file.type.startsWith("image/")) {
        items.push({
          id: `${Date.now()}-${idx}`,
          name: file.name,
          src: URL.createObjectURL(file),
        });
      }
    });
    setImages((prev) => [...prev, ...items]);
  };

  const stitch = useCallback(async () => {
    if (images.length === 0) {
      setResultDataUrl(null);
      return;
    }

    // Load all HTMLImageElements
    const loadedImgs = await Promise.all(
      images.map(
        (item) =>
          new Promise<HTMLImageElement>((res) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => res(img);
            img.src = item.src;
          }),
      ),
    );

    let totalW = 0;
    let totalH = 0;

    if (direction === "horizontal") {
      totalW =
        loadedImgs.reduce((sum, img) => sum + img.naturalWidth, 0) +
        (images.length - 1) * gap;
      totalH = Math.max(...loadedImgs.map((img) => img.naturalHeight));
    } else {
      totalW = Math.max(...loadedImgs.map((img) => img.naturalWidth));
      totalH =
        loadedImgs.reduce((sum, img) => sum + img.naturalHeight, 0) +
        (images.length - 1) * gap;
    }

    const canvas = document.createElement("canvas");
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Fill background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, totalW, totalH);

    // Draw images
    let offset = 0;
    loadedImgs.forEach((img) => {
      if (direction === "horizontal") {
        const y = (totalH - img.naturalHeight) / 2;
        ctx.drawImage(img, offset, y);
        offset += img.naturalWidth + gap;
      } else {
        const x = (totalW - img.naturalWidth) / 2;
        ctx.drawImage(img, x, offset);
        offset += img.naturalHeight + gap;
      }
    });

    setResultDataUrl(canvas.toDataURL("image/png"));
  }, [images, direction, gap, bgColor]);

  useEffect(() => {
    stitch();
  }, [stitch]);

  const handleDownload = () => {
    if (!resultDataUrl) return;
    fetch(resultDataUrl)
      .then((res) => res.blob())
      .then((blob) => downloadBlob(blob, "stitched-image.png"));
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          {images.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleLoadSample}>
              <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
              Load Sample Panels
            </Button>
          )}
          {images.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setImages([])}>
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
            Download Composite PNG
          </Button>
        </div>
      }
    >
      {images.length === 0 ? (
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">
                Upload Multiple Images to Combine
              </h3>
              <p className="text-xs text-muted-foreground">
                Join photos side-by-side (horizontal) or top-to-bottom
                (vertical) with custom spacing.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow">
                <span>Select Multiple Files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
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
          {/* Controls Bar */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Combine className="w-4 h-4 text-primary" />
                Stitch Direction & Spacing ({images.length} Images)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              {/* Direction */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground">Direction</span>
                <div className="flex rounded-md bg-muted p-0.5">
                  <button
                    onClick={() => setDirection("horizontal")}
                    className={`flex-1 py-1 px-3 rounded font-medium transition-colors ${
                      direction === "horizontal"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Horizontal (Side by side)
                  </button>
                  <button
                    onClick={() => setDirection("vertical")}
                    className={`flex-1 py-1 px-3 rounded font-medium transition-colors ${
                      direction === "vertical"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Vertical (Stacked)
                  </button>
                </div>
              </div>

              {/* Gap */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">
                    Spacing / Gap
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {gap}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={gap}
                  onChange={(e) => setGap(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              {/* Background Color */}
              <div className="space-y-1.5">
                <span className="font-semibold text-foreground">
                  Background Fill
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border border-input cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-8 flex-1 px-2 rounded-md border border-input bg-transparent font-mono text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Uploaded Thumbnails list */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <label className="cursor-pointer shrink-0 w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <UploadCloud className="w-5 h-5" />
              <span className="text-[10px] mt-1">Add Image</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>

            {images.map((item, idx) => (
              <div
                key={item.id}
                className="relative group shrink-0 w-20 h-20 rounded-lg border border-border overflow-hidden bg-muted/40"
              >
                <img
                  src={item.src}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(item.id)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-background/80 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
                <span className="absolute bottom-1 left-1 px-1 bg-background/80 rounded font-mono text-[9px]">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>

          {/* Composite Preview */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-border/40">
              <CardTitle className="text-xs font-semibold uppercase text-primary">
                Composite Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex items-center justify-center min-h-[350px] bg-muted/20 overflow-auto">
              {resultDataUrl && (
                <img
                  src={resultDataUrl}
                  alt="Stitched Output"
                  className="max-h-[450px] max-w-full object-contain rounded shadow"
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </ToolShell>
  );
};

export default ImageStitcher;
