import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Sparkles, Trash2, FileDiff } from "lucide-react";

interface DiffLine {
  type: "added" | "removed" | "same";
  text: string;
  origLine?: number;
  modLine?: number;
}

const SAMPLE_ORIG = `function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}`;

const SAMPLE_MOD = `function calculateTotal(items, discount = 0) {
  let total = items.reduce((sum, item) => sum + item.price, 0);
  if (discount > 0) {
    total = total * (1 - discount);
  }
  return Math.round(total * 100) / 100;
}`;

export const TextDiff: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [originalText, setOriginalText] = useState<string>(SAMPLE_ORIG);
  const [modifiedText, setModifiedText] = useState<string>(SAMPLE_MOD);
  const [viewMode, setViewMode] = useState<"split" | "unified">("unified");

  // Compute Line Diff using standard LCS
  const diffLines: DiffLine[] = useMemo(() => {
    const orig = originalText.split("\n");
    const mod = modifiedText.split("\n");

    // LCS Matrix
    const matrix: number[][] = Array(orig.length + 1)
      .fill(null)
      .map(() => Array(mod.length + 1).fill(0));

    for (let i = 1; i <= orig.length; i++) {
      for (let j = 1; j <= mod.length; j++) {
        if (orig[i - 1] === mod[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1] + 1;
        } else {
          matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
        }
      }
    }

    // Backtrack diff
    const result: DiffLine[] = [];
    let i = orig.length;
    let j = mod.length;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && orig[i - 1] === mod[j - 1]) {
        result.unshift({
          type: "same",
          text: orig[i - 1],
          origLine: i,
          modLine: j,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
        result.unshift({ type: "added", text: mod[j - 1], modLine: j });
        j--;
      } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
        result.unshift({ type: "removed", text: orig[i - 1], origLine: i });
        i--;
      }
    }

    return result;
  }, [originalText, modifiedText]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;
    let same = 0;
    diffLines.forEach((l) => {
      if (l.type === "added") added++;
      else if (l.type === "removed") removed++;
      else same++;
    });
    return { added, removed, same };
  }, [diffLines]);

  const handleSwap = () => {
    const tmp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(tmp);
  };

  const handleClear = () => {
    setOriginalText("");
    setModifiedText("");
  };

  const handleSample = () => {
    setOriginalText(SAMPLE_ORIG);
    setModifiedText(SAMPLE_MOD);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileDiff className="h-4 w-4 text-primary" />
                Text Diff & Comparison
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-muted p-1 rounded-md text-xs">
                  <button
                    className={`px-2.5 py-1 rounded font-medium ${
                      viewMode === "unified"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setViewMode("unified")}
                  >
                    Unified
                  </button>
                  <button
                    className={`px-2.5 py-1 rounded font-medium ${
                      viewMode === "split"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setViewMode("split")}
                  >
                    Side-by-Side
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSwap}
                  title="Swap Texts"
                >
                  <ArrowLeftRight className="h-4 w-4 mr-1" /> Swap
                </Button>
                <Button size="sm" variant="outline" onClick={handleSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Sample
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClear}
                  title="Clear"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Original Text
                </label>
                <textarea
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  placeholder="Paste original text here..."
                  className="w-full h-44 font-mono text-xs p-3 rounded-lg border bg-muted/20 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Modified Text
                </label>
                <textarea
                  value={modifiedText}
                  onChange={(e) => setModifiedText(e.target.value)}
                  placeholder="Paste modified text here..."
                  className="w-full h-44 font-mono text-xs p-3 rounded-lg border bg-muted/20 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Metrics summary banner */}
            <div className="flex items-center gap-4 bg-muted/40 p-2.5 rounded-lg border text-xs font-mono">
              <span className="text-green-600 font-bold">
                +{stats.added} additions
              </span>
              <span className="text-destructive font-bold">
                -{stats.removed} deletions
              </span>
              <span className="text-muted-foreground">
                {stats.same} unchanged lines
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Diff Output Viewer */}
        <Card className="overflow-hidden">
          <CardHeader className="py-2.5 px-4 bg-muted/30 border-b">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Diff Result
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 font-mono text-xs overflow-x-auto">
            {diffLines.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No text entered.
              </div>
            ) : viewMode === "unified" ? (
              <div className="divide-y divide-border/30">
                {diffLines.map((line, idx) => {
                  let bg = "bg-background";
                  let symbol = " ";
                  let textColor = "text-foreground";

                  if (line.type === "added") {
                    bg = "bg-green-500/10 text-green-700 dark:text-green-400";
                    symbol = "+";
                    textColor =
                      "text-green-700 dark:text-green-400 font-medium";
                  } else if (line.type === "removed") {
                    bg = "bg-red-500/10 text-red-700 dark:text-red-400";
                    symbol = "-";
                    textColor =
                      "text-red-700 dark:text-red-400 line-through opacity-80";
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex items-start px-3 py-1 text-xs hover:bg-muted/40 transition-colors ${bg}`}
                    >
                      <span className="w-8 select-none text-muted-foreground text-right mr-3 text-[11px]">
                        {line.origLine || ""}
                      </span>
                      <span className="w-8 select-none text-muted-foreground text-right mr-3 text-[11px]">
                        {line.modLine || ""}
                      </span>
                      <span className="w-4 select-none font-bold text-center mr-2">
                        {symbol}
                      </span>
                      <pre
                        className={`font-mono text-xs whitespace-pre-wrap break-all ${textColor}`}
                      >
                        {line.text}
                      </pre>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 divide-x divide-border">
                {/* Side by side columns */}
                <div className="divide-y divide-border/30">
                  {diffLines
                    .filter((l) => l.type !== "added")
                    .map((line, idx) => (
                      <div
                        key={idx}
                        className={`flex px-3 py-1 ${
                          line.type === "removed"
                            ? "bg-red-500/10 text-destructive"
                            : ""
                        }`}
                      >
                        <span className="w-8 text-muted-foreground select-none text-right mr-3 text-[11px]">
                          {line.origLine}
                        </span>
                        <pre className="font-mono text-xs whitespace-pre-wrap break-all">
                          {line.text}
                        </pre>
                      </div>
                    ))}
                </div>

                <div className="divide-y divide-border/30">
                  {diffLines
                    .filter((l) => l.type !== "removed")
                    .map((line, idx) => (
                      <div
                        key={idx}
                        className={`flex px-3 py-1 ${
                          line.type === "added"
                            ? "bg-green-500/10 text-green-600"
                            : ""
                        }`}
                      >
                        <span className="w-8 text-muted-foreground select-none text-right mr-3 text-[11px]">
                          {line.modLine}
                        </span>
                        <pre className="font-mono text-xs whitespace-pre-wrap break-all">
                          {line.text}
                        </pre>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default TextDiff;
