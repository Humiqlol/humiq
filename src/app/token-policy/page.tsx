import Link from "next/link";
import { BRAND, CHAIN, LAUNCHPAD, TOKEN, explorerAddress } from "@/config/brand";
import { CONTRACTS, CONTRACT_NAMES, bookLive } from "@/config/contracts";
import { Shell } from "@/components/site/Page";
import { CaBlock } from "@/components/site/CopyCa";
import { ArrowLeft, ShieldIcon } from "@/components/site/Icons";
import { JsonLd } from "@/components/JsonLd";
import { TokenFacts } from "@/components/token/TokenFacts";
import { Faq } from "@/components/home/Faq";
import { faqs } from "@/content/faq";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/token-policy",
  title: `${BRAND.name} (${BRAND.symbol}) Token`,
  description: `${BRAND.symbol} is the ${BRAND.name} token on ${BRAND.chainName}: contract address, supply read from chain, launch venue, planned uses and the risks to know first.`,
});

const SECTIONS = (live: boolean) => [
  {
    id: "role",
    t: `${BRAND.ticker} and the workspace`,
    p: [
      `${BRAND.symbol} is the project token of ${BRAND.name} on ${CHAIN.name}. The research workspace, the evidence library, the assistant, the review desk and the on-chain evidence book all work without it. Holding it gives no access level, no priority and no right to anything on this site today.`,
      `${CONTRACT_NAMES.book}, the contract that records brief anchors, sign-offs and evidence stamps, does not use the token at all. Recording costs only the network fee in ETH.`,
    ],
  },
  {
    id: "planned",
    t: "Planned uses (not live)",
    p: [
      "Research credits for hosted assistant runs, premium workspace access (shared team workspaces, longer history) and API access for teams that want to anchor briefs from their own tools. These are plans. None of them exists yet, their design may change, and none of them may ever ship.",
      "The contributor network and contributor rewards are also planned. They will only be considered with rules that keep every contribution lawful and consented. Nothing on this site pays, or promises to pay, anyone.",
    ],
  },
  {
    id: "no-promise",
    t: "What we do not promise",
    p: [
      `Holding ${BRAND.symbol} gives no ownership, no vote, no share of revenue, no interest and no claim to redeem it for anything. We make no promise about price, listings, liquidity, buybacks or burns. Nothing here is investment advice or an offer.`,
    ],
  },
  {
    id: "risks",
    t: "Price and trading risks",
    p: [
      "A token price can move sharply and can fall to zero. Thin trading can make it hard to sell, or sell only at a much worse price. Outages, security incidents and new rules can limit use or trading at any time.",
    ],
  },
  {
    id: "launch",
    t: `Launch on ${LAUNCHPAD.name}`,
    p: [
      live
        ? `${BRAND.symbol} launched on ${LAUNCHPAD.name}, the ${CHAIN.name} launchpad. Its terms, fees, price impact and slippage apply to every trade there. A link from this site is not a guarantee of execution or of safety.`
        : `${BRAND.symbol} has not launched yet. It will launch on ${LAUNCHPAD.name}, the ${CHAIN.name} launchpad, and the contract address will be published here, in the navbar and in the footer. Until then, any token presented as ${BRAND.symbol} is not ours.`,
    ],
  },
  {
    id: "address",
    t: "Addresses, wallets and code",
    p: [
      "Before you sign anything, check the network, the contract address, the recipient and the amount. Another contract that reuses the name or the ticker is a different asset. Wallet theft, wrong transfers and software faults can cause losses, and confirmed transactions cannot be reversed.",
      `${CONTRACT_NAMES.book} has no owner and cannot be paused or upgraded. That protects records from being changed, and it also means a mistake in the contract cannot be fixed in place. Its code has not been independently reviewed yet.`,
    ],
  },
  {
    id: "law",
    t: "Local rules and taxes",
    p: ["You are responsible for following the laws and tax rules where you live. Do not buy or use the token where that is not allowed."],
  },
  {
    id: "updates",
    t: "Network and updates to this notice",
    p: [`This notice covers ${CHAIN.name} (chain id ${CHAIN.id}) only. It may be updated as the project changes; the version on this page is the one that applies.`],
  },
];

export default function TokenPolicy() {
  const items = faqs().filter((f) => /\$|risk|anchored/i.test(f.q));
  const sections = SECTIONS(TOKEN.isLive);
  return (
    <Shell>
      <JsonLd data={[breadcrumbLd([{ name: "Token", path: "/token-policy" }]), faqLd(items)]} />
      <article className="hq-doc">
        <Link href="/" className="inline-flex items-center gap-3 text-[13px] underline underline-offset-4">
          <ArrowLeft size={14} /> Home
        </Link>
        <p className="hq-label mt-12">
          {BRAND.name} / {BRAND.ticker}
        </p>
        <h1 className="mt-4">
          {BRAND.name} ({BRAND.symbol}) token: use & risk notice
        </h1>
        <p className="mt-6 text-[13px] text-muted">Version 2026-10-27</p>
        <div className="hq-notice">
          <p className="flex items-center gap-3 text-[14px] font-semibold text-[var(--mint-ink)]">
            <ShieldIcon size={16} /> In short
          </p>
          <p className="mt-3 text-[14px] leading-[26px] text-[#3d4039]">
            {BRAND.symbol}&apos;s uses are planned, not live. Price, liquidity and value are not guaranteed, and you can lose everything you put in.
          </p>
          <div className="mt-5 border-t border-[var(--line-strong)] pt-4">
            <CaBlock label={`${BRAND.ticker} token CA`} />
          </div>
          <div className="mt-4">
            <p className="text-[12px] text-muted">{CONTRACT_NAMES.book}</p>
            {bookLive() ? (
              <a className="hq-code mt-1 block underline" href={explorerAddress(CONTRACTS.book)} target="_blank" rel="noreferrer">
                {CONTRACTS.book}
              </a>
            ) : (
              <p className="hq-code mt-1">Not deployed yet. Recording runs in practice mode until it is.</p>
            )}
          </div>
        </div>
        <TokenFacts />
        <nav className="mt-10 grid gap-x-10 gap-y-3 border-b border-[var(--line-strong)] pb-10 text-[13px] sm:grid-cols-2" aria-label="Sections">
          {sections.map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="underline underline-offset-4">
              {String(i + 1).padStart(2, "0")} {s.t}
            </a>
          ))}
        </nav>
        {sections.map((s, i) => (
          <section key={s.id} id={s.id}>
            <h2 className="flex gap-6">
              <span className="hq-num pt-2">{String(i + 1).padStart(2, "0")}</span>
              {s.t}
            </h2>
            {s.p.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </section>
        ))}
      </article>
      <section className="hq-section !pt-0">
        <Faq items={items} title="Token questions" lead="Short answers about the token, anchors and risk." />
      </section>
    </Shell>
  );
}
