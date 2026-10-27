import Link from "next/link";
import { BRAND, LAUNCHPAD, buyUrl, explorerAddress, hasGithub } from "@/config/brand";
import { ASSETS } from "@/config/assets";
import { CONTRACTS, CONTRACT_NAMES, bookLive } from "@/config/contracts";
import { CaBlock } from "@/components/site/CopyCa";
import { ArrowUpRight } from "@/components/site/Icons";

const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
    {children} <ArrowUpRight size={12} />
  </a>
);

export function SiteFooter() {
  return (
    <footer className="hq-footer" data-testid="site-footer">
      <Link href="/" className="flex items-center" aria-label={`${BRAND.name} home`}>
        <img src={ASSETS.wordmark} width={ASSETS.wordmarkSize.w} height={ASSETS.wordmarkSize.h} alt={BRAND.name} className="h-[34px] w-auto" />
      </Link>
      <div className="min-w-0">
        <p className="hq-kicker">
          Human insight network · {BRAND.tagline}
        </p>
        <p className="hq-kicker mt-1">© 2026 {BRAND.name}. An independent project on {BRAND.chainName}.</p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px]">
          <Ext href={buyUrl()}>{LAUNCHPAD.name.toLowerCase()} / {BRAND.ticker}</Ext>
          <Ext href={BRAND.x}>X / {BRAND.xHandle}</Ext>
          {hasGithub ? <Ext href={BRAND.github}>GitHub</Ext> : null}
          {bookLive() ? <Ext href={explorerAddress(CONTRACTS.book)}>{CONTRACT_NAMES.book}</Ext> : null}
        </div>
        <div className="mt-4 border-t border-[var(--line-strong)] pt-3">
          <CaBlock label={`${BRAND.ticker} token CA`} />
        </div>
        <nav className="hq-footer-links" aria-label="Legal and help">
          <Link href="/terms">Terms of use</Link>
          <Link href="/token-policy">{BRAND.ticker} use & risk notice</Link>
          <Link href="/report">Contribute responsibly</Link>
          <Link href="/use-cases/fact-checking">Use cases</Link>
        </nav>
      </div>
      <a href="#main-content" className="hq-kicker inline-flex items-center gap-3 justify-self-end text-fg max-[1023px]:justify-self-start">
        Back to top <ArrowUpRight size={14} />
      </a>
    </footer>
  );
}
