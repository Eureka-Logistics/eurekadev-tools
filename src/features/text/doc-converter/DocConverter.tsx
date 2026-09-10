import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { downloadText } from "@/lib/download";
import {
  FileCode,
  Copy,
  Check,
  Download,
  Sparkles,
  Trash2,
} from "lucide-react";

type ConversionType =
  | "camel"
  | "snake"
  | "kebab"
  | "constant"
  | "pascal"
  | "title"
  | "lower"
  | "upper"
  | "md-to-html"
  | "html-to-text";

const SAMPLE_TEXT =
  "Eureka developer utility tools boost engineering productivity";

export const DocConverter: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [mode, setMode] = useState<ConversionType>("camel");
  const [copied, setCopied] = useState<boolean>(false);

  const convertedText = useMemo(() => {
    if (!inputText) return "";

    const words = inputText
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/[_\-.]+/g, " ")
      .trim()
      .split(/\s+/);

    switch (mode) {
      case "camel":
        return words
          .map((w, i) =>
            i === 0
              ? w.toLowerCase()
              : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(),
          )
          .join("");

      case "pascal":
        return words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join("");

      case "snake":
        return words.map((w) => w.toLowerCase()).join("_");

      case "kebab":
        return words.map((w) => w.toLowerCase()).join("-");

      case "constant":
        return words.map((w) => w.toUpperCase()).join("_");

      case "title":
        return words
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");

      case "lower":
        return inputText.toLowerCase();

      case "upper":
        return inputText.toUpperCase();

      case "md-to-html":
        return inputText
          .replace(/^# (.*$)/gim, "<h1>$1</h1>")
          .replace(/^## (.*$)/gim, "<h2>$1</h2>")
          .replace(/^### (.*$)/gim, "<h3>$1</h3>")
          .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
          .replace(/\*(.*)\*/gim, "<em>$1</em>")
          .replace(/^\* (.*$)/gim, "<li>$1</li>")
          .replace(/`([^`]+)`/gim, "<code>$1</code>");

      case "html-to-text":
        return inputText.replace(/<[^>]+>/g, "");

      default:
        return inputText;
    }
  }, [inputText, mode]);

  const handleCopy = async () => {
    await copyToClipboard(convertedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    downloadText(convertedText, `converted-${mode}.txt`);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode className="h-4 w-4 text-primary" />
                Text Case & Document Format Converter
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setInputText(SAMPLE_TEXT)}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" /> Sample
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setInputText("")}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Mode selection buttons */}
            <div className="flex flex-wrap gap-1.5 bg-muted p-1.5 rounded-lg text-xs">
              {[
                { id: "camel", label: "camelCase" },
                { id: "pascal", label: "PascalCase" },
                { id: "snake", label: "snake_case" },
                { id: "kebab", label: "kebab-case" },
                { id: "constant", label: "CONSTANT_CASE" },
                { id: "title", label: "Title Case" },
                { id: "lower", label: "lowercase" },
                { id: "upper", label: "UPPERCASE" },
                { id: "md-to-html", label: "Markdown to HTML" },
                { id: "html-to-text", label: "Strip HTML Tags" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id as ConversionType)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    mode === item.id
                      ? "bg-background shadow text-foreground font-bold"
                      : "text-muted-foreground hover:bg-background/50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Input & Output Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground block">
                  Input Text
                </label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste text..."
                  className="w-full h-64 p-3 font-mono text-xs rounded-lg border bg-muted/20 resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Converted Output
                  </label>
                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] px-2"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3 w-3 mr-1 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copied ? "Copied" : "Copy"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] px-2"
                      onClick={handleDownload}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                  </div>
                </div>
                <textarea
                  readOnly
                  value={convertedText}
                  className="w-full h-64 p-3 font-mono text-xs rounded-lg border bg-muted/40 resize-none focus:outline-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default DocConverter;
