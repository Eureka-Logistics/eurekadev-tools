import { describe, it, expect } from "vitest";
import { HTTP_STATUS_CODES } from "./data";

describe("HTTP Status data", () => {
  it("contains fundamental status codes: 200, 404, 500", () => {
    const codes = new Set(HTTP_STATUS_CODES.map((c) => c.code));
    expect(codes.has(200)).toBe(true);
    expect(codes.has(404)).toBe(true);
    expect(codes.has(500)).toBe(true);
  });

  it("correctly categorizes status codes into 1xx-5xx classes", () => {
    for (const item of HTTP_STATUS_CODES) {
      const firstDigit = String(item.code)[0];
      expect(item.category).toBe(`${firstDigit}xx`);
      expect(item.rfc).toBeDefined();
      expect(item.phrase).toBeDefined();
    }
  });
});
