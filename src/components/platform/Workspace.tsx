"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BRAND, CHAIN, LAUNCHPAD, buyUrl } from "@/config/brand";
import { ASSETS } from "@/config/assets";
import { ArrowLeft, ArrowUpRight, BookIcon, ClipboardIcon, CompassIcon, DocIcon, HashIcon, ShieldIcon, SparkIcon, StampIcon } from "@/components/site/Icons";
import { CaPill } from "@/components/site/CopyCa";
import { NavWallet } from "@/components/wallet/WalletButton";
import { useResearch } from "./store";
import { Overview } from "./views/Overview";
import { Questions } from "./views/Questions";
import { EvidenceView } from "./views/Evidence";
import { Assistant } from "./views/Assistant";
import { Verify } from "./views/Verify";
import { Briefs } from "./views/Briefs";
import { ChainView } from "./views/Chain";

export const VIEWS = [
  { id: "overview", label: "Overview", icon: CompassIcon, group: "Workspace" },
  { id: "questions", label: "Research hub", icon: BookIcon, group: "Workspace" },
  { id: "evidence", label: "Evidence library", icon: HashIcon, group: "Workspace" },
  { id: "assistant", label: "Research assistant", icon: SparkIcon, group: "Workspace" },
  { id: "verify", label: "Human verification", icon: ClipboardIcon, group: "Workspace" },
  { id: "briefs", label: "Intelligence briefs", icon: DocIcon, group: "Workspace" },
  { id: "chain", label: "Chain record", icon: StampIcon, group: "Record" },
] as const;
export type ViewId = (typeof VIEWS)[number]["id"];

export function Workspace() {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("view") ?? "overview";
  const view: ViewId = (VIEWS.some((v) => v.id === raw) ? raw : "overview") as ViewId;
  const r = useResearch();
  const go = (id: ViewId) => router.push(id === "overview" ? "/platform" : `/platform?view=${id}`, { scroll: false });
  const count: Partial<Record<ViewId, number>> = { questions: r.questions.length, evidence: r.qEvidence.length, verify: r.qClaims.length, briefs: r.qBriefs.length };
  const current = VIEWS.find((v) => v.id === view)!;

  return (
    <div className="hq-app" data-testid="workspace">
      <aside className="hq-side">
        <Link href="/" className="hq-side-brand">
          <img src={ASSETS.wordmarkLight} width={ASSETS.wordmarkSize.w} height={ASSETS.wordmarkSize.h} alt={BRAND.name} className="h-[28px] w-auto" />
        </Link>
        <p className="hq-side-sub hq-side-hide">HUMAN INSIGHT NETWORK</p>
        <Link href="/" className="hq-side-back hq-side-hide">
          <ArrowLeft size={13} /> About {BRAND.name}
        </Link>
        <div className="hq-side-groups">
        {(["Workspace", "Record"] as const).map((g) => (
          <div key={g}>
            <p className="hq-side-group">{g.toUpperCase()}</p>
            <nav className="hq-side-nav" aria-label={g}>
              {VIEWS.filter((v) => v.group === g).map((v) => (
                <button key={v.id} type="button" className={`hq-side-item ${view === v.id ? "on" : ""}`} onClick={() => go(v.id)} data-testid={`nav-${v.id}`} aria-current={view === v.id ? "page" : undefined}>
                  <v.icon size={17} />
                  {v.label}
                  {count[v.id] !== undefined ? <span className="count">{count[v.id]}</span> : null}
                </button>
              ))}
            </nav>
          </div>
        ))}
        </div>
        <Link href="/report" className="hq-side-hide mt-3 text-[10.5px] text-[var(--sage-light)] underline underline-offset-2">
          Contribution rules ↗
        </Link>
        <div className="hq-side-card mt-6">
          <div className="flex items-start justify-between gap-2">
            <b>
              Your evidence,
              <br />
              your browser.
            </b>
            <ShieldIcon size={18} className="text-[var(--mint)]" />
          </div>
          Nothing is uploaded. Only fingerprints reach the chain, and only when you send them.
        </div>
        <div className="hq-side-hide"><div className="mt-4 flex gap-5 px-1 text-[11px] text-[var(--mint)]">
          <a href={buyUrl()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
            {LAUNCHPAD.name.toLowerCase()} / {BRAND.ticker} <ArrowUpRight size={11} />
          </a>
          <a href={BRAND.x} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1">
            X <ArrowUpRight size={11} />
          </a>
        </div></div>
        <div className="hq-side-foot hq-side-hide">
          <span className="flex items-center gap-2">
            <span className="hq-dot" /> {CHAIN.name.toUpperCase()}
          </span>
          <span>v0.1</span>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="hq-topbar">
          <div className="hq-crumbs">
            <span>Workspace</span>
            <span aria-hidden="true">›</span>
            <b>{current.label}</b>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <CaPill />
            <CaPill compact />
            <NavWallet />
          </div>
        </header>
        <main className="hq-main" id="main-content">
          {view === "overview" ? <Overview r={r} go={go} /> : null}
          {view === "questions" ? <Questions r={r} go={go} /> : null}
          {view === "evidence" ? <EvidenceView r={r} /> : null}
          {view === "assistant" ? <Assistant r={r} go={go} /> : null}
          {view === "verify" ? <Verify r={r} /> : null}
          {view === "briefs" ? <Briefs r={r} /> : null}
          {view === "chain" ? <ChainView r={r} /> : null}
          <footer className="mt-16 flex flex-wrap justify-between gap-3 border-t border-[#e0e3d9] pt-5 text-[11px] text-muted">
            <span>
              © 2026 {BRAND.name} · {BRAND.slogan}
            </span>
            <span className="flex gap-4">
              <Link href="/terms" className="underline">
                Terms of use
              </Link>
              <Link href="/token-policy" className="underline">
                Token notice
              </Link>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
