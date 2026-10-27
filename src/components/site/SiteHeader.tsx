"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BRAND } from "@/config/brand";
import { ASSETS } from "@/config/assets";
import { CaPill } from "@/components/site/CopyCa";
import { ArrowUpRight, CloseIcon, MenuIcon } from "@/components/site/Icons";
import { LiveStatus } from "@/components/site/LiveStatus";
import { HOME_NAV } from "@/components/site/nav";
import { NavWallet } from "@/components/wallet/WalletButton";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[60] focus:bg-[var(--paper)] focus:p-3">
        Skip to content
      </a>
      <header className="hq-nav" data-testid="site-header">
        <Link href="/" className="hq-nav-logo" aria-label={`${BRAND.name} home`}>
          <img src={ASSETS.wordmark} width={ASSETS.wordmarkSize.w} height={ASSETS.wordmarkSize.h} alt={BRAND.name} className="h-[24px] w-auto max-[767px]:h-[21px]" />
        </Link>
        <LiveStatus />
        <nav className="hq-nav-links" aria-label="Sections">
          {HOME_NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hq-nav-tools">
          <CaPill />
          <CaPill compact />
          <NavWallet />
        </div>
        <Link href="/platform" className="hq-nav-launch" data-testid="nav-launch">
          <span>Launch app</span>
          <ArrowUpRight size={16} />
        </Link>
        <button type="button" className="hq-nav-burger" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)} data-testid="nav-burger">
          {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
        </button>
      </header>
      {open ? (
        <div className="hq-drawer" data-testid="nav-drawer">
          {HOME_NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
          <Link href="/token-policy" onClick={() => setOpen(false)}>
            {BRAND.symbol} token
          </Link>
          <Link href="/report" onClick={() => setOpen(false)}>
            Contribute responsibly
          </Link>
        </div>
      ) : null}
    </>
  );
}
