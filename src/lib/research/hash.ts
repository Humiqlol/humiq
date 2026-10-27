import { keccak256, concat, stringToBytes } from "viem";
import type { Evidence } from "./types";

/* Fingerprints. Evidence uses SHA-256 (what any tool can recompute from a file); the brief and the evidence root use
   keccak-256, the hash the contract and every explorer speak. */

const hex = (buf: ArrayBuffer) => `0x${Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("")}`;

export async function sha256Bytes(bytes: ArrayBuffer | Uint8Array): Promise<string> {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const copy = new Uint8Array(view.byteLength);
  copy.set(view);
  return hex(await crypto.subtle.digest("SHA-256", copy.buffer));
}

export const sha256Text = (text: string) => sha256Bytes(new TextEncoder().encode(text));

/**
 * The canonical record of a link or a note: what the contributor wrote down, in a fixed order. Its SHA-256 proves the
 * record did not change; it is not a fingerprint of the web page itself (the browser cannot read other sites).
 */
export function canonicalRecord(e: Pick<Evidence, "kind" | "title" | "url" | "note" | "sourceType" | "sourceDate">) {
  return [`kind:${e.kind}`, `title:${e.title.trim()}`, `url:${e.url.trim()}`, `type:${e.sourceType}`, `date:${e.sourceDate.trim()}`, `note:${e.note.trim()}`].join("\n");
}

const isH = (h: string) => /^0x[0-9a-f]{64}$/.test(h);

/** keccak-256 over the sorted SHA-256 fingerprints (repeats removed, 32 bytes each, concatenated). */
export function evidenceRoot(hashes: string[]): `0x${string}` {
  const list = [...new Set(hashes.map((h) => h.toLowerCase()))].filter(isH).sort();
  if (list.length === 0) return `0x${"0".repeat(64)}`;
  return keccak256(concat(list as `0x${string}`[]));
}

/** keccak-256 of the exact text of a brief, as exported (UTF-8). */
export const briefHash = (markdown: string) => keccak256(stringToBytes(markdown));

/** keccak-256 of a canonical JSON value (keys sorted), used for review checklists. */
export function jsonHash(value: unknown): `0x${string}` {
  return keccak256(stringToBytes(canonicalJson(value)));
}

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    const o = value as Record<string, unknown>;
    return `{${Object.keys(o)
      .filter((k) => o[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonicalJson(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value ?? null);
}
