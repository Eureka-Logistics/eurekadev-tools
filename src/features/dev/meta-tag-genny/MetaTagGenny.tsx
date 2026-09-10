import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipboard } from "@/lib/utils";
import { generateMetaHtml, MetaTagConfig } from "./utils";
import { Copy, Check, Tag, Eye, Globe } from "lucide-react";

export const MetaTagGenny: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [config, setConfig] = useState<MetaTagConfig>({
    title: "Eureka Dev Tools — Powerful Client-Side Developer Suite",
    description:
      "A comprehensive collection of 96 client-side developer utility tools running completely offline in your browser.",
    url: "https://tools.eurekagroup.id",
    imageUrl: "https://tools.eurekagroup.id/og-banner.png",
    author: "Eureka Group Engineering",
    twitterHandle: "@eurekagroup",
    themeColor: "#2563eb",
    type: "website",
    robots: "index, follow",
  });

  const [copied, setCopied] = useState(false);
  const [previewTab, setPreviewTab] = useState<"google" | "social" | "twitter">(
    "google",
  );

  const metaHtml = useMemo(() => generateMetaHtml(config), [config]);

  const updateField = (field: keyof MetaTagConfig, val: string) => {
    setConfig((prev) => ({ ...prev, [field]: val }));
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(metaHtml);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <ToolShell
      tool={tool}
      actions={
        <Button variant="default" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5 mr-1" />
          )}
          {copied ? "Copied HTML" : "Copy HTML Tags"}
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Parameters Form */}
        <Card>
          <CardHeader className="py-3 px-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              Page Metadata Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Page Title
              </label>
              <Input
                value={config.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Page title"
                className="h-8 text-xs"
              />
              <span className="text-[11px] text-muted-foreground">
                {config.title.length}/60 chars (optimal for SEO)
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">
                Meta Description
              </label>
              <Textarea
                value={config.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Short summary of the page..."
                rows={3}
                className="text-xs"
              />
              <span className="text-[11px] text-muted-foreground">
                {config.description.length}/160 chars (optimal for search
                snippets)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Canonical URL
                </label>
                <Input
                  value={config.url}
                  onChange={(e) => updateField("url", e.target.value)}
                  placeholder="https://..."
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  OG Image URL
                </label>
                <Input
                  value={config.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  placeholder="https://.../og.png"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Author / Brand
                </label>
                <Input
                  value={config.author}
                  onChange={(e) => updateField("author", e.target.value)}
                  placeholder="Author or company"
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Twitter Handle
                </label>
                <Input
                  value={config.twitterHandle}
                  onChange={(e) => updateField("twitterHandle", e.target.value)}
                  placeholder="@username"
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => updateField("themeColor", e.target.value)}
                    className="w-8 h-8 rounded border border-input cursor-pointer bg-transparent"
                  />
                  <Input
                    value={config.themeColor}
                    onChange={(e) => updateField("themeColor", e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Site Type
                </label>
                <select
                  value={config.type}
                  onChange={(e) => updateField("type", e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-transparent text-xs font-mono"
                >
                  <option value="website">website</option>
                  <option value="article">article</option>
                  <option value="product">product</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Robots Directives
                </label>
                <select
                  value={config.robots}
                  onChange={(e) => updateField("robots", e.target.value)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-transparent text-xs font-mono"
                >
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Visual Previews & Generated Code */}
        <div className="space-y-6">
          {/* Social / Search Previews */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-semibold">
                  Live Social & Search Preview
                </CardTitle>
              </div>
              <div className="flex rounded-md bg-muted p-0.5 text-xs font-medium">
                {(["google", "social", "twitter"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPreviewTab(tab)}
                    className={`px-2.5 py-0.5 rounded capitalize ${
                      previewTab === tab
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab === "google"
                      ? "Google Search"
                      : tab === "social"
                        ? "OpenGraph"
                        : "Twitter/X"}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {previewTab === "google" && (
                <div className="p-4 rounded-xl border border-border bg-white text-neutral-900 shadow-sm space-y-1 font-sans">
                  <div className="flex items-center space-x-2 text-xs text-neutral-600 truncate">
                    <Globe className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{config.url || "https://example.com"}</span>
                  </div>
                  <h4 className="text-base text-blue-700 hover:underline cursor-pointer font-medium line-clamp-1">
                    {config.title || "Page Title Example"}
                  </h4>
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {config.description ||
                      "Provide a description to see how it looks on Google search engine results pages."}
                  </p>
                </div>
              )}

              {previewTab === "social" && (
                <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm max-w-sm mx-auto">
                  <div className="h-44 bg-muted/60 flex items-center justify-center overflow-hidden relative">
                    {config.imageUrl ? (
                      <img
                        src={config.imageUrl}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        OG Image 1200x630
                      </span>
                    )}
                  </div>
                  <div className="p-3 bg-muted/30 space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">
                      {new URL(config.url || "https://example.com").hostname}
                    </span>
                    <h5 className="text-sm font-bold text-foreground line-clamp-1">
                      {config.title}
                    </h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {config.description}
                    </p>
                  </div>
                </div>
              )}

              {previewTab === "twitter" && (
                <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm max-w-sm mx-auto">
                  <div className="h-44 bg-muted/60 flex items-center justify-center overflow-hidden relative">
                    {config.imageUrl ? (
                      <img
                        src={config.imageUrl}
                        alt="Twitter Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Twitter Summary Image
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <h5 className="text-sm font-bold text-foreground line-clamp-1">
                      {config.title}
                    </h5>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {config.description}
                    </p>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono pt-1">
                      <Globe className="w-3 h-3" />
                      {new URL(config.url || "https://example.com").hostname}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HTML Code Output */}
          <Card>
            <CardHeader className="py-2.5 px-4 border-b border-border/40">
              <CardTitle className="text-sm font-semibold">
                Generated HTML Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-4 bg-muted/20 font-mono text-xs text-foreground overflow-x-auto leading-relaxed max-h-48">
                {metaHtml}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolShell>
  );
};

export default MetaTagGenny;
