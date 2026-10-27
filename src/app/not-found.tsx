import Link from "next/link";
import { Shell } from "@/components/site/Page";
import { ArrowUpRight } from "@/components/site/Icons";

export default function NotFound() {
  return (
    <Shell>
      <section className="hq-section flex min-h-[60vh] flex-col items-start justify-center gap-6">
        <p className="hq-kicker">404 · No evidence here</p>
        <h1 className="text-[clamp(40px,7vw,96px)] leading-none font-medium tracking-[-0.06em]">
          This page has no source<span className="hq-period">.</span>
        </h1>
        <p className="hq-prose">The address leads to no page, or the page moved.</p>
        <Link href="/" className="hq-btn">
          Back to the start <ArrowUpRight size={16} />
        </Link>
      </section>
    </Shell>
  );
}
