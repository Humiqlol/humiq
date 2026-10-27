"use client";

import { useChain } from "@/components/providers/ChainProvider";
import { ASSETS } from "@/config/assets";
import { bookLive } from "@/config/contracts";
import { ArrowUpRight, PlusIcon } from "@/components/site/Icons";
import type { Research } from "../store";
import { stageOf } from "../store";
import type { ViewId } from "../Workspace";
import { Empty, ModeNote } from "../ui";

const STAGE = ["V0 Draft", "V1 Sourced", "V2 Self-checked", "V3 Anchored", "V4 Signed off"];

export function Overview({ r, go }: { r: Research; go: (v: ViewId) => void }) {
  const { facts } = useChain();
  const a = ASSETS.art.platform;
  const reviewed = r.claims.filter((c) => r.checks[c.id]?.verdict).length;
  const anchored = r.briefs.filter((b) => b.anchor).length;
  return (
    <div>
      <section className="hq-banner">
        <img src={a.src} width={a.w} height={a.h} alt="" aria-hidden="true" className="pointer-events-none absolute top-0 right-0 hidden h-full w-auto opacity-90 md:block" />
        <h1>
          Evidence first,
          <br />
          then a finding you can defend<span>.</span>
        </h1>
        <p className="relative mt-5 max-w-[420px] text-[12px] leading-[21px] text-[#c9cdbf]">
          Open a question, attach what you lawfully hold, let the assistant group it, review each finding, and export a brief with its sources.
        </p>
        <div className="relative mt-8 flex flex-wrap items-center gap-6">
          <button type="button" className="hq-btn mint sm !min-h-[40px]" onClick={() => go("questions")} data-testid="overview-new">
            New research question <PlusIcon size={14} />
          </button>
          <button type="button" className="inline-flex items-center gap-2 text-[11px]" onClick={() => go("chain")}>
            Verify a brief <ArrowUpRight size={12} />
          </button>
        </div>
      </section>
      <div className="hq-stats" data-testid="overview-stats">
        <div>
          <span className="text-[11px] text-muted">Research questions</span>
          <b>{r.questions.length}</b>
        </div>
        <div>
          <span className="text-[11px] text-muted">Evidence items</span>
          <b>{r.evidence.length}</b>
        </div>
        <div>
          <span className="text-[11px] text-muted">Findings reviewed</span>
          <b>
            {reviewed} <span className="text-[13px] text-muted">/ {r.claims.length}</span>
          </b>
        </div>
        <div>
          <span className="text-[11px] text-muted">Briefs anchored here</span>
          <b>{anchored}</b>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-[19px] font-medium tracking-[-0.4px]">Your questions</h2>
            <span className="hq-pill">{r.questions.length}</span>
          </div>
          {r.questions.length === 0 ? (
            <Empty title="Nothing here yet">Start with one research question. Your work stays in this browser until you export it.</Empty>
          ) : (
            <div className="hq-grid2">
              {r.questions.map((q) => {
                const cl = r.claims.filter((c) => c.questionId === q.id);
                const ev = r.evidence.filter((e) => e.questionId === q.id);
                const brief = r.briefs.find((b) => b.questionId === q.id);
                const st = stageOf(cl, r.checks, brief, false);
                return (
                  <button
                    key={q.id}
                    type="button"
                    className="hq-card hover flex flex-col text-left"
                    onClick={() => {
                      r.setActiveId(q.id);
                      go("evidence");
                    }}
                  >
                    <span className="hq-pill dark w-fit">{STAGE[st]}</span>
                    <h3 className="mt-4 text-[16px] leading-[23px] font-medium">{q.title}</h3>
                    <p className="mt-2 line-clamp-2 text-[12px] text-muted">{q.scope || "No scope written yet."}</p>
                    <p className="mt-4 text-[11px] text-muted">
                      {ev.length} evidence · {cl.length} findings · {new Date(q.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="hq-card">
            <p className="hq-kicker">Robinhood Chain · live</p>
            <dl className="mt-3 grid grid-cols-2 gap-y-3 text-[12px]">
              <dt className="text-muted">Block</dt>
              <dd data-testid="ov-block">{facts?.block ? facts.block.toLocaleString("en-US") : "—"}</dd>
              <dt className="text-muted">Gas</dt>
              <dd>{facts?.gasGwei !== null && facts?.gasGwei !== undefined ? `${facts.gasGwei.toFixed(4)} gwei` : "—"}</dd>
              <dt className="text-muted">ETH / USD</dt>
              <dd>{facts?.ethUsd ? `$${facts.ethUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "—"}</dd>
              <dt className="text-muted">Briefs on chain</dt>
              <dd>{bookLive() ? (facts?.book?.briefs ?? "—") : "—"}</dd>
              <dt className="text-muted">Sign-offs</dt>
              <dd>{bookLive() ? (facts?.book?.signOffs ?? "—") : "—"}</dd>
              <dt className="text-muted">Stamped items</dt>
              <dd>{bookLive() ? (facts?.book?.stamps ?? "—") : "—"}</dd>
            </dl>
            <div className="mt-4">
              <ModeNote live={bookLive()} />
            </div>
          </div>
          <div className="hq-card">
            <p className="hq-kicker">Recent activity</p>
            {r.activity.length === 0 ? (
              <p className="mt-3 text-[12px] text-muted">Your actions in this browser appear here.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2 text-[12px]" data-testid="activity">
                {r.activity.slice(0, 8).map((x) => (
                  <li key={x.at + x.text} className="flex justify-between gap-3">
                    <span className="min-w-0 truncate">{x.text}</span>
                    <span className="shrink-0 text-muted">{new Date(x.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="hq-card">
            <p className="hq-kicker">Planned</p>
            <ul className="mt-3 flex flex-col gap-2 text-[12px] text-muted">
              <li>Human Insight Network: contributors who opt in to answer scoped questions.</li>
              <li>Contributor Workspace: shared tasks and revision history for teams.</li>
              <li>Research credits, premium workspace and API access with the token.</li>
            </ul>
            <p className="mt-3 text-[11px] text-muted">Not live. No date, no promise.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
