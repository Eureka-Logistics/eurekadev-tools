import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/utils";
import { downloadText } from "@/lib/download";
import { Copy, Download, Trash2, Check, UploadCloud } from "lucide-react";

export const GenericToolView: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleCopy = async () => {
    if (!output) return;
    const ok = await copyToClipboard(output);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!output) return;
    downloadText(output, `${tool.id}-output.txt`);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleProcess = () => {
    // Default transformation: clean & uppercase / summarize
    setOutput(`Processed input for ${tool.name}:\n${input.trim()}`);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const text = await file.text();
      setInput(text);
    }
  };

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!input && !output}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!output}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" />
            )}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleDownload}
            disabled={!output}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card
          className={`transition-colors ${dragOver ? "border-primary bg-primary/5" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Input</CardTitle>
              {tool.accepts && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  Accepts: {tool.accepts.join(", ")}
                </span>
              )}
            </div>
            <CardDescription className="text-xs">
              Paste text or drag and drop supported files here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter input or data for ${tool.name}...`}
              rows={12}
              className="resize-y"
            />
            <div className="flex items-center justify-between">
              <label className="cursor-pointer inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
                <UploadCloud className="w-4 h-4 mr-1.5" />
                <span>Open file</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const text = await file.text();
                      setInput(text);
                    }
                  }}
                />
              </label>

              <Button
                size="sm"
                onClick={handleProcess}
                disabled={!input.trim()}
              >
                Execute
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Output</CardTitle>
              {tool.produces && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  Produces: {tool.produces.join(", ")}
                </span>
              )}
            </div>
            <CardDescription className="text-xs">
              Result will appear here immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={output}
              readOnly
              placeholder="Output will be generated here..."
              rows={12}
              className="bg-muted/30 resize-y"
            />
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};
