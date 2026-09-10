import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { copyToClipboard } from "@/lib/utils";
import {
  FileCode,
  Download,
  Copy,
  Check,
  Sparkles,
  UploadCloud,
  Trash2,
} from "lucide-react";

const SAMPLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generator: Adobe Illustrator 25.0.0, SVG Export Plug-In -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
     xmlns:sketch="http://www.bohemiancoding.com/sketch/ns"
     version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 500.00000 500.00000" 
     style="enable-background:new 0 0 500 500;" xml:space="preserve"
     data-name="Layer 1">
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
      <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/">
        <dc:format>image/svg+xml</dc:format>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  <title>Sample Shape</title>
  <desc>Created with Adobe Illustrator</desc>
  <defs>
  </defs>
  <g id="Page-1" sketch:type="MSPage">
    <circle fill="#3b82f6" cx="250.12345" cy="250.67891" r="180.45678" />
    <path fill="#ffffff" d="M 200.54321,150.12345 L 350.98765,250.55555 L 200.54321,350.99999 Z" />
  </g>
</svg>`;

export const SvgOptimiser: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [svgInput, setSvgInput] = useState<string>("");
  const [decimalPrecision, setDecimalPrecision] = useState<number>(2);
  const [removeComments, setRemoveComments] = useState<boolean>(true);
  const [removeMetadata, setRemoveMetadata] = useState<boolean>(true);
  const [removeDocType, setRemoveDocType] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const handleLoadSample = () => {
    setSvgInput(SAMPLE_SVG);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSvgInput(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const optimizedSvg = useMemo(() => {
    if (!svgInput.trim()) return "";

    let res = svgInput;

    if (removeDocType) {
      res = res.replace(/<\?xml[^>]*\?>/gi, "");
      res = res.replace(/<!DOCTYPE[^>]*>/gi, "");
    }

    if (removeComments) {
      res = res.replace(/<!--[\s\S]*?-->/g, "");
    }

    if (removeMetadata) {
      res = res.replace(/<metadata[\s\S]*?<\/metadata>/gi, "");
      res = res.replace(/<title[\s\S]*?<\/title>/gi, "");
      res = res.replace(/<desc[\s\S]*?<\/desc>/gi, "");
      res = res.replace(/<defs>\s*<\/defs>/gi, "");
      // Strip editor specific namespaces and attributes
      res = res.replace(
        /\s*(xmlns:sketch|xmlns:inkscape|xmlns:sodipodi|sketch:[a-zA-Z]+|inkscape:[a-zA-Z]+|sodipodi:[a-zA-Z]+|data-[a-zA-Z-]+)="[^"]*"/gi,
        "",
      );
    }

    // Round long floats in numbers / paths
    if (decimalPrecision >= 0) {
      const regex = /([0-9]+\.[0-9]{3,})/g;
      res = res.replace(regex, (match) => {
        const num = parseFloat(match);
        return isNaN(num)
          ? match
          : Number(num.toFixed(decimalPrecision)).toString();
      });
    }

    // Collapse multiple spaces and line breaks
    res = res.replace(/>\s+</g, "><");
    res = res.replace(/\s{2,}/g, " ");
    return res.trim();
  }, [
    svgInput,
    decimalPrecision,
    removeComments,
    removeMetadata,
    removeDocType,
  ]);

  const origBytes = useMemo(() => new Blob([svgInput]).size, [svgInput]);
  const optBytes = useMemo(() => new Blob([optimizedSvg]).size, [optimizedSvg]);
  const savedPercent =
    origBytes > 0 ? Math.round(((origBytes - optBytes) / origBytes) * 100) : 0;

  const handleCopy = async () => {
    await copyToClipboard(optimizedSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([optimizedSvg], { type: "image/svg+xml" });
    downloadBlob(blob, "optimized.svg", "image/svg+xml");
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                SVG Cleaner & Optimiser
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                </Button>
                {svgInput && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSvgInput("")}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!svgInput ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium">
                  Click to upload SVG or paste SVG code below
                </span>
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Original Size
                  </span>
                  <span className="text-base font-bold font-mono">
                    {formatBytes(origBytes)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Optimized Size
                  </span>
                  <span className="text-base font-bold font-mono text-green-600">
                    {formatBytes(optBytes)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Savings
                  </span>
                  <span className="text-base font-bold font-mono text-primary">
                    {savedPercent > 0 ? `-${savedPercent}%` : "0%"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleDownload}
                    disabled={!optimizedSvg}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </div>
            )}

            {/* Optimization options */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeComments}
                  onChange={(e) => setRemoveComments(e.target.checked)}
                  className="rounded border-primary"
                />
                <span>Strip Comments</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeDocType}
                  onChange={(e) => setRemoveDocType(e.target.checked)}
                  className="rounded border-primary"
                />
                <span>Remove Doctype & XML</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeMetadata}
                  onChange={(e) => setRemoveMetadata(e.target.checked)}
                  className="rounded border-primary"
                />
                <span>Clean Editor Tags</span>
              </label>

              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Decimals:</span>
                <select
                  value={decimalPrecision}
                  onChange={(e) => setDecimalPrecision(Number(e.target.value))}
                  className="h-7 px-2 border rounded bg-background text-xs"
                >
                  <option value={1}>1 digit</option>
                  <option value={2}>2 digits</option>
                  <option value={3}>3 digits</option>
                  <option value={-1}>No rounding</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input / Output split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Input SVG Markup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={svgInput}
                onChange={(e) => setSvgInput(e.target.value)}
                placeholder="<svg ...>...</svg>"
                className="w-full h-80 font-mono text-xs p-3 rounded border bg-muted/20 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  Optimized SVG Output
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={!optimizedSvg}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1 text-primary" />
                  )}
                  {copied ? "Copied" : "Copy SVG"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <textarea
                readOnly
                value={optimizedSvg}
                className="w-full h-80 font-mono text-xs p-3 rounded border bg-muted/40 resize-none focus:outline-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Visual Preview */}
        {optimizedSvg && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Visual Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center p-6 bg-muted/10">
              <div
                className="p-4 rounded border shadow-sm max-h-[300px] overflow-hidden flex items-center justify-center"
                style={{
                  backgroundImage:
                    "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 8px 8px",
                }}
                dangerouslySetInnerHTML={{ __html: optimizedSvg }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolShell>
  );
};

export default SvgOptimiser;
