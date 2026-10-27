import { test } from "node:test";
import assert from "node:assert/strict";
import { checkModelAnswer, type AssistItem } from "./assist";

const items: AssistItem[] = [
  { ref: "E1", id: "a", title: "Notice", sourceType: "primary", sourceDate: "2026-10-01", excerpt: "The bridge reopened to light vehicles on 12 October." },
  { ref: "E2", id: "b", title: "Report", sourceType: "secondary", sourceDate: "", excerpt: "Trucks above 10 tonnes remain barred." },
];

test("keeps claims whose quote is in a cited excerpt", () => {
  const raw = JSON.stringify({ themes: [{ title: "Access", summary: "s", claims: [{ text: "Light traffic is back.", quote: "reopened to  LIGHT vehicles", evidence: ["E1"] }] }] });
  const r = checkModelAnswer(`Here: ${raw}`, items, "m");
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.themes.length, 1);
    assert.deepEqual(r.themes[0].claims[0].evidenceIds, ["a"]);
    assert.equal(r.dropped, 0);
  }
});

test("drops invented quotes, unknown refs and quotes from uncited items", () => {
  const raw = JSON.stringify({
    themes: [
      { title: "A", claims: [{ text: "x", quote: "the bridge collapsed entirely", evidence: ["E1"] }] },
      { title: "B", claims: [{ text: "y", quote: "reopened to light vehicles", evidence: ["E9"] }] },
      { title: "C", claims: [{ text: "z", quote: "Trucks above 10 tonnes", evidence: ["E1"] }] },
    ],
  });
  const r = checkModelAnswer(raw, items, "m");
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.themes.length, 0);
    assert.equal(r.dropped, 3);
  }
});

test("garbage is an error, never a crash", () => {
  assert.equal(checkModelAnswer("no json here", items, "m").ok, false);
  assert.equal(checkModelAnswer("{bad json}", items, "m").ok, false);
  const r = checkModelAnswer('{"themes": 5}', items, "m");
  assert.ok(r.ok && r.themes.length === 0);
});
