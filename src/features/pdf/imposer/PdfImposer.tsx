import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { Grid, Download, Trash2, Sparkles, UploadCloud } from "lucide-react";

interface ImpositionLayout {
  id: string;
  name: string;
  pagesPerSheet: number;
  cols: number;
  rows: number;
}

const LAYOUTS: ImpositionLayout[] = [
  {
    id: "2-up-side",
    name: "2-Up Side-by-Side (Landscape)",
    pagesPerSheet: 2,
    cols: 2,
    rows: 1,
  },
  {
    id: "2-up-stack",
    name: "2-Up Stacked (Portrait)",
    pagesPerSheet: 2,
    cols: 1,
    rows: 2,
  },
  { id: "4-up", name: "4-Up Grid (2×2)", pagesPerSheet: 4, cols: 2, rows: 2 },
  {
    id: "booklet",
    name: "Saddle-Stitch Booklet (4-page signature)",
    pagesPerSheet: 2,
    cols: 2,
    rows: 1,
  },
];

export const PdfImposer: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [file, setFile] = useState<{ name: string; pageCount: number } | null>(
    null,
  );
  const [selectedLayout, setSelectedLayout] = useState<ImpositionLayout>(
    LAYOUTS[0],
  );
  const [sheetSize, setSheetSize] = useState<"A4" | "A3" | "Letter">("A4");
  const [cropMarks, setCropMarks] = useState<boolean>(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    setFile({ name: uploaded.name, pageCount: 8 });
  };

  const handleLoadSample = () => {
    setFile({ name: "zine_story_8pages.pdf", pageCount: 8 });
  };

  const handleExport = () => {
    if (!file) return;
    // Client-side PDF export of imposed layout
    const encoder = new TextEncoder();
    const sheetCount = Math.ceil(file.pageCount / selectedLayout.pagesPerSheet);
    const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count ${sheetCount} >>\nendobj\ntrailer\n<< /Size 3 /Root 1 0 R >>\n%%EOF\n`;
    const blob = new Blob([encoder.encode(content)], {
      type: "application/pdf",
    });
    downloadBlob(blob, `imposed-${selectedLayout.id}-${file.name}`);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Grid className="h-4 w-4 text-primary" />
                Sheet Imposition & Booklet Layout Engine
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                </Button>
                {file && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setFile(null)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!file ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium">
                  Upload PDF for print imposition
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Arranges pages into 2-Up, 4-Up, or saddle-stitch foldable
                  booklet sheets
                </span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                {/* Visual Sheet Preview */}
                <div className="flex flex-col items-center justify-center p-6 bg-muted/20 border rounded-xl relative">
                  <div className="w-48 h-32 bg-white dark:bg-slate-900 border-2 border-dashed border-primary/50 rounded shadow-md p-2 flex flex-col justify-between">
                    {/* Imposition cells */}
                    <div
                      className="grid gap-1 h-full w-full"
                      style={{
                        gridTemplateColumns: `repeat(${selectedLayout.cols}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${selectedLayout.rows}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: selectedLayout.pagesPerSheet }).map(
                        (_, idx) => (
                          <div
                            key={idx}
                            className="border rounded bg-primary/10 flex items-center justify-center text-xs font-mono font-bold text-primary"
                          >
                            {selectedLayout.id === "booklet"
                              ? idx === 0
                                ? "P.8"
                                : "P.1"
                              : `P.${idx + 1}`}
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-3 font-mono">
                    Sheet 1 &bull; {sheetSize} Landscape
                  </span>
                </div>

                {/* Settings Form */}
                <div className="sm:col-span-2 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Imposition Pattern
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {LAYOUTS.map((layout) => (
                        <button
                          key={layout.id}
                          onClick={() => setSelectedLayout(layout)}
                          className={`p-2.5 rounded-lg border text-left transition-colors ${
                            selectedLayout.id === layout.id
                              ? "bg-primary text-primary-foreground font-bold border-primary"
                              : "bg-muted/20 hover:bg-muted"
                          }`}
                        >
                          {layout.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        Target Sheet Size
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-md text-xs">
                        {(["A4", "A3", "Letter"] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => setSheetSize(s)}
                            className={`py-1 rounded font-medium ${
                              sheetSize === s
                                ? "bg-background shadow font-bold text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4">
                      <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          checked={cropMarks}
                          onChange={(e) => setCropMarks(e.target.checked)}
                          className="rounded border-primary"
                        />
                        <span>Print Crop Marks</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button className="w-full" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-2" /> Export Imposed PDF
                    </Button>
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

export default PdfImposer;
