"use client";

import { useEffect, useState } from "react";
import { CHAIN, explorerAddress, isAddress } from "@/config/brand";
import { CONTRACTS, CONTRACT_NAMES } from "@/config/contracts";
import { briefById, findBrief, latestBriefs, signOffsOf, stampsOf, type ChainBrief, type ChainSignOff, type ChainStamp } from "@/lib/book";
import { parseBrief } from "@/lib/research/brief";
import { briefHash, evidenceRoot } from "@/lib/research/hash";
import { VERDICTS } from "@/lib/research/types";
import { ArrowUpRight, StampIcon } from "@/components/site/Icons";
import type { Research } from "../store";
import { useRecorder } from "../useRecorder";
import { Empty, ModeNote, QuestionBar, RecorderLine, ViewHead, short } from "../ui";

const verdictLabel = (n: number) => VERDICTS.find((v) => v.chain === n)?.label ?? `#${n}`;
const when = (t: number) => new Date(t * 1000).toLocaleString("en-GB");

export function ChainView({ r }: { r: Research }) {
  const rec = useRecorder();
  return (
    <div>
      <ViewHead kicker="Chain record" title={`${CONTRACT_NAMES.book} on ${CHAIN.name}`} lead="Verify a brief file against the chain, stamp evidence fingerprints, and read the newest records. Only fingerprints, counts and verdict numbers live on chain.">
        <ModeNote live={rec.live} />
      </ViewHead>
      {rec.live ? (
        <p className="mb-6 text-[12px] text-muted">
          Contract{" "}
          <a className="hq-code underline" href={explorerAddress(CONTRACTS.book)} target="_blank" rel="noreferrer">
            {CONTRACTS.book}
          </a>
        </p>
      ) : (
        <p className="hq-card mb-6 text-[12.5px] leading-[21px] text-muted" data-testid="chain-practice">
          The evidence book is not deployed yet. Anchors, sign-offs and stamps are signed as practice records and kept in this browser; verification against the chain switches on as soon as the contract address is published.
        </p>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <VerifyBrief live={rec.live} />
        <Stamp r={r} rec={rec} />
      </div>
      {rec.live ? <Latest /> : null}
      {rec.practice.length ? (
        <div className="hq-card mt-6" data-testid="practice-records">
          <p className="hq-kicker">Practice records in this browser</p>
          <ul className="mt-3 flex flex-col gap-3 text-[12px]">
            {rec.practice.slice(0, 12).map((p) => (
              <li key={p.signature} className="border-t border-[var(--line)] pt-2">
                <span className="hq-pill">{p.kind}</span> <span className="text-muted">{new Date(p.at).toLocaleString("en-GB")} · {short(p.address, 6)}</span>
                <p className="hq-code mt-1 text-muted">{short(p.signature, 14)}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function VerifyBrief({ live }: { live: boolean }) {
  const [md, setMd] = useState("");
  const [author, setAuthor] = useState("");
  const [idText, setIdText] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ brief: ChainBrief | null; signOffs: ChainSignOff[]; stamps: (ChainStamp | null)[]; error?: string } | null>(null);
  const parsed = md ? parseBrief(md) : null;
  const hash = md ? briefHash(md) : null;
  const root = parsed ? evidenceRoot(parsed.evidence.map((e) => e.sha256)) : null;
  const rootOk = Boolean(parsed?.root && root && parsed.root === root);

  async function check() {
    if (!hash) return;
    setBusy(true);
    setRes(null);
    try {
      let id = Number(idText) || 0;
      if (!id && isAddress(author)) id = await findBrief(author, hash);
      if (!id) {
        setRes({ brief: null, signOffs: [], stamps: [], error: "No brief found. Enter the author's wallet address or the brief id." });
        return;
      }
      const brief = await briefById(id);
      const [signOffs, stamps] = await Promise.all([brief ? signOffsOf(id) : Promise.resolve([]), parsed?.evidence.length ? stampsOf(parsed.evidence.map((e) => e.sha256)) : Promise.resolve([])]);
      setRes({ brief, signOffs, stamps });
    } catch {
      setRes({ brief: null, signOffs: [], stamps: [], error: "The chain could not be read just now." });
    } finally {
      setBusy(false);
    }
  }

  const same = res?.brief && hash ? res.brief.briefHash.toLowerCase() === hash.toLowerCase() : false;
  return (
    <section className="hq-card" data-testid="verify-brief">
      <p className="text-[15px] font-medium">Verify a brief</p>
      <p className="mt-1 text-[12px] text-muted">The fingerprint is computed in your browser from the exact file.</p>
      <input
        className="hq-input mt-3"
        type="file"
        accept=".md,text/markdown,text/plain"
        data-testid="verify-file"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f && f.size <= 1_000_000) setMd(await f.text());
          setRes(null);
        }}
      />
      {hash ? (
        <div className="mt-3 flex flex-col gap-1 text-[12px]">
          <span>
            Brief fingerprint <span className="hq-code" data-testid="verify-hash">{hash}</span>
          </span>
          <span className={rootOk ? "text-ok" : "text-bad"} data-testid="verify-root">
            {rootOk ? "Evidence root inside the file matches its reference list." : "Evidence root inside the file does not match its reference list (edited, or not a brief from this site)."}
          </span>
        </div>
      ) : null}
      {live && hash ? (
        <div className="mt-4 flex flex-col gap-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
            <input className="hq-input" placeholder="Author wallet 0x…" value={author} onChange={(e) => setAuthor(e.target.value.trim())} />
            <input className="hq-input" placeholder="or brief id" inputMode="numeric" value={idText} onChange={(e) => setIdText(e.target.value.replace(/\D/g, ""))} />
          </div>
          <button type="button" className="hq-btn sm w-fit" onClick={() => void check()} disabled={busy} data-testid="verify-run">
            {busy ? "Reading…" : "Check on chain"}
          </button>
        </div>
      ) : null}
      {res?.error ? <p className="hq-alert mt-3">{res.error}</p> : null}
      {res?.brief ? (
        <div className="mt-4 text-[12.5px]" data-testid="verify-result">
          <p className={same ? "hq-ok" : "hq-alert"}>
            {same ? `Brief #${res.brief.id} matches this file exactly.` : `Brief #${res.brief.id} exists but its fingerprint differs from this file.`}
          </p>
          <dl className="mt-3 grid grid-cols-[130px_1fr] gap-y-1.5">
            <dt className="text-muted">Author</dt>
            <dd className="hq-code">
              <a className="underline" href={explorerAddress(res.brief.author)} target="_blank" rel="noreferrer">
                {res.brief.author}
              </a>
            </dd>
            <dt className="text-muted">Block</dt>
            <dd>
              {res.brief.chainBlock.toLocaleString("en-US")} · {when(res.brief.anchoredAt)}
            </dd>
            <dt className="text-muted">Evidence root</dt>
            <dd className={root && res.brief.evidenceRoot.toLowerCase() === root.toLowerCase() ? "text-ok" : "text-bad"}>{root && res.brief.evidenceRoot.toLowerCase() === root.toLowerCase() ? "matches the file" : "differs from the file"}</dd>
            <dt className="text-muted">Counts</dt>
            <dd>
              {res.brief.evidenceCount} sources · {res.brief.claimCount} findings
            </dd>
          </dl>
          <p className="mt-4 font-medium">Sign-offs ({res.signOffs.length})</p>
          {res.signOffs.length === 0 ? <p className="text-muted">No reviewer has signed off yet.</p> : null}
          <ul className="mt-2 flex flex-col gap-2">
            {res.signOffs.map((s) => (
              <li key={s.id}>
                <span className={`hq-pill ${s.verdict === 1 ? "ok" : s.verdict === 2 ? "warn" : "bad"}`}>{verdictLabel(s.verdict)}</span> <span className="hq-code">{short(s.reviewer, 6)}</span> <span className="text-muted">block {s.chainBlock.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ul>
          {parsed?.evidence.length ? (
            <>
              <p className="mt-4 font-medium">Evidence stamps</p>
              <ul className="mt-2 flex flex-col gap-1">
                {parsed.evidence.map((e, i) => (
                  <li key={e.tag}>
                    {e.tag} <span className="hq-code text-muted">{short(e.sha256, 8)}</span> · {res.stamps[i] ? `first stamped in block ${res.stamps[i]!.chainBlock.toLocaleString("en-US")}` : "not stamped"}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
      <p className="mt-4 text-[11px] text-muted">A match proves the file is unchanged since it was anchored. It does not prove the brief is correct.</p>
    </section>
  );
}

function Stamp({ r, rec }: { r: Research; rec: ReturnType<typeof useRecorder> }) {
  const [sel, setSel] = useState<string[]>([]);
  const [known, setKnown] = useState<Record<string, ChainStamp>>({});
  const ev = r.qEvidence;
  useEffect(() => {
    if (!rec.live || ev.length === 0) return;
    let off = false;
    stampsOf(ev.map((e) => e.sha256))
      .then((list) => !off && setKnown(Object.fromEntries(ev.map((e, i) => [e.sha256, list[i]]))))
      .catch(() => undefined);
    return () => {
      off = true;
    };
  }, [rec.live, ev, rec.msg]);
  const pick = ev.filter((e) => sel.includes(e.id));
  return (
    <section className="hq-card" data-testid="stamp-panel">
      <p className="text-[15px] font-medium">Stamp evidence fingerprints</p>
      <p className="mt-1 text-[12px] text-muted">Records that each fingerprint existed by this block. Up to 32 per transaction; already stamped ones are skipped by the contract. Files are never sent.</p>
      <div className="mt-4">
        <QuestionBar r={r} />
      </div>
      {ev.length === 0 ? (
        <Empty title="No evidence in this question">Add evidence first.</Empty>
      ) : (
        <ul className="flex max-h-[320px] flex-col gap-2 overflow-auto">
          {ev.map((e) => (
            <li key={e.id}>
              <label className="hq-check !text-[12px]">
                <input type="checkbox" checked={sel.includes(e.id)} disabled={!sel.includes(e.id) && sel.length >= 32} onChange={(x) => setSel((s) => (x.target.checked ? [...s, e.id] : s.filter((i) => i !== e.id)))} />
                <span className="min-w-0">
                  {e.title} <span className="hq-code text-muted">{short(e.sha256, 6)}</span>
                  {known[e.sha256] ? <span className="hq-pill ok ml-2">stamped · block {known[e.sha256]!.chainBlock.toLocaleString("en-US")}</span> : null}
                  {e.kind === "note" && e.note.length < 120 ? <span className="hq-pill warn ml-2">short note: guessable from its fingerprint</span> : null}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" className="hq-btn sm mint" disabled={pick.length === 0 || rec.busy} onClick={() => void rec.stamp(pick.map((e) => e.sha256 as `0x${string}`))} data-testid="stamp-run">
          <StampIcon size={14} /> {rec.live ? `Stamp ${pick.length || ""} on chain` : `Sign practice stamp`}
        </button>
        <span className="text-[11px] text-muted">≈ 50,000 gas per new fingerprint.</span>
      </div>
      <div className="mt-3">
        <RecorderLine msg={rec.msg} />
      </div>
    </section>
  );
}

function Latest() {
  const [data, setData] = useState<{ total: number; briefs: ChainBrief[] } | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    latestBriefs(8)
      .then(setData)
      .catch(() => setErr(true));
  }, []);
  return (
    <section className="hq-card mt-6" data-testid="latest-briefs">
      <p className="text-[15px] font-medium">Newest anchored briefs</p>
      {err ? <p className="hq-alert mt-3">The chain could not be read just now.</p> : null}
      {data && data.briefs.length === 0 ? <p className="mt-2 text-[12px] text-muted">No brief has been anchored yet.</p> : null}
      {data && data.briefs.length ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[12px]">
            <thead className="text-muted">
              <tr>
                <th className="py-2 font-normal">#</th>
                <th className="font-normal">Fingerprint</th>
                <th className="font-normal">Author</th>
                <th className="font-normal">Sources / findings</th>
                <th className="font-normal">Sign-offs</th>
                <th className="font-normal">Block</th>
              </tr>
            </thead>
            <tbody>
              {data.briefs.map((b) => (
                <tr key={b.id} className="border-t border-[var(--line)]">
                  <td className="py-2">{b.id}</td>
                  <td className="hq-code">{short(b.briefHash, 8)}</td>
                  <td>
                    <a className="hq-code underline" href={explorerAddress(b.author)} target="_blank" rel="noreferrer">
                      {short(b.author, 6)} <ArrowUpRight size={10} />
                    </a>
                  </td>
                  <td>
                    {b.evidenceCount} / {b.claimCount}
                  </td>
                  <td>{b.signOffCount}</td>
                  <td>{b.chainBlock.toLocaleString("en-US")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-muted">{data.total} briefs anchored in total. Content is never on chain; only the authors can share the files.</p>
        </div>
      ) : null}
    </section>
  );
}
