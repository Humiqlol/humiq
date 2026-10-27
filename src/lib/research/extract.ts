import type { Evidence, Question } from "./types";

/*
 * The assistant without a model: extractive and deterministic. It never writes a sentence of its own. It finds the
 * sentences in the attached evidence that share the most terms with the question, groups them by shared key terms,
 * and proposes each matching sentence as a quoted draft claim linked to the evidence it came from. Same input,
 * same output. Evidence with no readable text (a binary file without a note) is listed as "not read".
 */

export type DraftClaim = { text: string; evidenceIds: string[] };
export type Theme = { title: string; note: string; claims: DraftClaim[] };
export type Synthesis = { mode: "extractive" | "model"; themes: Theme[]; notRead: string[]; model?: string };

const STOP = new Set(
  "the and for are but not you all any can had her was one our out has his how its may new now old see two way who did get him let put say she too use that with have this will your from they know want been good much some time very when come here just like long make many more only over such take than them well were what which while about after again also back being both could does each even ever every first into most other should their there these those through under until where would because before between during within without across along among around upon whether shall might must cannot onto than then thus yet per via".split(" "),
);

export function words(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'-]*/gu) ?? []).map((w) => w.replace(/'s$/, "")).filter((w) => w.length >= 3 && !STOP.has(w) && !/^\d+$/.test(w));
}

export function sentences(text: string): string[] {
  return text
    .replace(/\r/g, "")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])|\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter((s) => s.length >= 25 && s.length <= 420);
}

type Row = { evidenceId: string; text: string; terms: Set<string>; score: number };

const evidenceText = (e: Evidence) => [e.note, e.text].filter(Boolean).join("\n");

const numbersIn = (s: string) => (s.match(/\d[\d,.]*\d|\d/g) ?? []).map((n) => n.replace(/,/g, ""));

export function synthesize(question: Pick<Question, "title" | "scope">, evidence: Evidence[], opts: { maxThemes?: number; perTheme?: number } = {}): Synthesis {
  const maxThemes = opts.maxThemes ?? 4;
  const perTheme = opts.perTheme ?? 3;
  const qTerms = new Set(words(`${question.title} ${question.scope}`));
  const notRead: string[] = [];
  const rows: Row[] = [];
  for (const e of evidence) {
    const text = evidenceText(e);
    const list = sentences(text);
    if (list.length === 0) {
      notRead.push(e.id);
      continue;
    }
    for (const s of list) rows.push({ evidenceId: e.id, text: s, terms: new Set(words(s)), score: 0 });
  }
  if (rows.length === 0) return { mode: "extractive", themes: [], notRead };

  // Document frequency per term, counted per evidence item, so one long file cannot dominate.
  const df = new Map<string, Set<string>>();
  for (const r of rows) for (const t of r.terms) (df.get(t) ?? df.set(t, new Set()).get(t)!).add(r.evidenceId);
  const docs = new Set(rows.map((r) => r.evidenceId)).size;
  const idf = (t: string) => Math.log(1 + docs / (df.get(t)?.size ?? 1));
  for (const r of rows) {
    let s = 0;
    for (const t of r.terms) s += (qTerms.has(t) ? 3 : 0.4) * idf(t);
    r.score = s / Math.sqrt(r.terms.size + 1);
  }

  // Candidate theme terms: question terms first, then terms shared by several items, then frequent ones.
  const weight = (t: string) => (qTerms.has(t) ? 100 : 0) + (df.get(t)?.size ?? 0) * 10 + rows.filter((r) => r.terms.has(t)).length;
  const candidates = [...df.keys()].filter((t) => t.length >= 4).sort((a, b) => weight(b) - weight(a) || a.localeCompare(b));

  const used = new Set<Row>();
  const themes: Theme[] = [];
  for (const term of candidates) {
    if (themes.length >= maxThemes) break;
    const picks = rows
      .filter((r) => r.terms.has(term) && !used.has(r))
      .sort((a, b) => b.score - a.score || a.text.localeCompare(b.text))
      .slice(0, perTheme);
    if (picks.length === 0) continue;
    picks.forEach((p) => used.add(p));
    const sources = new Set(picks.map((p) => p.evidenceId));
    const figures = new Map<string, Set<string>>();
    for (const p of picks) figures.set(p.evidenceId, new Set(numbersIn(p.text)));
    const allFigures = new Set([...figures.values()].flatMap((s) => [...s]));
    const differ = sources.size > 1 && allFigures.size > 1 && [...figures.values()].every((s) => s.size > 0);
    const note = [
      `${picks.length} matching sentence${picks.length === 1 ? "" : "s"} from ${sources.size} evidence item${sources.size === 1 ? "" : "s"}.`,
      sources.size > 1 ? "More than one item speaks to this; compare them before accepting a claim." : "Only one item speaks to this; a reviewer may ask for a second source.",
      differ ? `Figures differ between items (${[...allFigures].slice(0, 4).join(" / ")}); check which is current.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    themes.push({ title: term, note, claims: picks.map((p) => ({ text: `“${p.text}”`, evidenceIds: [p.evidenceId] })) });
  }
  return { mode: "extractive", themes, notRead };
}
