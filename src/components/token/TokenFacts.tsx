"use client";

import { useChain } from "@/components/providers/ChainProvider";
import { BRAND, CHAIN, LAUNCHPAD, TOKEN, buyUrl, chartUrl } from "@/config/brand";
import { ArrowUpRight } from "@/components/site/Icons";

function supplyText(supply: string | null | undefined, decimals: number | null | undefined) {
  if (!supply || decimals === null || decimals === undefined) return null;
  return (BigInt(supply) / 10n ** BigInt(decimals)).toLocaleString("en-US");
}

/** Token facts read live from Robinhood Chain once the CA is set; dashes before that. */
export function TokenFacts() {
  const { facts } = useChain();
  const t = TOKEN.isLive ? facts?.token : null;
  const m = TOKEN.isLive ? facts?.market : null;
  const usd = (eth: number | undefined) => (eth !== undefined && facts?.ethUsd ? `$${(eth * facts.ethUsd).toLocaleString("en-US", { maximumFractionDigits: eth * facts.ethUsd < 1 ? 8 : 0 })}` : "—");
  const rows: [string, string][] = [
    ["Network", `${CHAIN.name} · chain id ${CHAIN.id}`],
    ["Status", TOKEN.isLive ? "Launched" : "Not launched yet"],
    ["Name / symbol on chain", t ? `${t.name ?? "—"} / ${t.symbol ?? "—"}` : "—"],
    ["Decimals", t?.decimals !== null && t?.decimals !== undefined ? String(t.decimals) : "—"],
    ["Total supply", supplyText(t?.supply, t?.decimals) ?? "—"],
    ["Price", m ? usd(m.priceEth) : "—"],
    ["Market cap", m ? usd(m.marketCapEth) : "—"],
    ["Holders", TOKEN.isLive && facts?.holders !== null && facts?.holders !== undefined ? facts.holders.toLocaleString("en-US") : "—"],
    ["Launch curve", m ? (m.graduated ? "Graduated to a DEX pool" : `${(m.progressBps / 100).toFixed(1)}% to graduation`) : "—"],
  ];
  return (
    <div className="mt-8" data-testid="token-facts">
      <p className="hq-kicker">{BRAND.symbol} · read from chain {TOKEN.isLive ? "" : "(at launch)"}</p>
      <dl className="mt-3 border-t border-[var(--line-strong)]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[minmax(0,40%)_1fr] gap-4 border-b border-[var(--line)] py-3 text-[13px]">
            <dt className="text-muted">{k}</dt>
            <dd className="min-w-0 break-words">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex flex-wrap gap-3">
        <a className="hq-btn sm" href={buyUrl()} target="_blank" rel="noreferrer" data-testid="token-buy">
          {TOKEN.isLive ? `Buy on ${LAUNCHPAD.name}` : `At launch on ${LAUNCHPAD.name}`} <ArrowUpRight size={14} />
        </a>
        {chartUrl(BRAND.ca) ? (
          <a className="hq-btn sm line" href={chartUrl(BRAND.ca)!} target="_blank" rel="noreferrer">
            Chart on DEXTools <ArrowUpRight size={14} />
          </a>
        ) : null}
      </div>
    </div>
  );
}
