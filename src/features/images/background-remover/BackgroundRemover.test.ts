import { describe, it, expect } from "vitest";
import { removeBackground } from "./utils";

if (typeof ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data;
      this.width = width;
      this.height = height;
    }
  };
}

describe("Background Remover utils", () => {
  it("makes matching background pixels transparent", () => {
    // 2x2 image: 3 white pixels, 1 black pixel
    // [white, white]
    // [white, black]
    const data = new Uint8ClampedArray([
      255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 0, 0, 0, 255,
    ]);
    const imgData = new ImageData(data, 2, 2);

    const result = removeBackground(imgData, {
      tolerance: 20,
      feather: 0,
      sampleX: 0,
      sampleY: 0,
    });

    // White pixels (indices 0, 4, 8) should have alpha = 0
    expect(result.data[3]).toBe(0);
    expect(result.data[7]).toBe(0);
    expect(result.data[11]).toBe(0);

    // Black pixel (index 12) should remain fully opaque
    expect(result.data[15]).toBe(255);
    expect(result.data[12]).toBe(0);
  });

  it("respects tolerance threshold", () => {
    // Pixel with slight grey difference (240, 240, 240)
    const data = new Uint8ClampedArray([
      255, 255, 255, 255, 240, 240, 240, 255,
    ]);
    const imgData = new ImageData(data, 2, 1);

    // Low tolerance (1%) should NOT remove grey
    const strictRes = removeBackground(imgData, {
      tolerance: 1,
      feather: 0,
      sampleX: 0,
      sampleY: 0,
    });
    expect(strictRes.data[7]).toBe(255);

    // High tolerance (20%) should remove grey
    const relaxedRes = removeBackground(imgData, {
      tolerance: 20,
      feather: 0,
      sampleX: 0,
      sampleY: 0,
    });
    expect(relaxedRes.data[7]).toBe(0);
  });
});
