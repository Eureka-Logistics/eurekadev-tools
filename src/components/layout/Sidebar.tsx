import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Star, ChevronLeft, ChevronRight, Home } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { ALL_TOOLS } from "@/data/tools";
import { DynamicIcon } from "@/components/ui/icon";
import { useFavorites } from "@/app/providers/FavoritesProvider";
import { Button } from "@/components/ui/button";

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return (
        localStorage.getItem("eureka-dev-tools:sidebar-collapsed") === "true"
      );
    } catch {
      return false;
    }
  });

  const { favorites } = useFavorites();
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("eureka-dev-tools:sidebar-collapsed", String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border bg-card/40 backdrop-blur transition-all duration-200 z-30 shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Top Controls */}
      <div className="flex items-center justify-between p-3 border-b border-border/40">
        {!collapsed && (
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            Navigation
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-7 w-7 ml-auto text-muted-foreground hover:text-foreground"
          title={
            collapsed ? "Expand sidebar (Cmd+B)" : "Collapse sidebar (Cmd+B)"
          }
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            } ${collapsed ? "justify-center px-0" : ""}`
          }
          title={collapsed ? "All Tools" : undefined}
        >
          <Home className="w-4 h-4 shrink-0" />
          {!collapsed && <span>All Tools</span>}
        </NavLink>

        {/* Favorites */}
        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
            } ${collapsed ? "justify-center px-0" : ""}`
          }
          title={collapsed ? `Favorites (${favorites.length})` : undefined}
        >
          <Star className="w-4 h-4 shrink-0 text-amber-500 fill-amber-500/20" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate">Favorites</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-muted font-mono text-muted-foreground">
                {favorites.length}
              </span>
            </>
          )}
        </NavLink>

        <div className="pt-3 pb-1">
          {!collapsed ? (
            <div className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Categories
            </div>
          ) : (
            <div className="h-px bg-border/60 my-2" />
          )}
        </div>

        {/* Categories list */}
        {CATEGORIES.map((category) => {
          const count = ALL_TOOLS.filter(
            (t) => t.categoryId === category.id,
          ).length;
          const isCurrentCategory =
            location.pathname === `/category/${category.id}`;

          return (
            <NavLink
              key={category.id}
              to={`/category/${category.id}`}
              className={`flex items-center space-x-3 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isCurrentCategory
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              } ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? `${category.name} (${count})` : undefined}
            >
              <DynamicIcon
                name={category.icon}
                className="w-4 h-4 shrink-0 opacity-80"
              />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate text-xs">
                    {category.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {count}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer stats */}
      {!collapsed && (
        <div className="p-3 border-t border-border/40 text-[11px] text-muted-foreground/80 flex items-center justify-between">
          <span>96 tools available</span>
          <span className="font-mono">100% client</span>
        </div>
      )}
    </aside>
  );
};
