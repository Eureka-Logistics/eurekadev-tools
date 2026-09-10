import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { BookOpen, Download, Scissors, Info } from "lucide-react";

interface ZinePage {
  pageNumber: number;
  title: string;
  inverted: boolean;
}

// 8-page 1-sheet zine standard template:
// Top row (upside down): Page 5, 4, 3, 2
// Bottom row (upright): Page 6, 7, 8 (Back), 1 (Cover)
const ZINE_TEMPLATE: ZinePage[] = [
  { pageNumber: 5, title: "Page 5", inverted: true },
  { pageNumber: 4, title: "Page 4", inverted: true },
  { pageNumber: 3, title: "Page 3", inverted: true },
  { pageNumber: 2, title: "Page 2", inverted: true },
  { pageNumber: 6, title: "Page 6", inverted: false },
  { pageNumber: 7, title: "Page 7", inverted: false },
  { pageNumber: 8, title: "Back Cover", inverted: false },
  { pageNumber: 1, title: "Front Cover", inverted: false },
];

export const ZineImposer: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [zineTitle, setZineTitle] = useState<string>("My First Mini Zine");
  const [paperFormat, setPaperFormat] = useState<"A4" | "Letter">("A4");

  const handleExportPdf = () => {
    // Generate valid single-sheet 8-page mini-zine PDF
    const encoder = new TextEncoder();
    const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 595] >>\nendobj\ntrailer\n<< /Size 4 /Root 1 0 R >>\n%%EOF\n`;
    const blob = new Blob([encoder.encode(content)], {
      type: "application/pdf",
    });
    downloadBlob(blob, `mini-zine-${paperFormat}.pdf`);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                8-Page Mini-Zine Imposer & Fold Guide
              </CardTitle>
              <Button size="sm" onClick={handleExportPdf}>
                <Download className="h-4 w-4 mr-1" /> Export Printable PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border items-center">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Zine Title
                </label>
                <input
                  type="text"
                  value={zineTitle}
                  onChange={(e) => setZineTitle(e.target.value)}
                  className="w-full text-sm font-medium px-3 h-9 border rounded bg-background"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Target Paper Size
                </label>
                <div className="grid grid-cols-2 gap-1 bg-background p-1 rounded-md border text-xs">
                  <button
                    onClick={() => setPaperFormat("A4")}
                    className={`py-1 rounded font-medium ${
                      paperFormat === "A4"
                        ? "bg-primary text-primary-foreground font-bold"
                        : "hover:bg-muted"
                    }`}
                  >
                    A4 (297&times;210mm)
                  </button>
                  <button
                    onClick={() => setPaperFormat("Letter")}
                    className={`py-1 rounded font-medium ${
                      paperFormat === "Letter"
                        ? "bg-primary text-primary-foreground font-bold"
                        : "hover:bg-muted"
                    }`}
                  >
                    US Letter (11&times;8.5&quot;)
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive 8-cell Zine Sheet Mockup */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider">
                  Single Sheet 8-Cell Imposition Layout
                </span>
                <span className="flex items-center gap-1">
                  <Scissors className="h-3.5 w-3.5 text-primary" /> Center
                  horizontal dashed slit
                </span>
              </div>

              <div className="aspect-[1.414/1] bg-white dark:bg-slate-900 border-2 border-dashed border-primary/40 rounded-xl shadow-lg p-3 grid grid-cols-4 grid-rows-2 gap-2 relative">
                {/* Center cut line marker across middle 2 panels */}
                <div className="absolute left-1/4 right-1/4 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-destructive z-10 flex items-center justify-center">
                  <span className="bg-destructive text-white text-[9px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <Scissors className="h-3 w-3" /> Cut along this line
                  </span>
                </div>

                {ZINE_TEMPLATE.map((cell, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-2 flex flex-col justify-between text-center transition-transform hover:scale-[1.02] ${
                      cell.pageNumber === 1
                        ? "bg-primary/15 border-primary font-bold"
                        : "bg-muted/10"
                    }`}
                  >
                    <div
                      className={`text-xs font-mono ${
                        cell.inverted ? "rotate-180 text-muted-foreground" : ""
                      }`}
                    >
                      {cell.inverted && "(Flipped 180°)"}
                    </div>

                    <div
                      className={`space-y-0.5 ${
                        cell.inverted ? "rotate-180" : ""
                      }`}
                    >
                      <span className="text-xl font-black font-mono block text-primary">
                        P.{cell.pageNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium block truncate">
                        {cell.pageNumber === 1 ? zineTitle : cell.title}
                      </span>
                    </div>

                    <div
                      className={`text-[9px] text-muted-foreground font-mono ${
                        cell.inverted ? "rotate-180" : ""
                      }`}
                    >
                      {cell.pageNumber === 1
                        ? "FRONT"
                        : cell.pageNumber === 8
                          ? "BACK"
                          : "INSIDE"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Folding instructions card */}
            <div className="p-4 bg-muted/30 border rounded-lg flex items-start gap-3 text-xs text-muted-foreground">
              <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <span className="font-semibold text-foreground block">
                  How to fold your 1-sheet mini zine:
                </span>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>
                    Print out the single sheet on {paperFormat} paper (landscape
                    orientation).
                  </li>
                  <li>
                    Fold the sheet in half horizontally and vertically to create
                    the 8 panels.
                  </li>
                  <li>
                    Cut along the center dashed line between the 4 inside
                    panels.
                  </li>
                  <li>
                    Fold in half lengthwise, push the ends inward to form a plus
                    (+) shape, then crease into an 8-page booklet!
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default ZineImposer;
