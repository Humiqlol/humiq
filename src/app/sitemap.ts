import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
import { USE_CASES } from "@/content/useCases";

// Every indexable page (same list as the navigation and footer). The workspace (/platform) and the owner page stay out.
export const ROUTES = ["", "/token-policy", "/report", "/terms", ...USE_CASES.map((u) => `/use-cases/${u.slug}`)];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return ROUTES.map((r) => ({ url: `${BRAND.url}${r}`, lastModified: now, changeFrequency: r === "" ? "daily" : "weekly", priority: r === "" ? 1 : 0.6 }));
}
