import { PlusIcon } from "@/components/site/Icons";
import type { Faq as FaqItem } from "@/content/faq";

export function Faq({ items, title = "Frequently asked questions", lead = "How the workspace handles evidence, reviews and the token." }: { items: FaqItem[]; title?: string; lead?: string }) {
  return (
    <div className="hq-faq" id="faq">
      <div>
        <p className="hq-kicker">FAQ</p>
        <h2 className="mt-5 text-[30px] leading-[42px] font-medium tracking-[-1.2px] md:text-[36px] md:leading-[50px]">{title}</h2>
        <p className="hq-prose mt-6 max-w-[260px]">{lead}</p>
      </div>
      <div className="border-t border-[var(--line-strong)]">
        {items.map((f, i) => (
          <details key={f.q} data-testid="faq-item">
            <summary>
              <span className="hq-num">{String(i + 1).padStart(2, "0")}</span>
              <span>{f.q}</span>
              <PlusIcon size={16} className="plus" />
            </summary>
            <p className="a">{f.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
