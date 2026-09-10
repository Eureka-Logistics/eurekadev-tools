# Architecture Documentation — Eureka Dev Tools

## 1. Overview

**Eureka Dev Tools** is an internal developer utility web application designed as a privacy-preserving, high-speed, client-side Single Page Application (SPA).

Built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **shadcn/ui**, it serves as Eureka Group's proprietary client-side developer utilities platform.

---

## 2. Core Architectural Principles

1. **Client-Side First**:
   - Every calculation, format, transformation, and decode is executed locally inside the browser.
   - Zero telemetry, zero external API tracking, zero risk of data leakage for tokens, passwords, or sensitive payloads.
2. **Modular Feature Directory**:
   - Each utility is an isolated feature folder containing its UI component, pure logic helpers, and unit tests.
   - Heavy dependencies (such as PDF generators or canvas transforms) are dynamic imported to ensure the initial homepage payload remains negligible (<150KB gzipped).
3. **Centralized Tool Registry**:
   - A single data registry (`src/data/tools.ts`) acts as the single source of truth for all tools.
   - It supplies routing, category listings, fuzzy search index, favorites, and recent history.
4. **Resilient Offline Capabilities**:
   - Local state (user favorites, recent tool history, dark mode preference) is managed via `localStorage`.

---

## 3. Directory Layout

```text
tools/
├── docs/                           # Architecture, inventory, testing, and deployment specs
├── public/                         # Static assets and CNAME for custom domain
│   └── CNAME                       # tools.eurekagroup.id
├── src/
│   ├── app/
│   │   ├── App.tsx                 # Root application component
│   │   ├── router/                 # React Router definitions & lazy loading
│   │   └── providers/              # Theme, Favorites, and Recent Tools contexts
│   ├── components/
│   │   ├── layout/                 # MainLayout, Sidebar, Header, MobileNav
│   │   ├── navigation/             # Category navigation & Breadcrumbs
│   │   ├── search/                 # SearchDialog (Command palette) with / shortcut
│   │   ├── tool/                   # ToolShell, ToolHeader, ActionButtons, ResultPane
│   │   └── ui/                     # shadcn/ui primitives (Button, Input, Dialog, etc.)
│   ├── data/
│   │   ├── tools.ts                # Central registry of all 96 tools
│   │   └── categories.ts           # Categories configuration
│   ├── features/                   # Modular feature implementations
│   │   ├── dev/                    # Batch 1: Core dev tools
│   │   ├── colour/                 # Batch 2: Colour utilities
│   │   ├── images/                 # Batch 3: Image & Asset utilities
│   │   ├── typography/             # Batch 4: Typography & text utilities
│   │   ├── pdf/                    # Batch 5: PDF & print utilities
│   │   ├── audio-video/            # Batch 6: Audio & video utilities
│   │   └── calculators-nerd/       # Batch 7: Calculators, nerd tools & experiments
│   ├── lib/
│   │   ├── utils.ts                # Tailwind class merge (cn), formatting, helpers
│   │   ├── storage.ts              # LocalStorage wrappers
│   │   └── download.ts             # File download trigger utility
│   └── types/
│       └── tool.ts                 # TypeScript types for tools, categories, and tags
```

---

## 4. Central Registry Specification

```typescript
export interface ToolDefinition {
  id: string; // Unique slug (e.g. 'json-formatter')
  name: string; // Human-readable title
  description: string; // Short explanatory summary
  category: string; // Primary category display name
  categoryId: string; // Category identifier
  icon: string; // Lucide icon name
  tags: string[]; // Searchable keywords
  accepts?: string[]; // Accepted MIME types or file extensions
  produces?: string[]; // Generated MIME types
  component: React.LazyExoticComponent<React.ComponentType>;
}
```

---

## 5. Performance Strategy

- **Code Splitting**: Dynamic imports `React.lazy(() => import('./features/...'))` ensure tools are only fetched over the wire when navigated to.
- **Web Workers**: Heavy CPU processes (e.g. large file hashes, heavy compression, complex math) can be offloaded to Web Workers without locking the main rendering thread.
- **Canvas & Audio Recycling**: Reusable canvas buffers and singleton AudioContext instances avoid memory churn.
