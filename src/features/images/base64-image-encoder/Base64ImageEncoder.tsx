import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { downloadBlob } from "@/lib/download";
import {
  UploadCloud,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  Binary,
} from "lucide-react";

export const Base64ImageEncoder: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    type: string;
    size: number;
    dataUrl: string;
    rawBase64: string;
    width?: number;
    height?: number;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    "datauri" | "html" | "css" | "raw"
  >("datauri");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const commaIdx = dataUrl.indexOf(",");
      const rawBase64 = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : dataUrl;

      const img = new Image();
      img.onload = () => {
        setFileInfo({
          name: file.name,
          type: file.type || "image/png",
          size: file.size,
          dataUrl,
          rawBase64,
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 120;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#4f46e5";
      ctx.beginPath();
      ctx.arc(60, 60, 50, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("64", 60, 60);

      canvas.toBlob((blob) => {
        if (blob) {
          const sample = new File([blob], "icon-sample.png", {
            type: "image/png",
          });
          processFile(sample);
        }
      }, "image/png");
    }
  };

  const copySnippet = async (text: string, key: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getSnippets = () => {
    if (!fileInfo) return null;
    const { dataUrl, rawBase64, name } = fileInfo;
    return {
      datauri: dataUrl,
      html: `<img src="${dataUrl}" alt="${name}" />`,
      css: `.element {\n  background-image: url("${dataUrl}");\n  background-size: contain;\n  background-repeat: no-repeat;\n}`,
      raw: rawBase64,
    };
  };

  const snippets = getSnippets();

  const handleDownloadTxt = () => {
    if (!fileInfo) return;
    const blob = new Blob([fileInfo.dataUrl], {
      type: "text/plain;charset=utf-8",
    });
    downloadBlob(blob, `${fileInfo.name}-base64.txt`, "text/plain");
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
                <Binary className="h-4 w-4 text-primary" />
                Base64 Image Encoder
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                </Button>
                {fileInfo && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setFileInfo(null)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!fileInfo ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium">
                  Upload an image to convert to Base64
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Supports PNG, JPG, GIF, WebP, SVG, ICO
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <span className="text-xs text-muted-foreground block">
                    File Name
                  </span>
                  <span
                    className="text-sm font-semibold truncate block"
                    title={fileInfo.name}
                  >
                    {fileInfo.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Binary Size
                  </span>
                  <span className="text-sm font-semibold font-mono">
                    {formatBytes(fileInfo.size)}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Base64 Length
                  </span>
                  <span className="text-sm font-semibold font-mono">
                    {fileInfo.dataUrl.length.toLocaleString()} chars (~
                    {formatBytes(fileInfo.dataUrl.length)})
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">
                    Dimensions
                  </span>
                  <span className="text-sm font-semibold font-mono">
                    {fileInfo.width} &times; {fileInfo.height} px
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output & Preview Card */}
        {fileInfo && snippets && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview */}
            <Card className="flex flex-col items-center justify-center p-6 bg-muted/10">
              <div
                className="max-h-[260px] max-w-full rounded border shadow-sm p-2 overflow-hidden flex items-center justify-center"
                style={{
                  backgroundImage:
                    "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                  backgroundSize: "16px 16px",
                  backgroundPosition: "0 0, 8px 8px",
                }}
              >
                <img
                  src={fileInfo.dataUrl}
                  alt="Preview"
                  className="max-h-[220px] max-w-full object-contain"
                />
              </div>
              <div className="mt-4 flex gap-2 w-full">
                <Button
                  size="sm"
                  className="w-full"
                  variant="outline"
                  onClick={handleDownloadTxt}
                >
                  <Download className="h-4 w-4 mr-1" /> Download as TXT
                </Button>
              </div>
            </Card>

            {/* Code Snippets */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2 border-b">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-1 p-1 bg-muted rounded-md border text-xs">
                    <button
                      className={`px-3 py-1 rounded font-medium transition-colors ${
                        activeTab === "datauri"
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("datauri")}
                    >
                      Data URI
                    </button>
                    <button
                      className={`px-3 py-1 rounded font-medium transition-colors ${
                        activeTab === "html"
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("html")}
                    >
                      HTML &lt;img&gt;
                    </button>
                    <button
                      className={`px-3 py-1 rounded font-medium transition-colors ${
                        activeTab === "css"
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("css")}
                    >
                      CSS
                    </button>
                    <button
                      className={`px-3 py-1 rounded font-medium transition-colors ${
                        activeTab === "raw"
                          ? "bg-background shadow text-foreground"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => setActiveTab("raw")}
                    >
                      Raw Base64
                    </button>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => copySnippet(snippets[activeTab], activeTab)}
                  >
                    {copiedKey === activeTab ? (
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copiedKey === activeTab ? "Copied" : "Copy"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <textarea
                  readOnly
                  value={snippets[activeTab]}
                  className="w-full h-[220px] font-mono text-xs p-3 rounded-md bg-muted/40 border resize-none focus:outline-none"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default Base64ImageEncoder;
