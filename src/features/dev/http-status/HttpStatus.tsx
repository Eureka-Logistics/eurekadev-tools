import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HTTP_STATUS_CODES, HttpStatusCodeInfo } from "./data";
import { copyToClipboard } from "@/lib/utils";
import { Search, ExternalLink, Copy, Check } from "lucide-react";

export const HttpStatus: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return HTTP_STATUS_CODES.filter((item) => {
      const matchCat =
        categoryFilter === "all" || item.category === categoryFilter;
      if (!matchCat) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        String(item.code).includes(q) ||
        item.phrase.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [search, categoryFilter]);

  const handleCopySnippet = async (item: HttpStatusCodeInfo) => {
    const snippet = `HTTP/1.1 ${item.code} ${item.phrase}\nContent-Type: application/json\n\n{\n  "status": ${item.code},\n  "message": "${item.phrase}"\n}`;
    const ok = await copyToClipboard(snippet);
    if (ok) {
      setCopiedCode(item.code);
      setTimeout(() => setCopiedCode(null), 1500);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "1xx":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "2xx":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "3xx":
        return "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20";
      case "4xx":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "5xx":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <ToolShell tool={tool}>
      {/* Search & Class Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code or phrase (e.g. 404, Unauthorized)..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {["all", "1xx", "2xx", "3xx", "4xx", "5xx"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-colors ${
                categoryFilter === cat
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat === "all" ? "All Codes" : cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Status Codes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <Card
            key={item.code}
            className="hover:border-primary/40 transition-colors flex flex-col justify-between"
          >
            <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                {/* Header: Code & Category */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-2xl font-black font-mono px-2 py-0.5 rounded border ${getCategoryColor(item.category)}`}
                  >
                    {item.code}
                  </span>
                  <Badge variant="outline" className="text-[11px] font-mono">
                    {item.category}
                  </Badge>
                </div>

                {/* Phrase & Summary */}
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {item.phrase}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <p className="text-[11px] text-muted-foreground/80 leading-relaxed border-t border-border/40 pt-2">
                  {item.description}
                </p>
              </div>

              {/* Footer: RFC Link & Copy Mock */}
              <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                <a
                  href={item.rfcUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-mono"
                >
                  <span>{item.rfc}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => handleCopySnippet(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground p-1 rounded hover:bg-muted transition-colors"
                  title="Copy HTTP response mock"
                >
                  {copiedCode === item.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-mono">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span className="font-mono">Mock</span>
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ToolShell>
  );
};

export default HttpStatus;
