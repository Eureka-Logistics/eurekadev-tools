import React, { useEffect, Suspense } from "react";
import { useParams } from "react-router-dom";
import { ALL_TOOLS } from "@/data/tools";
import { NotFoundPage } from "./NotFoundPage";
import { useRecentTools } from "@/app/providers/RecentToolsProvider";
import { getToolComponent } from "@/features/toolComponentRegistry";
import { ToolShell } from "@/components/tool/ToolShell";
import { Loader2 } from "lucide-react";

export const ToolPage: React.FC = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const { addRecent } = useRecentTools();

  const tool = ALL_TOOLS.find((t) => t.id === toolId);

  useEffect(() => {
    if (toolId && tool) {
      addRecent(toolId);
    }
  }, [toolId, tool]);

  if (!tool) {
    return <NotFoundPage />;
  }

  const Component = getToolComponent(tool.id);

  return (
    <Suspense
      fallback={
        <ToolShell tool={tool}>
          <div className="flex flex-col items-center justify-center p-24 text-muted-foreground space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Loading {tool.name}...</p>
          </div>
        </ToolShell>
      }
    >
      <Component tool={tool} />
    </Suspense>
  );
};
