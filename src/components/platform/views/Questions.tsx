"use client";

import { useState } from "react";
import { LIMITS } from "@/lib/research/types";
import { PlusIcon } from "@/components/site/Icons";
import type { Research } from "../store";
import type { ViewId } from "../Workspace";
import { Empty, ViewHead } from "../ui";

const EXAMPLES = [
  { title: "Is the river crossing open to freight this week?", scope: "Road authority notices, operator statements and dated photos from the last 30 days.", limits: "No faces, plate numbers or names of drivers." },
  { title: "Did our parts supplier cut output since July?", scope: "Public filings, port notices and partner photos shared with permission.", limits: "Nothing about individual workers." },
];

export function Questions({ r, go }: { r: Research; go: (v: ViewId) => void }) {
  const [title, setTitle] = useState("");
  const [scope, setScope] = useState("");
  const [limits, setLimits] = useState("");
  const [err, setErr] = useState("");
  const full = r.questions.length >= LIMITS.questions;
  const submit = () => {
    if (title.trim().length < 8) return setErr("Write the question in at least 8 characters.");
    if (full) return setErr(`This browser holds up to ${LIMITS.questions} questions. Delete one first.`);
    r.addQuestion({ title: title.trim().slice(0, LIMITS.titleChars), scope: scope.trim().slice(0, 1000), limits: limits.trim().slice(0, 600) });
    setTitle("");
    setScope("");
    setLimits("");
    setErr("");
    go("evidence");
  };
  return (
    <div>
      <ViewHead kicker="Research hub" title="Research questions" lead="A good question names what you want to know, what counts as in scope, and what must stay out. Everything else in the workspace hangs off it." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form
          className="hq-card flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          data-testid="question-form"
        >
          <label className="hq-field">
            Question
            <input className="hq-input" value={title} maxLength={LIMITS.titleChars} onChange={(e) => setTitle(e.target.value)} placeholder="What do you need to know?" data-testid="q-title" />
          </label>
          <label className="hq-field">
            Scope: which sources and which period count
            <textarea className="hq-textarea !min-h-[80px]" value={scope} maxLength={1000} onChange={(e) => setScope(e.target.value)} data-testid="q-scope" />
          </label>
          <label className="hq-field">
            Limits: what must not be collected
            <input className="hq-input" value={limits} maxLength={600} onChange={(e) => setLimits(e.target.value)} placeholder="e.g. no names, no faces, no private messages" />
          </label>
          {err ? <p className="hq-alert">{err}</p> : null}
          <div className="flex flex-wrap items-center gap-4">
            <button type="submit" className="hq-btn sm" data-testid="q-submit">
              Open question <PlusIcon size={14} />
            </button>
            <span className="text-[11px] text-muted">Kept in this browser only.</span>
          </div>
        </form>
        <div className="hq-card">
          <p className="hq-kicker">Examples</p>
          {EXAMPLES.map((x) => (
            <button
              key={x.title}
              type="button"
              className="mt-3 block w-full border-b border-[var(--line)] pb-3 text-left text-[12.5px] hover:underline"
              onClick={() => {
                setTitle(x.title);
                setScope(x.scope);
                setLimits(x.limits);
              }}
            >
              {x.title}
            </button>
          ))}
          <p className="mt-3 text-[11px] text-muted">Click to fill the form, then edit it to fit your case.</p>
        </div>
      </div>

      <h2 className="mt-10 mb-4 text-[17px] font-medium">All questions</h2>
      {r.questions.length === 0 ? (
        <Empty title="No questions yet">Your first question appears here.</Empty>
      ) : (
        <ul className="flex flex-col gap-3" data-testid="question-list">
          {r.questions.map((q) => (
            <li key={q.id} className={`hq-card flex flex-wrap items-start justify-between gap-4 ${r.active?.id === q.id ? "!border-[#99b088]" : ""}`}>
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-medium">{q.title}</h3>
                <p className="mt-1 text-[12px] text-muted">{q.scope || "No scope written."}</p>
                {q.limits ? <p className="mt-1 text-[12px] text-muted">Out of scope: {q.limits}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="hq-btn sm line"
                  onClick={() => {
                    r.setActiveId(q.id);
                    go("evidence");
                  }}
                >
                  Open
                </button>
                <button
                  type="button"
                  className="hq-btn sm line !text-[var(--bad)]"
                  onClick={() => {
                    if (window.confirm("Delete this question with its evidence, findings and briefs from this browser?")) r.removeQuestion(q.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
