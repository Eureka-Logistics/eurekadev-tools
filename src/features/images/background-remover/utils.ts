export interface BgRemovalOptions {
  tolerance: number; // 0 - 100
  feather: number; // 0 - 10
  sampleX?: number; // optional click coordinate
  sampleY?: number;
}

export function removeBackground(
  imgData: ImageData,
  options: BgRemovalOptions,
): ImageData {
  const { width, height, data } = imgData;
  const toleranceSq = (options.tolerance * 2.55) ** 2;

  // Determine target background color to remove
  // If user clicked a coordinate, sample that pixel; otherwise sample the 4 corners
  let targetR = 255;
  let targetG = 255;
  let targetB = 255;

  if (options.sampleX !== undefined && options.sampleY !== undefined) {
    const x = Math.max(0, Math.min(width - 1, Math.floor(options.sampleX)));
    const y = Math.max(0, Math.min(height - 1, Math.floor(options.sampleY)));
    const idx = (y * width + x) * 4;
    targetR = data[idx];
    targetG = data[idx + 1];
    targetB = data[idx + 2];
  } else {
    // Average 4 corners
    const corners = [
      0, // top-left
      (width - 1) * 4, // top-right
      (height - 1) * width * 4, // bottom-left
      ((height - 1) * width + (width - 1)) * 4, // bottom-right
    ];
    let sumR = 0,
      sumG = 0,
      sumB = 0;
    for (const c of corners) {
      sumR += data[c];
      sumG += data[c + 1];
      sumB += data[c + 2];
    }
    targetR = Math.round(sumR / 4);
    targetG = Math.round(sumG / 4);
    targetB = Math.round(sumB / 4);
  }

  // Create output buffer
  const output = new ImageData(new Uint8ClampedArray(data), width, height);
  const outData = output.data;

  // Flood fill / distance mask
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const dr = r - targetR;
    const dg = g - targetG;
    const db = b - targetB;
    const distSq = dr * dr + dg * dg + db * db;

    if (distSq <= toleranceSq) {
      // Smooth falloff based on feather
      if (options.feather > 0 && toleranceSq > 0) {
        const ratio = distSq / toleranceSq;
        outData[i + 3] = Math.round(ratio * a);
      } else {
        outData[i + 3] = 0; // completely transparent
      }
    }
  }

  return output;
}
