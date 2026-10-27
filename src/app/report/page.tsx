import Link from "next/link";
import { BRAND, CHAIN } from "@/config/brand";
import { CONTRACT_NAMES } from "@/config/contracts";
import { Shell } from "@/components/site/Page";
import { ArrowLeft, ArrowUpRight } from "@/components/site/Icons";
import { JsonLd } from "@/components/JsonLd";
import { ConcernNote, RulesForm } from "@/components/report/RulesForm";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/report",
  title: `Contribute responsibly | ${BRAND.name}`,
  description: `The ${BRAND.name} contribution rules: only lawfully obtained, consented material, no personal data on chain, and how to raise a concern about a brief or a record.`,
});

export default function ReportPage() {
  return (
    <Shell>
      <JsonLd data={breadcrumbLd([{ name: "Contribute responsibly", path: "/report" }])} />
      <article className="hq-doc">
        <Link href="/" className="inline-flex items-center gap-3 text-[13px] underline underline-offset-4">
          <ArrowLeft size={14} /> Home
        </Link>
        <p className="hq-label mt-12">{BRAND.name} / Contribution rules</p>
        <h1 className="mt-4">Contribute responsibly</h1>
        <p>
          {BRAND.name} helps people turn evidence into findings that others can check. That only works, and only stays fair to the people in the evidence, when every contribution is lawful and consented. These rules apply to everything you add to the workspace and to everything you record on {CHAIN.name}.
        </p>

        <h2>What you may contribute</h2>
        <ul>
          <li>Your own observations, written as facts with a date and a general place, without identifying anyone.</li>
          <li>Public records: notices, filings, published reports, open datasets, with a link and the source date.</li>
          <li>Documents and files you own or have written permission to use.</li>
          <li>Material about people only when they agreed to its use, or when nothing in it identifies them.</li>
        </ul>

        <h2>What you must not contribute</h2>
        <ul>
          <li>Personal data: names, phone numbers, addresses, ID numbers, faces, licence plates, exact home locations.</li>
          <li>Anything obtained by hacking, surveillance, deception, trespass or a breach of confidentiality.</li>
          <li>Secret, classified or internal material you are not authorised to share.</li>
          <li>Material gathered to follow, profile or target a person or a group.</li>
        </ul>

        <h2>What goes on chain, and what never does</h2>
        <p>
          {CONTRACT_NAMES.book} stores fingerprints (32-byte hashes), counts, a verdict number and the wallet that sent the transaction. It never stores a file, a note, a name or any other content. Records are public and permanent; nobody, including this project, can edit or remove them. A short text can be guessed from its fingerprint by trying candidates, so never stamp a note that contains personal details.
        </p>

        <h2>Confirm the rules</h2>
        <p>The evidence library asks you to confirm these rules once in this browser, and then asks three questions on every item you add.</p>
        <RulesForm />

        <h2>Raise a concern</h2>
        <p>
          This site hosts no files and no accounts, so there is nothing for us to take down from a server. If a brief someone shared, or a record that claims to come from {BRAND.name}, worries you, write the facts below. The note is built in your browser; copy it and send it to the project account. Do not include personal data beyond what is needed.
        </p>
        <ConcernNote />

        <p className="mt-12 text-[13px]">
          <Link className="hq-link" href="/platform?view=evidence">
            Open the evidence library <ArrowUpRight size={14} />
          </Link>
        </p>
      </article>
    </Shell>
  );
}
