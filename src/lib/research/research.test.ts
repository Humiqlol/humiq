import { test } from "node:test";
import assert from "node:assert/strict";
import { keccak256, concat } from "viem";
import { synthesize, sentences, words } from "./extract";
import { buildBrief, parseBrief, briefRecord } from "./brief";
import { briefHash, canonicalJson, canonicalRecord, evidenceRoot, jsonHash, sha256Text } from "./hash";
import type { Evidence, Question } from "./types";

const q: Question = { id: "q1", title: "Is the river bridge open to trucks?", scope: "Public notices and road reports from the last month", limits: "No names of drivers", createdAt: 0 };
const ev = (id: string, note: string, sha: string, over: Partial<Evidence> = {}): Evidence => ({
  id, questionId: "q1", kind: "note", title: `Item ${id}`, url: "", note, text: "", fileName: "", fileSize: 0, mime: "", sourceType: "secondary",
  sourceDate: "2026-10-01", sha256: sha, addedAt: 0, consent: { lawful: true, consented: true, noPersonal: true }, ...over,
});
const H = (n: number) => `0x${n.toString(16).padStart(64, "0")}`;

test("sha256 of text matches the known vector", async () => {
  assert.equal(await sha256Text("abc"), "0xba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});

test("evidence root sorts, drops repeats and ignores malformed hashes", () => {
  const a = H(2), b = H(1);
  assert.equal(evidenceRoot([a, b, a, "nope"]), keccak256(concat([b, a] as `0x${string}`[])));
  assert.equal(evidenceRoot([a, b]), evidenceRoot([b, a]));
  assert.equal(evidenceRoot([]), `0x${"0".repeat(64)}`);
});

test("canonical JSON is key-order independent", () => {
  assert.equal(canonicalJson({ b: 1, a: [2, { d: 1, c: 2 }] }), canonicalJson({ a: [2, { c: 2, d: 1 }], b: 1 }));
  assert.equal(jsonHash({ x: 1, y: 2 }), jsonHash({ y: 2, x: 1 }));
});

test("canonical record changes when any recorded field changes", () => {
  const base = { kind: "url" as const, title: "Notice", url: "https://example.org/a", note: "n", sourceType: "primary" as const, sourceDate: "2026-10-01" };
  assert.notEqual(canonicalRecord(base), canonicalRecord({ ...base, note: "m" }));
  assert.equal(canonicalRecord(base), canonicalRecord({ ...base, title: " Notice " }));
});

test("sentences and words drop noise", () => {
  assert.deepEqual(sentences("Short. The bridge reopened to light vehicles on Monday morning. Trucks over 10 tonnes still wait."), [
    "The bridge reopened to light vehicles on Monday morning.",
    "Trucks over 10 tonnes still wait.",
  ]);
  assert.ok(!words("the and of bridge").includes("the"));
});

test("extractive assistant only quotes evidence and links every claim", () => {
  const items = [
    ev("a", "The river bridge reopened to light vehicles on 12 October. Trucks above 10 tonnes remain barred until repairs finish.", H(1)),
    ev("b", "A road report says trucks above 12 tonnes are barred from the river bridge. The ferry still runs twice a day.", H(2)),
    ev("c", "", H(3), { kind: "file", fileName: "photo.webp" }),
  ];
  const out = synthesize(q, items);
  assert.equal(out.mode, "extractive");
  assert.deepEqual(out.notRead, ["c"]);
  assert.ok(out.themes.length > 0);
  const all = items.map((e) => e.note).join(" ");
  for (const t of out.themes)
    for (const c of t.claims) {
      assert.equal(c.evidenceIds.length, 1);
      assert.ok(["a", "b"].includes(c.evidenceIds[0]));
      assert.ok(all.includes(c.text.slice(1, -1)), "claim is a verbatim quote");
    }
  // Same input, same output.
  assert.deepEqual(synthesize(q, items), out);
});

test("extractive assistant flags differing figures across items", () => {
  const items = [ev("a", "Trucks above 10 tonnes remain barred from the bridge.", H(1)), ev("b", "Trucks above 12 tonnes remain barred from the bridge.", H(2))];
  const t = synthesize(q, items).themes.find((x) => x.claims.length === 2);
  assert.ok(t && /Figures differ/.test(t.note));
});

test("no evidence text means no themes, never invented ones", () => {
  assert.deepEqual(synthesize(q, []).themes, []);
});

test("brief export round-trips and its hash is stable", () => {
  const items = [ev("a", "x", H(5), { title: "Notice A" }), ev("b", "y", H(4), { kind: "url", url: "https://example.org/r", title: "Report B" }), ev("z", "unused", H(9))];
  const claims = [
    { id: "c1", questionId: "q1", text: "The bridge is closed to heavy trucks.", evidenceIds: ["b", "a"], origin: "manual" as const, theme: "" },
    { id: "c2", questionId: "q1", text: "Light vehicles pass.", evidenceIds: ["a"], origin: "manual" as const, theme: "" },
  ];
  const input = { question: q, evidence: items, claims, checks: { c1: { verdict: "supported" as const, sourcesOpened: true, quoteMatches: true, datesChecked: true, noPersonalData: true, note: "" } }, author: "Desk 4", briefId: "abcd", date: "2026-10-27" };
  const b = buildBrief(input);
  assert.equal(b.used.length, 2, "uncited evidence is left out");
  assert.equal(b.root, evidenceRoot([H(4), H(5)]));
  const parsed = parseBrief(b.markdown);
  assert.equal(parsed.title, q.title);
  assert.equal(parsed.briefId, "abcd");
  assert.equal(parsed.findings.length, 2);
  assert.deepEqual(parsed.findings[0].refs, ["E1", "E2"]);
  assert.equal(parsed.findings[0].text, "The bridge is closed to heavy trucks.");
  assert.deepEqual(parsed.evidence.map((e) => e.sha256), [H(4), H(5)]);
  assert.equal(parsed.root, b.root);
  assert.equal(buildBrief(input).markdown, b.markdown);
  const rec = briefRecord(input, "r1", 1);
  assert.equal(rec.briefHash, briefHash(b.markdown));
  assert.equal(rec.evidenceCount, 2);
  assert.equal(rec.claimCount, 2);
  assert.match(b.markdown, /Human review: Supported/);
  assert.match(b.markdown, /Human review: Not reviewed/);
});
