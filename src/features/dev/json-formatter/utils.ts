export interface JsonErrorInfo {
  message: string;
  line: number;
  column: number;
  position: number;
}

export interface JsonTreeNode {
  key: string | null;
  path: string;
  kind: "object" | "array" | "string" | "number" | "boolean" | "null";
  value: any;
  entryCount: number;
  children: JsonTreeNode[] | null;
}

export function parseJsonWithError(
  source: string,
): { ok: true; value: any } | { ok: false; error: JsonErrorInfo } {
  try {
    const value = JSON.parse(source);
    return { ok: true, value };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: extractJsonErrorDetails(source, message) };
  }
}

function getLineAndCol(
  text: string,
  pos: number,
): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(pos, text.length));
  const slice = text.slice(0, clamped);
  const lines = (slice.match(/\n/g) || []).length + 1;
  const col = clamped - (slice.lastIndexOf("\n") + 1) + 1;
  return { line: lines, column: col };
}

function extractJsonErrorDetails(text: string, message: string): JsonErrorInfo {
  const posMatch = /position\s+(\d+)/i.exec(message);
  const lineColMatch =
    /\(line\s+(\d+)\s+column\s+(\d+)\)/i.exec(message) ||
    /at line\s+(\d+)\s+column\s+(\d+)/i.exec(message);

  if (lineColMatch) {
    const line = Number(lineColMatch[1]);
    const column = Number(lineColMatch[2]);
    let pos = 0;
    let currLine = 1;
    for (let i = 0; i < text.length; i++) {
      if (currLine === line) {
        pos = i + column - 1;
        break;
      }
      if (text[i] === "\n") currLine++;
    }
    return { message, line, column, position: Math.min(pos, text.length) };
  }

  if (posMatch) {
    const pos = Number(posMatch[1]);
    const { line, column } = getLineAndCol(text, pos);
    return { message, line, column, position: pos };
  }

  return { message, line: 1, column: 1, position: 0 };
}

export function buildJsonTree(
  val: any,
  key: string | null = null,
  path = "root",
): JsonTreeNode {
  if (val === null) {
    return {
      key,
      path,
      kind: "null",
      value: null,
      entryCount: 0,
      children: null,
    };
  }
  if (Array.isArray(val)) {
    const children = val.map((item, idx) =>
      buildJsonTree(item, String(idx), `${path}.${idx}`),
    );
    return {
      key,
      path,
      kind: "array",
      value: null,
      entryCount: children.length,
      children,
    };
  }
  if (typeof val === "object") {
    const entries = Object.entries(val);
    const children = entries.map(([k, v]) =>
      buildJsonTree(v, k, `${path}.${k}`),
    );
    return {
      key,
      path,
      kind: "object",
      value: null,
      entryCount: children.length,
      children,
    };
  }
  return {
    key,
    path,
    kind: typeof val as any,
    value: val,
    entryCount: 0,
    children: null,
  };
}

export function formatJsonString(
  val: any,
  indent: "2" | "4" | "tab" | "minify",
): string {
  if (indent === "minify") {
    return JSON.stringify(val);
  }
  const space = indent === "tab" ? "\t" : Number(indent);
  return JSON.stringify(val, null, space);
}
