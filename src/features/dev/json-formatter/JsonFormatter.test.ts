import { describe, it, expect } from "vitest";
import { parseJsonWithError, formatJsonString, buildJsonTree } from "./utils";

describe("JSON Formatter utils", () => {
  it("formats valid JSON with specified indents", () => {
    const input = { a: 1, b: "test", c: [1, 2] };
    const twoSpaces = formatJsonString(input, "2");
    expect(twoSpaces).toBe(JSON.stringify(input, null, 2));

    const fourSpaces = formatJsonString(input, "4");
    expect(fourSpaces).toBe(JSON.stringify(input, null, 4));

    const tabs = formatJsonString(input, "tab");
    expect(tabs).toBe(JSON.stringify(input, null, "\t"));

    const minified = formatJsonString(input, "minify");
    expect(minified).toBe(JSON.stringify(input));
  });

  it("detects and pinpoints invalid JSON errors", () => {
    const invalidJson = '{\n  "name": "Eureka",\n  "invalid": ,\n}';
    const res = parseJsonWithError(invalidJson);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.line).toBeGreaterThan(0);
      expect(res.error.column).toBeGreaterThan(0);
      expect(res.error.message).toBeDefined();
    }
  });

  it("builds JSON tree correctly for nested structures", () => {
    const data = {
      user: {
        id: 42,
        name: "Alice",
        roles: ["admin", "dev"],
      },
    };
    const tree = buildJsonTree(data);
    expect(tree.kind).toBe("object");
    expect(tree.children).toHaveLength(1);
    expect(tree.children![0].key).toBe("user");
    expect(tree.children![0].children).toHaveLength(3);
  });
});
