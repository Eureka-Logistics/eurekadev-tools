export type UuidType = "v4" | "v7" | "nanoid";

// Generate UUID v4
export function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generate UUID v7 (timestamp-ordered)
export function generateUuidV7(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  // 48-bit unix timestamp in milliseconds
  const timestamp = Date.now();
  bytes[0] = (timestamp / 0x10000000000) & 0xff;
  bytes[1] = (timestamp / 0x100000000) & 0xff;
  bytes[2] = (timestamp / 0x1000000) & 0xff;
  bytes[3] = (timestamp / 0x10000) & 0xff;
  bytes[4] = (timestamp / 0x100) & 0xff;
  bytes[5] = timestamp & 0xff;

  // Version 7: 0111 in bits 48-51
  bytes[6] = 0x70 | (bytes[6] & 0x0f);
  // Variant 1: 10 in bits 64-65
  bytes[8] = 0x80 | (bytes[8] & 0x3f);

  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

// Generate NanoID (21 chars URL-safe)
export function generateNanoId(size = 21): string {
  const alphabet =
    "useandom-26T1983_4057viewportqzksxRickLhFlOpMydGEAUBCDHJKNQSTVWXZ";
  const bytes = new Uint8Array(size);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < size; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let id = "";
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] & 63];
  }
  return id;
}

export function generateIds(
  type: UuidType,
  count: number,
  options: { uppercase?: boolean; hyphens?: boolean; braces?: boolean } = {},
): string[] {
  const clampedCount = Math.max(1, Math.min(count, 1000));
  const results: string[] = [];

  for (let i = 0; i < clampedCount; i++) {
    let id = "";
    if (type === "v4") id = generateUuidV4();
    else if (type === "v7") id = generateUuidV7();
    else id = generateNanoId();

    if (type !== "nanoid") {
      if (options.hyphens === false) {
        id = id.replace(/-/g, "");
      }
      if (options.uppercase) {
        id = id.toUpperCase();
      }
      if (options.braces) {
        id = `{${id}}`;
      }
    }
    results.push(id);
  }

  return results;
}
