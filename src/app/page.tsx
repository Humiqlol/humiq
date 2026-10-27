import Link from "next/link";
import { BRAND, CHAIN, LAUNCHPAD, TOKEN, buyUrl } from "@/config/brand";
import { ASSETS } from "@/config/assets";
import { CONTRACT_NAMES } from "@/config/contracts";
import { Shell } from "@/components/site/Page";
import { CaBlock } from "@/components/site/CopyCa";
import { ArrowDown, ArrowRight, ArrowUpRight, CheckIcon, PlusIcon } from "@/components/site/Icons";
import { Reveal } from "@/components/site/Reveal";
import { LiveStrip } from "@/components/home/LiveStrip";
import { Faq } from "@/components/home/Faq";
import { JsonLd } from "@/components/JsonLd";
import { faqs } from "@/content/faq";
import { USE_CASES } from "@/content/useCases";
import { appLd, faqLd } from "@/lib/seo";

const MODULES = [
  {
    kicker: "Research hub",
    title: "Questions with a scope",
    body: "Write the question you want answered, what counts as in scope, and what must stay out. Every piece of evidence and every finding hangs off one question.",
    tags: ["Scope", "Limits", "Status"],
    href: "/platform?view=questions",
  },
  {
    kicker: "Evidence library",
    title: "Sources you can fingerprint",
    body: "Links, notes and files, each with a source type and the date of the source itself. Files are hashed with SHA-256 in your browser and never uploaded.",
    tags: ["SHA-256", "Source type", "Source date"],
    href: "/platform?view=evidence",
  },
  {
    kicker: "Research assistant",
    title: "Grouping, quoting, comparing",
    body: "The assistant groups your evidence into themes and drafts findings that quote it. It flags when items disagree on a figure. It never adds a fact of its own.",
    tags: ["Themes", "Quotes", "Conflicts"],
    href: "/platform?view=assistant",
  },
  {
    kicker: "Human verification",
    title: "A person decides",
    body: "Each finding gets a checklist and a verdict from a human: sources opened, quote matches, dates checked, nothing personal exposed. Only then does it go into a brief.",
    tags: ["Checklist", "Verdict", "Sign-off"],
    href: "/platform?view=verify",
  },
];

const METHOD = [
  { t: "Frame the question.", d: "Write what you want to know, the scope that counts and the limits nobody should cross. A clear question keeps the evidence focused." },
  { t: "Attach lawful evidence.", d: "Add links, notes and files you may use, each confirmed as lawfully obtained and consented where people are involved. Files are fingerprinted locally." },
  { t: "Draft with the assistant, decide as a person.", d: "Themes and quoted findings come from your evidence only. You keep, edit or drop each one and review it against its sources." },
  { t: `Record the brief on ${CHAIN.name}.`, d: `Anchor the brief's fingerprint from your wallet in ${CONTRACT_NAMES.book}. A second person can add a sign-off with their own verdict. Anyone can check both.` },
];

const CONTROLS = [
  { t: "Local-first workspace", s: "Questions, evidence and reviews stay in this browser.", more: "There is no account and no upload. Clearing the browser's site data removes the workspace, so export briefs you want to keep." },
  { t: "Fingerprints only on chain", s: "The contract stores 32-byte hashes, counts and verdict numbers.", more: "No document, file, note or name is ever written to the chain. A fingerprint cannot be turned back into the file it came from." },
  { t: "Consent before every item", s: "Adding evidence asks for three confirmations.", more: "Lawfully obtained; consent from the people involved; no personal data in what you add. Without all three, the item is not saved." },
  { t: "No personal data on chain", s: "Stamping warns before short text is hashed.", more: "A short note can be guessed from its fingerprint by trying candidates. The workspace stamps files and records, and reminds you to keep names and contact details out of them." },
];

