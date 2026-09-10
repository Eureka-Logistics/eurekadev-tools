export interface DecodedPart {
  raw: string;
  bytes: number;
  value: any;
  pretty: string;
  error: string | null;
}

export interface TimeClaim {
  key: string;
  label: string;
  timestamp: number;
  dateString: string;
  isPast: boolean;
}

export interface DecodedJwt {
  validSegments: boolean;
  segmentCount: number;
  header: DecodedPart;
  payload: DecodedPart;
  signature: {
    raw: string;
    bytes: number;
    error: string | null;
  };
  algorithm: string | null;
  tokenType: string | null;
  timeClaims: TimeClaim[];
  isExpired: boolean;
  status: "valid" | "expired" | "malformed" | "empty";
}

function base64UrlDecode(str: string): string | null {
  try {
    let clean = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = clean.length % 4;
    if (pad) {
      if (pad === 1) return null;
      clean += "=".repeat(4 - pad);
    }
    const decodedBinary = atob(clean);
    const bytes = new Uint8Array(decodedBinary.length);
    for (let i = 0; i < decodedBinary.length; i++) {
      bytes[i] = decodedBinary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function parsePart(rawPart: string): DecodedPart {
  const decoded = base64UrlDecode(rawPart);
  const bytes = rawPart.length;

  if (decoded === null) {
    return {
      raw: rawPart,
      bytes,
      value: null,
      pretty: "",
      error: "Invalid Base64Url encoding",
    };
  }

  try {
    const value = JSON.parse(decoded);
    return {
      raw: rawPart,
      bytes,
      value,
      pretty: JSON.stringify(value, null, 2),
      error: null,
    };
  } catch {
    return {
      raw: rawPart,
      bytes,
      value: null,
      pretty: decoded,
      error: "Payload is not valid JSON",
    };
  }
}

export function decodeJwt(token: string): DecodedJwt {
  const trimmed = token.trim();
  if (!trimmed) {
    return {
      validSegments: false,
      segmentCount: 0,
      header: { raw: "", bytes: 0, value: null, pretty: "", error: null },
      payload: { raw: "", bytes: 0, value: null, pretty: "", error: null },
      signature: { raw: "", bytes: 0, error: null },
      algorithm: null,
      tokenType: null,
      timeClaims: [],
      isExpired: false,
      status: "empty",
    };
  }

  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    return {
      validSegments: false,
      segmentCount: parts.length,
      header: {
        raw: "",
        bytes: 0,
        value: null,
        pretty: "",
        error: "Expected 3 segments separated by dots",
      },
      payload: { raw: "", bytes: 0, value: null, pretty: "", error: null },
      signature: { raw: "", bytes: 0, error: null },
      algorithm: null,
      tokenType: null,
      timeClaims: [],
      isExpired: false,
      status: "malformed",
    };
  }

  const [rawHeader, rawPayload, rawSig] = parts;
  const header = parsePart(rawHeader);
  const payload = parsePart(rawPayload);

  // Parse time claims
  const now = Date.now();
  const timeClaims: TimeClaim[] = [];
  let isExpired = false;

  if (payload.value && typeof payload.value === "object") {
    const claimSpecs = [
      { key: "iat", label: "Issued At (iat)" },
      { key: "nbf", label: "Not Before (nbf)" },
      { key: "exp", label: "Expires At (exp)" },
    ];

    for (const spec of claimSpecs) {
      const val = payload.value[spec.key];
      if (typeof val === "number") {
        const ms = val * 1000;
        const isPast = ms <= now;
        if (spec.key === "exp" && isPast) {
          isExpired = true;
        }
        timeClaims.push({
          key: spec.key,
          label: spec.label,
          timestamp: val,
          dateString: new Date(ms).toLocaleString(),
          isPast,
        });
      }
    }
  }

  return {
    validSegments: true,
    segmentCount: 3,
    header,
    payload,
    signature: {
      raw: rawSig,
      bytes: rawSig.length,
      error: null,
    },
    algorithm: header.value?.alg || null,
    tokenType: header.value?.typ || null,
    timeClaims,
    isExpired,
    status: isExpired ? "expired" : "valid",
  };
}
