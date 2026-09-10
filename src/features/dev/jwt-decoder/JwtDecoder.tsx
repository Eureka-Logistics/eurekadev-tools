import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { copyToClipboard } from "@/lib/utils";
import { decodeJwt } from "./utils";
import {
  Copy,
  Trash2,
  Check,
  ShieldAlert,
  Clock,
  KeySquare,
  Sparkles,
  AlertCircle,
} from "lucide-react";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkV1cmVrYSBEZXYiLCJyb2xlIjoiU2VuaW9yIEVuZ2luZWVyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4zILcZ0v-wVvI8K5d7MqvD4RkU1yBwT1o9B_Xm3Vf0Y";

export const JwtDecoder: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [token, setToken] = useState(SAMPLE_JWT);
  const [copiedPart, setCopiedPart] = useState<string | null>(null);

  const decoded = useMemo(() => decodeJwt(token), [token]);

  const handleCopy = async (text: string, part: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedPart(part);
      setTimeout(() => setCopiedPart(null), 2000);
    }
  };

  const handleClear = () => setToken("");
  const handleLoadSample = () => setToken(SAMPLE_JWT);

  return (
    <ToolShell
      tool={tool}
      actions={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleLoadSample}>
            <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
            Load Sample
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            disabled={!token}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            Clear
          </Button>
        </div>
      }
    >
      {/* Security Disclaimer Banner */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200 text-xs">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
        <p>
          <strong className="font-semibold">Security Note:</strong> Decoding a
          JWT in the browser exposes its contents locally but{" "}
          <em>does not verify the cryptographic signature</em>. Never trust
          unverified claims on server-side logic.
        </p>
      </div>

      {/* Input Token Card */}
      <Card>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
          <div className="flex items-center space-x-2">
            <KeySquare className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">
              Encoded JWT String
            </CardTitle>
          </div>
          {token.trim() && (
            <Badge
              variant={decoded.validSegments ? "outline" : "destructive"}
              className="text-xs"
            >
              {decoded.segmentCount}/3 segments
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4">
          <textarea
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your JWT token here (e.g. eyJhbGciOi...)..."
            rows={5}
            className="w-full p-3 rounded-md border border-input bg-muted/20 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary break-all resize-y"
            spellCheck={false}
          />
        </CardContent>
      </Card>

      {/* Summary Properties if Valid */}
      {decoded.validSegments && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3 bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">
              Algorithm
            </span>
            <p className="text-sm font-bold font-mono mt-0.5 text-foreground">
              {decoded.algorithm || "None"}
            </p>
          </Card>
          <Card className="p-3 bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">
              Token Type
            </span>
            <p className="text-sm font-bold font-mono mt-0.5 text-foreground">
              {decoded.tokenType || "JWT"}
            </p>
          </Card>
          <Card className="p-3 bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">
              Signature Length
            </span>
            <p className="text-sm font-bold font-mono mt-0.5 text-foreground">
              {decoded.signature.bytes} bytes
            </p>
          </Card>
          <Card className="p-3 bg-card/60">
            <span className="text-[11px] text-muted-foreground font-medium">
              Status
            </span>
            <div className="mt-0.5">
              {decoded.isExpired ? (
                <Badge variant="destructive" className="text-xs py-0.5">
                  Expired
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-xs py-0.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                >
                  Valid / Active
                </Badge>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Claims Inspector */}
      {decoded.timeClaims.length > 0 && (
        <Card>
          <CardHeader className="py-2.5 px-4 flex flex-row items-center space-x-2 border-b border-border/40">
            <Clock className="w-4 h-4 text-primary" />
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Time Claims Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border/40">
            {decoded.timeClaims.map((claim) => (
              <div
                key={claim.key}
                className="flex items-center justify-between p-3 text-xs"
              >
                <div>
                  <span className="font-semibold text-foreground mr-2">
                    {claim.label}:
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {claim.dateString}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    ({claim.timestamp})
                  </span>
                  {claim.key === "exp" && (
                    <Badge
                      variant={claim.isPast ? "destructive" : "outline"}
                      className="text-[10px]"
                    >
                      {claim.isPast ? "Expired" : "Active"}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Decoded Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Header */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
            <div>
              <CardTitle className="text-sm font-semibold">Header</CardTitle>
              <span className="text-[11px] text-muted-foreground">
                Algorithm & Token Type
              </span>
            </div>
            {decoded.header.pretty && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => handleCopy(decoded.header.pretty, "header")}
              >
                {copiedPart === "header" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-4 flex-1">
            {decoded.header.error ? (
              <div className="flex items-center gap-2 text-destructive text-xs p-3 bg-destructive/10 rounded">
                <AlertCircle className="w-4 h-4" />
                <span>{decoded.header.error}</span>
              </div>
            ) : (
              <pre className="text-xs font-mono bg-muted/20 p-3 rounded-lg overflow-x-auto leading-relaxed text-foreground">
                {decoded.header.pretty || "// Header empty"}
              </pre>
            )}
          </CardContent>
        </Card>

        {/* Payload */}
        <Card className="flex flex-col">
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
            <div>
              <CardTitle className="text-sm font-semibold">
                Payload Data
              </CardTitle>
              <span className="text-[11px] text-muted-foreground">
                Claims & Subject Info
              </span>
            </div>
            {decoded.payload.pretty && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={() => handleCopy(decoded.payload.pretty, "payload")}
              >
                {copiedPart === "payload" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                Copy
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-4 flex-1">
            {decoded.payload.error ? (
              <div className="flex items-center gap-2 text-destructive text-xs p-3 bg-destructive/10 rounded">
                <AlertCircle className="w-4 h-4" />
                <span>{decoded.payload.error}</span>
              </div>
            ) : (
              <pre className="text-xs font-mono bg-muted/20 p-3 rounded-lg overflow-x-auto leading-relaxed text-foreground">
                {decoded.payload.pretty || "// Payload empty"}
              </pre>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Signature Pane */}
      {decoded.signature.raw && (
        <Card>
          <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b border-border/40">
            <div>
              <CardTitle className="text-sm font-semibold">Signature</CardTitle>
              <span className="text-[11px] text-muted-foreground">
                Encoded verification hash ({decoded.signature.bytes} characters)
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => handleCopy(decoded.signature.raw, "sig")}
            >
              {copiedPart === "sig" ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              Copy
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <p className="font-mono text-xs text-muted-foreground break-all bg-muted/20 p-3 rounded-lg">
              {decoded.signature.raw}
            </p>
          </CardContent>
        </Card>
      )}
    </ToolShell>
  );
};

export default JwtDecoder;
