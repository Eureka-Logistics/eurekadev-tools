# Development Guide — Eureka Dev Tools

## 1. Getting Started

### Prerequisites
* Node.js 18.x or higher
* npm 9.x or higher

### Installation

```bash
npm install
```

### Starting the Local Development Server

```bash
npm run dev
```

The application will be running at `http://localhost:5173`.

---

## 2. Available Scripts

* `npm run dev`: Launch local Vite dev server with Hot Module Replacement (HMR).
* `npm run build`: Perform TypeScript type-checking and build production bundle into `dist/`.
* `npm run preview`: Locally preview production build from `dist/`.
* `npm run test`: Run unit test suite using Vitest.
* `npm run test:watch`: Run Vitest in interactive watch mode.
* `npm run lint`: Check codebase syntax and code style with ESLint.

---

## 3. Adding a New Tool

To add a new tool to Eureka Dev Tools:

1. Create a feature directory under `src/features/<category>/<tool-slug>/`:
   ```text
   src/features/dev/my-tool/
   ├── MyTool.tsx         # Main interactive UI component
   ├── utils.ts           # Pure business logic and transformations
   └── MyTool.test.ts     # Vitest unit tests
   ```
2. Register the tool in `src/data/tools.ts`:
   ```typescript
   {
     id: 'my-tool',
     name: 'My Custom Tool',
     description: 'Performs useful transformations',
     category: 'Dev Tools',
     categoryId: 'dev-tools',
     icon: 'Wrench',
     tags: ['custom', 'transform'],
     component: React.lazy(() => import('@/features/dev/my-tool/MyTool'))
   }
   ```
3. Update `docs/tool-status.md` to track implementation progress.
4. Run `npm run test` and verify that all test suites pass.

