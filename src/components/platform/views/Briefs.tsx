"use client";

import { useMemo, useState } from "react";
import { BRAND, explorerTx } from "@/config/brand";
import { findBrief } from "@/lib/book";
import { briefRecord, buildBrief } from "@/lib/research/brief";
import { newId, type BriefRecord } from "@/lib/research/types";
import { ArrowUpRight, DocIcon } from "@/components/site/Icons";
import type { Research } from "../store";
import { stageOf } from "../store";
import { useRecorder } from "../useRecorder";
import { Empty, ModeNote, QuestionBar, RecorderLine, ViewHead, short } from "../ui";

const STAGE = ["V0 Draft", "V1 Sourced", "V2 Self-checked", "V3 Anchored", "V4 Signed off"];

function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Opens the brief as a plain printable page; the browser's print dialog saves it as PDF. */
function printBrief(md: string) {
  const html = md
    .split("\n")
    .map((l) => {
      if (l.startsWith("# ")) return `<h1>${esc(l.slice(2))}</h1>`;
      if (l.startsWith("## ")) return `<h2>${esc(l.slice(3))}</h2>`;
      if (/^\s+- /.test(l)) return `<p class="sub">${esc(l.trim().slice(2))}</p>`;
      if (l.startsWith("- ")) return `<p class="li">${esc(l.slice(2))}</p>`;
      if (/^\d+\. /.test(l)) return `<p class="li">${esc(l)}</p>`;
      return l.trim() ? `<p>${esc(l)}</p>` : "";
    })
    .join("\n");
  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Brief</title><style>body{font:13px/1.6 Georgia,serif;max-width:720px;margin:40px auto;color:#20211f}h1{font:600 24px/1.3 sans-serif}h2{font:600 15px sans-serif;margin-top:24px;border-bottom:1px solid #ccc}p.li{margin:6px 0}p.sub{margin:0 0 6px 24px;color:#555;font-size:12px;word-break:break-all}</style></head><body>${html}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

export function Briefs({ r }: { r: Research }) {
  const rec = useRecorder();
  const [author, setAuthor] = useState("");
  const [err, setErr] = useState("");
  const [briefId] = useState(() => newId());
  const latest: BriefRecord | undefined = r.qBriefs[0];
  const preview = useMemo(() => {
    if (!r.active) return null;
    return buildBrief({ question: r.active, evidence: r.qEvidence, claims: r.qClaims, checks: r.checks, author, briefId, date: new Date().toISOString().slice(0, 10) });
  }, [r.active, r.qEvidence, r.qClaims, r.checks, author, briefId]);
  const unsourced = r.qClaims.filter((c) => c.evidenceIds.length === 0).length;
  const stage = stageOf(r.qClaims, r.checks, latest, false);

  function exportNow() {
    setErr("");
    if (!r.active || !preview) return;
    if (r.qClaims.length === 0) return setErr("Add at least one finding first.");
    if (unsourced) return setErr("Every finding needs a source. Link or remove the findings without one.");
    const b = briefRecord({ question: r.active, evidence: r.qEvidence, claims: r.qClaims, checks: r.checks, author, briefId: newId(), date: new Date().toISOString().slice(0, 10) }, newId(), Date.now());
    r.saveBrief(b);
    download(`brief-${b.briefHash.slice(2, 10)}.md`, b.markdown);
  }

  async function anchor(b: BriefRecord) {
    const out = await rec.anchor(b.briefHash as `0x${string}`, b.evidenceRoot as `0x${string}`, b.evidenceCount, b.claimCount);
    if (!out) return;
    if ("tx" in out && rec.address) {
      const id = await findBrief(rec.address, b.briefHash).catch(() => 0);
      r.updateBrief(b.id, { anchor: { mode: "chain", briefId: id, tx: out.tx, block: out.block } });
      r.log(`Brief anchored on chain as #${id}`);
    } else if ("signature" in out) {
      r.updateBrief(b.id, { anchor: { mode: "practice", signature: out.signature, address: out.address, at: out.at } });
      r.log("Brief signed as a practice record");
    }
  }

  return (
    <div>
      <ViewHead kicker="Intelligence briefs" title="Export, print, anchor" lead="A brief lists the findings with their human verdicts and the evidence they cite, with every fingerprint. Its keccak-256 fingerprint is what you anchor on chain.">
        <ModeNote live={rec.live} />
      </ViewHead>
      <QuestionBar r={r} />
      {r.active ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="hq-card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[14px] font-medium">Preview</p>
                <span className="hq-pill dark" data-testid="brief-stage">
                  {STAGE[stage]}
                </span>
              </div>
              <label className="hq-field mt-3">
                Prepared by (optional; a team or desk name, not a person&apos;s full name)
                <input className="hq-input" value={author} maxLength={60} onChange={(e) => setAuthor(e.target.value)} />
              </label>
              <pre className="hq-pre mt-4" data-testid="brief-preview">
                {preview?.markdown}
              </pre>
              {err ? <p className="hq-alert mt-3">{err}</p> : null}
              {unsourced ? <p className="hq-alert mt-3">{unsourced} finding(s) have no source.</p> : null}
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="hq-btn sm" onClick={exportNow} data-testid="brief-export">
                  Export Markdown <DocIcon size={14} />
                </button>
                <button type="button" className="hq-btn sm line" onClick={() => preview && printBrief(preview.markdown)} disabled={!r.qClaims.length}>
                  Print / save as PDF
                </button>
              </div>
              <p className="mt-3 text-[11px] text-muted">Each export gets a fresh brief id, so its fingerprint differs from earlier exports. Anchor the exact file you share.</p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="hq-card">
              <p className="hq-kicker">Exported briefs</p>
              {r.qBriefs.length === 0 ? (
                <p className="mt-3 text-[12px] text-muted">Exports appear here with their fingerprints.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-4" data-testid="brief-list">
                  {r.qBriefs.map((b) => (
                    <li key={b.id} className="border-t border-[var(--line)] pt-3 text-[12px]">
                      <p className="hq-code" title={b.briefHash}>
                        {short(b.briefHash, 10)}
                      </p>
                      <p className="mt-1 text-muted">
                        {new Date(b.createdAt).toLocaleString("en-GB")} · {b.evidenceCount} sources · {b.claimCount} findings
                      </p>
                      {b.anchor?.mode === "chain" ? (
                        <p className="hq-ok mt-2" data-testid="brief-anchored">
                          Anchored as brief #{b.anchor.briefId} in block {b.anchor.block.toLocaleString("en-US")}.{" "}
                          <a className="underline" href={explorerTx(b.anchor.tx)} target="_blank" rel="noreferrer">
                            tx <ArrowUpRight size={10} />
                          </a>{" "}
                          Share the id with your reviewer.
                        </p>
                      ) : b.anchor?.mode === "practice" ? (
                        <p className="hq-ok mt-2" data-testid="brief-practice">
                          Practice record signed by {short(b.anchor.address, 6)}. Nothing was published.
                        </p>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button type="button" className="hq-btn sm mint !min-h-[32px]" disabled={rec.busy} onClick={() => void anchor(b)} data-testid="brief-anchor">
                            {rec.live ? "Anchor on chain" : "Sign practice anchor"}
                          </button>
                          <button type="button" className="hq-btn sm line !min-h-[32px]" onClick={() => download(`brief-${b.briefHash.slice(2, 10)}.md`, b.markdown)}>
                            Download again
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3">
                <RecorderLine msg={rec.msg} />
              </div>
            </div>
            <div className="hq-card text-[12px] leading-[20px] text-muted">
              Anchoring stores the brief fingerprint, the evidence root and two counts with your wallet address, about 190,000 gas. It proves this exact file existed at that block. It does not make {BRAND.name} or anyone else vouch for its content.
            </div>
          </div>
        </div>
      ) : null}
      {r.active && r.qClaims.length === 0 ? (
        <div className="mt-6">
          <Empty title="No findings yet">A brief is built from reviewed findings. Draft them in the Research assistant.</Empty>
        </div>
      ) : null}
    </div>
  );
}
