export function downloadText(
  content: string,
  filename: string,
  mimeType = "text/plain;charset=utf-8",
) {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

export function downloadBlob(blob: Blob, filename: string, _mimeType?: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.setAttribute("aria-hidden", "true");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.setAttribute("aria-hidden", "true");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
