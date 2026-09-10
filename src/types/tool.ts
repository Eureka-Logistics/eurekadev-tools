import React from "react";

export interface ToolDefinition {
  id: string; // URL slug e.g. 'json-formatter'
  name: string; // e.g. 'JSON Formatter'
  description: string; // short description
  category: string; // e.g. 'Dev Tools'
  categoryId: string; // e.g. 'dev-tools'
  icon: string; // Lucide icon name string
  tags: string[]; // search keywords
  href?: string; // optional custom route (default is /tools/:id)
  accepts?: string[]; // accepted mime types or file extensions
  produces?: string[]; // produced mime types
  external?: boolean; // is external link
  beta?: boolean;
  isNew?: boolean;
  component?: React.LazyExoticComponent<React.ComponentType<any>>;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
}
