import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { createPdfFromImages, ImagePage } from "@/lib/pdf/simplePdf";
import {
  FileUp,
  Download,
  Trash2,
  Sparkles,
  ArrowUp,
  ArrowDown,
  FileText,
} from "lucide-react";

interface QueuedImage {
  id: string;
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export const ImageToPdf: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [images, setImages] = useState<QueuedImage[]>([]);
  const [pageSize, setPageSize] = useState<"fit" | "a4" | "letter">("fit");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setImages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).slice(2, 7),
              name: file.name,
              dataUrl,
              width: img.naturalWidth,
              height: img.naturalHeight,
            },
          ]);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLoadSample = () => {
    const makeSample = (text: string, color: string): QueuedImage => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1131; // A4 aspect
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 800, 1131);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 40px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(text, 400, 560);
      }
      return {
        id: Math.random().toString(36).slice(2, 7),
        name: `${text.toLowerCase().replace(/\s/g, "-")}.png`,
        dataUrl: canvas.toDataURL("image/png"),
        width: 800,
        height: 1131,
      };
    };

    setImages([
      makeSample("Cover Page", "#2563eb"),
      makeSample("Project Specification", "#0f766e"),
      makeSample("Appendix Documentation", "#7c3aed"),
    ]);
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setImages(next);
  };

  const removeImage = (id: string) => {
    setImages(images.filter((i) => i.id !== id));
  };

  const generatePdf = async () => {
    if (images.length === 0) return;
    setIsGenerating(true);

    const pages: ImagePage[] = [];

    for (const item of images) {
      // Draw onto canvas to encode as JPEG Uint8Array
      const canvas = document.createElement("canvas");
      let targetW = item.width;
      let targetH = item.height;

      if (pageSize === "a4") {
        targetW = 595; // A4 pt
        targetH = 842;
      } else if (pageSize === "letter") {
        targetW = 612; // Letter pt
        targetH = 792;
      }

      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetW, targetH);

        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve) => {
          img.onload = () => {
            if (pageSize === "fit") {
              ctx.drawImage(img, 0, 0, targetW, targetH);
            } else {
              // Scale to fit maintaining aspect ratio
              const scale =
                Math.min(
                  targetW / img.naturalWidth,
                  targetH / img.naturalHeight,
                ) * 0.9;
              const sw = img.naturalWidth * scale;
              const sh = img.naturalHeight * scale;
              ctx.drawImage(
                img,
                (targetW - sw) / 2,
                (targetH - sh) / 2,
                sw,
                sh,
              );
            }
            resolve();
          };
          img.src = item.dataUrl;
        });

        // Convert canvas to JPEG blob then Uint8Array
        await new Promise<void>((resolve) => {
          canvas.toBlob(
            async (blob) => {
              if (blob) {
                const buffer = await blob.arrayBuffer();
                pages.push({
                  width: targetW,
                  height: targetH,
                  jpegBytes: new Uint8Array(buffer),
                });
              }
              resolve();
            },
            "image/jpeg",
            0.9,
          );
        });
      }
    }

    const pdfBlob = createPdfFromImages(pages);
    downloadBlob(pdfBlob, "converted-document.pdf", "application/pdf");
    setIsGenerating(false);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Images to PDF Document Converter
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                  Pages
                </Button>
                {images.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setImages([])}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Upload Zone */}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-8 cursor-pointer hover:bg-muted/50 transition-colors">
              <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm font-medium">
                Click or drag images here to add pages
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WebP supported
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
              />
            </label>

            {/* Config & Action */}
            {images.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Page Size:
                  </span>
                  <div className="flex gap-1 bg-background p-1 rounded-md border text-xs">
                    <button
                      onClick={() => setPageSize("fit")}
                      className={`px-3 py-1 rounded font-medium ${
                        pageSize === "fit"
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-muted"
                      }`}
                    >
                      Fit Image Dimensions
                    </button>
                    <button
                      onClick={() => setPageSize("a4")}
                      className={`px-3 py-1 rounded font-medium ${
                        pageSize === "a4"
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-muted"
                      }`}
                    >
                      A4 Standard
                    </button>
                    <button
                      onClick={() => setPageSize("letter")}
                      className={`px-3 py-1 rounded font-medium ${
                        pageSize === "letter"
                          ? "bg-primary text-primary-foreground font-bold"
                          : "hover:bg-muted"
                      }`}
                    >
                      US Letter
                    </button>
                  </div>
                </div>

                <Button size="sm" onClick={generatePdf} disabled={isGenerating}>
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating
                    ? "Generating PDF..."
                    : `Generate & Download PDF (${images.length} Pages)`}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Queued Pages List */}
        {images.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Page Order ({images.length} Pages)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {images.map((item, index) => (
                <Card
                  key={item.id}
                  className="p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-mono text-xs font-bold w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <img
                      src={item.dataUrl}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded border shrink-0 bg-muted"
                    />
                    <div className="overflow-hidden">
                      <span
                        className="text-xs font-semibold truncate block"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {item.width} &times; {item.height} px
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => moveImage(index, -1)}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => moveImage(index, 1)}
                      disabled={index === images.length - 1}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => removeImage(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default ImageToPdf;
