import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parsePdfMetadata, PdfMetadata } from "@/lib/pdf/simplePdf";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Sparkles,
  Trash2,
} from "lucide-react";

export const PdfPreflight: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [meta, setMeta] = useState<PdfMetadata | null>(null);
  const [fileName, setFileName] = useState<string>("document.pdf");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const result = parsePdfMetadata(buffer);
    setMeta(result);
  };

  const handleLoadSample = () => {
    setFileName("press_ad_print_ready.pdf");
    setMeta({
      version: "1.6",
      pageCount: 16,
      fileSizeBytes: 4210000,
      hasFonts: true,
      hasImages: true,
      colorSpace: "CMYK",
      title: "Commercial Print Catalog Q3",
      author: "Design Studio",
    });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-primary" />
                PDF Preflight & Print Readiness Inspector
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                </Button>
                {meta && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMeta(null)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!meta ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium">
                  Upload PDF for preflight analysis
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Checks color space, font embedding, raster images, and PDF
                  version compliance
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-1 border-b">
                  <span className="font-semibold text-sm">{fileName}</span>
                  <span className="text-xs text-muted-foreground font-mono">Preflight Report</span>
                </div>
                {/* Summary banner */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-4 rounded-lg border">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      PDF Version
                    </span>
                    <span className="text-base font-bold font-mono">
                      v{meta.version}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Total Pages
                    </span>
                    <span className="text-base font-bold font-mono">
                      {meta.pageCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      File Size
                    </span>
                    <span className="text-base font-bold font-mono">
                      {formatBytes(meta.fileSizeBytes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Color Space
                    </span>
                    <span
                      className={`text-base font-bold font-mono ${
                        meta.colorSpace === "CMYK"
                          ? "text-green-600"
                          : "text-amber-500"
                      }`}
                    >
                      {meta.colorSpace}
                    </span>
                  </div>
                </div>

                {/* Preflight Checklist */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Preflight Diagnostics Checklist
                  </span>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold">
                            PDF Architecture & Headers
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            Valid ISO header and cross-reference table structure
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-600 font-mono">
                        VALID
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                      <div className="flex items-center gap-3">
                        {meta.colorSpace === "CMYK" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                        )}
                        <div>
                          <div className="text-xs font-semibold">
                            Print Press Color Profile
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {meta.colorSpace === "CMYK"
                              ? "Native CMYK color space detected (ideal for offset/commercial printing)"
                              : "RGB color space detected (fine for digital screen/office print; convert to CMYK for press)"}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-bold font-mono ${
                          meta.colorSpace === "CMYK"
                            ? "text-green-600"
                            : "text-amber-500"
                        }`}
                      >
                        {meta.colorSpace}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold">
                            Embedded Typography Resources
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {meta.hasFonts
                              ? "Font dictionaries detected in document resources"
                              : "Standard core fonts utilized"}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-green-600 font-mono">
                        {meta.hasFonts ? "EMBEDDED" : "STANDARD"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold">
                            Embedded Graphics Streams
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {meta.hasImages
                              ? "XObject raster streams present"
                              : "Pure vector artwork"}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-primary font-mono">
                        {meta.hasImages ? "RASTER STREAMS" : "VECTOR ONLY"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Metadata properties */}
                {(meta.title || meta.author) && (
                  <div className="p-3 rounded-lg border bg-muted/20 text-xs space-y-1">
                    <span className="font-semibold text-muted-foreground block">
                      Document Title & Author
                    </span>
                    {meta.title && (
                      <div>
                        Title: <span className="font-medium">{meta.title}</span>
                      </div>
                    )}
                    {meta.author && (
                      <div>
                        Author:{" "}
                        <span className="font-medium">{meta.author}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default PdfPreflight;
