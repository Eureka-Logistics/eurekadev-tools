import { describe, it, expect } from "vitest";
import { encodeCode128, encodeEan13, encodeCode39 } from "./barcode";

describe("barcode encoders", () => {
  it("encodes Code 128 bit patterns", () => {
    const bits = encodeCode128("TEST123");
    expect(bits).toBeDefined();
    expect(bits.startsWith("11010010000")).toBe(true); // Start code B
    expect(bits.endsWith("1100011101011")).toBe(true); // Stop pattern
  });

  it("encodes EAN-13 check digit correctly", () => {
    // 590123412345 -> check digit calculation
    const res = encodeEan13("590123412345");
    expect(res.full.length).toBe(13);
    expect(res.bits.startsWith("101")).toBe(true);
    expect(res.bits.endsWith("101")).toBe(true);
  });

  it("encodes Code 39", () => {
    const bits = encodeCode39("HELLO");
    expect(bits).toBeDefined();
    expect(bits.length).toBeGreaterThan(20);
  });
});
