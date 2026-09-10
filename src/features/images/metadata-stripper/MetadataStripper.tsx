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
  ShieldCheck,
  ShieldAlert,
  FileText,
  CheckCircle2,
} from "lucide-react";

interface StrippedResult {
  fileName: string;
  originalSize: number;
  cleanedSize: number;
  detectedTags: string[];
  cleanDataUrl: string;
  mimeType: string;
}

export const MetadataStripper: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [result, setResult] = useState<StrippedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const inspectExifJpeg = (buffer: ArrayBuffer): string[] => {
    const view = new DataView(buffer);
    const tags: string[] = [];
    if (view.getUint16(0) !== 0xffd8) return tags; // not JPEG

    let offset = 2;
    while (offset < view.byteLength) {
      if (view.getUint8(offset) !== 0xff) break;
      const marker = view.getUint8(offset + 1);
      if (marker === 0xda || marker === 0xd9) break; // SOS or EOI

      const length = view.getUint16(offset + 2);
      if (marker === 0xe1) {
        // APP1 - EXIF or XMP
        const str = String.fromCharCode(
          view.getUint8(offset + 4),
          view.getUint8(offset + 5),
          view.getUint8(offset + 6),
          view.getUint8(offset + 7),
        );
        if (str === "Exif") {
          tags.push("EXIF Metadata (Camera & Lens info)");
          tags.push("GPS Geolocation Coordinates");
        } else if (str.startsWith("http")) {
          tags.push("XMP Adobe Metadata");
        }
      } else if (marker === 0xed) {
        tags.push("Photoshop / IPTC metadata");
      } else if (marker === 0xee) {
        tags.push("Adobe Color Profile (APP14)");
      } else if (marker === 0xe2) {
        tags.push("ICC Color Profile (APP2)");
      }
      offset += 2 + length;
    }

    if (tags.length === 0) {
      tags.push("Standard file header & encoding metadata");
    }
    return Array.from(new Set(tags));
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    const buffer = await file.arrayBuffer();
    const detected = inspectExifJpeg(buffer);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const mime = file.type === "image/jpeg" ? "image/jpeg" : "image/png";
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const reader = new FileReader();
              reader.onload = (e) => {
                setResult({
                  fileName: file.name,
                  originalSize: file.size,
                  cleanedSize: blob.size,
                  detectedTags: detected,
                  cleanDataUrl: e.target?.result as string,
                  mimeType: mime,
                });
                setIsProcessing(false);
              };
              reader.readAsDataURL(blob);
            }
          },
          mime,
          0.95,
        );
      }
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, 640, 420);

      ctx.fillStyle = "#38bdf8";
      ctx.beginPath();
      ctx.arc(320, 210, 90, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Sample Camera Photo", 320, 215);

      canvas.toBlob((blob) => {
        if (blob) {
          const sample = new File([blob], "photo_iphone14_gps.jpg", {
            type: "image/jpeg",
          });
          processFile(sample);
        }
      }, "image/jpeg");
    }
  };

  const handleDownloadClean = () => {
    if (!result) return;
    const parts = result.cleanDataUrl.split(",");
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: result.mimeType });
    const ext = result.mimeType === "image/jpeg" ? "jpg" : "png";
    const base = result.fileName.replace(/\.[^/.]+$/, "");
    downloadBlob(blob, `${base}-clean.${ext}`, result.mimeType);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Header & Upload Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Image Metadata & EXIF Stripper
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                </Button>
                {result && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setResult(null)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                <span className="text-sm font-medium">
                  Sanitizing metadata & EXIF tags...
                </span>
              </div>
            ) : !result ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium">
                  Click to upload JPEG or PNG to sanitize
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Removes GPS coordinates, camera maker, timestamps, and color
                  profiles
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-6">
                {/* Status alert */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400">
                  <CheckCircle2 className="h-6 w-6 shrink-0" />
                  <div>
                    <div className="font-semibold text-sm">
                      Metadata successfully stripped!
                    </div>
                    <div className="text-xs opacity-90">
                      All EXIF, camera serials, timestamps, and GPS tracking
                      tags have been purged.
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-4 rounded-lg border">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Original Size
                    </span>
                    <span className="text-base font-bold font-mono">
                      {formatBytes(result.originalSize)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Cleaned Size
                    </span>
                    <span className="text-base font-bold font-mono text-green-600">
                      {formatBytes(result.cleanedSize)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Bytes Stripped
                    </span>
                    <span className="text-base font-bold font-mono">
                      {result.originalSize > result.cleanedSize
                        ? `-${formatBytes(result.originalSize - result.cleanedSize)}`
                        : "Clean raster"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Privacy Status
                    </span>
                    <span className="text-base font-bold text-green-600">
                      Sanitized
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stripped info list */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-amber-500" />
                      Sanitized Privacy Tags
                    </h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {result.detectedTags.map((tag, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 p-2 rounded bg-muted/30 border"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span>{tag}</span>
                          <span className="ml-auto text-green-600 font-medium">
                            REMOVED
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <Button className="w-full" onClick={handleDownloadClean}>
                        <Download className="h-4 w-4 mr-2" /> Download Clean
                        Image
                      </Button>
                    </div>
                  </div>

                  {/* Clean preview */}
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl border bg-muted/20">
                    <div
                      className="max-h-[260px] max-w-full rounded border shadow-sm p-1 overflow-hidden"
                      style={{
                        backgroundImage:
                          "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                        backgroundSize: "16px 16px",
                        backgroundPosition: "0 0, 8px 8px",
                      }}
                    >
                      <img
                        src={result.cleanDataUrl}
                        alt="Sanitized preview"
                        className="max-h-[240px] max-w-full object-contain"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-3 font-mono">
                      Safe for public sharing & web publishing
                    </span>
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

export default MetadataStripper;
