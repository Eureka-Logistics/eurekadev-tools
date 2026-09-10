import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { downloadBlob } from "@/lib/download";
import {
  UploadCloud,
  Download,
  Sparkles,
  Trash2,
  Maximize2,
  RefreshCw,
} from "lucide-react";

interface Point {
  x: number;
  y: number;
}

export const ImageDeskewer: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [corners, setCorners] = useState<Point[]>([
    { x: 50, y: 50 },
    { x: 350, y: 30 },
    { x: 370, y: 250 },
    { x: 30, y: 270 },
  ]);
  const [activeCorner, setActiveCorner] = useState<number | null>(null);
  const [outputWidth, setOutputWidth] = useState<number>(400);
  const [outputHeight, setOutputHeight] = useState<number>(300);
  const [resultDataUrl, setResultDataUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const handleLoadSample = () => {
    const c = document.createElement("canvas");
    c.width = 500;
    c.height = 400;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, 500, 400);

      // Skewed document simulation
      ctx.save();
      ctx.transform(1, 0.2, -0.15, 1, 60, 40);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, 260, 180);

      ctx.fillStyle = "#2563eb";
      ctx.fillRect(20, 20, 220, 24);

      ctx.fillStyle = "#64748b";
      for (let i = 60; i < 160; i += 18) {
        ctx.fillRect(20, i, 200, 6);
      }
      ctx.restore();

      setImageSrc(c.toDataURL("image/png"));
      setCorners([
        { x: 55, y: 50 },
        { x: 320, y: 100 },
        { x: 285, y: 280 },
        { x: 25, y: 230 },
      ]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageSrc(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // When image loads, initialize corners if custom upload
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageElementRef.current = img;
      // If default corners don't match aspect ratio, set sensible defaults
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      setCorners([
        { x: Math.round(w * 0.1), y: Math.round(h * 0.1) },
        { x: Math.round(w * 0.9), y: Math.round(h * 0.1) },
        { x: Math.round(w * 0.9), y: Math.round(h * 0.9) },
        { x: Math.round(w * 0.1), y: Math.round(h * 0.9) },
      ]);
      setOutputWidth(Math.round(w * 0.8));
      setOutputHeight(Math.round(h * 0.8));
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Bilinear interpolation warp from arbitrary quad to rectangular destination
  const deskewWarp = useCallback(() => {
    const img = imageElementRef.current;
    if (!img || !imageSrc || corners.length < 4) return;

    setIsProcessing(true);
    const destW = outputWidth;
    const destH = outputHeight;

    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = img.naturalWidth;
    srcCanvas.height = img.naturalHeight;
    const srcCtx = srcCanvas.getContext("2d");
    if (!srcCtx) {
      setIsProcessing(false);
      return;
    }
    srcCtx.drawImage(img, 0, 0);
    const srcData = srcCtx.getImageData(
      0,
      0,
      img.naturalWidth,
      img.naturalHeight,
    );
    const sPixels = srcData.data;
    const sW = img.naturalWidth;
    const sH = img.naturalHeight;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = destW;
    outCanvas.height = destH;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) {
      setIsProcessing(false);
      return;
    }
    const outData = outCtx.createImageData(destW, destH);
    const dPixels = outData.data;

    const [p0, p1, p2, p3] = corners;

    for (let dy = 0; dy < destH; dy++) {
      const v = dy / (destH - 1);
      for (let dx = 0; dx < destW; dx++) {
        const u = dx / (destW - 1);

        // Bilinear coordinates inside quadrilateral
        const sx =
          (1 - u) * (1 - v) * p0.x +
          u * (1 - v) * p1.x +
          u * v * p2.x +
          (1 - u) * v * p3.x;
        const sy =
          (1 - u) * (1 - v) * p0.y +
          u * (1 - v) * p1.y +
          u * v * p2.y +
          (1 - u) * v * p3.y;

        const isx = Math.round(sx);
        const isy = Math.round(sy);

        const dIdx = (dy * destW + dx) * 4;

        if (isx >= 0 && isx < sW && isy >= 0 && isy < sH) {
          const sIdx = (isy * sW + isx) * 4;
          dPixels[dIdx] = sPixels[sIdx];
          dPixels[dIdx + 1] = sPixels[sIdx + 1];
          dPixels[dIdx + 2] = sPixels[sIdx + 2];
          dPixels[dIdx + 3] = sPixels[sIdx + 3];
        } else {
          dPixels[dIdx + 3] = 0; // transparent
        }
      }
    }

    outCtx.putImageData(outData, 0, 0);
    setResultDataUrl(outCanvas.toDataURL("image/png"));
    setIsProcessing(false);
  }, [corners, outputWidth, outputHeight, imageSrc]);

  useEffect(() => {
    if (imageSrc && imageElementRef.current) {
      deskewWarp();
    }
  }, [corners, outputWidth, outputHeight, imageSrc, deskewWarp]);

  // Draw overlay points on editor canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc || !imageElementRef.current) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imageElementRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.drawImage(img, 0, 0);

    // Draw quadrilateral border
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.stroke();

    // Fill quad semi-transparent
    ctx.fillStyle = "rgba(56, 189, 248, 0.15)";
    ctx.fill();

    // Draw handles
    const labels = ["TL", "TR", "BR", "BL"];
    corners.forEach((pt, i) => {
      ctx.fillStyle = activeCorner === i ? "#f43f5e" : "#0284c7";
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 11px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(labels[i], pt.x, pt.y - 18);
    });
  }, [corners, activeCorner, imageSrc]);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // Check hit within 25px
    const idx = corners.findIndex(
      (pt) => Math.hypot(pt.x - mx, pt.y - my) <= 25,
    );
    if (idx !== -1) {
      setActiveCorner(idx);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeCorner === null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mx = Math.max(
      0,
      Math.min(canvas.width, (e.clientX - rect.left) * scaleX),
    );
    const my = Math.max(
      0,
      Math.min(canvas.height, (e.clientY - rect.top) * scaleY),
    );

    setCorners((prev) => {
      const next = [...prev];
      next[activeCorner] = { x: Math.round(mx), y: Math.round(my) };
      return next;
    });
  };

  const handleCanvasMouseUp = () => {
    setActiveCorner(null);
  };

  const handleDownload = () => {
    if (!resultDataUrl) return;
    const parts = resultDataUrl.split(",");
    const byteString = atob(parts[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: "image/png" });
    downloadBlob(blob, "deskewed-document.png", "image/png");
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-primary" />
                Image Perspective Deskewer
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleLoadSample}>
                  <Sparkles className="h-4 w-4 mr-1 text-primary" /> Load Sample
                </Button>
                {imageSrc && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setImageSrc(null);
                      setResultDataUrl(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!imageSrc ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-10 cursor-pointer hover:bg-muted/50 transition-colors">
                <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
                <span className="text-sm font-medium">
                  Upload a skewed document, photo, or slide
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Drag the 4 corner handles to un-warp onto a flat rectangular
                  view
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Output Width (px)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="3000"
                    value={outputWidth}
                    onChange={(e) => setOutputWidth(Number(e.target.value))}
                    className="w-full text-xs font-mono h-8 px-2 border rounded bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Output Height (px)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="3000"
                    value={outputHeight}
                    onChange={(e) => setOutputHeight(Number(e.target.value))}
                    className="w-full text-xs font-mono h-8 px-2 border rounded bg-background"
                  />
                </div>
                <div className="col-span-2 flex items-end">
                  <Button
                    className="w-full h-8 text-xs"
                    onClick={handleDownload}
                    disabled={!resultDataUrl || isProcessing}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" /> Download Rectified
                    Image
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {imageSrc && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Interactive Corner Editor */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  <span>Interactive 4-Corner Selection</span>
                  <span className="text-xs text-muted-foreground">
                    Drag corner handles
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center bg-muted/20 min-h-[380px]">
                <canvas
                  ref={canvasRef}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="max-h-[360px] max-w-full rounded border shadow-sm cursor-crosshair object-contain"
                />
              </CardContent>
            </Card>

            {/* Rectified Output */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Rectified Deskewed Result
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center bg-muted/20 min-h-[380px]">
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin" /> Warping
                    perspective...
                  </div>
                ) : resultDataUrl ? (
                  <div
                    className="max-h-[360px] max-w-full rounded border shadow-sm p-1 overflow-hidden"
                    style={{
                      backgroundImage:
                        "radial-gradient(#cbd5e1 1px, transparent 1px), radial-gradient(#cbd5e1 1px, transparent 1px)",
                      backgroundSize: "16px 16px",
                      backgroundPosition: "0 0, 8px 8px",
                    }}
                  >
                    <img
                      src={resultDataUrl}
                      alt="Deskewed"
                      className="max-h-[340px] max-w-full object-contain"
                    />
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ToolShell>
  );
};

export default ImageDeskewer;
