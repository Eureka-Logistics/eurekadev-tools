import React from "react";
import { Link } from "react-router-dom";
import { Star, ChevronRight, ArrowLeft } from "lucide-react";
import { ALL_TOOLS } from "@/data/tools";
import { ToolCard } from "@/pages/HomePage";
import { useFavorites } from "@/app/providers/FavoritesProvider";
import { Button } from "@/components/ui/button";

export const FavoritesPage: React.FC = () => {
  const { favorites } = useFavorites();
  const favoriteTools = ALL_TOOLS.filter((t) => favorites.includes(t.id));

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">Favorites</span>
      </nav>

      {/* Header */}
      <div className="flex items-start space-x-4 pb-6 border-b border-border">
        <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shrink-0">
          <Star className="w-7 h-7 fill-amber-500 text-amber-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Favorite Tools
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Quick access to your pinned utilities. Saved locally in your browser
            session.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2 font-mono">
            {favoriteTools.length} tools pinned
          </p>
        </div>
      </div>

      {favoriteTools.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border border-dashed border-border bg-card/40 space-y-4">
          <Star className="w-10 h-10 text-muted-foreground/40 mx-auto" />
          <h2 className="text-lg font-semibold">No favorites yet</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Click the star icon on any tool card or tool header to pin it here
            for quick access.
          </p>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Browse all tools
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
};
