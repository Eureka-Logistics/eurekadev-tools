import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Sun, Moon, Menu, Wrench } from 'lucide-react';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onToggleMobileNav }) => {
  const { isDark, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-muted-foreground"
            onClick={onToggleMobileNav}
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <Wrench className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                Eureka Dev Tools
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-primary/10 text-primary border border-primary/20">
                  v1.0
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground -mt-0.5 hidden sm:inline">
                Offline-First Developer Utilities
              </span>
            </div>
          </Link>
        </div>

        {/* Center/Right: Quick Search Trigger */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-3 h-9 w-48 sm:w-72 rounded-md border border-input bg-muted/40 px-3 text-xs text-muted-foreground hover:bg-muted/80 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="flex-1 text-left truncate">Search 96 tools...</span>
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              /
            </kbd>
          </button>

          {/* Dark Mode Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
};

