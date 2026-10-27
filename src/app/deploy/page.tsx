import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { BRAND } from "@/config/brand";
import { DeployPanel } from "@/components/deploy/DeployPanel";
import { Shell } from "@/components/site/Page";
import ART from "@/lib/contracts/artifacts.json";

export const metadata: Metadata = {
  title: "Deploy contracts",
  description: `Owner tool: deploy the ${BRAND.name} contract from your own wallet.`,
  robots: { index: false, follow: false },
};

// Owner tool, local only: on any public host this route is a 404.
const LOCAL_HOST = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

export const dynamic = "force-dynamic";

export default async function DeployPage() {
  const host = (await headers()).get("host") ?? "";
  if (!LOCAL_HOST.test(host)) notFound();
  return (
    <Shell>
      <div className="hq-section mx-auto max-w-[920px]">
        <p className="hq-label">Owner tool · localhost only</p>
        <h1 className="hq-h2 mt-2 !leading-tight">Deploy HumiqEvidenceBook</h1>
        <p className="hq-prose mt-3">
          One transaction from your own wallet on Robinhood Chain. No constructor arguments, no owner, no fee and no token needed, so the evidence book can go live before $HUMIQ launches. Progress is kept in this browser.
        </p>
        <div className="mt-8">
          <DeployPanel book={{ creation: ART.contracts.HumiqEvidenceBook.creation, sha256: ART.contracts.HumiqEvidenceBook.sha256 }} />
        </div>
      </div>
    </Shell>
  );
}
