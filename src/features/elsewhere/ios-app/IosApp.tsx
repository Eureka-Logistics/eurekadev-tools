import React from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import { Smartphone, ShieldCheck, WifiOff, Share2 } from "lucide-react";

interface IosAppProps {
  tool: ToolDefinition;
}

export const IosApp: React.FC<IosAppProps> = ({ tool }) => {
  return (
    <ToolShell tool={tool}>
      <div className="space-y-8 max-w-4xl mx-auto py-4">
        {/* Hero Section */}
        <div className="p-8 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950/40">
            <Smartphone className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">
              Eureka Mobile Companion
            </h2>
            <p className="text-sm text-zinc-400">
              Access the entire suite of 98 developer utilities directly on your
              phone or tablet. Works 100% offline with zero telemetry and no
              tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-800 text-zinc-200 text-xs font-medium border border-zinc-700">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Safari / Chrome: Tap Share &rarr; Add to Home Screen</span>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="p-2.5 rounded-xl bg-zinc-800 w-fit text-emerald-400">
              <WifiOff className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-200">
              100% Offline
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every tool executes directly on Apple Silicon without network
              connectivity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="p-2.5 rounded-xl bg-zinc-800 w-fit text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-200">
              Private by Design
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Zero telemetry, zero ads, and zero account sign-in required.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="p-2.5 rounded-xl bg-zinc-800 w-fit text-emerald-400">
              <Share2 className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-zinc-200">
              Share Sheet Action
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Directly process images, audio files, and text straight from
              Photos or Safari.
            </p>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default IosApp;
