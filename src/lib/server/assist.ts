/*
 * Checks a model's answer against the evidence it was given. Pure, so it is tested without a model.
 * A claim survives only when it cites known evidence refs and its quote appears word for word (whitespace and case
 * folded) in one of the cited excerpts. Themes left without claims are dropped.
 */

export type AssistItem = { ref: string; id: string; title: string; sourceType: string; sourceDate: string; excerpt: string };
export type AssistClaim = { text: string; quote: string; evidenceIds: string[] };
export type AssistTheme = { title: string; summary: string; claims: AssistClaim[] };
export type AssistResult = { ok: true; model: string; themes: AssistTheme[]; dropped: number } | { ok: false; error: string };

const fold = (s: string) => s.toLowerCase().replace(/[“”"']/g, "").replace(/\s+/g, " ").trim();
const clip = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "");

export function checkModelAnswer(raw: string, items: AssistItem[], model: string): AssistResult {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return { ok: false, error: "The model did not answer in the expected format." };
  let data: unknown;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return { ok: false, error: "The model did not answer in the expected format." };
  }
  const byRef = new Map(items.map((i) => [i.ref, i]));
  const themesIn = Array.isArray((data as { themes?: unknown }).themes) ? ((data as { themes: unknown[] }).themes as unknown[]) : [];
  let dropped = 0;
  const themes: AssistTheme[] = [];
  for (const t of themesIn.slice(0, 4)) {
    if (!t || typeof t !== "object") continue;
    const o = t as { title?: unknown; summary?: unknown; claims?: unknown };
    const claims: AssistClaim[] = [];
    for (const c of Array.isArray(o.claims) ? o.claims.slice(0, 3) : []) {
      const cc = c as { text?: unknown; quote?: unknown; evidence?: unknown };
      const text = clip(cc.text, 400);
      const quote = clip(cc.quote, 300);
      const refs = Array.isArray(cc.evidence) ? [...new Set(cc.evidence.filter((r): r is string => typeof r === "string" && byRef.has(r)))] : [];
      const quoted = quote.length >= 8 && refs.some((r) => fold(byRef.get(r)!.excerpt).includes(fold(quote)));
      if (!text || refs.length === 0 || !quoted) {
        dropped++;
        continue;
      }
      claims.push({ text, quote, evidenceIds: refs.map((r) => byRef.get(r)!.id) });
    }
    if (claims.length === 0) continue;
    themes.push({ title: clip(o.title, 80) || "Theme", summary: clip(o.summary, 300), claims });
  }
  return { ok: true, model, themes, dropped };
}
