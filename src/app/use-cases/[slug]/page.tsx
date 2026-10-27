import Link from "next/link";
import { notFound } from "next/navigation";
import { BRAND } from "@/config/brand";
import { ASSETS } from "@/config/assets";
import { Shell } from "@/components/site/Page";
import { ArrowLeft, ArrowUpRight } from "@/components/site/Icons";
import { JsonLd } from "@/components/JsonLd";
import { USE_CASES, caseBySlug } from "@/content/useCases";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() {
  return USE_CASES.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const u = caseBySlug((await params).slug);
  if (!u) return {};
  return pageMeta({ path: `/use-cases/${u.slug}`, title: `${u.title} | ${BRAND.name}`, description: `${u.teaser} A ${BRAND.name} use case.`.slice(0, 160), type: "article" });
}

export default async function UseCasePage({ params }: { params: Promise<{ slug: string }> }) {
  const u = caseBySlug((await params).slug);
  if (!u) notFound();
  const art = ASSETS.cases[u.slug];
  const others = USE_CASES.filter((x) => x.slug !== u.slug);
  return (
    <Shell>
      <JsonLd data={breadcrumbLd([{ name: "Use cases", path: `/use-cases/${u.slug}` }])} />
      <article className="hq-story">
        <div className="px-[var(--pad-x)] pt-16">
          <Link href="/#use-cases" className="inline-flex items-center gap-3 text-[13px]">
            <ArrowLeft size={14} /> Use cases
          </Link>
          <p className="hq-kicker mt-12 text-center">{u.kicker}</p>
          <h1 className="mx-auto mt-6 max-w-[900px]">{u.title}</h1>
          <p className="lead">{u.teaser}</p>
          <p className="hq-kicker mt-8 text-center">
            {BRAND.name} / Worked example · {u.audience}
          </p>
        </div>
        <div className="mx-[var(--pad-x)] mt-12 overflow-hidden border border-[var(--line-strong)]">
          <img src={art.src} width={art.w} height={art.h} alt={art.alt} className="block h-auto w-full" />
        </div>
        <div className="hq-story-body">
          <p className="!text-[13px] !text-muted">A fictional scenario that shows how the workspace is meant to be used. People, places and figures are made up.</p>
          {u.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              {s.p.map((p) => (
                <p key={p.slice(0, 30)}>{p}</p>
              ))}
            </section>
          ))}
          <div className="mt-14 flex flex-wrap gap-5">
            <Link href="/platform?view=questions" className="hq-btn">
              Start a research question <ArrowUpRight size={16} />
            </Link>
            <Link href="/report" className="hq-btn line">
              Contribution rules <ArrowUpRight size={16} />
            </Link>
          </div>
          <h2>More use cases</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/use-cases/${o.slug}`} className="hq-link">
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </article>
    </Shell>
  );
}
