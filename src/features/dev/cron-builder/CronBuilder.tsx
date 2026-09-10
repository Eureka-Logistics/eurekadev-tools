import React, { useState, useMemo } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/tool/ToolShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { copyToClipboard } from "@/lib/utils";
import {
  CronFields,
  cronToString,
  parseCronString,
  explainCron,
  calculateNextRuns,
} from "./utils";
import { Copy, CalendarClock, Clock, Check, Sparkles } from "lucide-react";

const CRON_PRESETS = [
  { label: "Every minute", cron: "* * * * *" },
  { label: "Every 5 minutes", cron: "*/5 * * * *" },
  { label: "Every hour", cron: "0 * * * *" },
  { label: "Daily at midnight", cron: "0 0 * * *" },
  { label: "Weekdays at 9:00 AM", cron: "0 9 * * 1-5" },
  { label: "Sundays at midnight", cron: "0 0 * * 0" },
  { label: "First of month at midnight", cron: "0 0 1 * *" },
];

export const CronBuilder: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const [fields, setFields] = useState<CronFields>({
    minute: "0",
    hour: "9",
    dayOfMonth: "*",
    month: "*",
    dayOfWeek: "1-5",
  });

  const [copied, setCopied] = useState(false);

  const cronString = useMemo(() => cronToString(fields), [fields]);
  const explanation = useMemo(() => explainCron(fields), [fields]);
  const nextRuns = useMemo(() => calculateNextRuns(fields, 5), [fields]);

  const handleRawChange = (raw: string) => {
    setFields(parseCronString(raw));
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(cronString);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyPreset = (presetCron: string) => {
    setFields(parseCronString(presetCron));
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
          {copied ? "Copied" : "Copy Cron"}
        </Button>
      }
    >
      {/* Expression Display & Explanation */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cron Expression
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-primary" /> Presets:
            </span>
            {CRON_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.cron)}
                className="px-2 py-0.5 rounded text-[11px] bg-muted hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Big Cron Text Input */}
        <div className="flex items-center gap-3">
          <Input
            value={cronString}
            onChange={(e) => handleRawChange(e.target.value)}
            className="text-2xl sm:text-3xl font-bold font-mono tracking-widest h-14 bg-muted/20 border-primary/30"
          />
        </div>

        <div className="flex items-center space-x-2 text-sm text-primary font-medium pt-1">
          <CalendarClock className="w-4 h-4 shrink-0" />
          <span>{explanation}</span>
        </div>
      </div>

      {/* Field by Field Editors */}
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border/40">
          <CardTitle className="text-sm font-semibold">
            Field Builder (5-Part Standard Cron)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          {/* Minute */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Minute (0–59)
            </label>
            <Input
              value={fields.minute}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, minute: e.target.value }))
              }
              placeholder="*"
              className="font-mono text-xs h-8"
            />
            <p className="text-[11px] text-muted-foreground">
              e.g. *, 15, */5, 0-30
            </p>
          </div>

          {/* Hour */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Hour (0–23)</label>
            <Input
              value={fields.hour}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, hour: e.target.value }))
              }
              placeholder="*"
              className="font-mono text-xs h-8"
            />
            <p className="text-[11px] text-muted-foreground">
              e.g. *, 0, 9, 9-17, */2
            </p>
          </div>

          {/* Day of Month */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Day of Month (1–31)
            </label>
            <Input
              value={fields.dayOfMonth}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, dayOfMonth: e.target.value }))
              }
              placeholder="*"
              className="font-mono text-xs h-8"
            />
            <p className="text-[11px] text-muted-foreground">
              e.g. *, 1, 15, 1-15
            </p>
          </div>

          {/* Month */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Month (1–12)
            </label>
            <Input
              value={fields.month}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, month: e.target.value }))
              }
              placeholder="*"
              className="font-mono text-xs h-8"
            />
            <p className="text-[11px] text-muted-foreground">
              e.g. *, 1-6, */3
            </p>
          </div>

          {/* Day of Week */}
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              Day of Week (0–6)
            </label>
            <Input
              value={fields.dayOfWeek}
              onChange={(e) =>
                setFields((prev) => ({ ...prev, dayOfWeek: e.target.value }))
              }
              placeholder="*"
              className="font-mono text-xs h-8"
            />
            <p className="text-[11px] text-muted-foreground">
              0=Sun, 1-5=Mon-Fri
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Next Projected Occurrences */}
      <Card>
        <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center space-x-2">
          <Clock className="w-4 h-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Next 5 Scheduled Run Times
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border/30">
          {nextRuns.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground italic">
              No upcoming runs found within search horizon.
            </div>
          ) : (
            nextRuns.map((run, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 text-xs font-mono"
              >
                <span className="text-muted-foreground select-none">
                  Run #{idx + 1}
                </span>
                <span className="text-foreground font-medium">{run}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </ToolShell>
  );
};

export default CronBuilder;
