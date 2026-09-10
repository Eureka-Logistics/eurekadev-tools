import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import { UploadCloud, Download, Trash2, Sparkles, Grid } from "lucide-react";

interface TileData {
  row: number;
  col: number;
  index: number;
  dataUrl: string;
}

export const ImageSplitter: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [tiles, setTiles] = useState<TileData[]>([]);

  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleLoadSample = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Draw 3x3 colorful mosaic
      const colors = [
        "#f43f5e",
        "#fb923c",
        "#facc15",
        "#4ade80",
        "#2dd4bf",
        "#38bdf8",
        "#818cf8",
        "#c084fc",
        "#f472b6",
      ];
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          ctx.fillStyle = colors[r * 3 + c];
          ctx.fillRect(c * 300, r * 300, 300, 300);
          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 64px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`${r * 3 + c + 1}`, c * 300 + 150, r * 300 + 150);
        }
      }
      setImageSrc(canvas.toDataURL("image/png"));
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
  };

  const generateTiles = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const tileWidth = Math.floor(img.naturalWidth / cols);
    const tileHeight = Math.floor(img.naturalHeight / rows);

    const generated: TileData[] = [];
    let idx = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const canvas = document.createElement("canvas");
        canvas.width = tileWidth;
        canvas.height = tileHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(
            img,
            c * tileWidth,
            r * tileHeight,
            tileWidth,
            tileHeight,
            0,
            0,
            tileWidth,
            tileHeight,
          );
          generated.push({
            row: r,
            col: c,
            index: idx++,
            dataUrl: canvas.toDataURL("image/png"),
          });
        }
      }
    }

    setTiles(generated);
  }, [rows, cols]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgRef.current = img;
        generateTiles();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, generateTiles]);

  const handleDownloadTile = (tile: TileData) => {
    fetch(tile.dataUrl)
      .then((res) => res.blob())
      .then((blob) =>
        downloadBlob(
          blob,
          `tile-${tile.index}-r${tile.row + 1}-c${tile.col + 1}.png`,
        ),
      );
  };

  const handleDownloadAll = async () => {
    for (const t of tiles) {
      await handleDownloadTile(t);
      await new Promise((r) => setTimeout(r, 100));
    }
  };

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          {!imageSrc && (
            <Button variant="outline" size="sm" onClick={handleLoadSample}>
              <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
              Load Sample
            </Button>
          )}
          {imageSrc && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setImageSrc(null)}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              Clear
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadAll}
            disabled={tiles.length === 0}
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download All ({tiles.length} Tiles)
          </Button>
        </div>
      }
    >
      {!imageSrc ? (
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
          <CardContent className="p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold">
                Upload Image to Split into Tiles
              </h3>
              <p className="text-xs text-muted-foreground">
                Cut panoramic or large photos into 3x3, 2x2, or custom grid
                slices for Instagram or print.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow">
                <span>Select File</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = "";
                  }}
                />
              </label>
              <Button variant="outline" size="sm" onClick={handleLoadSample}>
                Use Sample
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Grid Settings */}
          <Card>
            <CardHeader className="py-3 px-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Grid className="w-4 h-4 text-primary" />
                Grid Dimensions ({rows} x {cols} = {rows * cols} tiles)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Columns</span>
                  <span className="font-mono text-muted-foreground">
                    {cols}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Rows</span>
                  <span className="font-mono text-muted-foreground">
                    {rows}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Slices Grid */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-border/40">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                Output Slices ({tiles.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div
                className="grid gap-2 max-w-2xl mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                }}
              >
                {tiles.map((tile) => (
                  <div
                    key={tile.index}
                    className="relative group border border-border/60 rounded overflow-hidden aspect-square bg-muted/20"
                  >
                    <img
                      src={tile.dataUrl}
                      alt={`Tile ${tile.index}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                      <span className="text-xs font-bold font-mono">
                        #{tile.index}
                      </span>
                      <Button
                        variant="default"
                        size="sm"
                        className="h-6 text-[10px] px-2 gap-1"
                        onClick={() => handleDownloadTile(tile)}
                      >
                        <Download className="w-3 h-3" />
                        PNG
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ToolShell>
  );
};

export default ImageSplitter;
