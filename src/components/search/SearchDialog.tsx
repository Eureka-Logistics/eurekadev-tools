import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowRight } from "lucide-react";
import { ALL_TOOLS } from "@/data/tools";
import { DynamicIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/app/providers/FavoritesProvider";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

export const SearchDialog: React.FC<SearchDialogProps> = ({
  open,
  onClose,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isFavorite } = useFavorites();

  const filteredTools = React.useMemo(() => {
    if (!query.trim()) return ALL_TOOLS.slice(0, 12);
    const q = query.toLowerCase().trim();
    return ALL_TOOLS.filter((tool) => {
      const matchName = tool.name.toLowerCase().includes(q);
      const matchDesc = tool.description.toLowerCase().includes(q);
      const matchCat = tool.category.toLowerCase().includes(q);
      const matchTags = tool.tags.some((t) => t.toLowerCase().includes(q));
      return matchName || matchDesc || matchCat || matchTags;
    });
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) {
        if (
          e.key === "/" &&
          !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)
        ) {
          e.preventDefault();
          onClose(); // In parent toggle open
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev + 1 < filteredTools.length ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev - 1 >= 0 ? prev - 1 : filteredTools.length - 1,
        );
      } else if (e.key === "Enter" && filteredTools[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredTools[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, filteredTools, selectedIndex]);

  const handleSelect = (tool: (typeof ALL_TOOLS)[0]) => {
    onClose();
    if (tool.external && tool.href) {
      window.open(tool.href, "_blank", "noopener,noreferrer");
    } else {
      navigate(tool.href || `/tools/${tool.id}`);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-background/80 backdrop-blur-sm animate-in fade-in-0">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-2xl bg-card border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10 border-border">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-border bg-muted/30">
          <Search className="w-5 h-5 text-muted-foreground mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all 96 tools by name, category, or keyword..."
            className="w-full h-14 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-base"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            Esc
          </kbd>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          className="overflow-y-auto p-2 space-y-1 divide-y divide-border/20"
        >
          {filteredTools.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className="text-sm">
                No tools found matching &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            filteredTools.map((tool, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelect(tool)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 pr-2">
                    <div
                      className={`p-2 rounded-md ${isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"} shrink-0`}
                    >
                      <DynamicIcon name={tool.icon} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm truncate">
                          {tool.name}
                        </span>
                        {tool.isNew && (
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 px-1 border-primary/40 text-primary"
                          >
                            New
                          </Badge>
                        )}
                        {tool.beta && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] py-0 px-1"
                          >
                            Beta
                          </Badge>
                        )}
                        {isFavorite(tool.id) && (
                          <span className="text-amber-500 text-xs">★</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[11px] font-normal hidden sm:inline-flex"
                    >
                      {tool.category}
                    </Badge>
                    <ArrowRight
                      className={`w-4 h-4 text-muted-foreground transition-transform ${isSelected ? "translate-x-0.5 text-primary" : "opacity-0"}`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-border bg-muted/40 text-[11px] text-muted-foreground flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span>
              <kbd className="font-mono bg-background border px-1 rounded">
                ↑
              </kbd>{" "}
              <kbd className="font-mono bg-background border px-1 rounded">
                ↓
              </kbd>{" "}
              to navigate
            </span>
            <span>
              <kbd className="font-mono bg-background border px-1 rounded">
                Enter
              </kbd>{" "}
              to open
            </span>
          </div>
          <span>
            {filteredTools.length}{" "}
            {filteredTools.length === 1 ? "tool" : "tools"}
          </span>
        </div>
      </div>
    </div>
  );
};
