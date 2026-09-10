import React from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { CATEGORIES } from "@/data/categories";
import { ALL_TOOLS } from "@/data/tools";
import { ToolCard } from "@/pages/HomePage";
import { DynamicIcon } from "@/components/ui/icon";

export const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();

  const category = CATEGORIES.find((c) => c.id === categoryId);
  const tools = ALL_TOOLS.filter((t) => t.categoryId === categoryId);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold">Category Not Found</h1>
        <p className="text-muted-foreground">
          The requested category does not exist.
        </p>
        <Link to="/" className="text-primary hover:underline text-sm">
          Return to All Tools
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start space-x-4 pb-6 border-b border-border">
        <div className="p-3.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
          <DynamicIcon name={category.icon} className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {category.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {category.description}
          </p>
          <p className="text-xs text-muted-foreground/80 mt-2 font-mono">
            {tools.length} utilities in this category
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};
