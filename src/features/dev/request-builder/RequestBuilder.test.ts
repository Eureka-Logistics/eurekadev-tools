import { describe, it, expect } from "vitest";
import {
  generateCurl,
  generateFetch,
  generatePython,
  RequestState,
} from "./utils";

describe("Request Builder utils", () => {
  const sampleReq: RequestState = {
    method: "POST",
    url: "https://api.eurekagroup.id/v1/items",
    headers: [
      { key: "Authorization", value: "Bearer token123", enabled: true },
      { key: "Disabled-Header", value: "ignore", enabled: false },
    ],
    queryParams: [{ key: "limit", value: "50", enabled: true }],
    body: '{"sku": "ABC-123"}',
  };

  it("generates proper cURL command with query params and headers", () => {
    const curl = generateCurl(sampleReq);
    expect(curl).toContain(
      'curl -X POST "https://api.eurekagroup.id/v1/items?limit=50"',
    );
    expect(curl).toContain('-H "Authorization: Bearer token123"');
    expect(curl).not.toContain("Disabled-Header");
    expect(curl).toContain('-d "{\\"sku\\": \\"ABC-123\\"}"');
  });

  it("generates fetch snippet", () => {
    const code = generateFetch(sampleReq);
    expect(code).toContain(
      'fetch("https://api.eurekagroup.id/v1/items?limit=50"',
    );
    expect(code).toContain('"method": "POST"');
    expect(code).toContain('"Authorization": "Bearer token123"');
  });

  it("generates Python requests code", () => {
    const py = generatePython(sampleReq);
    expect(py).toContain("import requests");
    expect(py).toContain("requests.post");
    expect(py).toContain('url = "https://api.eurekagroup.id/v1/items"');
  });
});
