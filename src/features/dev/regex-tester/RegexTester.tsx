import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { executeRegex } from "./utils";
import { copyToClipboard } from "@/lib/utils";
import { Copy, Trash2, Check, AlertTriangle, Code2 } from "lucide-react";

const PRESETS = [
  {
    name: "Email Address",
    pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    flags: "gi",
  },
  {
    name: "URL Link",
    pattern:
      "https?:\\/\\/[\\w\\.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&'\\(\\)\\*\\+,;=.]+",
    flags: "gi",
  },
  {
    name: "IPv4 Address",
    pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
    flags: "g",
  },
  { name: "ISO 8601 Date", pattern: "\\d{4}-\\d{2}-\\d{2}", flags: "g" },
  { name: "HEX Color", pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b", flags: "gi" },
];

export const RegexTester: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [pattern, setPattern] = useState("([A-Z])\\w+");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState(
    "Eureka Dev Tools is an awesome Suite of utilities created for developer Productivity.",
  );
  const [replacePattern, setReplacePattern] = useState("**$0**");
  const [copied, setCopied] = useState(false);

  const toggleFlag = (flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, "") : prev + flag,
    );
  };

  const result = useMemo(() => {
    return executeRegex(pattern, flags, testString, replacePattern);
  }, [pattern, flags, testString, replacePattern]);

  const handleCopyReplacement = async () => {
    if (!result.replacedText) return;
    const ok = await copyToClipboard(result.replacedText);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setPattern("");
    setTestString("");
    setReplacePattern("");
  };

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyReplacement}
            disabled={!result.replacedText}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5 mr-1" />
            )}
            Copy Replacement
          </Button>
        </div>
      }
    >
      {/* Pattern Input & Flags Bar */}
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border/40">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Code2 className="w-4 h-4 text-primary" />
              Regular Expression
            </CardTitle>
            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-muted-foreground mr-1">
                Presets:
              </span>
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setPattern(p.pattern);
                    setFlags(p.flags);
                  }}
                  className="px-2 py-0.5 rounded text-[11px] bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-mono text-lg select-none">
              /
            </span>
            <Input
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="e.g. ([A-Z])\w+"
              className="font-mono text-sm h-10 flex-1"
              spellCheck={false}
            />
            <span className="text-muted-foreground font-mono text-lg select-none">
              /
            </span>

            {/* Flags Toggles */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
              {["g", "i", "m", "s", "u"].map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFlag(f)}
                  className={`w-7 h-7 rounded text-xs font-mono font-medium transition-colors ${
                    flags.includes(f)
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={`Toggle /${f} flag`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {!result.valid && (
            <div className="flex items-center gap-2 text-destructive text-xs p-2.5 bg-destructive/10 rounded-md font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Regex syntax error: {result.error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test String & Highlight Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test String */}
        <Card>
          <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold">Test String</CardTitle>
            <span className="text-xs text-muted-foreground font-mono">
              {testString.length} chars
            </span>
          </CardHeader>
          <CardContent className="p-4">
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Enter or paste text to test regex against..."
              rows={8}
              className="w-full p-3 rounded-md border border-input bg-muted/20 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Highlighted Match Visualizer */}
        <Card>
          <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold">
              Match Visualizer
            </CardTitle>
            <Badge variant="outline" className="text-xs font-mono">
              {result.matches.length}{" "}
              {result.matches.length === 1 ? "match" : "matches"}
            </Badge>
          </CardHeader>
          <CardContent className="p-4">
            <div className="p-3 rounded-md border border-border bg-muted/10 font-mono text-xs leading-relaxed min-h-[160px] whitespace-pre-wrap break-words">
              {result.matches.length === 0 ? (
                <span className="text-muted-foreground">
                  {testString || "No test string provided"}
                </span>
              ) : (
                renderHighlightedText(testString, result.matches)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Substitution / Replace Section */}
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border/40">
          <CardTitle className="text-sm font-semibold">
            Substitution & Replace
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground shrink-0">
              Replace with:
            </span>
            <Input
              value={replacePattern}
              onChange={(e) => setReplacePattern(e.target.value)}
              placeholder="e.g. [$0] or replacement text"
              className="font-mono text-xs h-8 max-w-md"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Substitution Result:
            </label>
            <textarea
              value={result.replacedText || ""}
              readOnly
              rows={4}
              className="w-full p-3 rounded-md border border-input bg-muted/20 font-mono text-xs leading-relaxed resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Matches Detail Table */}
      {result.matches.length > 0 && (
        <Card>
          <CardHeader className="py-3 px-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold">
              Matches Breakdown Table ({result.matches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                  <th className="p-3 w-12 font-medium">#</th>
                  <th className="p-3 font-medium">Match</th>
                  <th className="p-3 font-medium">Range</th>
                  <th className="p-3 font-medium">Capture Groups</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-mono">
                {result.matches.map((m) => (
                  <tr
                    key={m.index}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-3 text-muted-foreground">{m.index}</td>
                    <td className="p-3 text-foreground font-semibold">
                      <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                        {m.match}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      [{m.start} – {m.end}]
                    </td>
                    <td className="p-3">
                      {m.groups.length === 0 ? (
                        <span className="text-muted-foreground italic">
                          None
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {m.groups.map((g, i) => (
                            <span
                              key={i}
                              className="bg-muted px-1.5 py-0.5 rounded border border-border text-[11px]"
                            >
                              ${i + 1}: &quot;{g}&quot;
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </ToolShell>
  );
};

function renderHighlightedText(
  text: string,
  matches: Array<{ start: number; end: number }>,
) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  matches.forEach((m, i) => {
    if (m.start > lastIndex) {
      parts.push(text.slice(lastIndex, m.start));
    }
    parts.push(
      <mark
        key={i}
        className="bg-amber-300 dark:bg-amber-500/40 text-foreground px-0.5 rounded"
      >
        {text.slice(m.start, m.end)}
      </mark>,
    );
    lastIndex = m.end;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

export default RegexTester;
