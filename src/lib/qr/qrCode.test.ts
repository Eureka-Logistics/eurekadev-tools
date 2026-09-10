import { describe, it, expect } from "vitest";
import { generateQrMatrix } from "./qrCode";

describe("generateQrMatrix", () => {
  it("generates a valid QR boolean matrix with correct dimensions", () => {
    const matrix = generateQrMatrix("https://eureka.tools");
    expect(matrix).toBeDefined();
    expect(matrix.length).toBeGreaterThanOrEqual(21);
    expect(matrix[0].length).toBe(matrix.length);

    // Top-left finder pattern check
    expect(matrix[0][0]).toBe(true);
    expect(matrix[0][6]).toBe(true);
    expect(matrix[6][0]).toBe(true);
    expect(matrix[6][6]).toBe(true);
  });
});
