"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocalStore } from "@/components/wallet/useLocalStore";
import { RULES_KEY, type RulesAck } from "@/components/report/RulesForm";
import { canonicalRecord, sha256Bytes, sha256Text } from "@/lib/research/hash";
import { LIMITS, SOURCE_TYPES, newId, type Consent, type Evidence, type EvidenceKind, type SourceType } from "@/lib/research/types";
import { bytesLabel } from "@/lib/format";
import { PlusIcon } from "@/components/site/Icons";
import type { Research } from "../store";
import { Empty, QuestionBar, ViewHead, short } from "../ui";

const TEXT_TYPES = /^(text\/|application\/(json|csv|xml|x-ndjson|markdown))/;
const NO_CONSENT: Consent = { lawful: false, consented: false, noPersonal: false };

export function EvidenceView({ r }: { r: Research }) {
  const [ack] = useLocalStore<RulesAck>(RULES_KEY, null);
  const [kind, setKind] = useState<EvidenceKind>("url");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sourceType, setSourceType] = useState<SourceType>("secondary");
  const [sourceDate, setSourceDate] = useState("");
  const [consent, setConsent] = useState<Consent>(NO_CONSENT);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<SourceType | "all">("all");

  const full = r.qEvidence.length >= LIMITS.evidencePerQuestion;

  async function add() {
    setErr("");
    if (!r.active) return;
    if (!consent.lawful || !consent.consented || !consent.noPersonal) return setErr("Confirm all three points before adding the item.");
    if (title.trim().length < 3) return setErr("Give the item a short title.");
    if (kind === "url" && !/^https?:\/\/[^\s]+\.[^\s]+/.test(url.trim())) return setErr("Enter a full link starting with http:// or https://.");
    if (kind === "note" && note.trim().length < 20) return setErr("Write the note in at least 20 characters.");
    if (kind === "file" && !file) return setErr("Choose a file.");
    if (file && kind === "file" && file.size > LIMITS.fileBytes) return setErr(`Files up to ${bytesLabel(LIMITS.fileBytes)} are fingerprinted here.`);
    if (full) return setErr(`Up to ${LIMITS.evidencePerQuestion} items per question.`);
    setBusy(true);
    try {
      const base = { kind, title: title.trim().slice(0, LIMITS.titleChars), url: kind === "url" ? url.trim().slice(0, 600) : "", note: note.trim().slice(0, LIMITS.noteChars), sourceType, sourceDate };
      let sha = "";
      let text = "";
      let fileName = "";
      let fileSize = 0;
      let mime = "";
      if (kind === "file" && file) {
        const buf = await file.arrayBuffer();
        sha = await sha256Bytes(buf);
        fileName = file.name.slice(0, 120);
        fileSize = file.size;
        mime = file.type || "application/octet-stream";
        if ((TEXT_TYPES.test(mime) || /\.(txt|md|csv|json)$/i.test(file.name)) && file.size <= 2_000_000) text = new TextDecoder().decode(buf).slice(0, LIMITS.textChars);
      } else sha = await sha256Text(canonicalRecord(base));
      if (r.qEvidence.some((e) => e.sha256 === sha)) {
        setErr("This exact item is already in the library for this question.");
        return;
      }
      const item: Evidence = { ...base, id: newId(), questionId: r.active.id, text, fileName, fileSize, mime, sha256: sha, addedAt: Date.now(), consent };
      r.addEvidence(item);
      setTitle("");
      setUrl("");
      setNote("");
      setFile(null);
      setConsent(NO_CONSENT);
    } catch {
      setErr("The item could not be read in this browser.");
    } finally {
      setBusy(false);
    }
  }

  const shown = r.qEvidence.filter((e) => filter === "all" || e.sourceType === filter);

  return (
    <div>
      <ViewHead kicker="Evidence library" title="Evidence" lead="Links, notes and files with their source type and the date of the source itself. Every item gets a SHA-256 fingerprint computed in this browser; files are never uploaded." />
      <QuestionBar r={r} />
      {r.active && !ack ? (
        <div className="hq-card mb-6" data-testid="rules-needed">
          <p className="text-[14px] font-medium">Confirm the contribution rules first</p>
          <p className="mt-2 text-[12.5px] leading-[21px] text-muted">Only lawfully obtained material, consent from the people involved, and no personal data. Read and confirm the rules once in this browser.</p>
          <Link href="/report" className="hq-btn sm mt-4 w-fit">
            Read the contribution rules
          </Link>
        </div>
      ) : null}
      {r.active && ack ? (
        <form
          className="hq-card mb-8 flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void add();
          }}
          data-testid="evidence-form"
        >
          <div className="hq-tabs" role="tablist" aria-label="Kind of evidence">
            {(["url", "note", "file"] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={kind === k} className={kind === k ? "on" : ""} onClick={() => setKind(k)} data-testid={`kind-${k}`}>
                {k === "url" ? "Link" : k === "note" ? "Note" : "File"}
              </button>
            ))}
          </div>
          <div className="hq-grid2">
            <label className="hq-field">
              Title
              <input className="hq-input" value={title} maxLength={LIMITS.titleChars} onChange={(e) => setTitle(e.target.value)} data-testid="ev-title" />
            </label>
            {kind === "url" ? (
              <label className="hq-field">
                Link
                <input className="hq-input" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" data-testid="ev-url" />
              </label>
            ) : kind === "file" ? (
              <label className="hq-field">
                File (hashed here, not uploaded)
                <input className="hq-input" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} data-testid="ev-file" />
              </label>
            ) : (
              <span />
            )}
            <label className="hq-field">
              Source type
              <select className="hq-select" value={sourceType} onChange={(e) => setSourceType(e.target.value as SourceType)}>
                {SOURCE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="hq-field">
              Date of the source
              <input className="hq-input" type="date" value={sourceDate} onChange={(e) => setSourceDate(e.target.value)} />
            </label>
          </div>
          <label className="hq-field">
            {kind === "note" ? "Note: what you observed, as facts" : "Summary or key passage (the assistant reads this text)"}
            <textarea className="hq-textarea" value={note} maxLength={LIMITS.noteChars} onChange={(e) => setNote(e.target.value)} data-testid="ev-note" />
            <span className="text-[11px] text-muted">
              {note.length} / {LIMITS.noteChars.toLocaleString("en-US")} · Keep names, contact details and faces out.
            </span>
          </label>
          <fieldset className="flex flex-col gap-2 rounded-[8px] bg-[#f4f7f0] p-4">
            <legend className="sr-only">Confirmations</legend>
            <label className="hq-check">
              <input type="checkbox" checked={consent.lawful} onChange={(e) => setConsent({ ...consent, lawful: e.target.checked })} data-testid="c-lawful" />I obtained this lawfully and may use it.
            </label>
            <label className="hq-check">
              <input type="checkbox" checked={consent.consented} onChange={(e) => setConsent({ ...consent, consented: e.target.checked })} data-testid="c-consent" />
              People involved agreed to its use, or nothing in it identifies anyone.
            </label>
            <label className="hq-check">
              <input type="checkbox" checked={consent.noPersonal} onChange={(e) => setConsent({ ...consent, noPersonal: e.target.checked })} data-testid="c-personal" />
              It contains no personal data such as names, contact details or ID numbers.
            </label>
          </fieldset>
          {err ? <p className="hq-alert">{err}</p> : null}
          <button type="submit" className="hq-btn sm w-fit" disabled={busy} data-testid="ev-submit">
            {busy ? "Fingerprinting…" : "Fingerprint and add"} <PlusIcon size={14} />
          </button>
        </form>
      ) : null}

      {r.active ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="hq-tabs">
              <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>
                All types
              </button>
              {SOURCE_TYPES.map((t) => (
                <button key={t.id} type="button" className={filter === t.id ? "on" : ""} onClick={() => setFilter(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>
            <Link href="/platform?view=chain" className="text-[12px] underline">
              Stamp fingerprints on chain
            </Link>
          </div>
          {shown.length === 0 ? (
            <Empty title="No evidence yet">Add a link, a note or a file above. Each one is fingerprinted before it is saved.</Empty>
          ) : (
            <ul className="flex flex-col gap-3" data-testid="evidence-list">
              {shown.map((e) => (
                <li key={e.id} className="hq-card">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="hq-pill">{SOURCE_TYPES.find((t) => t.id === e.sourceType)?.label}</span>
                        <span className="hq-pill">{e.kind === "url" ? "Link" : e.kind === "file" ? "File" : "Note"}</span>
                        <span className="text-[11px] text-muted">{e.sourceDate || "date unknown"}</span>
                      </div>
                      <h3 className="mt-2 text-[14.5px] font-medium">{e.title}</h3>
                      {e.url ? (
                        <a className="mt-1 block truncate text-[12px] text-muted underline" href={e.url} target="_blank" rel="noreferrer nofollow">
                          {e.url}
                        </a>
                      ) : null}
                      {e.fileName ? (
                        <p className="mt-1 text-[12px] text-muted">
                          {e.fileName} · {bytesLabel(e.fileSize)} {e.text ? "· text read for the assistant" : "· not readable as text"}
                        </p>
                      ) : null}
                      {e.note ? <p className="mt-2 line-clamp-3 text-[12.5px] leading-[20px] text-[var(--ink-2)]">{e.note}</p> : null}
                      <p className="hq-code mt-3 text-muted" title={e.sha256}>
                        SHA-256 {short(e.sha256, 14)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="hq-btn sm line"
                      onClick={() => {
                        if (window.confirm("Remove this item from this browser? Findings that cite it lose the link.")) r.removeEvidence(e.id);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </div>
  );
}
