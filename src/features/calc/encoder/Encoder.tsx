import React, { useState, useEffect } from "react";
import { ToolDefinition } from "@/types/tool";
import { ToolShell } from "@/components/common/ToolShell";
import {
  Copy,
  Check,
  Hash,
} from "lucide-react";

interface EncoderProps {
  tool: ToolDefinition;
}

export const Encoder: React.FC<EncoderProps> = ({ tool }) => {
  const [input, setInput] = useState("Hello from Eureka Dev Tools!");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Hash states
  const [sha256, setSha256] = useState("");
  const [sha512, setSha512] = useState("");
  const [sha1, setSha1] = useState("");

  // Base64 UTF-8 safe
  const toBase64 = (str: string) => {
    try {
      const bytes = new TextEncoder().encode(str);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    } catch {
      return "Encoding error";
    }
  };

  const fromBase64 = (str: string) => {
    try {
      const binary = atob(str.trim());
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    } catch {
      return "Invalid Base64";
    }
  };

  // URL Encode / Decode
  const urlEncoded = encodeURIComponent(input);
  const urlDecoded = (() => {
    try {
      return decodeURIComponent(input);
    } catch {
      return "Invalid URI";
    }
  })();

  // HTML entities
  const htmlEncoded = input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // Web Crypto Hashes
  useEffect(() => {
    const calcHashes = async () => {
      const encoder = new TextEncoder();
      const data = encoder.encode(input);

      if (window.crypto && window.crypto.subtle) {
        try {
          // SHA-256
          const buf256 = await window.crypto.subtle.digest("SHA-256", data);
          setSha256(Array.from(new Uint8Array(buf256)).map((b) => b.toString(16).padStart(2, "0")).join(""));

          // SHA-512
          const buf512 = await window.crypto.subtle.digest("SHA-512", data);
          setSha512(Array.from(new Uint8Array(buf512)).map((b) => b.toString(16).padStart(2, "0")).join(""));

          // SHA-1
          const buf1 = await window.crypto.subtle.digest("SHA-1", data);
          setSha1(Array.from(new Uint8Array(buf1)).map((b) => b.toString(16).padStart(2, "0")).join(""));
        } catch (e) {
          console.error(e);
        }
      }
    };
    calcHashes();
  }, [input]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <ToolShell tool={tool}>
      <div className="space-y-6">
        {/* Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Input Text</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="Type or paste text..."
            className="w-full p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-mono text-zinc-100 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Encodings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Base64 */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Base64 Encoded</span>
              <button
                onClick={() => handleCopy(toBase64(input), "b64e")}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400"
              >
                {copiedKey === "b64e" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 font-mono text-xs text-emerald-400 break-all select-all">
              {toBase64(input)}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">Base64 Decoded</span>
              <button
                onClick={() => handleCopy(fromBase64(input), "b64d")}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400"
              >
                {copiedKey === "b64d" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 font-mono text-xs text-zinc-200 break-all select-all">
              {fromBase64(input)}
            </div>
          </div>

          {/* URL */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">URL Encoded</span>
              <button
                onClick={() => handleCopy(urlEncoded, "urle")}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400"
              >
                {copiedKey === "urle" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 font-mono text-xs text-emerald-400 break-all select-all">
              {urlEncoded}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">URL Decoded</span>
              <button
                onClick={() => handleCopy(urlDecoded, "urld")}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400"
              >
                {copiedKey === "urld" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 font-mono text-xs text-zinc-200 break-all select-all">
              {urlDecoded}
            </div>
          </div>

          {/* HTML Entities */}
          <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300">HTML Entities Encoded</span>
              <button
                onClick={() => handleCopy(htmlEncoded, "htmle")}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400"
              >
                {copiedKey === "htmle" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-850 font-mono text-xs text-zinc-200 break-all select-all">
              {htmlEncoded}
            </div>
          </div>
        </div>

        {/* Cryptographic Hashes */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <h4 className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Hash className="w-3.5 h-3.5 text-emerald-400" />
            Cryptographic Hashes
          </h4>

          <div className="space-y-2.5 text-xs">
            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>SHA-256</span>
                <button onClick={() => handleCopy(sha256, "sha256")} className="hover:text-zinc-200">
                  {copiedKey === "sha256" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950 font-mono text-emerald-400 break-all select-all border border-zinc-850">
                {sha256}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>SHA-512</span>
                <button onClick={() => handleCopy(sha512, "sha512")} className="hover:text-zinc-200">
                  {copiedKey === "sha512" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950 font-mono text-zinc-300 break-all select-all border border-zinc-850">
                {sha512}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-zinc-400 mb-1">
                <span>SHA-1</span>
                <button onClick={() => handleCopy(sha1, "sha1")} className="hover:text-zinc-200">
                  {copiedKey === "sha1" ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-950 font-mono text-zinc-300 break-all select-all border border-zinc-850">
                {sha1}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolShell>
  );
};

export default Encoder;
