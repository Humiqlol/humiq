"use client";

import { useChain } from "@/components/providers/ChainProvider";
import { bookLive } from "@/config/contracts";

/** Four live readings from Robinhood Chain; dashes until the server answers or when a value is unknown. */
export function LiveStrip() {
  const { facts, failed } = useChain();
  const dash = "—";
  const cells: [string, string][] = [
    ["Latest block", facts?.block ? facts.block.toLocaleString("en-US") : dash],
    ["Gas price", facts?.gasGwei !== null && facts?.gasGwei !== undefined ? `${facts.gasGwei < 0.01 ? facts.gasGwei.toFixed(4) : facts.gasGwei.toFixed(3)} gwei` : dash],
    ["ETH / USD", facts?.ethUsd ? `$${facts.ethUsd.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : dash],
    ["Briefs anchored", bookLive() ? (facts?.book?.briefs ?? null) !== null ? String(facts?.book?.briefs) : dash : "At deploy"],
  ];
  return (
    <div>
      <div className="hq-live" data-testid="live-strip">
        {cells.map(([k, v]) => (
          <div key={k}>
            <span className="hq-kicker">{k}</span>
            <b>{v}</b>
          </div>
        ))}
      </div>
      <p className="hq-note text-muted">
        {failed ? "The chain could not be reached just now; values return on the next read." : "Read live from Robinhood Chain every 12 seconds. ETH / USD from the Chainlink feed on chain."}
      </p>
    </div>
  );
}
