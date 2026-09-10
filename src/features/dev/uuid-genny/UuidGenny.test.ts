import { describe, it, expect } from "vitest";
import {
  generateUuidV4,
  generateUuidV7,
  generateNanoId,
  generateIds,
} from "./utils";

describe("UUID Generator utils", () => {
  it("generates valid UUID v4 format", () => {
    const id = generateUuidV4();
    const v4Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(v4Regex);
  });

  it("generates valid UUID v7 format with version 7 marker", () => {
    const id = generateUuidV7();
    const v7Regex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(id).toMatch(v7Regex);
  });

  it("generates NanoIDs with correct default length of 21", () => {
    const id = generateNanoId();
    expect(id).toHaveLength(21);
    expect(/^[A-Za-z0-9_-]+$/.test(id)).toBe(true);
  });

  it("generates bulk items with options", () => {
    const list = generateIds("v4", 10, { uppercase: true, hyphens: false });
    expect(list).toHaveLength(10);
    expect(list[0]).toHaveLength(32); // 36 without hyphens = 32
    expect(list[0]).toBe(list[0].toUpperCase());
  });
});
