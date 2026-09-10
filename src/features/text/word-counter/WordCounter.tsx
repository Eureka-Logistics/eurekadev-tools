import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Sparkles, Trash2, Copy, Check, BookOpen, Mic } from "lucide-react";

const SAMPLE_TEXT = `Eureka Dev Tools is an internal developer utility web application designed to boost developer productivity across engineering teams. By providing robust, client-side offline tools for image processing, color management, cryptography, string manipulations, and data transformations, developers can get their work done quickly and securely without leaking proprietary company data to third-party public sites.

Every single tool executes directly inside the web browser using modern Web APIs such as Canvas, Web Cryptography, and Web Audio. With zero tracking and zero telemetry, security is paramount. Enjoy using Eureka Dev Tools for all your everyday developer workflows!`;

export const WordCounter: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [text, setText] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        words: 0,
        chars: 0,
        charsNoSpace: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: "0 sec",
        speakingTime: "0 sec",
        keywords: [],
      };
    }

    const wordsArr = trimmed.split(/\s+/).filter(Boolean);
    const words = wordsArr.length;
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0).length;
    const paragraphs = text
      .split(/\n+/)
      .filter((p) => p.trim().length > 0).length;

    // Reading time (200 wpm)
    const readMin = words / 200;
    const readingTime =
      readMin < 1
        ? `${Math.ceil(readMin * 60)} sec`
        : `${Math.ceil(readMin)} min`;

    // Speaking time (130 wpm)
    const speakMin = words / 130;
    const speakingTime =
      speakMin < 1
        ? `${Math.ceil(speakMin * 60)} sec`
        : `${Math.ceil(speakMin)} min`;

    // Keyword density
    const stopWords = new Set([
      "the",
      "is",
      "at",
      "which",
      "on",
      "and",
      "a",
      "an",
      "in",
      "to",
      "for",
      "of",
      "or",
      "by",
      "with",
      "as",
      "it",
    ]);
    const freqMap = new Map<string, number>();
    wordsArr.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (clean.length > 2 && !stopWords.has(clean)) {
        freqMap.set(clean, (freqMap.get(clean) || 0) + 1);
      }
    });

    const keywords = Array.from(freqMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([word, count]) => ({
        word,
        count,
        pct: Math.round((count / words) * 100),
      }));

    return {
      words,
      chars,
      charsNoSpace,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
      keywords,
    };
  }, [text]);

  const handleCopy = async () => {
    await copyToClipboard(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Stat metrics cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          <Card className="p-3 text-center">
            <span className="text-xs text-muted-foreground block font-medium">
              Words
            </span>
            <span className="text-2xl font-bold font-mono text-primary">
              {stats.words}
            </span>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-xs text-muted-foreground block font-medium">
              Characters
            </span>
            <span className="text-2xl font-bold font-mono">{stats.chars}</span>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-xs text-muted-foreground block font-medium">
              No Spaces
            </span>
            <span className="text-2xl font-bold font-mono">
              {stats.charsNoSpace}
            </span>
          </Card>
          <Card className="p-3 text-center">
            <span className="text-xs text-muted-foreground block font-medium">
              Sentences
            </span>
            <span className="text-2xl font-bold font-mono">
              {stats.sentences}
            </span>
          </Card>
          <Card className="p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-xs text-muted-foreground block font-medium">
              Paragraphs
            </span>
            <span className="text-2xl font-bold font-mono">
              {stats.paragraphs}
            </span>
          </Card>
        </div>

        {/* Editor Area */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> Reading:{" "}
                  {stats.readingTime}
                </span>
                <span className="flex items-center gap-1">
                  <Mic className="h-3.5 w-3.5 text-primary" /> Speaking:{" "}
                  {stats.speakingTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setText(SAMPLE_TEXT)}
                >
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Sample
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                  disabled={!text}
                >
                  {copied ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setText("")}
                  disabled={!text}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type any text to analyze word count and reading metrics..."
              className="w-full h-64 p-4 text-sm rounded-lg border bg-muted/10 resize-y focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
            />

            {/* Keyword frequency analysis */}
            {stats.keywords.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
                  Top Keyword Density
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {stats.keywords.map((k) => (
                    <div
                      key={k.word}
                      className="flex items-center justify-between p-2 rounded border bg-muted/20 text-xs"
                    >
                      <span className="font-semibold">{k.word}</span>
                      <span className="text-muted-foreground font-mono">
                        {k.count} ({k.pct}%)
                      </span>
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

export default WordCounter;
