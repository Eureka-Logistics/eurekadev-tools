/**
 * Pure TypeScript GIF89a Encoder for client-side animated GIF generation.
 * Zero external dependencies.
 */

export interface GifFrame {
  imageData: ImageData;
  delayMs: number;
}

export function encodeGif(frames: GifFrame[], width: number, height: number): Blob {
  const bytes: number[] = [];

  function writeByte(b: number) {
    bytes.push(b & 0xff);
  }

  function writeShort(s: number) {
    bytes.push(s & 0xff, (s >> 8) & 0xff);
  }

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      writeByte(str.charCodeAt(i));
    }
  }

  // 1. Header
  writeString("GIF89a");

  // 2. Logical Screen Descriptor
  writeShort(width);
  writeShort(height);
  // GCT Flag = 0, Color Res = 7, Sort = 0, GCT Size = 0
  writeByte(0x70);
  writeByte(0); // Background Color Index
  writeByte(0); // Pixel Aspect Ratio

  // 3. Netscape 2.0 Loop Extension
  writeByte(0x21); // Extension Introducer
  writeByte(0xff); // Application Extension
  writeByte(11); // Block Size
  writeString("NETSCAPE2.0");
  writeByte(3); // Sub-block Size
  writeByte(1); // Loop Sub-block ID
  writeShort(0); // Loop count (0 = infinite)
  writeByte(0); // Block Terminator

  // 4. Encode each frame
  for (const frame of frames) {
    const { data } = frame.imageData;
    const delayHundredths = Math.round(frame.delayMs / 10);

    // Build standard 64-color / 128-color palette (quantization: 3:3:2 bit RGB = 256 colors)
    // 3 bits Red (0-7), 3 bits Green (0-7), 2 bits Blue (0-3)
    const colorTable: number[] = [];
    for (let r = 0; r < 8; r++) {
      for (let g = 0; g < 8; g++) {
        for (let b = 0; b < 4; b++) {
          colorTable.push(
            Math.round((r / 7) * 255),
            Math.round((g / 7) * 255),
            Math.round((b / 3) * 255)
          );
        }
      }
    }

    // Graphic Control Extension
    writeByte(0x21); // Extension Introducer
    writeByte(0xf9); // Graphic Control Label
    writeByte(4); // Block Size
    writeByte(0x04); // Disposal method 1, user input 0, transparent color 0
    writeShort(delayHundredths); // Frame delay in 1/100ths of a sec
    writeByte(0); // Transparent color index (not used)
    writeByte(0); // Block Terminator

    // Image Descriptor
    writeByte(0x2c); // Image Separator
    writeShort(0); // Left
    writeShort(0); // Top
    writeShort(width);
    writeShort(height);
    writeByte(0x87); // Local Color Table Present, 256 colors (2^(7+1))

    // Write Local Color Table (256 * 3 bytes)
    for (let i = 0; i < colorTable.length; i++) {
      writeByte(colorTable[i]);
    }

    // Quantize pixels to color table indices
    const pixelCount = width * height;
    const indexedPixels = new Uint8Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      const offset = i * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];

      const rIdx = Math.min(7, Math.floor((r / 256) * 8));
      const gIdx = Math.min(7, Math.floor((g / 256) * 8));
      const bIdx = Math.min(3, Math.floor((b / 256) * 4));

      indexedPixels[i] = (rIdx << 5) | (gIdx << 2) | bIdx;
    }

    // LZW Compression
    compressLZW(indexedPixels, 8, writeByte);
  }

  // 5. Trailer
  writeByte(0x3b);

  return new Blob([new Uint8Array(bytes)], { type: "image/gif" });
}

function compressLZW(
  pixels: Uint8Array,
  colorDepth: number,
  writeByte: (b: number) => void
) {
  const initCodeSize = Math.max(2, colorDepth);
  writeByte(initCodeSize);

  const clearCode = 1 << initCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = initCodeSize + 1;
  let nextCode = eoiCode + 1;

  const dictionary = new Map<string, number>();

  function resetDict() {
    dictionary.clear();
    for (let i = 0; i < clearCode; i++) {
      dictionary.set(String.fromCharCode(i), i);
    }
    codeSize = initCodeSize + 1;
    nextCode = eoiCode + 1;
  }

  resetDict();

  let curAccum = 0;
  let curBits = 0;
  const packet: number[] = [];

  function flushPacket() {
    if (packet.length > 0) {
      writeByte(packet.length);
      for (const p of packet) writeByte(p);
      packet.length = 0;
    }
  }

  function outputCode(code: number) {
    curAccum |= code << curBits;
    curBits += codeSize;
    while (curBits >= 8) {
      packet.push(curAccum & 0xff);
      if (packet.length === 254) flushPacket();
      curAccum >>= 8;
      curBits -= 8;
    }
  }

  outputCode(clearCode);

  let curStr = String.fromCharCode(pixels[0]);
  for (let i = 1; i < pixels.length; i++) {
    const c = String.fromCharCode(pixels[i]);
    const nextStr = curStr + c;
    if (dictionary.has(nextStr)) {
      curStr = nextStr;
    } else {
      outputCode(dictionary.get(curStr)!);
      if (nextCode < 4096) {
        dictionary.set(nextStr, nextCode++);
        if (nextCode === 1 << codeSize && codeSize < 12) {
          codeSize++;
        }
      } else {
        outputCode(clearCode);
        resetDict();
      }
      curStr = c;
    }
  }

  outputCode(dictionary.get(curStr)!);
  outputCode(eoiCode);

  if (curBits > 0) {
    packet.push(curAccum & 0xff);
  }
  flushPacket();
  writeByte(0); // End of image data
}
