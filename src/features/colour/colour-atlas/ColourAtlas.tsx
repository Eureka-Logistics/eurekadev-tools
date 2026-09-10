import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/utils";
import { Compass, Copy, Check, Sparkles } from "lucide-react";

export const ColourAtlas: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [hue, setHue] = useState<number>(210); // 0-360
  const [saturation, setSaturation] = useState<number>(85); // 0-100
  const [lightness, setLightness] = useState<number>(55); // 0-100
  const [copied, setCopied] = useState<boolean>(false);

  const wheelRef = useRef<HTMLCanvasElement | null>(null);

  // Convert HSL to Hex
  const hslToHex = useCallback((h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }, []);

  const currentHex = hslToHex(hue, saturation, lightness);

  // Draw 2D Color Wheel
  useEffect(() => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const radius = width / 2 - 10;

    const imgData = ctx.createImageData(width, height);
    const data = imgData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy);
        const idx = (y * width + x) * 4;

        if (dist <= radius) {
          let angle = Math.atan2(dy, dx) * (180 / Math.PI);
          if (angle < 0) angle += 360;

          const sat = (dist / radius) * 100;
          const hex = hslToHex(angle, sat, lightness);
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);

          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        } else {
          data[idx + 3] = 0;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Draw current selection handle
    const rad = (hue * Math.PI) / 180;
    const dist = (saturation / 100) * radius;
    const handleX = cx + Math.cos(rad) * dist;
    const handleY = cy + Math.sin(rad) * dist;

    ctx.beginPath();
    ctx.arc(handleX, handleY, 8, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = currentHex;
    ctx.fill();

    // Draw complementary marker
    const compRad = ((hue + 180) % 360) * (Math.PI / 180);
    const compX = cx + Math.cos(compRad) * dist;
    const compY = cy + Math.sin(compRad) * dist;

    ctx.beginPath();
    ctx.arc(compX, compY, 5, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [hue, saturation, lightness, hslToHex, currentHex]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = wheelRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = canvas.width / 2 - 10;

    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);

    if (dist <= radius) {
      let angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      setHue(Math.round(angle));
      setSaturation(Math.round((dist / radius) * 100));
    }
  };

  const handleCopy = async () => {
    await copyToClipboard(currentHex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRandom = () => {
    setHue(Math.floor(Math.random() * 360));
    setSaturation(Math.floor(Math.random() * 60) + 40);
    setLightness(Math.floor(Math.random() * 40) + 35);
  };

  // Generate tints, tones, and shades
  const tints = [90, 75, 60, 45, 30, 15].map((l) =>
    hslToHex(hue, saturation, l),
  );
  const tones = [10, 30, 50, 70, 90].map((s) => hslToHex(hue, s, lightness));

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Color Atlas & Chromatic Gamut
              </CardTitle>
              <Button size="sm" variant="outline" onClick={handleRandom}>
                <Sparkles className="h-4 w-4 mr-1 text-primary" /> Random Point
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Interactive Color Wheel Canvas */}
              <div className="flex flex-col items-center justify-center space-y-3">
                <canvas
                  ref={wheelRef}
                  width={280}
                  height={280}
                  onClick={handleCanvasClick}
                  className="rounded-full shadow-md cursor-crosshair border"
                />
                <span className="text-xs text-muted-foreground font-medium">
                  Click anywhere inside wheel to select hue & saturation
                </span>
              </div>

              {/* Controls & Metrics */}
              <div className="space-y-4">
                {/* Active Color Banner */}
                <div
                  className="h-20 rounded-xl border shadow-inner flex items-center justify-between px-6 transition-colors"
                  style={{ backgroundColor: currentHex }}
                >
                  <span className="bg-black/50 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg font-mono text-base font-bold shadow">
                    {currentHex.toUpperCase()}
                  </span>
                  <Button size="sm" variant="secondary" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 mr-1 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy HEX"}
                  </Button>
                </div>

                {/* Lightness Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-muted-foreground">Lightness</span>
                    <span className="font-mono">{lightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={lightness}
                    onChange={(e) => setLightness(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Hue & Saturation Sliders */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Hue Angle</span>
                      <span className="font-mono">{hue}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={hue}
                      onChange={(e) => setHue(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Saturation</span>
                      <span className="font-mono">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Coordinates summary */}
                <div className="grid grid-cols-3 gap-2 bg-muted/40 p-3 rounded-lg border text-xs font-mono text-center">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      HSL
                    </span>
                    <span>
                      {hue}°, {saturation}%, {lightness}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      COMPLEMENT
                    </span>
                    <span>{(hue + 180) % 360}°</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">
                      HEX
                    </span>
                    <span>{currentHex.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tints & Shades Strips */}
            <div className="space-y-3 pt-2">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Lightness Tints & Shades
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {tints.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setLightness([90, 75, 60, 45, 30, 15][i]);
                      }}
                      className="h-10 rounded-md border shadow-xs hover:scale-105 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-1.5">
                  Saturation Tones
                </span>
                <div className="grid grid-cols-5 gap-2">
                  {tones.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSaturation([10, 30, 50, 70, 90][i]);
                      }}
                      className="h-10 rounded-md border shadow-xs hover:scale-105 transition-transform"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default ColourAtlas;
