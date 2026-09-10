export interface KeyValueItem {
  key: string;
  value: string;
  enabled: boolean;
}

export interface RequestState {
  method: string;
  url: string;
  headers: KeyValueItem[];
  queryParams: KeyValueItem[];
  body: string;
}

export function generateCurl(req: RequestState): string {
  let fullUrl = req.url.trim() || "https://api.example.com/data";
  const activeParams = req.queryParams.filter((p) => p.enabled && p.key.trim());
  if (activeParams.length > 0) {
    const search = new URLSearchParams();
    activeParams.forEach((p) => search.append(p.key.trim(), p.value));
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + search.toString();
  }

  const parts: string[] = [`curl -X ${req.method} "${fullUrl}"`];

  const activeHeaders = req.headers.filter((h) => h.enabled && h.key.trim());
  activeHeaders.forEach((h) => {
    parts.push(`  -H "${h.key.trim()}: ${h.value}"`);
  });

  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    req.body.trim()
  ) {
    const escaped = req.body.replace(/"/g, '\\"').replace(/\n/g, "");
    parts.push(`  -d "${escaped}"`);
  }

  return parts.join(" \\\n");
}

export function generateFetch(req: RequestState): string {
  let fullUrl = req.url.trim() || "https://api.example.com/data";
  const activeParams = req.queryParams.filter((p) => p.enabled && p.key.trim());
  if (activeParams.length > 0) {
    const search = new URLSearchParams();
    activeParams.forEach((p) => search.append(p.key.trim(), p.value));
    fullUrl += (fullUrl.includes("?") ? "&" : "?") + search.toString();
  }

  const headersObj: Record<string, string> = {};
  req.headers
    .filter((h) => h.enabled && h.key.trim())
    .forEach((h) => {
      headersObj[h.key.trim()] = h.value;
    });

  const options: any = {
    method: req.method,
  };

  if (Object.keys(headersObj).length > 0) {
    options.headers = headersObj;
  }

  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    req.body.trim()
  ) {
    options.body = req.body;
  }

  return `fetch("${fullUrl}", ${JSON.stringify(options, null, 2)})\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));`;
}

export function generatePython(req: RequestState): string {
  let fullUrl = req.url.trim() || "https://api.example.com/data";
  const activeHeaders = req.headers.filter((h) => h.enabled && h.key.trim());

  let py = `import requests\n\nurl = "${fullUrl}"\n`;

  if (req.queryParams.filter((p) => p.enabled && p.key.trim()).length > 0) {
    const paramsObj: Record<string, string> = {};
    req.queryParams
      .filter((p) => p.enabled && p.key.trim())
      .forEach((p) => {
        paramsObj[p.key.trim()] = p.value;
      });
    py += `params = ${JSON.stringify(paramsObj, null, 2)}\n`;
  }

  if (activeHeaders.length > 0) {
    const headersObj: Record<string, string> = {};
    activeHeaders.forEach((h) => {
      headersObj[h.key.trim()] = h.value;
    });
    py += `headers = ${JSON.stringify(headersObj, null, 2)}\n`;
  }

  const methodLower = req.method.toLowerCase();
  const args = ["url"];
  if (req.queryParams.filter((p) => p.enabled && p.key.trim()).length > 0)
    args.push("params=params");
  if (activeHeaders.length > 0) args.push("headers=headers");
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    req.body.trim()
  ) {
    try {
      JSON.parse(req.body);
      py += `data = ${req.body}\n`;
      args.push("json=data");
    } catch {
      py += `data = """${req.body}"""\n`;
      args.push("data=data");
    }
  }

  py += `response = requests.${methodLower}(${args.join(", ")})\nprint(response.json())`;
  return py;
}
