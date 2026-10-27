"use client";

import { useState } from "react";
import { bookLive } from "@/config/contracts";
import { briefById, type ChainBrief } from "@/lib/book";
import { parseBrief } from "@/lib/research/brief";
import { briefHash, jsonHash } from "@/lib/research/hash";
import { VERDICTS, emptyCheck, type ClaimCheck, type Verdict } from "@/lib/research/types";
import type { Research } from "../store";
import { useRecorder } from "../useRecorder";
import { Empty, ModeNote, QuestionBar, RecorderLine, ViewHead, short } from "../ui";

const CHECKS: { k: keyof Omit<ClaimCheck, "verdict" | "note">; label: string }[] = [
  { k: "sourcesOpened", label: "I opened every cited source" },
  { k: "quoteMatches", label: "The finding matches what the sources say" },
  { k: "datesChecked", label: "Source dates fit the question's period" },
  { k: "noPersonalData", label: "No personal data is exposed" },
];

function Checklist({ value, onChange, testid }: { value: ClaimCheck; onChange: (v: ClaimCheck) => void; testid?: string }) {
  return (
    <div className="mt-3 flex flex-col gap-2" data-testid={testid}>
      <div className="grid gap-2 sm:grid-cols-2">
        {CHECKS.map((c) => (
          <label key={c.k} className="hq-check !text-[12px]">
            <input type="checkbox" checked={value[c.k]} onChange={(e) => onChange({ ...value, [c.k]: e.target.checked })} />
            {c.label}
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {VERDICTS.map((v) => (
          <button key={v.id} type="button" className={`hq-pill !h-7 cursor-pointer ${value.verdict === v.id ? (v.id === "supported" ? "ok" : v.id === "needs-work" ? "warn" : "bad") : ""}`} onClick={() => onChange({ ...value, verdict: v.id })} aria-pressed={value.verdict === v.id}>
            {v.label}
          </button>
        ))}
        <input className="hq-input !w-auto min-w-0 flex-1 !py-1.5 !text-[12px]" placeholder="Reviewer note (optional)" maxLength={240} value={value.note} onChange={(e) => onChange({ ...value, note: e.target.value })} />
      </div>
    </div>
  );
}

export function Verify({ r }: { r: Research }) {
  const [tab, setTab] = useState<"self" | "desk">("self");
  return (
    <div>
      <ViewHead kicker="Human verification" title="People decide" lead="A finding enters a brief with a person's verdict. Check your own findings here, or review someone else's exported brief and record your sign-off.">
        <div className="hq-tabs">
          <button type="button" className={tab === "self" ? "on" : ""} onClick={() => setTab("self")} data-testid="tab-self">
            Your findings
          </button>
          <button type="button" className={tab === "desk" ? "on" : ""} onClick={() => setTab("desk")} data-testid="tab-desk">
            Review desk
          </button>
        </div>
      </ViewHead>
      {tab === "self" ? <SelfCheck r={r} /> : <ReviewDesk />}
    </div>
  );
}

function SelfCheck({ r }: { r: Research }) {
  const label = (id: string) => {
    const i = r.qEvidence.findIndex((e) => e.id === id);
    return i < 0 ? "?" : `E${i + 1}`;
  };
  const done = r.qClaims.filter((c) => r.checks[c.id]?.verdict).length;
  return (
    <div>
      <QuestionBar r={r} />
      {r.active && r.qClaims.length === 0 ? <Empty title="No findings to check">Draft findings in the Research assistant first.</Empty> : null}
      {r.qClaims.length ? (
        <p className="mb-4 text-[12px] text-muted" data-testid="self-progress">
          {done} of {r.qClaims.length} findings have a verdict.
        </p>
      ) : null}
      <ol className="flex flex-col gap-3">
        {r.qClaims.map((c, i) => {
          const value = r.checks[c.id] ?? emptyCheck();
          return (
            <li key={c.id} className="hq-card" data-testid="self-item">
              <p className="text-[13.5px] leading-[22px]">
                <span className="hq-num mr-2">{i + 1}.</span>
                {c.text}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Sources:{" "}
                {c.evidenceIds.map((id) => {
                  const e = r.qEvidence.find((x) => x.id === id);
                  return e ? (
                    <span key={id} className="mr-2">
                      {label(id)} {e.url ? <a className="underline" href={e.url} target="_blank" rel="noreferrer nofollow">{e.title}</a> : e.title}
                    </span>
                  ) : null;
                })}
              </p>
              <Checklist value={value} onChange={(v) => r.setCheck(c.id, v)} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ReviewDesk() {
  const rec = useRecorder();
  const [md, setMd] = useState("");
  const [name, setName] = useState("");
  const [idText, setIdText] = useState("");
  const [onChain, setOnChain] = useState<ChainBrief | null>(null);
  const [lookErr, setLookErr] = useState("");
  const [checks, setChecks] = useState<Record<number, ClaimCheck>>({});
  const [overall, setOverall] = useState<Verdict | null>(null);
  const parsed = md ? parseBrief(md) : null;
  const hash = md ? briefHash(md) : null;
  const matches = Boolean(onChain && hash && onChain.briefHash.toLowerCase() === hash.toLowerCase());

  async function look() {
    setLookErr("");
    setOnChain(null);
    const id = Number(idText);
    if (!Number.isInteger(id) || id <= 0) return setLookErr("Enter the brief id the author shared.");
    try {
      const b = await briefById(id);
      if (!b) return setLookErr("No brief with that id on chain.");
      setOnChain(b);
    } catch {
      setLookErr("The chain could not be read just now.");
    }
  }

  const findings = parsed?.findings ?? [];
  const allChecked = findings.length > 0 && findings.every((f) => checks[f.n]?.verdict);
  const checklist = { brief: hash, findings: findings.map((f) => ({ n: f.n, ...(checks[f.n] ?? emptyCheck()) })), overall };
  const verdictNo = VERDICTS.find((v) => v.id === overall)?.chain;

  return (
    <div className="flex flex-col gap-4" data-testid="review-desk">
      <div className="hq-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] font-medium">1 · Load the brief file you were sent</p>
          <ModeNote live={rec.live} />
        </div>
        <input
          className="hq-input mt-3"
          type="file"
          accept=".md,text/markdown,text/plain"
          data-testid="desk-file"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f || f.size > 1_000_000) return;
            setMd(await f.text());
            setName(f.name);
            setChecks({});
            setOverall(null);
          }}
        />
        {parsed ? (
          <p className="mt-3 text-[12px] text-muted">
            {name}: “{parsed.title}” · {findings.length} findings · {parsed.evidence.length} sources · fingerprint <span className="hq-code">{short(hash ?? "", 12)}</span>
          </p>
        ) : null}
      </div>
      {bookLive() ? (
        <div className="hq-card">
          <p className="text-[14px] font-medium">2 · Match it with the chain</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <input className="hq-input !w-40" inputMode="numeric" placeholder="Brief id" value={idText} onChange={(e) => setIdText(e.target.value.replace(/\D/g, ""))} data-testid="desk-id" />
            <button type="button" className="hq-btn sm line" onClick={() => void look()}>
              Look up
            </button>
          </div>
          {lookErr ? <p className="hq-alert mt-3">{lookErr}</p> : null}
          {onChain ? (
            <p className={`mt-3 ${matches ? "hq-ok" : "hq-alert"}`} data-testid="desk-match">
              {matches ? `Match: brief #${onChain.id} by ${short(onChain.author, 6)} has exactly this fingerprint.` : "This file's fingerprint differs from the brief on chain. Ask the author for the exact file."}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="hq-card text-[12.5px] text-muted">2 · Matching with the chain becomes available once the evidence book is deployed. Until then the sign-off below is a practice record kept in this browser.</div>
      )}
      {parsed ? (
        <div className="hq-card">
          <p className="text-[14px] font-medium">3 · Review each finding</p>
          {findings.length === 0 ? <p className="mt-2 text-[12px] text-muted">No findings could be read from this file.</p> : null}
          <ol className="mt-2 flex flex-col gap-4">
            {findings.map((f) => (
              <li key={f.n} className="border-t border-[var(--line)] pt-3">
                <p className="text-[13px] leading-[21px]">
                  <span className="hq-num mr-2">{f.n}.</span>
                  {f.text} <span className="text-[11px] text-muted">{f.refs.join(" ")}</span>
                </p>
                <Checklist value={checks[f.n] ?? emptyCheck()} onChange={(v) => setChecks((m) => ({ ...m, [f.n]: v }))} />
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[14px] font-medium">4 · Your overall verdict</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {VERDICTS.map((v) => (
              <button key={v.id} type="button" className={`hq-btn sm ${overall === v.id ? "" : "line"}`} onClick={() => setOverall(v.id)} data-testid={`overall-${v.id}`}>
                {v.label}
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="hq-btn sm mint"
              disabled={!allChecked || !verdictNo || rec.busy || (rec.live && !matches)}
              onClick={() => onChain || !rec.live ? void rec.signOff(onChain?.id ?? 0, verdictNo as 1 | 2 | 3, jsonHash(checklist), hash ?? "") : undefined}
              data-testid="desk-signoff"
            >
              {rec.live ? "Record sign-off on chain" : "Sign practice sign-off"}
            </button>
            <span className="text-[11px] text-muted">{allChecked ? `Checklist hash ${short(jsonHash(checklist), 8)}` : "Give every finding a verdict first."}</span>
          </div>
          <div className="mt-3">
            <RecorderLine msg={rec.msg} />
          </div>
          <p className="mt-3 text-[11px] text-muted">Your sign-off records your wallet, the verdict and the hash of this checklist. The author&apos;s own wallet cannot sign off its brief, and each wallet signs a brief once.</p>
        </div>
      ) : null}
    </div>
  );
}
