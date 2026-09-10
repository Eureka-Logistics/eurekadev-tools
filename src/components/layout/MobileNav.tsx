import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { X, Home, Star } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { ALL_TOOLS } from "@/data/tools";
import { DynamicIcon } from "@/components/ui/icon";
import { useFavorites } from "@/app/providers/FavoritesProvider";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ open, onClose }) => {
  const { favorites } = useFavorites();
  const location = useLocation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex flex-col w-72 max-w-[85vw] bg-card border-r border-border shadow-xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 mb-2 border-b border-border">
          <span className="font-bold text-sm">Eureka Dev Tools</span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <NavLink
            to="/"
            end
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`
            }
          >
            <Home className="w-4 h-4" />
            <span>All Tools</span>
          </NavLink>

          <NavLink
            to="/favorites"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`
            }
          >
            <div className="flex items-center space-x-3">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>Favorites</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
              {favorites.length}
            </span>
          </NavLink>

          <div className="pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase">
            Categories
          </div>

          {CATEGORIES.map((category) => {
            const count = ALL_TOOLS.filter(
              (t) => t.categoryId === category.id,
            ).length;
            const isCurrent = location.pathname === `/category/${category.id}`;

            return (
              <NavLink
                key={category.id}
                to={`/category/${category.id}`}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  isCurrent
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <DynamicIcon
                    name={category.icon}
                    className="w-4 h-4 opacity-80"
                  />
                  <span>{category.name}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {count}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </div>
  );
};
