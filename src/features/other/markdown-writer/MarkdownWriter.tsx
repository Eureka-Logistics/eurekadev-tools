import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { downloadBlob } from "@/lib/download";
import {
  Copy,
  Check,
  Download,
  Trash2,
  Columns,
  Eye,
  Edit3,
} from "lucide-react";

interface MarkdownWriterProps {
  tool: ToolDefinition;
}

export const MarkdownWriter: React.FC<MarkdownWriterProps> = ({ tool }) => {
  const [content, setContent] = useState(`# Text Scratchpad

Welcome to your offline text workbench and scratchpad.

## Quick Features
- Transform cases (camelCase, kebab-case, Title Case)
- Sort lines and remove duplicates
- Live word and reading time stats
- Zero data leaves your browser.`);

  const [viewMode, setViewMode] = useState<"split" | "edit" | "preview">(
    "split",
  );
  const [copied, setCopied] = useState(false);

  // Statistics
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lineCount = content ? content.split("\n").length : 0;
  const readingTimeMin = Math.ceil(wordCount / 200);

  // Transformations
  const transform = (fn: (str: string) => string) => {
    setContent((prev) => fn(prev));
  };

  const toCamelCase = (str: string) =>
    str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) => {
      if (+match === 0) return "";
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });

  const toKebabCase = (str: string) =>
    str
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();

  const toSnakeCase = (str: string) =>
    str
      .replace(/([a-z])([A-Z])/g, "$1_$2")
      .replace(/[\s-]+/g, "_")
      .toLowerCase();

  const toTitleCase = (str: string) =>
    str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );

  const sortLinesAsc = (str: string) =>
    str
      .split("\n")
      .sort((a, b) => a.localeCompare(b))
      .join("\n");

  const sortLinesDesc = (str: string) =>
    str
      .split("\n")
      .sort((a, b) => b.localeCompare(a))
      .join("\n");

  const removeDuplicateLines = (str: string) =>
    Array.from(new Set(str.split("\n"))).join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    downloadBlob(blob, "scratchpad.md");
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Top Bar */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg bg-zinc-800 p-1 border border-zinc-700 text-xs">
              <button
                onClick={() => setViewMode("split")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition ${
                  viewMode === "split"
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-400"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
              <button
                onClick={() => setViewMode("edit")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition ${
                  viewMode === "edit"
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-400"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editor</span>
              </button>
              <button
                onClick={() => setViewMode("preview")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded transition ${
                  viewMode === "preview"
                    ? "bg-emerald-600 text-white"
                    : "text-zinc-400"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span>{charCount} chars</span>
            <span>{wordCount} words</span>
            <span>{lineCount} lines</span>
            <span>~{readingTimeMin} min read</span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition shadow-lg shadow-emerald-900/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export .MD</span>
            </button>
            <button
              onClick={() => setContent("")}
              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition"
              title="Clear"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Text Transformations Strip */}
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-medium">Transform:</span>
          <button
            onClick={() => transform((s) => s.toUpperCase())}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            UPPERCASE
          </button>
          <button
            onClick={() => transform((s) => s.toLowerCase())}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            lowercase
          </button>
          <button
            onClick={() => transform(toTitleCase)}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Title Case
          </button>
          <button
            onClick={() => transform(toCamelCase)}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            camelCase
          </button>
          <button
            onClick={() => transform(toKebabCase)}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            kebab-case
          </button>
          <button
            onClick={() => transform(toSnakeCase)}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            snake_case
          </button>
          <button
            onClick={() => transform(sortLinesAsc)}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Sort A→Z
          </button>
          <button
            onClick={() => transform(sortLinesDesc)}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Sort Z→A
          </button>
          <button
            onClick={() => transform(removeDuplicateLines)}
            className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Unique Lines
          </button>
        </div>

        {/* Editor / Preview Area */}
        <div
          className={`grid gap-4 ${viewMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
        >
          {(viewMode === "split" || viewMode === "edit") && (
            <div className="space-y-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Type or paste markdown content here..."
                rows={20}
                className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-100 resize-none focus:border-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {(viewMode === "split" || viewMode === "preview") && (
            <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 min-h-[460px] text-zinc-200 text-sm overflow-y-auto prose prose-invert max-w-none">
              <div
                dangerouslySetInnerHTML={{
                  __html: content
                    .replace(
                      /^### (.*$)/gim,
                      '<h3 class="text-base font-bold text-zinc-200 mt-4 mb-2">$1</h3>',
                    )
                    .replace(
                      /^## (.*$)/gim,
                      '<h2 class="text-lg font-bold text-emerald-400 mt-5 mb-2">$1</h2>',
                    )
                    .replace(
                      /^# (.*$)/gim,
                      '<h1 class="text-xl font-bold text-zinc-100 mb-3 border-b border-zinc-800 pb-2">$1</h1>',
                    )
                    .replace(
                      /^\- (.*$)/gim,
                      '<li class="ml-4 list-disc text-zinc-300">$1</li>',
                    )
                    .replace(
                      /\*\*(.*)\*\*/gim,
                      '<strong class="text-zinc-100">$1</strong>',
                    )
                    .replace(/\*(.*)\*/gim, '<em class="text-zinc-300">$1</em>')
                    .replace(/\n/gim, "<br />"),
                }}
              />
            </div>
          )}
        </div>
      </div>
    </ToolShell>
  );
};

export default MarkdownWriter;
