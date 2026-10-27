import { NextResponse } from "next/server";
import { AI, ASSIST_LIMITS } from "@/config/ai";
import { readCapped } from "@/lib/guard";
import { clientIp } from "@/lib/netkey";
import { spend } from "@/lib/ratelimit";
import { aiConfigured, assist, hourlyLimit } from "@/lib/server/ai";
import type { AssistItem } from "@/lib/server/assist";
import { getStore } from "@/lib/server/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/*
 * Optional AI research assistant. Without OPENROUTER_API_KEY it answers { configured: false } with HTTP 200 and the
 * workspace uses its extractive method. With a key: body capped, per-network limit, site-wide hourly ceiling
 * (AI_HOURLY_LIMIT), price ceiling checked on every call, every returned claim checked against the excerpts.
 * Only the question and the excerpts the visitor chose to send leave the browser; no files, no wallet data.
 */

export async function GET() {
  return NextResponse.json({ configured: aiConfigured() }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!aiConfigured()) return NextResponse.json({ configured: false });
  const raw = await readCapped(request, ASSIST_LIMITS.bodyBytes).catch(() => null);
  if (raw === null) return NextResponse.json({ configured: true, error: "Request too large." }, { status: 413 });
  let body: { question?: unknown; items?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ configured: true, error: "Invalid JSON." }, { status: 400 });
  }
  const question = typeof body.question === "string" ? body.question.trim().slice(0, ASSIST_LIMITS.questionChars) : "";
  if (question.length < 5) return NextResponse.json({ configured: true, error: "Write the research question first." }, { status: 400 });
  const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : "");
  const items: AssistItem[] = (Array.isArray(body.items) ? body.items : [])
    .slice(0, ASSIST_LIMITS.items)
    .map((x, i) => {
      const o = (x ?? {}) as Record<string, unknown>;
      return { ref: `E${i + 1}`, id: str(o.id, 40), title: str(o.title, 160), sourceType: str(o.sourceType, 20), sourceDate: str(o.sourceDate, 20), excerpt: str(o.excerpt, ASSIST_LIMITS.excerptChars) };
    })
    .filter((it) => it.id && it.excerpt.trim().length >= 20);
  if (items.length === 0) return NextResponse.json({ configured: true, error: "Attach evidence with readable text first." }, { status: 400 });

  const store = getStore();
  const ipOk = await spend(store, "assist", clientIp(request), 1, AI.perIpPer10Min, 600, { aggregate: true });
  if (!ipOk) return NextResponse.json({ configured: true, error: "Too many assistant runs from this network; try again in a few minutes." }, { status: 429 });
  const siteOk = await spend(store, "assist:site", "all", 1, hourlyLimit(), 3600);
  if (!siteOk) return NextResponse.json({ configured: true, error: "The site's assistant runs for this hour are used up." }, { status: 429 });

  const out = await assist(question, items);
  if (!out.ok) return NextResponse.json({ configured: true, error: out.error });
  return NextResponse.json({ configured: true, model: out.model, themes: out.themes, dropped: out.dropped });
}
