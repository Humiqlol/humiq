"use client";

import { useEffect, useState } from "react";
import { synthesize, type Theme } from "@/lib/research/extract";
import { ASSIST_LIMITS } from "@/config/ai";
import { LIMITS, type Claim } from "@/lib/research/types";
import { PlusIcon, SparkIcon } from "@/components/site/Icons";
import type { Research } from "../store";
import type { ViewId } from "../Workspace";
import { Empty, QuestionBar, ViewHead } from "../ui";

type Run = { mode: "extractive" | "model"; model?: string; themes: Theme[]; notRead: string[]; dropped?: number; note?: string };

export function Assistant({ r, go }: { r: Research; go: (v: ViewId) => void }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [useModel, setUseModel] = useState(true);
  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [kept, setKept] = useState<Set<string>>(new Set());
  useEffect(() => {
    fetch("/api/assist", { cache: "no-store" })
      .then((x) => x.json())
      .then((v: { configured?: boolean }) => setConfigured(Boolean(v.configured)))
      .catch(() => setConfigured(false));
  }, []);

  const ev = r.qEvidence;
  const label = (id: string) => {
    const i = ev.findIndex((e) => e.id === id);
    return i < 0 ? "?" : `E${i + 1}`;
  };

  async function start() {
    if (!r.active) return;
    setErr("");
    setKept(new Set());
    if (configured && useModel) {
      setBusy(true);
      try {
        const items = ev
          .map((e) => ({ id: e.id, title: e.title, sourceType: e.sourceType, sourceDate: e.sourceDate, excerpt: [e.note, e.text].filter(Boolean).join("\n").slice(0, ASSIST_LIMITS.excerptChars) }))
          .filter((x) => x.excerpt.trim().length >= 20)
          .slice(0, ASSIST_LIMITS.items);
        const res = await fetch("/api/assist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: `${r.active.title}\nScope: ${r.active.scope}`, items }) });
        const body = (await res.json()) as { configured?: boolean; error?: string; model?: string; dropped?: number; themes?: { title: string; summary: string; claims: { text: string; quote: string; evidenceIds: string[] }[] }[] };
        if (body.error || !body.themes) throw new Error(body.error ?? "No answer.");
        setRun({
          mode: "model",
          model: body.model,
          dropped: body.dropped,
          notRead: [],
          themes: body.themes.map((t) => ({ title: t.title, note: t.summary, claims: t.claims.map((c) => ({ text: `${c.text} (“${c.quote}”)`, evidenceIds: c.evidenceIds })) })),
        });
      } catch (e) {
        const local = synthesize(r.active, ev);
        setRun({ ...local, note: `The model run failed (${(e as Error).message}); showing the extractive method instead.` });
      } finally {
        setBusy(false);
      }
    } else setRun(synthesize(r.active, ev));
  }

  function keep(theme: string, c: { text: string; evidenceIds: string[] }, key: string) {
    if (!r.active || kept.has(key)) return;
    if (r.qClaims.length >= LIMITS.claimsPerQuestion) return setErr(`Up to ${LIMITS.claimsPerQuestion} findings per question.`);
    r.addClaims([{ questionId: r.active.id, text: c.text, evidenceIds: c.evidenceIds, origin: run?.mode === "model" ? "assistant" : "extractive", theme }]);
    setKept((s) => new Set(s).add(key));
  }

  return (
    <div>
      <ViewHead kicker="Research assistant" title="Group, quote, compare" lead="The assistant reads only the evidence attached to this question. It groups sentences into themes and proposes findings that quote them, each linked to its source. You decide what to keep." />
      <QuestionBar r={r} />
      {r.active ? (
        <div className="hq-card mb-6 flex flex-wrap items-center justify-between gap-4" data-testid="assistant-panel">
          <div className="min-w-0">
            <p className="text-[13px] font-medium">
              {configured === null ? "Checking the assistant…" : configured ? "A model is configured on this site" : "Extractive mode (no model configured on this site)"}
            </p>
            <p className="mt-1 text-[12px] leading-[20px] text-muted">
              {configured
                ? "With the model, only the excerpts of this question's evidence are sent for one run; every returned finding must quote its source word for word or it is dropped."
                : "Deterministic: it never writes a sentence of its own. It quotes the best-matching sentences from your evidence and flags figures that differ between items."}
            </p>
            {configured ? (
              <label className="hq-check mt-2">
                <input type="checkbox" checked={useModel} onChange={(e) => setUseModel(e.target.checked)} />
                Use the model for this run (uncheck to stay fully local)
              </label>
            ) : null}
          </div>
          <button type="button" className="hq-btn sm" onClick={() => void start()} disabled={busy || ev.length === 0} data-testid="assistant-run">
            {busy ? "Reading…" : "Run on this question's evidence"} <SparkIcon size={14} />
          </button>
        </div>
      ) : null}
      {err ? <p className="hq-alert mb-4">{err}</p> : null}
      {r.active && ev.length === 0 ? <Empty title="No evidence to read">Add evidence with readable text (a note, a summary or a text file) first.</Empty> : null}
      {run ? (
        <div className="mb-10" data-testid="assistant-result">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className={`hq-pill ${run.mode === "model" ? "dark" : ""}`} data-testid="assistant-mode">
              {run.mode === "model" ? `Model: ${run.model}` : "Extractive method · no model"}
            </span>
            {run.dropped ? <span className="hq-pill warn">{run.dropped} model findings dropped: quote not found in the cited evidence</span> : null}
            {run.notRead.length ? <span className="hq-pill warn">{run.notRead.map(label).join(", ")} not read: no text</span> : null}
          </div>
          {run.note ? <p className="hq-alert mb-4">{run.note}</p> : null}
          {run.themes.length === 0 ? (
            <Empty title="No themes found">The evidence has too little readable text. Add a summary or a key passage to each item.</Empty>
          ) : (
            <div className="hq-grid2">
              {run.themes.map((t, ti) => (
                <div key={t.title + ti} className="hq-card">
                  <p className="hq-kicker">Theme</p>
                  <h3 className="mt-1 text-[16px] font-medium capitalize">{t.title}</h3>
                  <p className="mt-2 text-[12px] leading-[20px] text-muted">{t.note}</p>
                  <ul className="mt-4 flex flex-col gap-3">
                    {t.claims.map((c, ci) => {
                      const key = `${ti}:${ci}`;
                      return (
                        <li key={key} className="border-t border-[var(--line)] pt-3">
                          <p className="text-[13px] leading-[21px]">{c.text}</p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <span className="text-[11px] text-muted">Source {c.evidenceIds.map(label).join(", ")}</span>
                            <button type="button" className="hq-btn sm line !min-h-[30px]" disabled={kept.has(key)} onClick={() => keep(t.title, c, key)} data-testid="keep-claim">
                              {kept.has(key) ? "Kept" : "Keep as finding"}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
      {r.active ? <Findings r={r} label={label} go={go} /> : null}
    </div>
  );
}

function Findings({ r, label, go }: { r: Research; label: (id: string) => string; go: (v: ViewId) => void }) {
  const [text, setText] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const add = () => {
    if (!r.active || text.trim().length < 8 || sel.length === 0) return;
    r.addClaims([{ questionId: r.active.id, text: text.trim().slice(0, 600), evidenceIds: sel, origin: "manual", theme: "" }]);
    setText("");
    setSel([]);
  };
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[17px] font-medium">Findings for this question</h2>
        <button type="button" className="text-[12px] underline" onClick={() => go("verify")}>
          Review them →
        </button>
      </div>
      <div className="hq-card mb-4 flex flex-col gap-3" data-testid="manual-finding">
        <label className="hq-field">
          Write a finding yourself
          <textarea className="hq-textarea !min-h-[70px]" value={text} maxLength={600} onChange={(e) => setText(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2">
          {r.qEvidence.map((e) => (
            <label key={e.id} className="hq-check rounded-[4px] border border-[var(--line)] px-2 py-1 !text-[11.5px]">
              <input type="checkbox" checked={sel.includes(e.id)} onChange={(x) => setSel((s) => (x.target.checked ? [...s, e.id] : s.filter((i) => i !== e.id)))} />
              {label(e.id)} {e.title.slice(0, 40)}
            </label>
          ))}
        </div>
        <button type="button" className="hq-btn sm w-fit" onClick={add} disabled={text.trim().length < 8 || sel.length === 0}>
          Add finding with its sources <PlusIcon size={14} />
        </button>
        <p className="text-[11px] text-muted">A finding needs at least one source.</p>
      </div>
      {r.qClaims.length === 0 ? (
        <Empty title="No findings yet">Keep findings from the assistant or write one above.</Empty>
      ) : (
        <ol className="flex flex-col gap-2" data-testid="finding-list">
          {r.qClaims.map((c: Claim, i) => (
            <li key={c.id} className="hq-card flex flex-wrap items-start justify-between gap-3 !py-3">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-[21px]">
                  <span className="hq-num mr-2">{i + 1}.</span>
                  {c.text}
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  {c.evidenceIds.length ? `Sources ${c.evidenceIds.map(label).join(", ")}` : "No source left: link one or remove the finding"} · {c.origin === "manual" ? "written by you" : c.origin === "assistant" ? "drafted by the model" : "quoted by the extractive method"}
                </p>
              </div>
              <button type="button" className="text-[12px] text-[var(--bad)] underline" onClick={() => r.removeClaim(c.id)}>
                Remove
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
