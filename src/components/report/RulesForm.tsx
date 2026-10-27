"use client";

import { useState } from "react";
import { useLocalStore } from "@/components/wallet/useLocalStore";
import { storageKey } from "@/config/storage";
import { BRAND } from "@/config/brand";
import { CheckIcon, CopyIcon } from "@/components/site/Icons";

export const RULES_KEY = storageKey("rules", "v1");
export type RulesAck = { at: number } | null;

const POINTS = [
  "I only add material I obtained lawfully and am allowed to use.",
  "Where people are involved, they agreed to their information being used, or nothing identifies them.",
  "I keep personal data (names, contact details, ID numbers, faces, exact home locations) out of what I add and out of anything I stamp on chain.",
  "I do not add secret, classified or confidential material that I am not authorised to share, and nothing obtained by surveillance or deception.",
  "I understand that on-chain records are public and permanent, and that they hold only fingerprints.",
];

/** One-time acknowledgement of the contribution rules, kept in this browser. The evidence library asks for it. */
export function RulesForm() {
  const [ack, setAck] = useLocalStore<RulesAck>(RULES_KEY, null);
  const [ticks, setTicks] = useState<boolean[]>(POINTS.map(() => false));
  const all = ticks.every(Boolean);
  if (ack)
    return (
      <div className="hq-ok mt-6" data-testid="rules-ack">
        You confirmed these rules in this browser on {new Date(ack.at).toLocaleDateString("en-GB")}. The evidence library still asks for the three confirmations on every item.{" "}
        <button type="button" className="underline" onClick={() => setAck(null)}>
          Withdraw
        </button>
      </div>
    );
  return (
    <form
      className="mt-6 flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (all) setAck({ at: Date.now() });
      }}
      data-testid="rules-form"
    >
      {POINTS.map((p, i) => (
        <label key={p} className="hq-check">
          <input type="checkbox" checked={ticks[i]} onChange={(e) => setTicks((t) => t.map((v, k) => (k === i ? e.target.checked : v)))} />
          {p}
        </label>
      ))}
      <button type="submit" className="hq-btn sm mt-3 w-fit" disabled={!all} data-testid="rules-submit">
        I agree to contribute on these terms <CheckIcon size={14} />
      </button>
    </form>
  );
}

const CATEGORIES = ["Personal data in a shared brief", "Material that looks unlawfully obtained", "A record presented as ours that is not", "Something else"];

/** Builds a plain-text concern note to send to the project's X account. Nothing is sent from here. */
export function ConcernNote() {
  const [cat, setCat] = useState(CATEGORIES[0]);
  const [ref, setRef] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const note = `Concern for ${BRAND.name}\nCategory: ${cat}\nReference (brief id, tx or link): ${ref.trim() || "—"}\n\n${text.trim()}`;
  const ok = text.trim().length >= 20;
  return (
    <div className="mt-6 flex flex-col gap-4" data-testid="concern">
      <label className="hq-field">
        Category
        <select className="hq-select" value={cat} onChange={(e) => setCat(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="hq-field">
        Brief id, transaction hash or link
        <input className="hq-input" value={ref} maxLength={200} onChange={(e) => setRef(e.target.value)} />
      </label>
      <label className="hq-field">
        What is wrong, in facts (at least 20 characters, no personal data about yourself needed)
        <textarea className="hq-textarea" value={text} maxLength={3000} onChange={(e) => setText(e.target.value)} />
        <span className="text-[11px] text-muted">{text.length} / 3,000</span>
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          className="hq-btn sm"
          disabled={!ok}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(note);
              setCopied(true);
              setTimeout(() => setCopied(false), 1800);
            } catch {
              // clipboard refused; the note stays visible below
            }
          }}
        >
          {copied ? "Copied" : "Copy the note"} <CopyIcon size={14} />
        </button>
        <a className="hq-link" href={BRAND.x} target="_blank" rel="noreferrer">
          Send it to {BRAND.xHandle} on X
        </a>
      </div>
      {ok ? <pre className="hq-pre">{note}</pre> : null}
    </div>
  );
}
