import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copyToClipboard } from "@/lib/utils";
import {
  RequestState,
  KeyValueItem,
  generateCurl,
  generateFetch,
  generatePython,
} from "./utils";
import { Copy, Plus, Trash2, Check, Terminal, Globe } from "lucide-react";

const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

export const RequestBuilder: React.FC<{ tool: ToolDefinition }> = ({
  tool,
}) => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("https://api.eurekagroup.id/v1/health");
  const [headers, setHeaders] = useState<KeyValueItem[]>([
    { key: "Accept", value: "application/json", enabled: true },
    { key: "Content-Type", value: "application/json", enabled: true },
  ]);
  const [queryParams, setQueryParams] = useState<KeyValueItem[]>([
    { key: "format", value: "json", enabled: true },
  ]);
  const [body, setBody] = useState(
    '{\n  "service": "eureka-tools",\n  "status": "active"\n}',
  );
  const [exportTab, setExportTab] = useState("curl");
  const [copied, setCopied] = useState(false);

  const requestState: RequestState = useMemo(
    () => ({
      method,
      url,
      headers,
      queryParams,
      body,
    }),
    [method, url, headers, queryParams, body],
  );

  const outputCode = useMemo(() => {
    switch (exportTab) {
      case "curl":
        return generateCurl(requestState);
      case "fetch":
        return generateFetch(requestState);
      case "python":
        return generatePython(requestState);
      default:
        return generateCurl(requestState);
    }
  }, [exportTab, requestState]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(outputCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addHeader = () => {
    setHeaders((prev) => [...prev, { key: "", value: "", enabled: true }]);
  };

  const updateHeader = (
    index: number,
    field: "key" | "value" | "enabled",
    val: any,
  ) => {
    setHeaders((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const removeHeader = (index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  };

  const addQueryParam = () => {
    setQueryParams((prev) => [...prev, { key: "", value: "", enabled: true }]);
  };

  const updateQueryParam = (
    index: number,
    field: "key" | "value" | "enabled",
    val: any,
  ) => {
    setQueryParams((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const removeQueryParam = (index: number) => {
    setQueryParams((prev) => prev.filter((_, i) => i !== index));
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
          {copied ? "Copied" : `Copy ${exportTab.toUpperCase()}`}
        </Button>
      }
    >
      {/* Target Request Line */}
      <div className="flex items-center gap-2 p-3 bg-card rounded-xl border border-border shadow-sm">
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="h-10 px-3 bg-muted font-bold font-mono text-xs rounded-md border border-input focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {HTTP_METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <div className="relative flex-1">
          <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/v1/resource"
            className="pl-9 h-10 font-mono text-xs"
          />
        </div>
      </div>

      {/* Configuration & Output Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Details Tabs */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-4 border-b border-border/40">
            <CardTitle className="text-sm font-semibold">
              Request Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 flex-1 space-y-4">
            <div className="space-y-4">
              {/* Headers */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Headers
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addHeader}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Header
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {headers.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={h.enabled}
                        onChange={(e) =>
                          updateHeader(i, "enabled", e.target.checked)
                        }
                        className="rounded text-primary border-input"
                      />
                      <Input
                        value={h.key}
                        onChange={(e) => updateHeader(i, "key", e.target.value)}
                        placeholder="Header key"
                        className="h-8 text-xs font-mono flex-1"
                      />
                      <Input
                        value={h.value}
                        onChange={(e) =>
                          updateHeader(i, "value", e.target.value)
                        }
                        placeholder="Value"
                        className="h-8 text-xs font-mono flex-1"
                      />
                      <button
                        onClick={() => removeHeader(i)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Query Parameters */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">
                    Query Parameters
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={addQueryParam}
                    className="h-7 text-xs gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Param
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {queryParams.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={p.enabled}
                        onChange={(e) =>
                          updateQueryParam(i, "enabled", e.target.checked)
                        }
                        className="rounded text-primary border-input"
                      />
                      <Input
                        value={p.key}
                        onChange={(e) =>
                          updateQueryParam(i, "key", e.target.value)
                        }
                        placeholder="Parameter"
                        className="h-8 text-xs font-mono flex-1"
                      />
                      <Input
                        value={p.value}
                        onChange={(e) =>
                          updateQueryParam(i, "value", e.target.value)
                        }
                        placeholder="Value"
                        className="h-8 text-xs font-mono flex-1"
                      />
                      <button
                        onClick={() => removeQueryParam(i)}
                        className="p-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body for write methods */}
              {["POST", "PUT", "PATCH", "DELETE"].includes(method) && (
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <span className="text-xs font-semibold text-foreground">
                    Request Payload Body (JSON/Raw)
                  </span>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-md border border-input bg-muted/20 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed resize-y"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Code Generator Snippets */}
        <Card className="flex flex-col">
          <CardHeader className="py-2.5 px-4 border-b border-border/40 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                Generated Code
              </CardTitle>
            </div>
            {/* Snippet format selector */}
            <div className="flex rounded-md bg-muted p-0.5 text-xs font-medium">
              {(["curl", "fetch", "python"] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportTab(fmt)}
                  className={`px-2.5 py-0.5 rounded transition-colors uppercase font-mono ${
                    exportTab === fmt
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <pre className="p-4 bg-muted/20 font-mono text-xs text-foreground overflow-x-auto leading-relaxed flex-1 whitespace-pre-wrap">
              {outputCode}
            </pre>
          </CardContent>
        </Card>
      </div>
    </ToolShell>
  );
};

export default RequestBuilder;
