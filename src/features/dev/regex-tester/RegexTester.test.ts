import { describe, it, expect } from "vitest";
import { executeRegex } from "./utils";

describe("Regex Tester utils", () => {
  it("finds global matches with capture groups", () => {
    const text = "foo123 bar456 baz789";
    const result = executeRegex("([a-z]+)(\\d+)", "g", text);

    expect(result.valid).toBe(true);
    expect(result.matches).toHaveLength(3);
    expect(result.matches[0].match).toBe("foo123");
    expect(result.matches[0].groups).toEqual(["foo", "123"]);
  });

  it("performs string replacement using groups", () => {
    const text = "Hello world";
    const result = executeRegex("(\\w+)", "g", text, "[$1]");
    expect(result.replacedText).toBe("[Hello] [world]");
  });

  it("handles invalid regex syntax cleanly", () => {
    const result = executeRegex("[a-z", "g", "test");
    expect(result.valid).toBe(false);
    expect(result.error).toBeDefined();
  });
});
