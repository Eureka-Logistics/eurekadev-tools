import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Palette, Copy, Check, Search } from "lucide-react";

interface PaletteItem {
  name: string;
  category: string;
  colors: string[];
}

const PALETTES: PaletteItem[] = [
  {
    name: "Cyberpunk Neon",
    category: "Neon",
    colors: ["#f43f5e", "#a855f7", "#06b6d4", "#10b981", "#fbbf24"],
  },
  {
    name: "Nordic Chill",
    category: "Cool",
    colors: ["#2e3440", "#3b4252", "#434c5e", "#88c0d0", "#81a1c1"],
  },
  {
    name: "Matcha Forest",
    category: "Nature",
    colors: ["#14532d", "#15803d", "#4ade80", "#bbf7d0", "#fef08a"],
  },
  {
    name: "Warm Sunset",
    category: "Warm",
    colors: ["#4a044e", "#9d174d", "#f43f5e", "#fb923c", "#fef08a"],
  },
  {
    name: "Tokyo Midnight",
    category: "Dark",
    colors: ["#0f172a", "#1e1b4b", "#312e81", "#4338ca", "#6366f1"],
  },
  {
    name: "Pastel Dream",
    category: "Pastel",
    colors: ["#fecdd3", "#fbcfe8", "#e9d5ff", "#c7d2fe", "#bae6fd"],
  },
  {
    name: "Terracotta Clay",
    category: "Earth",
    colors: ["#451a03", "#78350f", "#b45309", "#d97706", "#fde68a"],
  },
  {
    name: "Ocean Depth",
    category: "Cool",
    colors: ["#082f49", "#0369a1", "#0284c7", "#38bdf8", "#bae6fd"],
  },
  {
    name: "Velvet Noir",
    category: "Dark",
    colors: ["#18181b", "#27272a", "#3f3f46", "#71717a", "#fafafa"],
  },
];

const CATEGORIES = [
  "All",
  "Neon",
  "Cool",
  "Nature",
  "Warm",
  "Dark",
  "Pastel",
  "Earth",
];

export const PaletteCollection: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PALETTES.filter((p) => {
      const matchCat =
        activeCategory === "All" || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const handleCopyColor = async (hex: string, key: string) => {
    await copyToClipboard(hex);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleCopyAll = async (colors: string[], name: string) => {
    await copyToClipboard(JSON.stringify(colors, null, 2));
    setCopiedKey(name);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                Curated Color Palettes
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search palettes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 text-xs border rounded-md bg-background"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-md text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-background shadow text-foreground font-bold"
                      : "text-muted-foreground hover:bg-background/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Palettes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card
              key={item.name}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold">
                      {item.name}
                    </CardTitle>
                    <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => handleCopyAll(item.colors, item.name)}
                  >
                    {copiedKey === item.name ? (
                      <Check className="h-3.5 w-3.5 text-green-500 mr-1" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 mr-1" />
                    )}
                    {copiedKey === item.name ? "Copied" : "JSON"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2 space-y-2">
                <div className="flex h-16 rounded-lg overflow-hidden border shadow-inner">
                  {item.colors.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleCopyColor(c, `${item.name}-${c}`)}
                      className="flex-1 h-full relative group transition-transform hover:scale-105"
                      style={{ backgroundColor: c }}
                      title={`Click to copy ${c}`}
                    >
                      <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white font-mono text-[9px] px-1 py-0.5 rounded text-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedKey === `${item.name}-${c}`
                          ? "COPIED"
                          : c.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                  {item.colors.map((c, i) => (
                    <span key={i}>{c.toUpperCase()}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ToolShell>
  );
};

export default PaletteCollection;
