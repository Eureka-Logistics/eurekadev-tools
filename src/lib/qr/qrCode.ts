/**
 * Lightweight, self-contained QR Code Generator in pure TypeScript.
 * Generates ISO/IEC 18004 compliant QR Code matrices.
 */

// GF(256) Math
const GF256_EXP: number[] = new Array(512);
const GF256_LOG: number[] = new Array(256);
let x = 1;
for (let i = 0; i < 255; i++) {
  GF256_EXP[i] = x;
  GF256_EXP[i + 255] = x;
  GF256_LOG[x] = i;
  x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
}

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF256_EXP[GF256_LOG[a] + GF256_LOG[b]];
}

function rsGenPoly(n: number): number[] {
  let poly = [1];
  for (let i = 0; i < n; i++) {
    const next = [1, GF256_EXP[i]];
    const res = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      for (let k = 0; k < next.length; k++) {
        res[j + k] ^= gfMul(poly[j], next[k]);
      }
    }
    poly = res;
  }
  return poly;
}

function rsEncode(data: number[], ecCount: number): number[] {
  const gen = rsGenPoly(ecCount);
  const remainder = new Array(ecCount).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.shift();
    remainder.push(0);
    for (let j = 0; j < ecCount; j++) {
      remainder[j] ^= gfMul(gen[j + 1], factor);
    }
  }
  return remainder;
}

// Version table for Byte mode (Low error correction)
// [totalCodewords, dataCodewords, ecCodewordsPerBlock]
const VERSION_TABLE = [
  null,
  { size: 21, total: 26, data: 19, ec: 7 },   // V1
  { size: 25, total: 44, data: 34, ec: 10 },  // V2
  { size: 29, total: 70, data: 55, ec: 15 },  // V3
  { size: 33, total: 100, data: 80, ec: 20 }, // V4
  { size: 37, total: 134, data: 108, ec: 26 },// V5
  { size: 41, total: 172, data: 136, ec: 18 * 2 }, // V6
];

export function generateQrMatrix(text: string): boolean[][] {
  const utf8Bytes = new TextEncoder().encode(text);
  const dataLen = utf8Bytes.length;

  // Pick smallest version
  let ver = 1;
  while (ver <= 6 && VERSION_TABLE[ver]!.data - 3 < dataLen) {
    ver++;
  }
  if (ver > 6) ver = 6; // cap for simple implementation

  const info = VERSION_TABLE[ver]!;
  const size = info.size;

  // Encode byte mode
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  // Mode indicator 0100 (Byte)
  pushBits(0b0100, 4);
  // Character count indicator (8 bits for V1-9)
  pushBits(Math.min(dataLen, info.data - 3), 8);
  // Data bytes
  for (let i = 0; i < Math.min(dataLen, info.data - 3); i++) {
    pushBits(utf8Bytes[i], 8);
  }

  // Terminator
  const maxDataBits = info.data * 8;
  const termLen = Math.min(4, maxDataBits - bits.length);
  pushBits(0, termLen);

  // Pad to byte boundary
  while (bits.length % 8 !== 0) bits.push(0);

  // Pad bytes 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxDataBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to byte array
  const dataCodewords: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0;
    for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
    dataCodewords.push(b);
  }

  // Error correction
  const ecCodewords = rsEncode(dataCodewords, info.total - info.data);
  const allCodewords = dataCodewords.concat(ecCodewords);

  // Build matrix
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () =>
    new Array(size).fill(null)
  );

  function setSquare(r: number, c: number, val: boolean) {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
    }
  }

  // 1. Finder patterns (7x7) at 3 corners
  function drawFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const isBlack =
          (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
          (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        setSquare(row + r, col + c, isBlack);
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (matrix[6][i] === null) matrix[6][i] = i % 2 === 0;
    if (matrix[i][6] === null) matrix[i][6] = i % 2 === 0;
  }

  // 3. Alignment patterns for V2+
  if (ver >= 2) {
    const alignPos = size - 7;
    for (let r = -2; r <= 2; r++) {
      for (let c = -2; c <= 2; c++) {
        const isB = Math.max(Math.abs(r), Math.abs(c)) !== 1;
        setSquare(alignPos + r, alignPos + c, isB);
      }
    }
  }

  // Dark module
  matrix[size - 8][8] = true;

  // Reserve format information
  for (let i = 0; i < 9; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }
  for (let i = size - 8; i < size; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
  }

  // 4. Place data bits (right to left, zig-zag)
  let allBits: number[] = [];
  for (const b of allCodewords) {
    for (let i = 7; i >= 0; i--) allBits.push((b >> i) & 1);
  }

  let bitIdx = 0;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // skip timing column
    const rows = upwards
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i);

    for (const r of rows) {
      for (const c of [right, right - 1]) {
        if (matrix[r][c] === null) {
          const bitVal = bitIdx < allBits.length ? allBits[bitIdx++] === 1 : false;
          // Apply mask pattern 0: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = mask ? !bitVal : bitVal;
        }
      }
    }
    upwards = !upwards;
  }

  // Format info for L error correction + mask 0 (0b111011111000100)
  const formatBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];
  let fIdx = 0;
  for (let c = 0; c <= 8; c++) {
    if (c !== 6) matrix[8][c] = formatBits[fIdx++] === 1;
  }
  for (let r = 7; r >= 0; r--) {
    if (r !== 6) matrix[r][8] = formatBits[fIdx++] === 1;
  }

  return matrix.map((row) => row.map((cell) => cell ?? false));
}
