/*
 * Every image path in one place. Brand files (mark, word mark, icons, share card) come from the owner's artwork via
 * ../referensi/tools/make-owner-brand.mjs; the illustrations were drawn by ../referensi/tools/make-brand.mjs. New art only
 * replaces files at these paths, no code edits.
 */
export const ASSETS = {
  /** Owner's slanted H mark (256x212, alpha), dark ink for paper and light ink for dark panels. */
  mark: "/brand/mark.webp",
  markLight: "/brand/mark-light.webp",
  markSize: { w: 256, h: 212 },
  /** Owner's word mark (H + HUMIQ, 800x189) for wide spots: navbar, footer, workspace sidebar. */
  wordmark: "/brand/wordmark.webp",
  wordmarkLight: "/brand/wordmark-light.webp",
  wordmarkSize: { w: 800, h: 189 },
  /** Light mark on a forest tile (wallet avatar, token avatar). */
  markSquare: "/brand/mark-square.webp",
  /** Square PNG served by Next from src/app/icon.png (structured data needs a PNG logo). */
  logoPng: "/icon.png",
  /** Share card served from src/app/opengraph-image.jpg. */
  og: "/opengraph-image.jpg",
  art: {
    heroLens: { src: "/art/hero-lens.webp", w: 1440, h: 700, alt: "A magnifying lens over two pages of notes, one line highlighted in mint" },
    heroPrint: { src: "/art/hero-print.webp", w: 1440, h: 960, alt: "Fingerprint-like rings drawn in thin lines around a marked centre" },
    network: { src: "/art/about-network.webp", w: 520, h: 520, alt: "A dotted circle with four linked sources around a centre point" },
    frames: { src: "/art/domains-frames.webp", w: 520, h: 840, alt: "Nested square frames turning around a crosshair" },
    platform: { src: "/art/platform-field.webp", w: 1240, h: 560, alt: "A dotted oval field with connected evidence points" },
    contributor: { src: "/art/contributor.webp", w: 520, h: 520, alt: "A contributor card inside rings, with four linked points" },
  },
  cases: {
    "fact-checking": { src: "/art/case-fact.webp", w: 616, h: 384, alt: "Two printed pages with a check mark" },
    "supplier-checks": { src: "/art/case-supplier.webp", w: 616, h: 384, alt: "Three shipping crates and a barcode" },
    "recovery-notes": { src: "/art/case-recovery.webp", w: 616, h: 384, alt: "A shelter tent, a water drop and an aid sign" },
    "dataset-notes": { src: "/art/case-dataset.webp", w: 616, h: 384, alt: "A table of labelled data cells inside a viewfinder" },
  },
} as const;
