"use client";

import { useEffect, useState } from "react";
import { useChain } from "@/components/providers/ChainProvider";
import { CHAIN } from "@/config/brand";

/** Navbar chip: the newest Robinhood Chain block read by the server, or the UTC clock while it loads. */
export function LiveStatus() {
  const { facts, failed } = useChain();
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString().slice(11, 16));
    tick();
    const t = window.setInterval(tick, 20_000);
    return () => window.clearInterval(t);
  }, []);
  const block = facts?.block;
  return (
    <span className="hq-nav-status" data-testid="nav-status" title={`${CHAIN.name} (chain id ${CHAIN.id})`}>
      <i className={block ? "live" : ""} aria-hidden="true" />
      {block ? `BLOCK ${block.toLocaleString("en-US")}` : failed ? "CHAIN UNREACHABLE" : `${now || "--:--"} UTC`}
    </span>
  );
}
