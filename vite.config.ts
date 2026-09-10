import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure base URL works on GitHub Pages or custom domain
  base: "./",
  // @ts-ignore
  test: {
    environment: "jsdom",
    globals: true,
  },
});
