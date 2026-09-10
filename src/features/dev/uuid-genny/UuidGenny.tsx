import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copyToClipboard } from "@/lib/utils";
import { downloadText } from "@/lib/download";
import { generateIds, UuidType } from "./utils";
import { Copy, Download, RefreshCw, Check, Fingerprint } from "lucide-react";

export const UuidGenny: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [type, setType] = useState<UuidType>("v4");
  const [count, setCount] = useState<number>(5);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [braces, setBraces] = useState<boolean>(false);
  const [seed, setSeed] = useState(0);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Regenerate when seed or params change
  const generatedList = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    seed;
    return generateIds(type, count, { uppercase, hyphens, braces });
  }, [type, count, uppercase, hyphens, braces, seed]);

  const handleRegenerate = () => {
    setSeed((s) => s + 1);
  };

  const handleCopySingle = async (id: string, index: number) => {
    const ok = await copyToClipboard(id);
    if (ok) {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const handleCopyAll = async () => {
    const text = generatedList.join("\n");
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handleDownload = () => {
    const text = generatedList.join("\n");
    downloadText(text, `${type}-identifiers.txt`);
  };

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleRegenerate}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            Regenerate
          </Button>
          <Button variant="outline" size="sm" onClick={handleCopyAll}>
            {copiedAll ? (
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" />
            )}
            {copiedAll ? "Copied All" : "Copy All"}
          </Button>
          <Button variant="default" size="sm" onClick={handleDownload}>
            <Download className="w-3.5 h-3.5 mr-1" />
            Download
          </Button>
        </div>
      }
    >
      {/* Options Panel */}
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border/40">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" />
            Generator Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Format Type */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">
              Identifier Type
            </label>
            <div className="flex rounded-md bg-muted p-0.5">
              {(["v4", "v7", "nanoid"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`flex-1 py-1 px-2 rounded text-xs transition-colors uppercase font-medium ${
                    type === t
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "nanoid" ? "NanoID" : `UUID ${t}`}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="space-y-1.5">
            <label className="font-medium text-foreground">
              Quantity (1–1000)
            </label>
            <Input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) =>
                setCount(
                  Math.max(1, Math.min(1000, Number(e.target.value) || 1)),
                )
              }
              className="h-8 text-xs font-mono"
            />
          </div>

          {/* Toggles (UUID only) */}
          {type !== "nanoid" && (
            <>
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">
                  Formatting
                </label>
                <div className="flex items-center space-x-3 pt-1">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uppercase}
                      onChange={(e) => setUppercase(e.target.checked)}
                      className="rounded border-input text-primary"
                    />
                    <span>Uppercase</span>
                  </label>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hyphens}
                      onChange={(e) => setHyphens(e.target.checked)}
                      className="rounded border-input text-primary"
                    />
                    <span>Hyphens</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Braces</label>
                <div className="pt-1">
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={braces}
                      onChange={(e) => setBraces(e.target.checked)}
                      className="rounded border-input text-primary"
                    />
                    <span>Include &#123; &#125;</span>
                  </label>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Generated IDs Output */}
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-semibold">
            Generated {type.toUpperCase()} IDs ({generatedList.length})
          </CardTitle>
          <span className="text-xs text-muted-foreground font-mono">
            {type === "v7"
              ? "Monotonic timestamp-ordered"
              : type === "v4"
                ? "Cryptographically random v4"
                : "21-character URL-friendly"}
          </span>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/30 max-h-[500px] overflow-y-auto">
          {generatedList.map((id, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 text-xs hover:bg-muted/40 transition-colors group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span className="text-muted-foreground font-mono text-[11px] w-6 text-right select-none">
                  {index + 1}.
                </span>
                <span className="font-mono text-sm text-foreground select-all truncate">
                  {id}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs opacity-80 group-hover:opacity-100"
                onClick={() => handleCopySingle(id, index)}
              >
                {copiedIndex === index ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </ToolShell>
  );
};

export default UuidGenny;
