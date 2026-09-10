import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadText } from "@/lib/download";
import { copyToClipboard } from "@/lib/utils";
import {
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  List,
  Quote,
  Download,
  Copy,
  Check,
  Trash2,
} from "lucide-react";

const INITIAL_MD = `# Project Planning Notes

Welcome to **Eureka Dev Tools** scratchpad.

## Key Goals
* 100% client-side privacy.
* Zero external telemetry.
* Instant snappy performance.

> "Simplicity is prerequisite for reliability." — Edsger W. Dijkstra

\`\`\`typescript
const app = new EurekaDevTools();
app.start();
\`\`\`
`;

export const TextEditor: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [content, setContent] = useState<string>(INITIAL_MD);
  const [copied, setCopied] = useState<boolean>(false);

  const insertSnippet = (before: string, after: string = "") => {
    setContent((prev) => `${prev}\n${before}text${after}`);
  };

  const handleDownloadMd = () => {
    downloadText(content, "document.md", "text/markdown");
  };

  const handleCopy = async () => {
    await copyToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Simple client-side markdown to HTML renderer
  const renderSimpleMarkdown = (md: string) => {
    let html = md
      .replace(
        /^# (.*$)/gim,
        '<h1 class="text-2xl font-bold mt-3 mb-1">$1</h1>',
      )
      .replace(
        /^## (.*$)/gim,
        '<h2 class="text-xl font-bold mt-2.5 mb-1">$1</h2>',
      )
      .replace(
        /^### (.*$)/gim,
        '<h3 class="text-lg font-bold mt-2 mb-1">$1</h3>',
      )
      .replace(
        /^\> (.*$)/gim,
        '<blockquote class="border-l-4 border-primary pl-3 italic text-muted-foreground my-2">$1</blockquote>',
      )
      .replace(/\*\*(.*)\*\*/gim, "<strong>$1</strong>")
      .replace(/\*(.*)\*/gim, "<em>$1</em>")
      .replace(
        /```([\s\S]*?)```/gim,
        '<pre class="bg-muted p-3 rounded-md font-mono text-xs my-2 overflow-x-auto"><code>$1</code></pre>',
      )
      .replace(
        /`([^`]+)`/gim,
        '<code class="bg-muted px-1 py-0.5 rounded text-xs font-mono">$1</code>',
      )
      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc text-sm">$1</li>')
      .replace(/\n$/gim, "<br />");

    return html;
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="py-2.5 px-4 border-b">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 bg-muted p-1 rounded-md text-xs">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => insertSnippet("**", "**")}
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => insertSnippet("*", "*")}
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => insertSnippet("# ")}
                  title="H1"
                >
                  <Heading1 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => insertSnippet("## ")}
                  title="H2"
                >
                  <Heading2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => insertSnippet("* ")}
                  title="Bullet List"
                >
                  <List className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => insertSnippet("> ")}
                  title="Quote"
                >
                  <Quote className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => insertSnippet("```\n", "\n```")}
                  title="Code Block"
                >
                  <Code className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 mr-1" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleDownloadMd}
                >
                  <Download className="h-3.5 w-3.5 mr-1" /> Download .md
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0"
                  onClick={() => setContent("")}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border min-h-[420px]">
              {/* Markdown Source Input */}
              <div className="p-4">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type markdown content here..."
                  className="w-full h-full min-h-[380px] font-mono text-xs bg-transparent border-0 resize-none focus:outline-none leading-relaxed"
                />
              </div>

              {/* Rendered Preview */}
              <div className="p-6 bg-muted/10 overflow-y-auto min-h-[380px] prose dark:prose-invert max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderSimpleMarkdown(content),
                  }}
                />
              </div>
            </div>

            <div className="py-2 px-4 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Markdown Scratchpad</span>
              <span>
                {wordCount} words &bull; {charCount} characters
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default TextEditor;
