import { describe, it, expect } from "vitest";
import { TAILWIND_CLASSES } from "./data";

describe("Tailwind Cheat Sheet data", () => {
  it("contains essential layout, flex, and spacing utilities", () => {
    const classNames = new Set(TAILWIND_CLASSES.map((c) => c.className));
    expect(classNames.has("flex")).toBe(true);
    expect(classNames.has("grid")).toBe(true);
    expect(classNames.has("p-4")).toBe(true);
    expect(classNames.has("items-center")).toBe(true);
  });

  it("each item has valid className, css, and category", () => {
    for (const item of TAILWIND_CLASSES) {
      expect(item.className.length).toBeGreaterThan(0);
      expect(item.css.length).toBeGreaterThan(0);
      expect(item.category).toBeDefined();
    }
  });
});
