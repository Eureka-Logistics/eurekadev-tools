import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { copyToClipboard } from "@/lib/utils";
import {
  Image as ImageIcon,
  Download,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

const PRESETS = [
  { label: "HD (1920×1080)", w: 1920, h: 1080 },
  { label: "Standard (800×600)", w: 800, h: 600 },
  { label: "Square (500×500)", w: 500, h: 500 },
  { label: "Avatar (128×128)", w: 128, h: 128 },
  { label: "Med Rect (300×250)", w: 300, h: 250 },
  { label: "Banner (728×90)", w: 728, h: 90 },
];

export const PlaceholderGenny: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [width, setWidth] = useState<number>(600);
  const [height, setHeight] = useState<number>(400);
  const [bgColor1, setBgColor1] = useState<string>("#3b82f6");
  const [bgColor2, setBgColor2] = useState<string>("#1d4ed8");
  const [useGradient, setUseGradient] = useState<boolean>(true);
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [customText, setCustomText] = useState<string>("");
  const [fontFamily, setFontFamily] = useState<
    "sans-serif" | "monospace" | "serif"
  >("sans-serif");
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);
  const [copiedDataUri, setCopiedDataUri] = useState<boolean>(false);

  const displayText = customText.trim()
    ? customText
    : `${width} \u00D7 ${height}`;
  const autoFontSize = Math.max(
    14,
    Math.min(Math.floor(width / 12), Math.floor(height / 6)),
  );

  const svgMarkup = useMemo(() => {
    const bgDef = useGradient
      ? `<defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bgColor1}"/><stop offset="100%" stop-color="${bgColor2}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#grad)"/>`
      : `<rect width="${width}" height="${height}" fill="${bgColor1}"/>`;

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${bgDef}
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="${fontFamily}" font-size="${autoFontSize}" font-weight="bold" fill="${textColor}">${displayText}</text>
</svg>`;
  }, [
    width,
    height,
    bgColor1,
    bgColor2,
    useGradient,
    textColor,
    displayText,
    fontFamily,
    autoFontSize,
  ]);

  const svgDataUrl = useMemo(() => {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svgMarkup)}`;
  }, [svgMarkup]);

  const handleCopySvg = async () => {
    await copyToClipboard(svgMarkup);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  const handleCopyDataUri = async () => {
    await copyToClipboard(svgDataUrl);
    setCopiedDataUri(true);
    setTimeout(() => setCopiedDataUri(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml" });
    downloadBlob(blob, `placeholder-${width}x${height}.svg`, "image/svg+xml");
  };

  const handleDownloadPng = () => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            downloadBlob(
              blob,
              `placeholder-${width}x${height}.png`,
              "image/png",
            );
          }
        }, "image/png");
      }
    };
    img.src = svgDataUrl;
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Column */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary" />
                  Dimensions & Presets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="4000"
                      value={width}
                      onChange={(e) =>
                        setWidth(Math.max(10, Number(e.target.value)))
                      }
                      className="w-full px-3 py-1.5 text-sm border rounded bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="4000"
                      value={height}
                      onChange={(e) =>
                        setHeight(Math.max(10, Number(e.target.value)))
                      }
                      className="w-full px-3 py-1.5 text-sm border rounded bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                    Quick Presets
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        className="text-xs p-1.5 rounded border bg-muted/30 hover:bg-muted font-medium text-left truncate transition-colors"
                        onClick={() => {
                          setWidth(p.w);
                          setHeight(p.h);
                        }}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Styling & Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Background Style
                    </label>
                    <button
                      className="text-xs text-primary hover:underline font-medium"
                      onClick={() => setUseGradient(!useGradient)}
                    >
                      {useGradient ? "Switch to Solid" : "Switch to Gradient"}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColor1}
                      onChange={(e) => setBgColor1(e.target.value)}
                      className="w-8 h-8 rounded border p-0 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={bgColor1}
                      onChange={(e) => setBgColor1(e.target.value)}
                      className="text-xs font-mono h-8 px-2 border rounded bg-background flex-1"
                    />
                    {useGradient && (
                      <>
                        <input
                          type="color"
                          value={bgColor2}
                          onChange={(e) => setBgColor2(e.target.value)}
                          className="w-8 h-8 rounded border p-0 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={bgColor2}
                          onChange={(e) => setBgColor2(e.target.value)}
                          className="text-xs font-mono h-8 px-2 border rounded bg-background flex-1"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Text Content
                  </label>
                  <input
                    type="text"
                    placeholder={`${width} \u00D7 ${height}`}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border rounded bg-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded border p-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="text-xs font-mono h-8 px-2 border rounded bg-background flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value as any)}
                      className="w-full h-8 text-xs border rounded bg-background px-2"
                    >
                      <option value="sans-serif">Sans Serif</option>
                      <option value="monospace">Monospace</option>
                      <option value="serif">Serif</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Export Column */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Live Preview</CardTitle>
                  <span className="text-xs font-mono text-muted-foreground">
                    {width} &times; {height} px
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center p-6 bg-muted/20 min-h-[380px] border-t">
                <div
                  className="max-h-[360px] max-w-full overflow-hidden rounded border shadow-sm p-1"
                  style={{
                    backgroundImage:
                      "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                    backgroundPosition: "0 0, 8px 8px",
                  }}
                >
                  <img
                    src={svgDataUrl}
                    alt="Placeholder Preview"
                    className="max-h-[340px] max-w-full object-contain mx-auto"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Copy & Download Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopySvg}>
                    {copiedSvg ? (
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1 text-primary" />
                    )}
                    {copiedSvg ? "SVG Copied" : "Copy SVG Code"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyDataUri}
                  >
                    {copiedDataUri ? (
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-1 text-primary" />
                    )}
                    {copiedDataUri ? "Data URI Copied" : "Copy Data URI"}
                  </Button>

                  <Button size="sm" onClick={handleDownloadSvg}>
                    <Download className="h-4 w-4 mr-1" /> Download SVG
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleDownloadPng}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download PNG
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default PlaceholderGenny;
