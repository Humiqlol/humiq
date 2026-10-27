import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { CONTRACT_NAMES } from "@/config/contracts";
import { Shell } from "@/components/site/Page";
import { ArrowLeft } from "@/components/site/Icons";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/terms",
  title: `Terms of use | ${BRAND.name}`,
  description: `Terms of use for ${BRAND.name}: a browser research workspace and an on-chain evidence book on ${BRAND.chainName}, provided as is, with your responsibilities spelled out.`,
});

const TERMS = [
  { h: "What this site is", p: `${BRAND.name} is a research workspace that runs in your browser plus a public contract on ${CHAIN.name}, ${CONTRACT_NAMES.book}. The site keeps no accounts and stores no files on a server. Using it does not create any client, employment or advisory relationship.` },
  { h: "Your content", p: "What you add to the workspace stays in your browser and remains yours. You are responsible for having the right to use it, for keeping personal data out of it, and for following the contribution rules. Exported briefs are yours to share or not." },
  { h: "The assistant", p: "The built-in assistant only quotes the evidence you attach. When the site operator enables an optional model, the excerpts you choose to send for one run go to that provider and are checked against your evidence on the way back. Assistant output is a draft, not advice, and a person must review it." },
  { h: "Records on chain", p: `Transactions you send to ${CONTRACT_NAMES.book} are public, permanent and paid for by your wallet. The contract has no owner: nobody can edit, hide or delete a record. An anchor or a sign-off proves that a wallet recorded a fingerprint or a verdict at a block. It does not prove that a brief is true, complete or lawful.` },
  { h: "Practice mode", p: "Until the contract is deployed, recording works in practice mode: your wallet signs a message and the signature is kept in this browser. Nothing is sent to the chain and nothing is published." },
  { h: "No warranty", p: "The site and the contract are provided as is, without warranties of any kind. The contract code has not been independently reviewed yet. Use it at your own risk and keep your own copies of anything that matters." },
  { h: "Acceptable use", p: "Do not use the site to collect information about people without their consent, to publish personal data, to harass anyone or to break any law. The contribution rules page lists what may and may not be added." },
  { h: "Token", p: `The ${BRAND.symbol} token is covered by its own use and risk notice. Nothing on this site is an offer, a solicitation or investment advice.` },
  { h: "Changes", p: "These terms may change as the project changes. The version on this page applies from the date shown." },
];

export default function Terms() {
  return (
    <Shell>
      <JsonLd data={breadcrumbLd([{ name: "Terms of use", path: "/terms" }])} />
      <article className="hq-doc">
        <Link href="/" className="inline-flex items-center gap-3 text-[13px] underline underline-offset-4">
          <ArrowLeft size={14} /> Home
        </Link>
        <p className="hq-label mt-12">{BRAND.name} / Terms</p>
        <h1 className="mt-4">Terms of use</h1>
        <p className="text-[13px] text-muted">Version 2026-10-27</p>
        {TERMS.map((t, i) => (
          <section key={t.h}>
            <h2 className="flex gap-6">
              <span className="hq-num pt-2">{String(i + 1).padStart(2, "0")}</span>
              {t.h}
            </h2>
            <p>{t.p}</p>
          </section>
        ))}
        <p className="mt-10">
          See also the{" "}
          <Link className="underline" href="/token-policy">
            {BRAND.ticker} use & risk notice
          </Link>{" "}
          and the{" "}
          <Link className="underline" href="/report">
            contribution rules
          </Link>
          .
        </p>
      </article>
    </Shell>
  );
}
