import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { FileText, Copy, Check, Search } from "lucide-react";

interface PaperSpec {
  name: string;
  series: "ISO A" | "ISO B" | "ISO C" | "US / Imperial";
  wMm: number;
  hMm: number;
  wIn: number;
  hIn: number;
}

const PAPERS: PaperSpec[] = [
  // ISO A
  { name: "A0", series: "ISO A", wMm: 841, hMm: 1189, wIn: 33.1, hIn: 46.8 },
  { name: "A1", series: "ISO A", wMm: 594, hMm: 841, wIn: 23.4, hIn: 33.1 },
  { name: "A2", series: "ISO A", wMm: 420, hMm: 594, wIn: 16.5, hIn: 23.4 },
  { name: "A3", series: "ISO A", wMm: 297, hMm: 420, wIn: 11.7, hIn: 16.5 },
  { name: "A4", series: "ISO A", wMm: 210, hMm: 297, wIn: 8.3, hIn: 11.7 },
  { name: "A5", series: "ISO A", wMm: 148, hMm: 210, wIn: 5.8, hIn: 8.3 },
  { name: "A6", series: "ISO A", wMm: 105, hMm: 148, wIn: 4.1, hIn: 5.8 },
  { name: "A7", series: "ISO A", wMm: 74, hMm: 105, wIn: 2.9, hIn: 4.1 },

  // ISO B
  { name: "B0", series: "ISO B", wMm: 1000, hMm: 1414, wIn: 39.4, hIn: 55.7 },
  { name: "B1", series: "ISO B", wMm: 707, hMm: 1000, wIn: 27.8, hIn: 39.4 },
  { name: "B2", series: "ISO B", wMm: 500, hMm: 707, wIn: 19.7, hIn: 27.8 },
  { name: "B3", series: "ISO B", wMm: 353, hMm: 500, wIn: 13.9, hIn: 19.7 },
  { name: "B4", series: "ISO B", wMm: 250, hMm: 353, wIn: 9.8, hIn: 13.9 },
  { name: "B5", series: "ISO B", wMm: 176, hMm: 250, wIn: 6.9, hIn: 9.8 },

  // ISO C
  { name: "C4", series: "ISO C", wMm: 229, hMm: 324, wIn: 9.0, hIn: 12.8 },
  { name: "C5", series: "ISO C", wMm: 162, hMm: 229, wIn: 6.4, hIn: 9.0 },
  { name: "C6", series: "ISO C", wMm: 114, hMm: 162, wIn: 4.5, hIn: 6.4 },

  // US
  {
    name: "US Letter",
    series: "US / Imperial",
    wMm: 216,
    hMm: 279,
    wIn: 8.5,
    hIn: 11.0,
  },
  {
    name: "US Legal",
    series: "US / Imperial",
    wMm: 216,
    hMm: 356,
    wIn: 8.5,
    hIn: 14.0,
  },
  {
    name: "US Tabloid",
    series: "US / Imperial",
    wMm: 279,
    hMm: 432,
    wIn: 11.0,
    hIn: 17.0,
  },
  {
    name: "Executive",
    series: "US / Imperial",
    wMm: 184,
    hMm: 267,
    wIn: 7.25,
    hIn: 10.5,
  },
];

export const PaperSizes: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [unit, setUnit] = useState<"mm" | "in" | "px72" | "px300">("mm");
  const [search, setSearch] = useState<string>("");
  const [selectedPaper, setSelectedPaper] = useState<PaperSpec>(PAPERS[4]); // A4 default
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PAPERS.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.series.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  const formatDimensions = (p: PaperSpec) => {
    if (unit === "mm") return `${p.wMm} \u00D7 ${p.hMm} mm`;
    if (unit === "in") return `${p.wIn} \u00D7 ${p.hIn} in`;
    if (unit === "px72")
      return `${Math.round(p.wIn * 72)} \u00D7 ${Math.round(p.hIn * 72)} px`;
    return `${Math.round(p.wIn * 300)} \u00D7 ${Math.round(p.hIn * 300)} px`;
  };

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                International Paper Dimensions Directory
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-muted p-1 rounded-md text-xs">
                  <button
                    onClick={() => setUnit("mm")}
                    className={`px-2 py-0.5 rounded font-medium ${
                      unit === "mm"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    mm
                  </button>
                  <button
                    onClick={() => setUnit("in")}
                    className={`px-2 py-0.5 rounded font-medium ${
                      unit === "in"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    in
                  </button>
                  <button
                    onClick={() => setUnit("px72")}
                    className={`px-2 py-0.5 rounded font-medium ${
                      unit === "px72"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    72 DPI
                  </button>
                  <button
                    onClick={() => setUnit("px300")}
                    className={`px-2 py-0.5 rounded font-medium ${
                      unit === "px300"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    300 DPI
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search paper formats (e.g. A4, Letter, B2)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 h-9 text-xs border rounded-md bg-background"
              />
            </div>
          </CardContent>
        </Card>

        {/* Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of paper sizes */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filtered.map((paper) => {
              const formatted = formatDimensions(paper);
              const isSelected = selectedPaper.name === paper.name;
              return (
                <div
                  key={paper.name}
                  onClick={() => setSelectedPaper(paper)}
                  className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-muted/10 hover:bg-muted/30"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm">{paper.name}</span>
                      <span className="text-[10px] bg-muted px-1.5 py-0.2 rounded text-muted-foreground font-mono">
                        {paper.series}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground mt-0.5 block">
                      {formatted}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(formatted, paper.name);
                    }}
                  >
                    {copiedKey === paper.name ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 opacity-60" />
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Aspect ratio preview sheet */}
          <Card className="flex flex-col items-center justify-center p-6 bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Scale Preview: {selectedPaper.name}
            </span>

            <div
              className="bg-white dark:bg-slate-900 border-2 border-primary shadow-lg rounded flex items-center justify-center p-4 transition-all"
              style={{
                width: `${Math.min(220, (selectedPaper.wMm / selectedPaper.hMm) * 280)}px`,
                height: "280px",
              }}
            >
              <div className="text-center font-mono space-y-1">
                <span className="text-sm font-bold block">
                  {selectedPaper.name}
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  {selectedPaper.wMm} &times; {selectedPaper.hMm} mm
                </span>
                <span className="text-[11px] text-muted-foreground block">
                  {selectedPaper.wIn}&quot; &times; {selectedPaper.hIn}&quot;
                </span>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-muted-foreground">
              Aspect Ratio: {(selectedPaper.hMm / selectedPaper.wMm).toFixed(2)}
              :1 (1:&radic;2)
            </div>
          </Card>
        </div>
      </div>
    </ToolShell>
  );
};

export default PaperSizes;
