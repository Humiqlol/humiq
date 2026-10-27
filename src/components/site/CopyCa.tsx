"use client";

import { useState } from "react";
import { BRAND, TOKEN, explorerToken, isAddress, shortAddress } from "@/config/brand";
import { ArrowUpRight, CheckIcon, CopyIcon } from "@/components/site/Icons";

/* Contract address of $HUMIQ from BRAND.ca. Until it is a real address every copy button says "At launch". */

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!isAddress(BRAND.ca)) return;
    try {
      await navigator.clipboard.writeText(BRAND.ca);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard refused; the address stays visible.
    }
  };
  return { copied, copy };
}

/** Navbar pill: "$HUMIQ 0x12…abcd [Copy]"; on narrow screens only the short "CA" button. */
export function CaPill({ compact = false }: { compact?: boolean }) {
  const { copied, copy } = useCopy();
  const live = TOKEN.isLive;
  return (
    <span className={`hq-ca ${compact ? "compact" : ""}`} data-testid={compact ? "ca-chip" : "ca-pill"}>
      {compact ? null : (
        <>
          <b>{BRAND.symbol}</b>
          <span>{live ? shortAddress(BRAND.ca, 4, 4) : "TBA"}</span>
        </>
      )}
      <button type="button" onClick={copy} disabled={!live} aria-label={live ? `Copy the ${BRAND.symbol} contract address` : `${BRAND.symbol} contract address: at launch`} title={live ? BRAND.ca : "The contract address is published at launch"}>
        {live && !compact ? copied ? <CheckIcon size={12} /> : <CopyIcon size={12} /> : null}
        {compact ? (live && copied ? "Copied" : "CA") : live ? (copied ? "Copied" : "Copy") : "At launch"}
      </button>
    </span>
  );
}

/** Full address row: label, address, Copy and View (home token block, footer, token page). */
export function CaBlock({ label = "Contract address", dark = false }: { label?: string; dark?: boolean }) {
  const { copied, copy } = useCopy();
  const live = TOKEN.isLive;
  return (
    <div data-testid="ca-block">
      <div className="flex items-center justify-between gap-3">
        <span className="hq-kicker">{label}</span>
        <span className="hq-kicker">Robinhood Chain</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <span className={`hq-code text-[11px] ${dark ? "" : "text-fg"}`} data-testid="ca-value">
          {live ? BRAND.ca : "Contract address coming soon"}
        </span>
        <span className="flex items-center gap-3">
          <button type="button" className="hq-mini" onClick={copy} disabled={!live} data-testid="ca-copy">
            {copied ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
            {live ? (copied ? "Copied" : "Copy") : "At launch"}
          </button>
          {live ? (
            <a className="hq-mini" href={explorerToken(BRAND.ca)} target="_blank" rel="noreferrer">
              View <ArrowUpRight size={12} />
            </a>
          ) : null}
        </span>
      </div>
    </div>
  );
}
