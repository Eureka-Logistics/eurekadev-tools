import { describe, it, expect } from "vitest";
import { generateMetaHtml, MetaTagConfig } from "./utils";

describe("Meta Tag Generator utils", () => {
  const config: MetaTagConfig = {
    title: "Test Title & More",
    description: "A test description",
    url: "https://eurekagroup.id",
    imageUrl: "https://eurekagroup.id/og.jpg",
    author: "Eureka",
    twitterHandle: "@eureka",
    themeColor: "#123456",
    type: "website",
    robots: "index, follow",
  };

  it("generates primary, og, and twitter meta tags", () => {
    const html = generateMetaHtml(config);
    expect(html).toContain("<title>Test Title &amp; More</title>");
    expect(html).toContain(
      '<meta property="og:title" content="Test Title &amp; More">',
    );
    expect(html).toContain(
      '<meta property="twitter:card" content="summary_large_image">',
    );
    expect(html).toContain('<meta name="theme-color" content="#123456">');
    expect(html).toContain(
      '<link rel="canonical" href="https://eurekagroup.id">',
    );
  });
});
