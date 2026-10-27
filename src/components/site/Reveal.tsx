"use client";

import { useEffect, useRef } from "react";

/** Fades its children up once they scroll into view. Content is in the HTML either way. */
export function Reveal({ children, className = "", as: Tag = "div", delay = 0 }: { children: React.ReactNode; className?: string; as?: "div" | "li" | "section"; delay?: number }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) {
            el.classList.add("in");
            io.disconnect();
          }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} className={`hq-reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
