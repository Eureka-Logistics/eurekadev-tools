import React, { useState } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import {
  Terminal,
  Copy,
  Check,
  Code2,
} from "lucide-react";

interface CliViewProps {
  tool: ToolDefinition;
}

export const CliView: React.FC<CliViewProps> = ({ tool }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const CLI_EXAMPLES = [
    {
      title: "Decode JWT Token",
      cmd: "eureka jwt decode eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      desc: "Instantly inspect JWT header and payload in your terminal.",
    },
    {
      title: "Compress Image",
      cmd: "eureka image compress ./photo.png --quality 80 --output ./photo-compressed.png",
      desc: "Lossless / lossy image compression using pure offline algorithms.",
    },
    {
      title: "Generate QR Code",
      cmd: "eureka qr generate https://eureka.tools --output qr.svg",
      desc: "Render styled QR code directly to terminal or SVG.",
    },
    {
      title: "Convert Video to GIF",
      cmd: "eureka video gif input.mp4 --fps 12 --width 480 -o output.gif",
      desc: "Extract clip and encode animated GIF right in your shell.",
    },
  ];

  return (
    <ToolShell tool={tool}>
      <div className="space-y-8 max-w-4xl mx-auto py-4">
        {/* Hero */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/40">
            <Terminal className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">
              Eureka Dev Tools CLI
            </h2>
            <p className="text-sm text-zinc-400">
              The same suite of powerful utilities right in your shell. Fast, pipeable, and entirely offline.
            </p>
          </div>

          {/* Quick Install */}
          <div className="max-w-md mx-auto p-3 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
            <code className="text-xs font-mono text-emerald-400 select-all pl-2">
              curl -fsSL https://eureka.tools/install.sh | bash
            </code>
            <button
              onClick={() => handleCopy("curl -fsSL https://eureka.tools/install.sh | bash", "install")}
              className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 transition"
              title="Copy install command"
            >
              {copiedKey === "install" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Examples */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Code2 className="w-4 h-4 text-emerald-400" />
            CLI Command Usage Examples
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLI_EXAMPLES.map((ex, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
                <h4 className="text-xs font-semibold text-zinc-200">{ex.title}</h4>
                <p className="text-[11px] text-zinc-400">{ex.desc}</p>
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-850 flex items-center justify-between gap-2">
                  <code className="text-xs font-mono text-emerald-400 select-all truncate">
                    {ex.cmd}
                  </code>
                  <button
                    onClick={() => handleCopy(ex.cmd, `ex-${idx}`)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                  >
                    {copiedKey === `ex-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default CliView;
