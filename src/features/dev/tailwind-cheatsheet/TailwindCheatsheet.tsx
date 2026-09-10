import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TAILWIND_CLASSES } from "./data";
import { copyToClipboard } from "@/lib/utils";
import { Search, Copy, Check } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "layout", label: "Layout" },
  { id: "flex-grid", label: "Flex & Grid" },
  { id: "spacing", label: "Spacing" },
  { id: "sizing", label: "Sizing" },
  { id: "typography", label: "Typography" },
  { id: "backgrounds", label: "Backgrounds" },
  { id: "borders", label: "Borders" },
  { id: "effects", label: "Effects" },
];

export const TailwindCheatsheet: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [copiedClass, setCopiedClass] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return TAILWIND_CLASSES.filter((item) => {
      const matchCat = selectedCat === "all" || item.category === selectedCat;
      if (!matchCat) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        item.className.toLowerCase().includes(q) ||
        item.css.toLowerCase().includes(q)
      );
    });
  }, [search, selectedCat]);

  const handleCopyClass = async (className: string) => {
    const ok = await copyToClipboard(className);
    if (ok) {
      setCopiedClass(className);
      setTimeout(() => setCopiedClass(null), 1500);
    }
  };

  return (
    <ToolShell tool={tool}>
      {/* Search & Category Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search class or CSS property (e.g. flex, z-index)..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedCat === c.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Class Items Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="p-3.5 font-semibold">Tailwind Class</th>
                <th className="p-3.5 font-semibold">
                  Generated CSS Properties
                </th>
                <th className="p-3.5 font-semibold w-24">Category</th>
                <th className="p-3.5 w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30 font-mono">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground font-sans"
                  >
                    No Tailwind classes found matching &ldquo;{search}&rdquo;
                  </td>
                </tr>
              ) : (
                filtered.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    <td className="p-3.5 font-bold text-primary select-all">
                      <span className="bg-primary/10 px-2 py-1 rounded border border-primary/20">
                        {item.className}
                      </span>
                    </td>
                    <td className="p-3.5 text-muted-foreground whitespace-pre-wrap">
                      {item.css}
                    </td>
                    <td className="p-3.5 font-sans">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-mono"
                      >
                        {item.category}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <button
                        onClick={() => handleCopyClass(item.className)}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Copy class name"
                      >
                        {copiedClass === item.className ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </ToolShell>
  );
};

export default TailwindCheatsheet;
