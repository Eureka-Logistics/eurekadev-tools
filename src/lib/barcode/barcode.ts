/**
 * Pure TypeScript Barcode Encoders for Code 128, EAN-13, Code 39.
 */

// Code 128-B Patterns
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
  "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
  "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
];

export function encodeCode128(text: string): string {
  // Start with Code 128B (index 104)
  const indices: number[] = [104];
  let checkSum = 104;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) - 32;
    const idx = Math.max(0, Math.min(105, code));
    indices.push(idx);
    checkSum += idx * (i + 1);
  }

  const checkChar = checkSum % 103;
  indices.push(checkChar);
  indices.push(106); // Stop code

  let patternStr = "";
  for (const idx of indices) {
    const p = CODE128_PATTERNS[idx] || "212222";
    let isBar = true;
    for (let j = 0; j < p.length; j++) {
      const count = parseInt(p[j], 10);
      patternStr += (isBar ? "1" : "0").repeat(count);
      isBar = !isBar;
    }
  }
  return patternStr;
}

// Code 39 Patterns
const CODE39_MAP: Record<string, string> = {
  "0": "101001101101", "1": "110100101011", "2": "101100101011", "3": "110110010101",
  "4": "101001101011", "5": "110100110101", "6": "101100110101", "7": "101001011011",
  "8": "110100101101", "9": "101100101101", "A": "110101001011", "B": "101101001011",
  "C": "110110100101", "D": "101011001011", "E": "110101100101", "F": "101101100101",
  "G": "101010011011", "H": "110101001101", "I": "101101001101", "J": "101011001101",
  "K": "110101010011", "L": "101101010011", "M": "110110101001", "N": "101011010011",
  "O": "110101101001", "P": "101101101001", "Q": "101010110011", "R": "110101011001",
  "S": "101101011001", "T": "101011011001", "U": "110010101011", "V": "100110101011",
  "W": "110011010101", "X": "100101101011", "Y": "110010110101", "Z": "100110110101",
  "-": "100101011011", ".": "110010101101", " ": "100110101101", "*": "100101101101",
};

export function encodeCode39(text: string): string {
  const upper = `*${text.toUpperCase().replace(/[^0-9A-Z-. ]/g, "")}*`;
  let result = "";
  for (const c of upper) {
    result += CODE39_MAP[c] || CODE39_MAP[" "];
    result += "0"; // intercharacter gap
  }
  return result;
}

// EAN-13 Encoded bits
const L_CODE = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"];
const G_CODE = ["0100111", "0110011", "0011011", "0100001", "0011101", "0111001", "0000101", "0010001", "0001001", "0010111"];
const R_CODE = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
const PARITY_MAP = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG", "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL"
];

export function encodeEan13(digitsStr: string): { bits: string; checkDigit: string; full: string } {
  let digits = digitsStr.replace(/\D/g, "").slice(0, 12);
  while (digits.length < 12) digits += "0";

  // Check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(digits[i], 10);
    sum += i % 2 === 0 ? d : d * 3;
  }
  const checkDigit = ((10 - (sum % 10)) % 10).toString();
  const full13 = digits + checkDigit;

  const first = parseInt(full13[0], 10);
  const parity = PARITY_MAP[first];

  let bits = "101"; // Lead guard
  for (let i = 1; i <= 6; i++) {
    const d = parseInt(full13[i], 10);
    bits += parity[i - 1] === "L" ? L_CODE[d] : G_CODE[d];
  }
  bits += "01010"; // Center guard
  for (let i = 7; i <= 12; i++) {
    const d = parseInt(full13[i], 10);
    bits += R_CODE[d];
  }
  bits += "101"; // Trail guard

  return { bits, checkDigit, full: full13 };
}
