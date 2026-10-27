import { Suspense } from "react";
import { BRAND } from "@/config/brand";
import { Workspace } from "@/components/platform/Workspace";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  path: "/platform",
  title: `Workspace | ${BRAND.name}`,
  description: `The ${BRAND.name} research workspace: questions, evidence fingerprints, assistant, human verification and briefs, all in your browser.`,
  noindex: true,
});

export default function PlatformPage() {
  return (
    <Suspense fallback={<div className="p-10 text-[13px] text-[var(--muted)]">Loading the workspace…</div>}>
      <Workspace />
    </Suspense>
  );
}
