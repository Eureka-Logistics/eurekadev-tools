import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Star,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Laptop,
} from "lucide-react";
import { ALL_TOOLS } from "@/data/tools";
import { CATEGORIES } from "@/data/categories";
import { DynamicIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useFavorites } from "@/app/providers/FavoritesProvider";
import { useRecentTools } from "@/app/providers/RecentToolsProvider";
import { ToolDefinition } from "@/types/tool";

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { favorites } = useFavorites();
  const { recentTools } = useRecentTools();

  // Filter tools
  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter((tool) => {
      const matchCat =
        selectedCategory === "all" || tool.categoryId === selectedCategory;
      if (!matchCat) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [selectedCategory, searchQuery]);

  const favoriteToolsList = useMemo(() => {
    return ALL_TOOLS.filter((t) => favorites.includes(t.id));
  }, [favorites]);

  const recentToolsList = useMemo(() => {
    return recentTools
      .map((id) => ALL_TOOLS.find((t) => t.id === id))
      .filter((t): t is ToolDefinition => Boolean(t))
      .slice(0, 8);
  }, [recentTools]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border p-6 sm:p-10 shadow-sm">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            <Zap className="w-3.5 h-3.5" />
            <span>Eureka Group Internal Engineering</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Eureka Dev Tools
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            A comprehensive suite of 98 client-side developer utilities
            engineered for high performance, zero data leakage, and local
            browser execution.
          </p>

          {/* Privacy & Speed badges */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              100% Client-Side Privacy
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Zero Telemetry / No Logins
            </span>
            <span className="flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-primary" />
              Offline Ready
            </span>
          </div>

          {/* Quick Search */}
          <div className="relative pt-2 max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter 96 tools by name, keyword, or format (e.g. 'jwt', 'json', 'pdf', 'video')..."
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-input bg-background/90 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      {favoriteToolsList.length > 0 && !searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Favorite Tools
            </h2>
            <Link
              to="/favorites"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View all ({favorites.length}) <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {favoriteToolsList.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Recently Used Section */}
      {recentToolsList.length > 0 && !searchQuery && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recently Used
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {recentToolsList.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Category Pills & All Tools */}
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Explore All Tools
            </h2>
            <p className="text-xs text-muted-foreground">
              Showing {filteredTools.length} of {ALL_TOOLS.length} utilities
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              All ({ALL_TOOLS.length})
            </button>
            {CATEGORIES.map((c) => {
              const count = ALL_TOOLS.filter(
                (t) => t.categoryId === c.id,
              ).length;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectedCategory === c.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <DynamicIcon name={c.icon} className="w-3 h-3" />
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid */}
        {filteredTools.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
            <p className="text-base font-medium">No tools found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try searching with a different term or select another category
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ToolCard: React.FC<{ tool: ToolDefinition }> = ({ tool }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(tool.id);

  const cardContent = (
    <Card className="group relative h-full flex flex-col justify-between hover:border-primary/50 hover:shadow-md transition-all duration-150 bg-card/70 hover:bg-card">
      <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Top Bar: Icon + Category + Favorite button */}
          <div className="flex items-center justify-between">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 group-hover:scale-105 transition-transform shrink-0">
              <DynamicIcon name={tool.icon} className="w-4 h-4" />
            </div>

            <div className="flex items-center space-x-1.5">
              <Badge
                variant="outline"
                className="text-[10px] font-normal py-0 px-1.5"
              >
                {tool.category}
              </Badge>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFavorite(tool.id);
                }}
                className={`p-1 rounded hover:bg-muted/80 transition-colors ${
                  favorited
                    ? "text-amber-500"
                    : "text-muted-foreground/50 hover:text-muted-foreground"
                }`}
                title={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  className={`w-3.5 h-3.5 ${favorited ? "fill-amber-500 text-amber-500" : ""}`}
                />
              </button>
            </div>
          </div>

          {/* Title & Desc */}
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {tool.name}
              </h3>
              {tool.isNew && (
                <span className="text-[9px] px-1 py-0.2 rounded font-medium bg-primary/15 text-primary">
                  New
                </span>
              )}
              {tool.beta && (
                <span className="text-[9px] px-1 py-0.2 rounded font-medium bg-secondary text-secondary-foreground">
                  Beta
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
              {tool.description}
            </p>
          </div>
        </div>

        {/* Bottom meta formats */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground/80">
          <span className="truncate">
            {tool.accepts && tool.accepts.length > 0
              ? tool.accepts.slice(0, 2).join(", ")
              : "Interactive"}
          </span>
          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-primary shrink-0" />
        </div>
      </CardContent>
    </Card>
  );

  if (tool.external && tool.href) {
    return (
      <a
        href={tool.href}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={tool.href || `/tools/${tool.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
};
