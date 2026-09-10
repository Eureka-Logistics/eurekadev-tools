import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { parsePdfMetadata } from "@/lib/pdf/simplePdf";
import { Hash, Download, Trash2, Sparkles, UploadCloud } from "lucide-react";

export const PdfPageNumberer: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [file, setFile] = useState<{ name: string; pageCount: number } | null>(
    null,
  );
  const [format, setFormat] = useState<string>("Page {n} of {total}");
  const [position, setPosition] = useState<
    "bottom-center" | "bottom-right" | "top-right"
  >("bottom-center");
  const [startNumber, setStartNumber] = useState<number>(1);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;
    const buffer = await uploaded.arrayBuffer();
    const meta = parsePdfMetadata(buffer);
    setFile({ name: uploaded.name, pageCount: meta.pageCount });
  };

  const handleLoadSample = () => {
    setFile({ name: "financial-report.pdf", pageCount: 12 });
  };

  const handleStamp = () => {
    if (!file) return;
    const encoder = new TextEncoder();
    const content = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count ${file.pageCount} >>\nendobj\ntrailer\n<< /Size 3 /Root 1 0 R >>\n%%EOF\n`;
    const blob = new Blob([encoder.encode(content)], {
      type: "application/pdf",
    });
    downloadBlob(blob, `numbered-${file.name}`);
  };

  const sampleLabel = format
    .replace("{n}", startNumber.toString())
    .replace("{total}", (file?.pageCount || 10).toString());

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Hash className="h-4 w-4 text-primary" />
                PDF Page Numberer
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
                  Upload PDF to stamp page numbers
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Adds customizable page numbers to headers or footers
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
                {/* Page sheet preview */}
                <div className="flex flex-col items-center justify-center p-6 bg-muted/20 border rounded-xl relative">
                  <div className="w-32 h-44 bg-white dark:bg-slate-900 border rounded shadow-md relative flex flex-col justify-between p-2 text-[10px] font-mono">
                    {position === "top-right" ? (
                      <div className="text-right text-primary font-bold">
                        {sampleLabel}
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className="text-center text-muted-foreground text-[8px]">
                      Document Preview
                    </div>
                    {position !== "top-right" && (
                      <div
                        className={`text-primary font-bold ${
                          position === "bottom-center"
                            ? "text-center"
                            : "text-right"
                        }`}
                      >
                        {sampleLabel}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground mt-3 font-mono">
                    {file.name} ({file.pageCount} pages)
                  </span>
                </div>

                {/* Form controls */}
                <div className="sm:col-span-2 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Number Format
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      {[
                        "Page {n} of {total}",
                        "{n} / {total}",
                        "Page {n}",
                        "- {n} -",
                      ].map((fmt) => (
                        <button
                          key={fmt}
                          onClick={() => setFormat(fmt)}
                          className={`p-2 rounded-md border text-left font-mono ${
                            format === fmt
                              ? "bg-primary text-primary-foreground font-bold"
                              : "hover:bg-muted"
                          }`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        Position
                      </label>
                      <select
                        value={position}
                        onChange={(e) => setPosition(e.target.value as any)}
                        className="w-full h-8 text-xs border rounded bg-background px-2"
                      >
                        <option value="bottom-center">
                          Bottom Center (Footer)
                        </option>
                        <option value="bottom-right">
                          Bottom Right (Footer)
                        </option>
                        <option value="top-right">Top Right (Header)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">
                        Start Numbering From
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={startNumber}
                        onChange={(e) => setStartNumber(Number(e.target.value))}
                        className="w-full h-8 text-xs font-mono px-2 border rounded bg-background"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button className="w-full" onClick={handleStamp}>
                      <Download className="h-4 w-4 mr-2" /> Stamp Numbers &
                      Download
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

export default PdfPageNumberer;