const STAGES = [
  { c: "V0", t: "Draft", d: "A question with evidence attached. Findings may still be missing their sources." },
  { c: "V1", t: "Sourced", d: "Every finding cites at least one evidence item from the library." },
  { c: "V2", t: "Self-checked", d: "The author worked through the checklist for each finding and gave a verdict." },
  { c: "V3", t: "Anchored", d: `The brief's fingerprint and evidence root are recorded on ${CHAIN.name}.` },
  { c: "V4", t: "Signed off", d: "A different wallet recorded its own verdict on the anchored brief." },
];

export default function Home() {
  const items = faqs();
  const a = ASSETS.art;
  return (
    <Shell>
      <JsonLd data={[appLd, faqLd(items)]} />

      {/* hero */}
      <section className="hq-hero" aria-labelledby="hero-title">
        <div className="hq-hero-word">
          <div className="flex justify-between">
            <span className="hq-kicker">Human insight network</span>
            <span className="hq-kicker">Est. 2026 / 10</span>
          </div>
          <h1 id="hero-title">
            {BRAND.name}
            <span className="hq-period">.</span>
          </h1>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <p className="text-[13px] text-[var(--ink-2)]">
              {BRAND.slogan} <span className="text-muted">{BRAND.tagline}</span>
            </p>
            <div className="flex gap-6 text-[12px]">
              <a href={buyUrl()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                {LAUNCHPAD.name.toLowerCase()} / {BRAND.ticker} <ArrowUpRight size={12} />
              </a>
              <a href={BRAND.x} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline">
                X / {BRAND.xHandle} <ArrowUpRight size={12} />
              </a>
            </div>
          </div>
        </div>
        <div className="hq-hero-art">
          <img src={a.heroLens.src} width={a.heroLens.w} height={a.heroLens.h} alt={a.heroLens.alt} fetchPriority="high" />
        </div>
        <div className="hq-hero-row col-span-full">
          <div className="hq-hero-print">
            <img className="hq-cover" src={a.heroPrint.src} width={a.heroPrint.w} height={a.heroPrint.h} alt={a.heroPrint.alt} />
            <span className="hq-ripple" style={{ left: "50%", top: "52%" }} aria-hidden="true" />
            <span aria-hidden="true">
              Proof<span className="hq-period">.</span>
            </span>
          </div>
          <div className="hq-hero-card dark">
            <span className="hq-kicker !text-[#9aa192]">Beyond the guesswork.</span>
            <h2>Research you can trace back to its sources.</h2>
            <p className="mt-8 text-[13px] leading-6 text-[#c9cdbf]">
              Evidence first.
              <br />
              Findings that quote it.
              <br />
              A person who checks them.
              <br />A record anyone can verify.
            </p>
            <Link href="/platform?view=questions" className="go">
              Open a research question <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="hq-hero-card mint">
            <span className="hq-kicker !text-[var(--mint-ink)]">Built for evidence.</span>
            <h2>Turning what people know into briefs others can check.</h2>
            <p className="mt-5 text-[13px] leading-[22px] text-[#3c5a46]">For analysts, editors, researchers and community groups who need their conclusions to hold up.</p>
            <div className="mt-6 flex flex-col gap-1 font-mono text-[8px] tracking-[1.2px] uppercase">
              <span>Editors & fact-checkers</span>
              <span>Analysts & researchers</span>
              <span>AI & data teams</span>
            </div>
            <Link href="/report" className="go">
              Contribute evidence responsibly <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* about */}
      <section id="about" className="hq-section">
        <div className="hq-about">
          <div className="relative hidden pt-6 lg:block">
            <img className="hq-spin-slow" src={a.network.src} width={260} height={260} alt={a.network.alt} />
          </div>
          <Reveal>
            <h2>
              Close the gap between a hunch and a finding.
              <br />
              <span className="text-muted">Keep the people who checked it in the record.</span>
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <p className="hq-prose">
                Most research ends as a document full of claims and a folder of sources that nobody can line up later. Was that figure from the March report or the June one? Did anyone actually open the link? {BRAND.name} keeps every finding tied to the evidence it rests on.
              </p>
              <p className="hq-prose">
                {BRAND.name} is a workspace for research questions, evidence and human review on {BRAND.chainName}. Files are fingerprinted in your browser, an assistant drafts findings that quote your sources, and a person decides. The final brief can be anchored on chain so any copy can be checked against it.
              </p>
            </div>
            <Link href="/platform" className="hq-kicker mt-14 inline-flex items-center gap-12 border-b border-[var(--ink)] pb-2 !text-[var(--ink)]">
              Explore the workspace <ArrowDown size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* modules */}
      <section id="workspace" className="hq-modules" aria-labelledby="modules-title">
        <div className="hq-modules-lead">
          <img src={a.frames.src} width={a.frames.w} height={a.frames.h} alt="" aria-hidden="true" className="pointer-events-none absolute right-0 bottom-0 hidden h-[86%] w-auto opacity-80 lg:block" />
          <h2 id="modules-title">
            Where evidence
            <br />
            <span>matters.</span>
          </h2>
          <p className="relative mt-10 text-[15px] leading-[27px]">
            One question at a time.
            <br />
            Every source fingerprinted.
            <br />
            Every finding reviewed by a person.
          </p>
          <Link href="/platform" className="relative mt-10 inline-flex w-[150px] items-center justify-between border-b border-[var(--mint-ink)] pb-3 text-[13px]">
            Open <ArrowUpRight size={14} />
          </Link>
        </div>
        <div>
          {MODULES.map((m, i) => (
            <Link key={m.title} href={m.href} className={`hq-module ${i === 3 ? "on" : ""}`}>
              <span className="hq-num pt-[3px]">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <span className="hq-kicker">{m.kicker}</span>
                <h3>{m.title}</h3>
                <p className="text-[12px] leading-[21px] text-muted">{m.body}</p>
                <div className="hq-tags">
                  {m.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
              <ArrowUpRight size={16} />
            </Link>
          ))}
        </div>
      </section>

      {/* use cases */}
      <section id="use-cases" className="hq-section">
        <p className="hq-kicker">[03 — Use cases]</p>
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_440px] lg:items-end">
          <h2 className="hq-h2 !text-[clamp(32px,3.6vw,51.84px)] !leading-[1.2]">
            When the answer depends on sources,
            <br />
            <span className="text-muted">show the sources with the answer.</span>
          </h2>
          <p className="hq-prose">From a claim that spreads overnight to a dataset whose origin someone will ask about next year. Four short stories of how a scoped question and checked evidence become a brief.</p>
        </div>
        <div className="hq-cases">
          {USE_CASES.map((u, i) => {
            const art = ASSETS.cases[u.slug];
            return (
              <Reveal key={u.slug} delay={i * 80}>
                <Link href={`/use-cases/${u.slug}`} className="hq-case h-full">
                  <div className="pic">
                    <img className="hq-cover" src={art.src} width={art.w} height={art.h} alt={art.alt} loading="lazy" />
                  </div>
                  <span className="hq-kicker mt-6 !text-[8px]">{u.kicker}</span>
                  <h3>{u.title}</h3>
                  <p className="mt-4 mb-8 text-[12px] leading-[22px] text-muted">{u.teaser}</p>
                  <span className="more">
                    Read the story <ArrowUpRight size={14} />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* question band */}
      <section className="hq-forest">
        <div className="hq-band">
          <div className="pt-12">
            <h2>
              When a decision needs evidence,
              <br />
              start with a question.
            </h2>
            <p className="mt-6 max-w-[480px] text-[14px] leading-[27px] text-[#c9cdbf]">Write the question, the scope and the limits. Attach what you lawfully hold. Let the assistant sort, and review every finding yourself.</p>
            <div className="mt-10 flex flex-wrap items-center gap-7">
              <Link href="/platform?view=questions" className="hq-btn mint">
                Start a research question <ArrowUpRight size={18} />
              </Link>
              <Link href="/report" className="hq-link text-[#e7ebe0]">
                Read the contribution rules <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="pt-12">
            <ol className="hq-steps">
              <li>
                <span className="hq-num !text-[#9aa192]">01</span>
                <div>
                  <h3>Say exactly what you need to know</h3>
                  <p>Question, scope, and a line on what must not be collected.</p>
                </div>
              </li>
              <li>
                <span className="hq-num !text-[#9aa192]">02</span>
                <div>
                  <h3>Collect evidence with its context</h3>
                  <p>Source type, source date and a fingerprint for every item.</p>
                </div>
              </li>
              <li>
                <span className="hq-num !text-[#9aa192]">03</span>
                <div>
                  <h3>Review, export, record</h3>
                  <p>Checklist per finding, a Markdown brief, and an optional on-chain anchor.</p>
                </div>
              </li>
            </ol>
            <p className="hq-note text-[#c9cdbf]">Runs in your browser · No account · Wallet only to record on chain</p>
          </div>
        </div>
      </section>

      {/* method + token */}
      <section id="method" className="hq-section">
        <div className="hq-split">
          <div>
            <p className="hq-kicker">[04 — The method]</p>
            <h2 className="mt-12 text-[clamp(34px,3.5vw,50.4px)] leading-[1.5] font-medium tracking-[-0.048em]">
              Clear questions.
              <br />
              Checkable evidence.
              <br />
              <span className="text-[#8c9385]">Recorded sign-offs.</span>
            </h2>
            <p className="hq-prose mt-8">
              From the first question to a reviewed brief.
              <br />
              One path for every piece of research.
            </p>
          </div>
          <div>
            <ol className="hq-steps check">
              {METHOD.map((m, i) => (
                <Reveal as="li" key={m.t}>
                  <span className="hq-num pt-[4px]">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{m.t}</h3>
                    <p className="text-muted !opacity-100">{m.d}</p>
                  </div>
                  <CheckIcon size={15} className="mt-1 text-[var(--faint)]" />
                </Reveal>
              ))}
            </ol>
            <div className="hq-token">
              <p className="hq-kicker">{BRAND.ticker} token</p>
              <p className="mt-3 text-[11px] text-muted">The project token on {CHAIN.name}. Its uses are planned, not live.</p>
              <p className="mt-3 text-[14px] leading-[23px] text-muted">
                Planned uses are research credits, premium workspace access and API access, once those services exist. Today it unlocks nothing; every feature here works without it. Price, liquidity and value are not guaranteed, and you can lose everything you put in.{" "}
                <Link href="/token-policy" className="hq-textlink text-fg">
                  See the token use and risk notice
                </Link>
              </p>
              <div className="hq-token-row block">
                <CaBlock label={`${BRAND.ticker} token CA`} />
              </div>
              <div className="mt-5 flex flex-wrap gap-4">
                <a href={buyUrl()} target="_blank" rel="noreferrer" className="hq-btn sm" data-testid="home-buy">
                  {TOKEN.isLive ? `Buy on ${LAUNCHPAD.name}` : `At launch on ${LAUNCHPAD.name}`} <ArrowUpRight size={14} />
                </a>
              </div>
              <LiveStrip />
            </div>
          </div>
        </div>
      </section>

      {/* briefs */}
      <section id="briefs" className="hq-section border-t border-[var(--line-strong)] !py-[clamp(48px,5.5vw,80px)]">
        <div className="hq-split items-center">
          <div>
            <p className="hq-kicker">Intelligence briefs</p>
            <h2 className="mt-10 text-[clamp(32px,4.2vw,60.48px)] leading-[1.2] font-medium tracking-[-0.055em]">
              Findings become a brief.
              <br />
              The brief keeps its proof.
            </h2>
            <p className="mt-8 max-w-[520px] text-[15px] leading-[28px] text-muted">
              Export a Markdown brief with numbered findings, a reference list with every fingerprint, and the human verdicts. Print it to PDF from the same view. Anchor its fingerprint so a reader can confirm a copy has not been edited since.
            </p>
            <div className="mt-6 flex gap-3 text-[11px] text-muted">
              <span className="hq-pill">Markdown</span>
              <span className="hq-pill">Print to PDF</span>
              <span className="hq-pill">keccak-256</span>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-7">
              <Link href="/platform?view=briefs" className="hq-btn">
                Build a brief <ArrowUpRight size={18} />
              </Link>
              <Link href="/platform?view=chain" className="hq-link">
                Verify a brief <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="hq-flow">
            <div className="hq-flow-head">
              <span className="hq-kicker !text-[var(--mint-ink)]">Export</span>
              <ArrowRight size={14} />
              <span className="hq-kicker !text-[var(--mint-ink)]">Anchor</span>
              <ArrowRight size={14} />
              <span className="hq-kicker !text-[var(--mint-ink)]">Sign-off</span>
            </div>
            <ol className="hq-steps">
              <li>
                <span className="hq-num !text-[var(--mint-ink)]">01</span>
                <div>
                  <h3>Export the brief</h3>
                  <p>Only evidence the findings cite goes into the reference list, numbered in order of first citation.</p>
                </div>
              </li>
              <li>
                <span className="hq-num !text-[var(--mint-ink)]">02</span>
                <div>
                  <h3>Anchor its fingerprint</h3>
                  <p>One transaction stores the brief hash, the evidence root and two counts. Before the contract is deployed, a wallet signature is kept locally instead.</p>
                </div>
              </li>
              <li>
                <span className="hq-num !text-[var(--mint-ink)]">03</span>
                <div>
                  <h3>Collect an independent verdict</h3>
                  <p>A reviewer loads the file, confirms it matches the chain, and records supported, needs work or not supported.</p>
                </div>
              </li>
            </ol>
            <p className="mt-6 text-[10.5px]">An anchor proves a brief existed unchanged at a block. It does not prove the brief is right.</p>
          </div>
        </div>
      </section>

      {/* protection */}
      <section id="protection" className="hq-dark">
        <div className="hq-protect">
          <div>
            <p className="hq-kicker !text-[#9aa192]">[05 — Contributor protection]</p>
            <h2 className="mt-12">
              Contributors, protected.
              <br />
              <span className="text-[var(--sage-light)]">Evidence, made traceable.</span>
            </h2>
            <p className="mt-8 max-w-[400px] text-[12.5px] leading-[24px] text-[#bdc6b4]">
              Your workspace lives in your browser. The chain only ever sees fingerprints and counts. Everything you add is confirmed as lawful and consented first.
            </p>
            <Link href="/report" className="mt-10 inline-flex items-center gap-12 border-b border-[#6c7568] pb-2 text-[12px]">
              Read the contribution rules <ArrowUpRight size={14} />
            </Link>
          </div>
          <div>
            <div className="flex justify-between border-b border-[#3a3c38] pb-8">
              <span className="hq-kicker !text-[#7f8878]">How this version handles your material</span>
              <span className="hq-kicker !text-[#7f8878]">04 controls</span>
            </div>
            {CONTROLS.map((c, i) => (
              <details key={c.t} className="hq-control" data-testid="control">
                <summary>
                  <span className="hq-num !text-[#7f8878] pt-[3px]">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <h3>{c.t}</h3>
                    <span className="mt-2 block text-[11px] text-[#9aa192]">{c.s}</span>
                  </span>
                  <PlusIcon size={16} className="plus text-[var(--sage-light)]" />
                </summary>
                <p className="more">{c.more}</p>
              </details>
            ))}
            <details className="hq-control">
              <summary>
                <span />
                <span className="text-[11px] text-[#bdc6b4]">What this version does not do</span>
                <PlusIcon size={14} className="plus" />
              </summary>
              <p className="more">
                It does not host files, run accounts, match contributors with requesters or pay anyone. It does not check identities. The contributor network and rewards are planned features, and they will only come with rules that keep contributions lawful and consented.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* contributor band */}
      <section className="hq-mint">
        <div className="hq-band">
          <div className="pt-12">
            <h2>
              What you know firsthand,
              <br />
              someone else&apos;s firmer ground.
            </h2>
            <p className="mt-6 max-w-[480px] text-[14px] leading-[27px] text-[#3c5a46]">Observations, records and documents you may share can settle a question. Add them with their context, keep people out of them, and let the review decide what they support.</p>
            <div className="mt-10 flex flex-wrap items-center gap-7">
              <Link href="/report" className="hq-btn forest">
                Contribute evidence <ArrowUpRight size={18} />
              </Link>
              <Link href="/platform?view=evidence" className="hq-link">
                Open the evidence library <ArrowRight size={14} />
              </Link>
            </div>
          </div>
          <div className="pt-12">
            <ol className="hq-steps">
              <li>
                <span className="hq-num !text-[var(--mint-ink)]">01</span>
                <div>
                  <h3>Check that it is yours to share</h3>
                  <p>Lawfully obtained, consent from the people involved, no personal data.</p>
                </div>
              </li>
              <li>
                <span className="hq-num !text-[var(--mint-ink)]">02</span>
                <div>
                  <h3>Add it with its context</h3>
                  <p>Where it comes from, when the source was dated, and what it shows.</p>
                </div>
              </li>
              <li>
                <span className="hq-num !text-[var(--mint-ink)]">03</span>
                <div>
                  <h3>Stamp the fingerprint if you want a dated record</h3>
                  <p>Up to thirty-two fingerprints per transaction, never the file itself.</p>
                </div>
              </li>
            </ol>
            <p className="hq-note">Contributor network and rewards are planned · Nothing here pays or promises a reward</p>
          </div>
        </div>
      </section>

      {/* stages + faq */}
      <section className="hq-section">
        <div className="grid gap-10 lg:grid-cols-[1fr_520px] lg:items-start">
          <h2 className="text-[clamp(36px,4.8vw,69.12px)] leading-[1.08] font-semibold tracking-[-0.065em]">
            Trust is shown.
            <br />
            <span className="text-muted">Not assumed.</span>
          </h2>
          <div>
            <p className="text-[15px] leading-[27px]">Verification stages describe what has been done to a brief.</p>
            <p className="mt-4 text-[15px] leading-[27px] text-[var(--ink-2)]">Start with a draft, and move up only through steps anyone can check: sources cited, checklist done, fingerprint anchored, a second verdict recorded.</p>
            <Link href="/platform?view=verify" className="hq-link mt-8">
              Open the review desk <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="hq-stages">
          {STAGES.map((s, i) => (
            <Reveal key={s.c} delay={i * 60} className={`hq-stage ${i === 4 ? "top" : ""}`}>
              <code>{s.c}</code>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </Reveal>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-muted">Stages are not identity checks and not a guarantee that a brief is correct.</p>
        <Faq items={items} />
      </section>

      {/* closing */}
      <section className="hq-section hq-close border-t border-[var(--line-strong)]">
        <div className="flex justify-between">
          <span className="hq-kicker">Human insight. Shared evidence.</span>
          <span className="hq-kicker">
            {BRAND.name} / {BRAND.ticker}
          </span>
        </div>
        <h2 className="mt-16">
          Check more.
          <br />
          <span>Assume less.</span>
        </h2>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-8">
          <p className="text-[13px] leading-[26px] text-muted">
            Ask the question you need answered,
            <br />
            or bring the evidence you can share.
          </p>
          <Link href="/platform" className="hq-launch-box" data-testid="closing-launch">
            <span className="flex items-center gap-4">
              <img src={ASSETS.mark} width={ASSETS.markSize.w} height={ASSETS.markSize.h} alt="" className="h-[22px] w-auto" /> Launch app
            </span>
            <ArrowUpRight size={22} />
          </Link>
        </div>
      </section>
    </Shell>
  );
}
