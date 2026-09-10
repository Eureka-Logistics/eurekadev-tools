import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Binary, Copy, Check, Search } from "lucide-react";

interface Glyph {
  char: string;
  name: string;
  cat: string;
  code: string;
  html?: string;
}

const GLYPHS: Glyph[] = [
  // Arrows
  {
    char: "←",
    name: "Leftwards Arrow",
    cat: "Arrows",
    code: "U+2190",
    html: "&larr;",
  },
  {
    char: "→",
    name: "Rightwards Arrow",
    cat: "Arrows",
    code: "U+2192",
    html: "&rarr;",
  },
  {
    char: "↑",
    name: "Upwards Arrow",
    cat: "Arrows",
    code: "U+2191",
    html: "&uarr;",
  },
  {
    char: "↓",
    name: "Downwards Arrow",
    cat: "Arrows",
    code: "U+2193",
    html: "&darr;",
  },
  {
    char: "↔",
    name: "Left Right Arrow",
    cat: "Arrows",
    code: "U+2194",
    html: "&harr;",
  },
  {
    char: "⇒",
    name: "Rightwards Double Arrow",
    cat: "Arrows",
    code: "U+21D2",
    html: "&rArr;",
  },
  {
    char: "⇄",
    name: "Rightwards Arrow Over Leftwards Arrow",
    cat: "Arrows",
    code: "U+21C4",
  },
  { char: "➔", name: "Heavy Rightwards Arrow", cat: "Arrows", code: "U+2794" },

  // Math
  {
    char: "±",
    name: "Plus-Minus Sign",
    cat: "Math",
    code: "U+00B1",
    html: "&plusmn;",
  },
  {
    char: "×",
    name: "Multiplication Sign",
    cat: "Math",
    code: "U+00D7",
    html: "&times;",
  },
  {
    char: "÷",
    name: "Division Sign",
    cat: "Math",
    code: "U+00F7",
    html: "&divide;",
  },
  {
    char: "≠",
    name: "Not Equal To",
    cat: "Math",
    code: "U+2260",
    html: "&ne;",
  },
  {
    char: "≤",
    name: "Less-Than or Equal To",
    cat: "Math",
    code: "U+2264",
    html: "&le;",
  },
  {
    char: "≥",
    name: "Greater-Than or Equal To",
    cat: "Math",
    code: "U+2265",
    html: "&ge;",
  },
  {
    char: "≈",
    name: "Almost Equal To",
    cat: "Math",
    code: "U+2248",
    html: "&asymp;",
  },
  { char: "∞", name: "Infinity", cat: "Math", code: "U+221E", html: "&infin;" },
  {
    char: "√",
    name: "Square Root",
    cat: "Math",
    code: "U+221A",
    html: "&radic;",
  },
  {
    char: "∑",
    name: "N-Ary Summation",
    cat: "Math",
    code: "U+2211",
    html: "&sum;",
  },
  { char: "∫", name: "Integral", cat: "Math", code: "U+222B", html: "&int;" },
  {
    char: "π",
    name: "Greek Small Letter Pi",
    cat: "Math",
    code: "U+03C0",
    html: "&pi;",
  },

  // Currency
  { char: "$", name: "Dollar Sign", cat: "Currency", code: "U+0024" },
  {
    char: "€",
    name: "Euro Sign",
    cat: "Currency",
    code: "U+20AC",
    html: "&euro;",
  },
  {
    char: "£",
    name: "Pound Sign",
    cat: "Currency",
    code: "U+00A3",
    html: "&pound;",
  },
  {
    char: "¥",
    name: "Yen Sign",
    cat: "Currency",
    code: "U+00A5",
    html: "&yen;",
  },
  { char: "₹", name: "Indian Rupee Sign", cat: "Currency", code: "U+20B9" },
  { char: "₩", name: "Won Sign", cat: "Currency", code: "U+20A9" },
  { char: "₿", name: "Bitcoin Sign", cat: "Currency", code: "U+20BF" },

  // Typography
  {
    char: "—",
    name: "Em Dash",
    cat: "Typography",
    code: "U+2014",
    html: "&mdash;",
  },
  {
    char: "–",
    name: "En Dash",
    cat: "Typography",
    code: "U+2013",
    html: "&ndash;",
  },
  {
    char: "•",
    name: "Bullet",
    cat: "Typography",
    code: "U+2022",
    html: "&bull;",
  },
  {
    char: "©",
    name: "Copyright Sign",
    cat: "Typography",
    code: "U+00A9",
    html: "&copy;",
  },
  {
    char: "®",
    name: "Registered Sign",
    cat: "Typography",
    code: "U+00AE",
    html: "&reg;",
  },
  {
    char: "™",
    name: "Trade Mark Sign",
    cat: "Typography",
    code: "U+2122",
    html: "&trade;",
  },
  {
    char: "§",
    name: "Section Sign",
    cat: "Typography",
    code: "U+00A7",
    html: "&sect;",
  },
  {
    char: "¶",
    name: "Pilcrow / Paragraph Sign",
    cat: "Typography",
    code: "U+00B6",
    html: "&para;",
  },

  // Shapes & Symbols
  { char: "★", name: "Black Star", cat: "Symbols", code: "U+2605" },
  { char: "☆", name: "White Star", cat: "Symbols", code: "U+2606" },
  {
    char: "♥",
    name: "Black Heart Suit",
    cat: "Symbols",
    code: "U+2665",
    html: "&hearts;",
  },
  {
    char: "▲",
    name: "Black Up-Pointing Triangle",
    cat: "Symbols",
    code: "U+25B2",
  },
  {
    char: "▼",
    name: "Black Down-Pointing Triangle",
    cat: "Symbols",
    code: "U+25BC",
  },
  { char: "●", name: "Black Circle", cat: "Symbols", code: "U+25CF" },
  { char: "■", name: "Black Square", cat: "Symbols", code: "U+25A0" },
  { char: "✓", name: "Check Mark", cat: "Symbols", code: "U+2713" },
];

