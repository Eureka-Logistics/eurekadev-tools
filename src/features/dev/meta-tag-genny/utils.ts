export interface MetaTagConfig {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  author: string;
  twitterHandle: string;
  themeColor: string;
  type: string;
  robots: string;
}

export function generateMetaHtml(cfg: MetaTagConfig): string {
  const lines: string[] = [
    "<!-- Primary Meta Tags -->",
    `<title>${escapeHtml(cfg.title || "My Page Title")}</title>`,
    `<meta name="title" content="${escapeHtml(cfg.title || "My Page Title")}">`,
    `<meta name="description" content="${escapeHtml(cfg.description || "Page description...")}">`,
  ];

  if (cfg.author) {
    lines.push(`<meta name="author" content="${escapeHtml(cfg.author)}">`);
  }
  if (cfg.themeColor) {
    lines.push(
      `<meta name="theme-color" content="${escapeHtml(cfg.themeColor)}">`,
    );
  }
  if (cfg.robots) {
    lines.push(`<meta name="robots" content="${escapeHtml(cfg.robots)}">`);
  }
  if (cfg.url) {
    lines.push(`<link rel="canonical" href="${escapeHtml(cfg.url)}">`);
  }

  lines.push("");
  lines.push("<!-- Open Graph / Facebook -->");
  lines.push(
    `<meta property="og:type" content="${escapeHtml(cfg.type || "website")}">`,
  );
  if (cfg.url)
    lines.push(`<meta property="og:url" content="${escapeHtml(cfg.url)}">`);
  lines.push(
    `<meta property="og:title" content="${escapeHtml(cfg.title || "My Page Title")}">`,
  );
  lines.push(
    `<meta property="og:description" content="${escapeHtml(cfg.description || "Page description...")}">`,
  );
  if (cfg.imageUrl)
    lines.push(
      `<meta property="og:image" content="${escapeHtml(cfg.imageUrl)}">`,
    );

  lines.push("");
  lines.push("<!-- Twitter -->");
  lines.push('<meta property="twitter:card" content="summary_large_image">');
  if (cfg.url)
    lines.push(
      `<meta property="twitter:url" content="${escapeHtml(cfg.url)}">`,
    );
  lines.push(
    `<meta property="twitter:title" content="${escapeHtml(cfg.title || "My Page Title")}">`,
  );
  lines.push(
    `<meta property="twitter:description" content="${escapeHtml(cfg.description || "Page description...")}">`,
  );
  if (cfg.imageUrl)
    lines.push(
      `<meta property="twitter:image" content="${escapeHtml(cfg.imageUrl)}">`,
    );
  if (cfg.twitterHandle) {
    const handle = cfg.twitterHandle.startsWith("@")
      ? cfg.twitterHandle
      : `@${cfg.twitterHandle}`;
    lines.push(
      `<meta property="twitter:creator" content="${escapeHtml(handle)}">`,
    );
  }

  return lines.join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
