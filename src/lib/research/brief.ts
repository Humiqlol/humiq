import type { BriefRecord, Claim, ClaimCheck, Evidence, Question } from "./types";
import { SOURCE_TYPES, VERDICTS } from "./types";
import { briefHash, evidenceRoot } from "./hash";

/*
 * Intelligence brief export. The Markdown is the artifact: its keccak-256 is what gets anchored, so the text is
 * built deterministically from the workspace (no clock inside except the dates the author recorded) plus a random
 * brief id that keeps a short brief from being guessed from its fingerprint.
 */

export type BriefInput = {
  question: Question;
  evidence: Evidence[];
  claims: Claim[];
  checks: Record<string, ClaimCheck>;
  author: string;
  briefId: string;
  date: string;
};

const esc = (s: string) => s.replace(/\r/g, "").trim();
const label = (e: Evidence, i: number) => `E${i + 1}`;

export function buildBrief(input: BriefInput): { markdown: string; root: `0x${string}`; used: Evidence[] } {
  const { question, claims, checks } = input;
  // Only evidence the claims cite goes into the references; numbering follows first citation.
  const order: Evidence[] = [];
  for (const c of claims) for (const id of c.evidenceIds) {
    const e = input.evidence.find((x) => x.id === id);
    if (e && !order.includes(e)) order.push(e);
  }
  const tag = new Map(order.map((e, i) => [e.id, label(e, i)]));
  const root = evidenceRoot(order.map((e) => e.sha256));
  const lines: string[] = [];
  lines.push(`# ${esc(question.title)}`, "");
  lines.push(`Brief id: ${input.briefId}`);
  lines.push(`Date: ${input.date}`);
  if (input.author.trim()) lines.push(`Prepared by: ${esc(input.author)}`);
  lines.push("", "## Scope", "", esc(question.scope) || "—");
  if (question.limits.trim()) lines.push("", "Out of scope: " + esc(question.limits));
  lines.push("", "## Findings", "");
  claims.forEach((c, i) => {
    const ck = checks[c.id];
    const v = ck?.verdict ? VERDICTS.find((x) => x.id === ck.verdict)?.label : "Not reviewed";
    const refs = c.evidenceIds.map((id) => tag.get(id)).filter(Boolean).map((t) => `[${t}]`).join(" ");
    lines.push(`${i + 1}. ${esc(c.text)} ${refs}`.trimEnd());
    lines.push(`   - Human review: ${v}${ck?.note.trim() ? ` (${esc(ck.note)})` : ""}`);
  });
  if (claims.length === 0) lines.push("No findings yet.");
  lines.push("", "## Evidence", "");
  order.forEach((e) => {
    const type = SOURCE_TYPES.find((t) => t.id === e.sourceType)?.label ?? e.sourceType;
    const where = e.kind === "url" ? e.url : e.kind === "file" ? `file ${e.fileName}` : "note";
    lines.push(`- [${tag.get(e.id)}] ${esc(e.title)} · ${type} · ${e.sourceDate || "date unknown"} · ${where}`);
    lines.push(`  - SHA-256 ${e.sha256}`);
  });
  lines.push("", "## Method", "");
  lines.push("Evidence was fingerprinted in the browser (SHA-256). Findings were drafted from the attached evidence only and checked by a person.");
  lines.push("Contributors confirmed that every item was obtained lawfully, with consent where people are involved, and that no personal data is published.");
  lines.push("", `Evidence root (keccak-256 of the sorted fingerprints): ${root}`, "");
  return { markdown: lines.join("\n"), root, used: order };
}

export function briefRecord(input: BriefInput, id: string, now: number): BriefRecord {
  const { markdown, root, used } = buildBrief(input);
  return { id, questionId: input.question.id, markdown, briefHash: briefHash(markdown), evidenceRoot: root, evidenceCount: used.length, claimCount: input.claims.length, createdAt: now, anchor: null };
}

/** Reads a brief exported by this site back into findings and evidence fingerprints (for reviewers). */
export function parseBrief(markdown: string): { title: string; briefId: string; findings: { n: number; text: string; refs: string[] }[]; evidence: { tag: string; sha256: string }[]; root: string | null } {
  const lines = markdown.replace(/\r/g, "").split("\n");
  const title = (lines.find((l) => l.startsWith("# ")) ?? "").slice(2).trim();
  const briefId = (lines.find((l) => l.startsWith("Brief id: ")) ?? "").slice(10).trim();
  const findings: { n: number; text: string; refs: string[] }[] = [];
  const evidence: { tag: string; sha256: string }[] = [];
  let section = "";
  let lastTag = "";
  for (const l of lines) {
    if (l.startsWith("## ")) section = l.slice(3).trim();
    else if (section === "Findings") {
      const m = l.match(/^(\d+)\. (.*)$/);
      if (m) {
        const refs = [...m[2].matchAll(/\[(E\d+)\]/g)].map((x) => x[1]);
        findings.push({ n: Number(m[1]), text: m[2].replace(/\s*(\[E\d+\]\s*)+$/, "").trim(), refs });
      }
    } else if (section === "Evidence") {
      const t = l.match(/^- \[(E\d+)\]/);
      if (t) lastTag = t[1];
      const h = l.match(/SHA-256 (0x[0-9a-f]{64})/);
      if (h && lastTag) evidence.push({ tag: lastTag, sha256: h[1] });
    }
  }
  const r = markdown.match(/Evidence root \(keccak-256 of the sorted fingerprints\): (0x[0-9a-f]{64})/);
  return { title, briefId, findings, evidence, root: r ? r[1] : null };
}
