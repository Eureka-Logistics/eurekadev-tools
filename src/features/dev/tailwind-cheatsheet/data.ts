export interface TailwindClassItem {
  className: string;
  css: string;
  category:
    | "layout"
    | "flex-grid"
    | "spacing"
    | "sizing"
    | "typography"
    | "backgrounds"
    | "borders"
    | "effects";
}

export const TAILWIND_CLASSES: TailwindClassItem[] = [
  // Layout
  { className: "block", css: "display: block;", category: "layout" },
  {
    className: "inline-block",
    css: "display: inline-block;",
    category: "layout",
  },
  { className: "inline", css: "display: inline;", category: "layout" },
  { className: "flex", css: "display: flex;", category: "layout" },
  {
    className: "inline-flex",
    css: "display: inline-flex;",
    category: "layout",
  },
  { className: "grid", css: "display: grid;", category: "layout" },
  { className: "hidden", css: "display: none;", category: "layout" },
  { className: "relative", css: "position: relative;", category: "layout" },
  { className: "absolute", css: "position: absolute;", category: "layout" },
  { className: "fixed", css: "position: fixed;", category: "layout" },
  { className: "sticky", css: "position: sticky;", category: "layout" },
  {
    className: "overflow-hidden",
    css: "overflow: hidden;",
    category: "layout",
  },
  { className: "overflow-auto", css: "overflow: auto;", category: "layout" },
  { className: "z-10", css: "z-index: 10;", category: "layout" },
  { className: "z-50", css: "z-index: 50;", category: "layout" },

  // Flex & Grid
  { className: "flex-row", css: "flex-direction: row;", category: "flex-grid" },
  {
    className: "flex-col",
    css: "flex-direction: column;",
    category: "flex-grid",
  },
  { className: "flex-wrap", css: "flex-wrap: wrap;", category: "flex-grid" },
  {
    className: "items-center",
    css: "align-items: center;",
    category: "flex-grid",
  },
  {
    className: "items-start",
    css: "align-items: flex-start;",
    category: "flex-grid",
  },
  {
    className: "items-end",
    css: "align-items: flex-end;",
    category: "flex-grid",
  },
  {
    className: "justify-between",
    css: "justify-content: space-between;",
    category: "flex-grid",
  },
  {
    className: "justify-center",
    css: "justify-content: center;",
    category: "flex-grid",
  },
  {
    className: "justify-start",
    css: "justify-content: flex-start;",
    category: "flex-grid",
  },
  {
    className: "justify-end",
    css: "justify-content: flex-end;",
    category: "flex-grid",
  },
  { className: "gap-2", css: "gap: 0.5rem; /* 8px */", category: "flex-grid" },
  { className: "gap-4", css: "gap: 1rem; /* 16px */", category: "flex-grid" },
  {
    className: "grid-cols-2",
    css: "grid-template-columns: repeat(2, minmax(0, 1fr));",
    category: "flex-grid",
  },
  {
    className: "grid-cols-3",
    css: "grid-template-columns: repeat(3, minmax(0, 1fr));",
    category: "flex-grid",
  },
  {
    className: "grid-cols-4",
    css: "grid-template-columns: repeat(4, minmax(0, 1fr));",
    category: "flex-grid",
  },

  // Spacing
  { className: "p-2", css: "padding: 0.5rem; /* 8px */", category: "spacing" },
  { className: "p-4", css: "padding: 1rem; /* 16px */", category: "spacing" },
  { className: "p-6", css: "padding: 1.5rem; /* 24px */", category: "spacing" },
  {
    className: "px-4",
    css: "padding-left: 1rem; padding-right: 1rem;",
    category: "spacing",
  },
  {
    className: "py-2",
    css: "padding-top: 0.5rem; padding-bottom: 0.5rem;",
    category: "spacing",
  },
  { className: "m-2", css: "margin: 0.5rem; /* 8px */", category: "spacing" },
  { className: "m-4", css: "margin: 1rem; /* 16px */", category: "spacing" },
  {
    className: "mx-auto",
    css: "margin-left: auto; margin-right: auto;",
    category: "spacing",
  },
  {
    className: "space-y-4",
    css: "& > :not([hidden]) ~ :not([hidden]) { margin-top: 1rem; }",
    category: "spacing",
  },

  // Sizing
  { className: "w-full", css: "width: 100%;", category: "sizing" },
  { className: "w-screen", css: "width: 100vw;", category: "sizing" },
  { className: "h-full", css: "height: 100%;", category: "sizing" },
  { className: "h-screen", css: "height: 100vh;", category: "sizing" },
  {
    className: "max-w-sm",
    css: "max-width: 24rem; /* 384px */",
    category: "sizing",
  },
  {
    className: "max-w-md",
    css: "max-width: 28rem; /* 448px */",
    category: "sizing",
  },
  {
    className: "max-w-xl",
    css: "max-width: 36rem; /* 576px */",
    category: "sizing",
  },
  {
    className: "max-w-7xl",
    css: "max-width: 80rem; /* 1280px */",
    category: "sizing",
  },

  // Typography
  {
    className: "text-xs",
    css: "font-size: 0.75rem; line-height: 1rem;",
    category: "typography",
  },
  {
    className: "text-sm",
    css: "font-size: 0.875rem; line-height: 1.25rem;",
    category: "typography",
  },
  {
    className: "text-base",
    css: "font-size: 1rem; line-height: 1.5rem;",
    category: "typography",
  },
  {
    className: "text-lg",
    css: "font-size: 1.125rem; line-height: 1.75rem;",
    category: "typography",
  },
  {
    className: "text-xl",
    css: "font-size: 1.25rem; line-height: 1.75rem;",
    category: "typography",
  },
  {
    className: "text-2xl",
    css: "font-size: 1.5rem; line-height: 2rem;",
    category: "typography",
  },
  {
    className: "text-3xl",
    css: "font-size: 1.875rem; line-height: 2.25rem;",
    category: "typography",
  },
  {
    className: "font-normal",
    css: "font-weight: 400;",
    category: "typography",
  },
  {
    className: "font-medium",
    css: "font-weight: 500;",
    category: "typography",
  },
  {
    className: "font-semibold",
    css: "font-weight: 600;",
    category: "typography",
  },
  { className: "font-bold", css: "font-weight: 700;", category: "typography" },
  {
    className: "truncate",
    css: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;",
    category: "typography",
  },

  // Backgrounds & Borders
  {
    className: "bg-primary",
    css: "background-color: var(--primary);",
    category: "backgrounds",
  },
  {
    className: "bg-secondary",
    css: "background-color: var(--secondary);",
    category: "backgrounds",
  },
  {
    className: "bg-muted",
    css: "background-color: var(--muted);",
    category: "backgrounds",
  },
  { className: "border", css: "border-width: 1px;", category: "borders" },
  {
    className: "border-b",
    css: "border-bottom-width: 1px;",
    category: "borders",
  },
  {
    className: "rounded-md",
    css: "border-radius: calc(var(--radius) - 2px);",
    category: "borders",
  },
  {
    className: "rounded-lg",
    css: "border-radius: var(--radius);",
    category: "borders",
  },
  {
    className: "rounded-xl",
    css: "border-radius: 0.75rem;",
    category: "borders",
  },
  {
    className: "rounded-full",
    css: "border-radius: 9999px;",
    category: "borders",
  },

  // Effects
  {
    className: "shadow-sm",
    css: "box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);",
    category: "effects",
  },
  {
    className: "shadow-md",
    css: "box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);",
    category: "effects",
  },
  {
    className: "shadow-lg",
    css: "box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);",
    category: "effects",
  },
  { className: "opacity-50", css: "opacity: 0.5;", category: "effects" },
  { className: "opacity-80", css: "opacity: 0.8;", category: "effects" },
  { className: "blur-sm", css: "filter: blur(4px);", category: "effects" },
  {
    className: "transition-colors",
    css: "transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms;",
    category: "effects",
  },
];