const CATEGORIES = [
  "All",
  "Arrows",
  "Math",
  "Currency",
  "Typography",
  "Symbols",
];

export const GlyphBrowser: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph>(GLYPHS[1]); // right arrow default
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return GLYPHS.filter((g) => {
      const matchCat = activeCategory === "All" || g.cat === activeCategory;
      const matchSearch =
        g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.code.toLowerCase().includes(search.toLowerCase()) ||
        g.char.includes(search);
      return matchCat && matchSearch;
    });
  }, [activeCategory, search]);

  const handleCopy = async (val: string, key: string) => {
    await copyToClipboard(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const charCode = selectedGlyph.char.charCodeAt(0);
  const hexCode = charCode.toString(16).toUpperCase().padStart(4, "0");

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Binary className="h-4 w-4 text-primary" />
                Unicode Glyph & Symbol Browser
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search glyph name, symbol or code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 text-xs border rounded-md bg-background"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Glyphs Grid */}
          <div className="lg:col-span-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[480px] overflow-y-auto pr-1">
            {filtered.map((g) => {
              const isSelected = selectedGlyph.char === g.char;
              return (
                <button
                  key={g.code}
                  onClick={() => setSelectedGlyph(g)}
                  className={`h-16 rounded-lg border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground font-bold border-primary shadow-sm scale-105"
                      : "bg-muted/10 hover:bg-muted/30"
                  }`}
                  title={g.name}
                >
                  <span className="text-2xl">{g.char}</span>
                  <span className="text-[10px] font-mono opacity-70 mt-1">
                    {g.code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Glyph Inspector */}
          <Card className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle
                className="text-sm font-semibold truncate"
                title={selectedGlyph.name}
              >
                {selectedGlyph.name}
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {selectedGlyph.cat}
              </span>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Giant Glyph view */}
              <div className="h-36 rounded-xl border bg-muted/20 flex items-center justify-center shadow-inner">
                <span className="text-7xl select-all">
                  {selectedGlyph.char}
                </span>
              </div>

              {/* Code representations table */}
              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-muted/20 border">
                  <span className="text-muted-foreground">Character</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm">
                      {selectedGlyph.char}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopy(selectedGlyph.char, "char")}
                    >
                      {copiedKey === "char" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-muted/20 border">
                  <span className="text-muted-foreground">Unicode Point</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{selectedGlyph.code}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopy(selectedGlyph.code, "code")}
                    >
                      {copiedKey === "code" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-muted/20 border">
                  <span className="text-muted-foreground">HTML Entity</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      {selectedGlyph.html || `&#x${hexCode};`}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() =>
                        handleCopy(
                          selectedGlyph.html || `&#x${hexCode};`,
                          "html",
                        )
                      }
                    >
                      {copiedKey === "html" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-muted/20 border">
                  <span className="text-muted-foreground">
                    JS / JSON Escape
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{`\\u${hexCode}`}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => handleCopy(`\\u${hexCode}`, "js")}
                    >
                      {copiedKey === "js" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolShell>
  );
};

export default GlyphBrowser;
