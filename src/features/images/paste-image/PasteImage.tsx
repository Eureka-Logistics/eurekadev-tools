import React, { useState, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { copyToClipboard } from "@/lib/utils";
import {
  Clipboard,
  Download,
  Trash2,
  Sparkles,
  Copy,
  Check,
  Info,
  FileImage,
} from "lucide-react";

interface ImageDetails {
  width: number;
  height: number;
  aspectRatio: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
}

export const PasteImage: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageDetails, setImageDetails] = useState<ImageDetails | null>(null);
  const [copiedDataUri, setCopiedDataUri] = useState<boolean>(false);
  const [copiedImage, setCopiedImage] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">(
    "png",
  );

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const gcd = (a: number, b: number): number =>
          b === 0 ? a : gcd(b, a % b);
        const div = gcd(img.naturalWidth, img.naturalHeight);
        const aspect = `${img.naturalWidth / div}:${img.naturalHeight / div}`;

        setImageDetails({
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: aspect,
          mimeType: file.type || "image/png",
          sizeBytes: file.size,
          dataUrl,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, 600, 360);
      grad.addColorStop(0, "#3b82f6");
      grad.addColorStop(1, "#9333ea");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 360);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Clipboard Inspector", 300, 160);

      ctx.font = "16px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText(
        "Press Cmd+V / Ctrl+V anytime to paste your image",
        300,
        200,
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const sampleFile = new File([blob], "sample-paste.png", {
            type: "image/png",
          });
          processImageFile(sampleFile);
        }
      }, "image/png");
    }
  };

  const handleCopyDataUri = async () => {
    if (!imageDetails) return;
    await copyToClipboard(imageDetails.dataUrl);
    setCopiedDataUri(true);
    setTimeout(() => setCopiedDataUri(false), 2000);
  };

  const handleCopyClipboardImage = async () => {
    if (!imageDetails) return;
    try {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (blob && navigator.clipboard?.write) {
              await navigator.clipboard.write([
                new ClipboardItem({ "image/png": blob }),
              ]);
              setCopiedImage(true);
              setTimeout(() => setCopiedImage(false), 2000);
            }
          }, "image/png");
        }
      };
      img.src = imageDetails.dataUrl;
    } catch {
      // Clipboard write fallback
      handleCopyDataUri();
    }
  };

  const handleDownload = () => {
    if (!imageDetails) return;
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (exportFormat === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.drawImage(img, 0, 0);
        const mime = `image/${exportFormat}`;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              downloadBlob(blob, `pasted-image.${exportFormat}`, mime);
            }
          },
          mime,
          0.92,
        );
      }
    };
    img.src = imageDetails.dataUrl;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Controls Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clipboard className="h-4 w-4 text-primary" />
                Paste & Inspect Image
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                </Button>
                {imageDetails && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setImageDetails(null)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!imageDetails ? (
              <div className="border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-12 text-center space-y-3">
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-2">
                  <Clipboard className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold">
                  Press Cmd+V / Ctrl+V to paste directly
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Take a screenshot or copy any image from anywhere, then simply
                  paste it onto this window.
                </p>
                <div className="pt-2">
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-input rounded-md text-sm font-medium bg-background hover:bg-muted transition-colors">
                    <FileImage className="h-4 w-4 mr-2" /> Or choose file from
                    disk
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Meta details banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-4 rounded-lg border">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Dimensions
                    </span>
                    <span className="text-base font-bold font-mono">
                      {imageDetails.width} &times; {imageDetails.height} px
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Aspect Ratio
                    </span>
                    <span className="text-base font-bold font-mono">
                      {imageDetails.aspectRatio}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      File Size
                    </span>
                    <span className="text-base font-bold font-mono">
                      {formatBytes(imageDetails.sizeBytes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      MIME Type
                    </span>
                    <span className="text-base font-bold font-mono text-primary">
                      {imageDetails.mimeType}
                    </span>
                  </div>
                </div>

                {/* Preview & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 border rounded-xl overflow-hidden bg-muted/20 flex items-center justify-center p-4 min-h-[380px]">
                    <div
                      className="max-h-[460px] max-w-full rounded border shadow-sm overflow-hidden"
                      style={{
                        backgroundImage:
                          "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 8px 8px",
                      }}
                    >
                      <img
                        src={imageDetails.dataUrl}
                        alt="Pasted"
                        className="max-h-[440px] w-auto object-contain mx-auto"
                      />
                    </div>
                  </div>

                  {/* Actions column */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Clipboard Actions
                      </div>

                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={handleCopyClipboardImage}
                      >
                        {copiedImage ? (
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <Clipboard className="h-4 w-4 mr-2 text-primary" />
                        )}
                        {copiedImage
                          ? "Image Copied!"
                          : "Copy Image to Clipboard"}
                      </Button>

                      <Button
                        className="w-full justify-start"
                        variant="outline"
                        onClick={handleCopyDataUri}
                      >
                        {copiedDataUri ? (
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 mr-2 text-primary" />
                        )}
                        {copiedDataUri
                          ? "Data URI Copied!"
                          : "Copy Base64 Data URI"}
                      </Button>
                    </div>

                    <div className="space-y-3 border-t pt-4">
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Export & Download
                      </div>

                      <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-md border text-xs">
                        <button
                          className={`py-1 rounded font-medium ${
                            exportFormat === "png"
                              ? "bg-background shadow text-foreground"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setExportFormat("png")}
                        >
                          PNG
                        </button>
                        <button
                          className={`py-1 rounded font-medium ${
                            exportFormat === "jpeg"
                              ? "bg-background shadow text-foreground"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setExportFormat("jpeg")}
                        >
                          JPEG
                        </button>
                        <button
                          className={`py-1 rounded font-medium ${
                            exportFormat === "webp"
                              ? "bg-background shadow text-foreground"
                              : "text-muted-foreground"
                          }`}
                          onClick={() => setExportFormat("webp")}
                        >
                          WEBP
                        </button>
                      </div>

                      <Button className="w-full" onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" /> Download as{" "}
                        {exportFormat.toUpperCase()}
                      </Button>
                    </div>

                    <div className="p-3 bg-muted/40 rounded-lg text-xs text-muted-foreground flex items-start gap-2">
                      <Info className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span>
                        You can keep pasting new screenshots at any time. It
                        will immediately replace the current preview.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default PasteImage;
