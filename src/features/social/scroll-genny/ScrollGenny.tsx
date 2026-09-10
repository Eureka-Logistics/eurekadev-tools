import React, { useState, useEffect, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import {
  Columns3,
  Download,
  Trash2,
  Sparkles,
  UploadCloud,
} from "lucide-react";

interface Slide {
  index: number;
  dataUrl: string;
}

export const ScrollGenny: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [slideCount, setSlideCount] = useState<number>(3);
  const [slideRatio, setSlideRatio] = useState<"1:1" | "4:5">("4:5");
  const [slides, setSlides] = useState<Slide[]>([]);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Wide panoramic gradient landscape
      const grad = ctx.createLinearGradient(0, 0, 1800, 600);
      grad.addColorStop(0, "#3b82f6");
      grad.addColorStop(0.35, "#8b5cf6");
      grad.addColorStop(0.7, "#ec4899");
      grad.addColorStop(1, "#f59e0b");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1800, 600);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 44px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SEAMLESS SWIPEABLE PANORAMA", 900, 310);

      // Add continuity shapes crossing slides
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.moveTo(100, 480);
      ctx.bezierCurveTo(500, 150, 1200, 550, 1700, 200);
      ctx.stroke();

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
      generateSlides();
    };
    img.src = imageSrc;
  }, [imageSrc, slideCount, slideRatio]);

  const generateSlides = () => {
    const img = imgRef.current;
    if (!img) return;

    // Slide pixel sizes
    const slideW = 1080;
    const slideH = slideRatio === "1:1" ? 1080 : 1350;

    const totalTargetW = slideW * slideCount;

    // Canvas to draw full scaled image
    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = totalTargetW;
    fullCanvas.height = slideH;
    const fullCtx = fullCanvas.getContext("2d");
    if (!fullCtx) return;

    // Fill background
    fullCtx.fillStyle = "#000000";
    fullCtx.fillRect(0, 0, totalTargetW, slideH);

    // Scale to cover full panorama height/width
    const scale = Math.max(
      totalTargetW / img.naturalWidth,
      slideH / img.naturalHeight,
    );
    const scaledW = img.naturalWidth * scale;
    const scaledH = img.naturalHeight * scale;
    const offsetX = (totalTargetW - scaledW) / 2;
    const offsetY = (slideH - scaledH) / 2;

    fullCtx.drawImage(img, offsetX, offsetY, scaledW, scaledH);

    // Slice into individual slides
    const newSlides: Slide[] = [];
    for (let i = 0; i < slideCount; i++) {
      const sliceCanvas = document.createElement("canvas");
      sliceCanvas.width = slideW;
      sliceCanvas.height = slideH;
      const sliceCtx = sliceCanvas.getContext("2d");
      if (sliceCtx) {
        sliceCtx.drawImage(
          fullCanvas,
          i * slideW,
          0,
          slideW,
          slideH,
          0,
          0,
          slideW,
          slideH,
        );
        newSlides.push({
          index: i + 1,
          dataUrl: sliceCanvas.toDataURL("image/png"),
        });
      }
    }
    setSlides(newSlides);
  };

  const downloadSlide = (slide: Slide) => {
    const parts = slide.dataUrl.split(",");
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: "image/png" });
    downloadBlob(blob, `carousel-slide-${slide.index}.png`);
  };

  const downloadAll = () => {
    slides.forEach((slide, idx) => {
      setTimeout(() => downloadSlide(slide), idx * 250);
    });
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Columns3 className="h-4 w-4 text-primary" />
                Seamless Carousel & Scroll Generator
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
                      setSlides([]);
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
                  Upload panoramic or wide artwork
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Splits seamlessly into multi-slide Instagram swipe carousels
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Number of Carousel Slides
                  </label>
                  <div className="flex gap-1 bg-background p-1 rounded-md border text-xs">
                    {[2, 3, 4, 5, 6].map((count) => (
                      <button
                        key={count}
                        className={`flex-1 py-1 rounded font-medium ${
                          slideCount === count
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                        onClick={() => setSlideCount(count)}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Slide Format
                  </label>
                  <div className="grid grid-cols-2 gap-1 bg-background p-1 rounded-md border text-xs">
                    <button
                      className={`py-1 rounded font-medium ${
                        slideRatio === "4:5"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSlideRatio("4:5")}
                    >
                      4:5 Portrait (1080&times;1350)
                    </button>
                    <button
                      className={`py-1 rounded font-medium ${
                        slideRatio === "1:1"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setSlideRatio("1:1")}
                    >
                      1:1 Square (1080&times;1080)
                    </button>
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    className="w-full h-8 text-xs"
                    onClick={downloadAll}
                    disabled={slides.length === 0}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Download All{" "}
                    {slides.length} Slides
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Slides Grid */}
        {slides.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Seamless Carousel Slices ({slides.length} Slides)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {slides.map((slide) => (
                  <div key={slide.index} className="space-y-2 group">
                    <div className="relative rounded-lg border overflow-hidden bg-muted/20 shadow-xs aspect-[4/5] flex items-center justify-center">
                      <img
                        src={slide.dataUrl}
                        alt={`Slide ${slide.index}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-black/75 text-white font-mono text-[10px] px-1.5 py-0.5 rounded">
                        #{slide.index}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-7"
                      onClick={() => downloadSlide(slide)}
                    >
                      <Download className="h-3 w-3 mr-1" /> Slide {slide.index}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolShell>
  );
};

export default ScrollGenny;
