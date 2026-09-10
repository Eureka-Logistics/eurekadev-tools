import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Type, UploadCloud, Sparkles } from "lucide-react";

const FONTS = [
  {
    name: "System Sans",
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  {
    name: "Monospace / Code",
    family: 'ui-monospace, "SF Mono", Menlo, Monaco, Consolas, monospace',
  },
  {
    name: "Georgia (Serif)",
    family: 'Georgia, Cambria, "Times New Roman", serif',
  },
  {
    name: "Garamond",
    family: 'Garamond, "Hoefler Text", "Times New Roman", serif',
  },
  {
    name: "Trebuchet MS",
    family: '"Trebuchet MS", "Lucida Sans Unicode", sans-serif',
  },
  {
    name: "Impact",
    family: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif',
  },
  { name: "Courier New", family: '"Courier New", Courier, monospace' },
];

export const FontExplorer: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [selectedFont, setSelectedFont] = useState<string>(FONTS[0].family);
  const [fontSize, setFontSize] = useState<number>(36);
  const [fontWeight, setFontWeight] = useState<number>(400);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [lineHeight, setLineHeight] = useState<number>(1.4);
  const [sampleText, setSampleText] = useState<string>(
    "The quick brown fox jumps over the lazy dog 1234567890",
  );
  const [customFontName, setCustomFontName] = useState<string | null>(null);

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fontName = file.name.replace(/\.[^/.]+$/, "");
      const buffer = await file.arrayBuffer();
      const fontFace = new FontFace(fontName, buffer);
      await fontFace.load();
      (document.fonts as any).add(fontFace);
      setCustomFontName(fontName);
      setSelectedFont(`"${fontName}", sans-serif`);
    } catch {
      alert("Could not load custom font file.");
    }
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                Font & Typography Specimen Explorer
              </CardTitle>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center px-3 py-1.5 border rounded-md text-xs font-medium hover:bg-muted transition-colors">
                  <UploadCloud className="h-3.5 w-3.5 mr-1 text-primary" /> Load
                  TTF/WOFF2
                  <input
                    type="file"
                    accept=".woff,.woff2,.ttf,.otf"
                    onChange={handleFontUpload}
                    className="hidden"
                  />
                </label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setSampleText(
                      "Typography is the craft of endowing human language with durable visual form.",
                    )
                  }
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" /> Quote
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Font selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setSelectedFont(f.family)}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    selectedFont === f.family
                      ? "bg-primary text-primary-foreground font-bold border-primary"
                      : "bg-muted/10 hover:bg-muted/30"
                  }`}
                >
                  <span
                    className="truncate block"
                    style={{ fontFamily: f.family }}
                  >
                    {f.name}
                  </span>
                </button>
              ))}
              {customFontName && (
                <button
                  onClick={() =>
                    setSelectedFont(`"${customFontName}", sans-serif`)
                  }
                  className="p-2.5 rounded-lg border text-left text-xs bg-primary text-primary-foreground font-bold"
                >
                  <span className="truncate block font-bold">
                    {customFontName} (Custom)
                  </span>
                </button>
              )}
            </div>

            {/* Formatting Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-lg border">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Size
                  </label>
                  <span className="text-xs font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="96"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Weight
                  </label>
                  <span className="text-xs font-mono">{fontWeight}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="900"
                  step="100"
                  value={fontWeight}
                  onChange={(e) => setFontWeight(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Letter Spacing
                  </label>
                  <span className="text-xs font-mono">{letterSpacing}px</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="12"
                  value={letterSpacing}
                  onChange={(e) => setLetterSpacing(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Line Height
                  </label>
                  <span className="text-xs font-mono">{lineHeight}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.2"
                  step="0.1"
                  value={lineHeight}
                  onChange={(e) => setLineHeight(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Specimen Output Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Editable Specimen Canvas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => setSampleText(e.currentTarget.textContent || "")}
              className="outline-none min-h-[200px] border-b pb-4 transition-all"
              style={{
                fontFamily: selectedFont,
                fontSize: `${fontSize}px`,
                fontWeight,
                letterSpacing: `${letterSpacing}px`,
                lineHeight,
              }}
            >
              {sampleText}
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-muted-foreground font-mono">
              <span>Font: {selectedFont.split(",")[0].replace(/"/g, "")}</span>
              <span>
                {fontSize}px &bull; weight {fontWeight} &bull; leading{" "}
                {lineHeight} &bull; tracking {letterSpacing}px
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default FontExplorer;
