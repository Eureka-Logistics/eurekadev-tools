import { describe, it, expect } from "vitest";
import { decodeJwt } from "./utils";

describe("JWT Decoder utils", () => {
  const sample =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.4zILcZ0v-wVvI8K5d7MqvD4RkU1yBwT1o9B_Xm3Vf0Y";

  it("decodes standard 3-part JWT header and payload", () => {
    const decoded = decodeJwt(sample);
    expect(decoded.validSegments).toBe(true);
    expect(decoded.segmentCount).toBe(3);
    expect(decoded.header.value).toEqual({ alg: "HS256", typ: "JWT" });
    expect(decoded.payload.value.name).toBe("John Doe");
    expect(decoded.payload.value.sub).toBe("1234567890");
    expect(decoded.algorithm).toBe("HS256");
  });

  it("detects expired tokens based on exp claim", () => {
    // exp in year 2000 (946684800)
    const expiredPayload = btoa(JSON.stringify({ exp: 946684800 })).replace(
      /=/g,
      "",
    );
    const header = btoa(JSON.stringify({ alg: "HS256" })).replace(/=/g, "");
    const expiredToken = `${header}.${expiredPayload}.signature`;

    const decoded = decodeJwt(expiredToken);
    expect(decoded.isExpired).toBe(true);
    expect(decoded.status).toBe("expired");
  });

  it("handles empty and malformed tokens without throwing", () => {
    expect(decodeJwt("").status).toBe("empty");
    expect(decodeJwt("not.a.valid.jwt.token").status).toBe("malformed");
    expect(decodeJwt("single-part").validSegments).toBe(false);
  });
});
