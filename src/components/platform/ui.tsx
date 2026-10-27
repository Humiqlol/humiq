"use client";

import Link from "next/link";
import { explorerTx } from "@/config/brand";
import { ArrowUpRight } from "@/components/site/Icons";
import type { Research } from "./store";

export function ViewHead({ kicker, title, lead, children }: { kicker: string; title: string; lead?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="hq-kicker">{kicker}</p>
        <h1 className="mt-2 text-[24px] leading-[32px] font-medium tracking-[-0.6px]">{title}</h1>
        {lead ? <p className="mt-2 max-w-[720px] text-[13px] leading-[22px] text-muted">{lead}</p> : null}
      </div>
      {children}
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="hq-empty">
      <b>{title}</b>
      <div className="max-w-[460px] text-[12.5px] leading-[21px]">{children}</div>
    </div>
  );
}

/** Which question the view works on, with a switcher. */
export function QuestionBar({ r }: { r: Research }) {
  if (!r.active)
    return (
      <div className="mb-6">
        <Empty title="No research question yet">
          Every piece of evidence and every finding belongs to a question.{" "}
          <Link className="underline" href="/platform?view=questions">
            Open one first
          </Link>
          .
        </Empty>
      </div>
    );
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[10px] border border-[#e0e6d9] bg-white px-4 py-3">
      <span className="hq-kicker">Question</span>
      <select className="hq-select !w-auto max-w-full min-w-0 flex-1 !border-0 !p-0 !text-[14px] font-medium" value={r.active.id} onChange={(e) => r.setActiveId(e.target.value)} aria-label="Active research question" data-testid="question-switch">
        {r.questions.map((q) => (
          <option key={q.id} value={q.id}>
            {q.title}
          </option>
        ))}
      </select>
      <span className="hq-pill">{r.qEvidence.length} evidence</span>
      <span className="hq-pill">{r.qClaims.length} findings</span>
    </div>
  );
}

export function RecorderLine({ msg }: { msg: { ok: boolean; text: string; tx?: string } | null }) {
  if (!msg) return null;
  return (
    <p className={msg.ok ? "hq-ok" : "hq-alert"} data-testid="recorder-msg">
      {msg.text}{" "}
      {msg.tx ? (
        <a className="inline-flex items-center gap-1 underline" href={explorerTx(msg.tx)} target="_blank" rel="noreferrer">
          tx <ArrowUpRight size={11} />
        </a>
      ) : null}
    </p>
  );
}

export function ModeNote({ live }: { live: boolean }) {
  return live ? (
    <span className="hq-pill ok" data-testid="mode-live">
      Live on Robinhood Chain
    </span>
  ) : (
    <span className="hq-pill warn" data-testid="mode-practice">
      Practice mode · contract not deployed yet
    </span>
  );
}

export const short = (h: string, n = 10) => (h.length > n * 2 ? `${h.slice(0, n)}…${h.slice(-6)}` : h);
