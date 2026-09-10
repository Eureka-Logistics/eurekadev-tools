import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard, formatBytes } from "@/lib/utils";
import { downloadText } from "@/lib/download";
import {
  parseJsonWithError,
  formatJsonString,
  buildJsonTree,
  JsonTreeNode,
} from "./utils";
import {
  Copy,
  Download,
  Trash2,
  Check,
  UploadCloud,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  FileCode,
  FolderTree,
} from "lucide-react";

export const JsonFormatter: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [source, setSource] = useState(
    '{\n  "name": "Eureka Dev Tools",\n  "version": 1,\n  "offline": true,\n  "tags": ["fast", "privacy", "client-side"]\n}',
  );
  const [indent, setIndent] = useState<"2" | "4" | "tab" | "minify">("2");
  const [view, setView] = useState<"text" | "tree">("text");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const parsed = useMemo(() => {
    if (!source.trim()) return null;
    return parseJsonWithError(source);
  }, [source]);

  const formatted = useMemo(() => {
    if (parsed && parsed.ok) {
      return formatJsonString(parsed.value, indent);
    }
    return "";
  }, [parsed, indent]);

  const treeRoot = useMemo(() => {
    if (parsed && parsed.ok) {
      return buildJsonTree(parsed.value);
    }
    return null;
  }, [parsed]);

  const handleCopy = async () => {
    if (!formatted) return;
    const ok = await copyToClipboard(formatted);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!formatted) return;
    const name = fileName
      ? fileName.endsWith(".json")
        ? fileName
        : `${fileName}.json`
      : "formatted.json";
    downloadText(formatted, name, "application/json;charset=utf-8");
  };

  const handleClear = () => {
    setSource("");
    setFileName(null);
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    setSource(text);
    setFileName(file.name);
  };

  const lineCount = source.split("\n").length;
  const byteSize = new TextEncoder().encode(source).length;
  const resultByteSize = formatted
    ? new TextEncoder().encode(formatted).length
    : 0;

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!source}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!parsed?.ok}
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
            disabled={!parsed?.ok}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download
          </Button>
        </div>
      }
    >
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-lg border border-border bg-card/60">
        <div className="flex items-center space-x-6">
          {/* Indent Options */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-muted-foreground">
              Indent:
            </span>
            <div className="inline-flex rounded-md bg-muted p-0.5 text-xs font-medium">
              {(["2", "4", "tab", "minify"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setIndent(opt)}
                  className={`px-2.5 py-1 rounded transition-colors capitalize ${
                    indent === opt
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt === "tab"
                    ? "Tabs"
                    : opt === "minify"
                      ? "Minify"
                      : `${opt} spaces`}
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-muted-foreground">
              View:
            </span>
            <div className="inline-flex rounded-md bg-muted p-0.5 text-xs font-medium">
              <button
                onClick={() => setView("text")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  view === "text"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileCode className="w-3 h-3" />
                <span>Text</span>
              </button>
              <button
                onClick={() => setView("tree")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
                  view === "tree"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FolderTree className="w-3 h-3" />
                <span>Tree</span>
              </button>
            </div>
          </div>
        </div>

        {/* File Open */}
        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
          {fileName && (
            <span className="font-mono truncate max-w-xs">{fileName}</span>
          )}
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-input bg-background hover:bg-muted transition-colors text-foreground">
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Open JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      {/* Editor & Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Pane */}
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
            <CardTitle className="text-sm font-semibold">Source JSON</CardTitle>
            <span className="text-xs text-muted-foreground font-mono">
              {lineCount} lines &bull; {formatBytes(byteSize)}
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <textarea
              value={source}
              onChange={(e) => {
                setSource(e.target.value);
                setFileName(null);
              }}
              placeholder="Paste JSON source here..."
              rows={22}
              className="w-full p-4 bg-transparent font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed"
              spellCheck={false}
              autoCapitalize="off"
              autoComplete="off"
            />
          </CardContent>
        </Card>

        {/* Result Pane */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
            <CardTitle className="text-sm font-semibold">
              {view === "tree" ? "JSON Structure Tree" : "Formatted Output"}
            </CardTitle>
            {parsed?.ok && (
              <span className="text-xs text-muted-foreground font-mono">
                {formatBytes(resultByteSize)}
              </span>
            )}
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {parsed && !parsed.ok ? (
              <div className="p-6 bg-destructive/10 border-l-4 border-destructive text-destructive m-4 rounded-r-md space-y-2">
                <div className="flex items-center gap-2 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Invalid JSON</span>
                </div>
                <p className="text-xs font-mono">{parsed.error.message}</p>
                <div className="text-xs font-mono opacity-80 pt-1">
                  Line {parsed.error.line}, Column {parsed.error.column}
                </div>
              </div>
            ) : view === "tree" && treeRoot ? (
              <div className="p-4 overflow-auto max-h-[500px] font-mono text-xs space-y-1">
                <TreeNodeItem node={treeRoot} />
              </div>
            ) : (
              <textarea
                value={formatted}
                readOnly
                placeholder="Formatted result will be displayed here..."
                rows={22}
                className="w-full p-4 bg-muted/20 font-mono text-xs sm:text-sm focus:outline-none resize-none leading-relaxed flex-1"
              />
            )}
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

// Tree Node Renderer Component
const TreeNodeItem: React.FC<{ node: JsonTreeNode }> = ({ node }) => {
  const [collapsed, setCollapsed] = useState(false);

  const hasChildren = node.children !== null && node.children.length > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-1.5 py-0.5 hover:bg-muted/40 rounded px-1 group">
        {hasChildren ? (
          <button
            onClick={() => setCollapsed((prev) => !prev)}
            className="p-0.5 text-muted-foreground hover:text-foreground rounded"
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {node.key !== null && (
          <span className="text-primary font-semibold">
            &quot;{node.key}&quot;:
          </span>
        )}

        {hasChildren ? (
          <span className="text-muted-foreground text-[11px]">
            {node.kind === "array"
              ? `Array [${node.entryCount}]`
              : `Object {${node.entryCount}}`}
          </span>
        ) : (
          <span
            className={`${
              node.kind === "string"
                ? "text-emerald-600 dark:text-emerald-400"
                : node.kind === "number"
                  ? "text-amber-600 dark:text-amber-400"
                  : node.kind === "boolean"
                    ? "text-purple-600 dark:text-purple-400"
                    : "text-muted-foreground italic"
            }`}
          >
            {node.kind === "string" ? `"${node.value}"` : String(node.value)}
          </span>
        )}
      </div>

      {hasChildren && !collapsed && (
        <div className="pl-5 border-l border-border/50 ml-2 space-y-1">
          {node.children!.map((child, idx) => (
            <TreeNodeItem key={child.path || idx} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JsonFormatter;
