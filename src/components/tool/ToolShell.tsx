import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";
import { DynamicIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/app/providers/FavoritesProvider";
import { ToolDefinition } from "@/types/tool";

interface ToolShellProps {
  tool: ToolDefinition;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const ToolShell: React.FC<ToolShellProps> = ({
  tool,
  children,
  actions,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(tool.id);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link
          to={`/category/${tool.categoryId}`}
          className="hover:text-foreground transition-colors"
        >
          {tool.category}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium truncate">
          {tool.name}
        </span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <DynamicIcon name={tool.icon} className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {tool.name}
              </h1>
              <Link to={`/category/${tool.categoryId}`}>
                <Badge
                  variant="outline"
                  className="text-xs font-normal hover:bg-muted cursor-pointer"
                >
                  {tool.category}
                </Badge>
              </Link>
              {tool.isNew && (
                <Badge
                  variant="outline"
                  className="text-[11px] border-primary/40 text-primary"
                >
                  New
                </Badge>
              )}
              {tool.beta && (
                <Badge variant="secondary" className="text-[11px]">
                  Beta
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {actions}
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleFavorite(tool.id)}
            className={`h-9 px-3 text-xs gap-1.5 ${
              favorited
                ? "text-amber-500 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
                : "text-muted-foreground"
            }`}
            title={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Star
              className={`w-3.5 h-3.5 ${favorited ? "fill-amber-500 text-amber-500" : ""}`}
            />
            <span>{favorited ? "Favorited" : "Favorite"}</span>
          </Button>
        </div>
      </div>

      {/* Main Content Workspace */}
      <div className="space-y-6">{children}</div>
    </div>
  );
};
