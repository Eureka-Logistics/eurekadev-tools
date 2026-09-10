import React, { useState, useRef } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, Type, Sun, Moon } from "lucide-react";

export const LargeType: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [text, setText] = useState<string>("WIFI: EurekaGuest");
  const [fontSize, setFontSize] = useState<number>(72);
  const [theme, setTheme] = useState<"light" | "dark" | "yellow">("dark");
  const [fontFamily, setFontFamily] = useState<"sans" | "serif" | "mono">(
    "sans",
  );
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getThemeStyles = () => {
    if (theme === "light") return "bg-white text-slate-950";
    if (theme === "yellow") return "bg-yellow-400 text-slate-950";
    return "bg-slate-950 text-white";
  };

  const getFontFamily = () => {
    if (fontFamily === "serif") return "font-serif";
    if (fontFamily === "mono") return "font-mono";
    return "font-sans";
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="h-4 w-4 text-primary" />
                Large Type & Signboard Presenter
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={toggleFullscreen}>
                  {isFullscreen ? (
                    <Minimize className="h-4 w-4 mr-1" />
                  ) : (
                    <Maximize className="h-4 w-4 mr-1" />
                  )}
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-muted/30 p-4 rounded-lg border">
              <div className="sm:col-span-3">
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Message Text
                </label>
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type message to display..."
                  className="w-full text-base font-medium px-3 h-10 border rounded bg-background"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Size
                  </label>
                  <span className="text-xs font-mono">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="160"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Contrast Theme
                </label>
                <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-md text-xs">
                  <button
                    onClick={() => setTheme("dark")}
                    className={`py-1 rounded font-medium flex items-center justify-center gap-1 ${
                      theme === "dark"
                        ? "bg-background shadow font-bold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Moon className="h-3 w-3" /> Dark
                  </button>
                  <button
                    onClick={() => setTheme("light")}
                    className={`py-1 rounded font-medium flex items-center justify-center gap-1 ${
                      theme === "light"
                        ? "bg-background shadow font-bold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    <Sun className="h-3 w-3" /> Light
                  </button>
                  <button
                    onClick={() => setTheme("yellow")}
                    className={`py-1 rounded font-medium ${
                      theme === "yellow"
                        ? "bg-yellow-400 text-black shadow font-bold"
                        : "text-muted-foreground"
                    }`}
                  >
                    Alert
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  Font Family
                </label>
                <div className="grid grid-cols-3 gap-1 bg-muted p-1 rounded-md text-xs">
                  {(["sans", "serif", "mono"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFontFamily(f)}
                      className={`py-1 rounded font-medium capitalize ${
                        fontFamily === f
                          ? "bg-background shadow font-bold text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Presenter Canvas Card */}
        <div
          ref={containerRef}
          className={`min-h-[420px] rounded-xl border p-8 flex items-center justify-center text-center shadow-lg transition-colors overflow-hidden select-all ${getThemeStyles()}`}
        >
          <div
            className={`font-bold tracking-tight max-w-full break-words leading-tight ${getFontFamily()}`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {text || "Type your message above"}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default LargeType;
