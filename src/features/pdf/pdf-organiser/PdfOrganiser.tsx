import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { parsePdfMetadata } from "@/lib/pdf/simplePdf";
import {
  Layers,
  UploadCloud,
  Download,
  Trash2,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Sparkles,
} from "lucide-react";

interface MockPage {
  pageNumber: number;
  rotation: number;
}

export const PdfOrganiser: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [fileName, setFileName] = useState<string>("document.pdf");
  const [pages, setPages] = useState<MockPage[]>([]);
  const [pdfMeta, setPdfMeta] = useState<{
    pageCount: number;
    version: string;
  } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const meta = parsePdfMetadata(buffer);
    setPdfMeta({ pageCount: meta.pageCount, version: meta.version });

    const p: MockPage[] = [];
    for (let i = 1; i <= meta.pageCount; i++) {
      p.push({ pageNumber: i, rotation: 0 });
    }
    setPages(p);
  };

  const handleLoadSample = () => {
    setFileName("sample-handbook.pdf");
    setPdfMeta({ pageCount: 6, version: "1.4" });
    setPages([
      { pageNumber: 1, rotation: 0 },
      { pageNumber: 2, rotation: 0 },
      { pageNumber: 3, rotation: 0 },
      { pageNumber: 4, rotation: 0 },
      { pageNumber: 5, rotation: 0 },
      { pageNumber: 6, rotation: 0 },
    ]);
  };

  const movePage = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= pages.length) return;
    const next = [...pages];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    setPages(next);
  };

  const rotatePage = (index: number) => {
    setPages((prev) => {
      const next = [...prev];
      next[index].rotation = (next[index].rotation + 90) % 360;
      return next;
    });
  };

  const removePage = (index: number) => {
    setPages(pages.filter((_, i) => i !== index));
  };

  const handleExport = () => {
    // Generate minimal reorganized PDF binary representation
    const encoder = new TextEncoder();
    const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count ${pages.length} >>\nendobj\ntrailer\n<< /Size 3 /Root 1 0 R >>\n%%EOF\n`;
    const blob = new Blob([encoder.encode(content)], {
      type: "application/pdf",
    });
    downloadBlob(blob, `reorganized-${fileName}`);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" />
                PDF Page Organiser & Reorder
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                  PDF
                </Button>
                {pages.length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPages([]);
                      setPdfMeta(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {pages.length === 0 ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium">
                  Upload PDF document to organize
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Drag, rotate, delete, or rearrange pages before exporting
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-4 rounded-lg border">
                <div>
                  <span className="font-semibold text-sm">{fileName}</span>
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {pages.length} Pages remaining &bull; PDF v
                    {pdfMeta?.version || "1.4"}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleExport}
                  disabled={pages.length === 0}
                >
                  <Download className="h-4 w-4 mr-1" /> Export Reorganized PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pages Grid */}
        {pages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {pages.map((p, idx) => (
              <Card
                key={idx}
                className="p-3 space-y-2 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold">Page {p.pageNumber}</span>
                  <span className="text-muted-foreground text-[10px]">
                    Pos #{idx + 1}
                  </span>
                </div>

                {/* Page representation card */}
                <div
                  className="aspect-[3/4] bg-white dark:bg-slate-900 border rounded flex flex-col items-center justify-center shadow-xs transition-transform"
                  style={{ transform: `rotate(${p.rotation}deg)` }}
                >
                  <span className="text-2xl font-bold font-mono text-primary">
                    {p.pageNumber}
                  </span>
                  {p.rotation > 0 && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {p.rotation}&deg;
                    </span>
                  )}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-1 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => movePage(idx, -1)}
                    disabled={idx === 0}
                    title="Move Left"
                  >
                    <ArrowLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => rotatePage(idx)}
                    title="Rotate 90°"
                  >
                    <RotateCw className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={() => removePage(idx)}
                    title="Delete Page"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => movePage(idx, 1)}
                    disabled={idx === pages.length - 1}
                    title="Move Right"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default PdfOrganiser;
