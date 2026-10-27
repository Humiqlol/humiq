/* The research workspace model. Everything lives in the visitor's browser (localStorage); only fingerprints ever
   leave it, and only when the visitor anchors or stamps them on chain from their own wallet. */

export type SourceType = "primary" | "secondary" | "dataset" | "observation" | "other";
export type EvidenceKind = "url" | "note" | "file";
export type Verdict = "supported" | "needs-work" | "not-supported";

export const SOURCE_TYPES: { id: SourceType; label: string; hint: string }[] = [
  { id: "primary", label: "Primary source", hint: "Original record: filing, statement, dataset owner's release" },
  { id: "secondary", label: "Secondary source", hint: "Reporting or analysis that cites others" },
  { id: "dataset", label: "Dataset", hint: "Table, CSV or structured export" },
  { id: "observation", label: "Own observation", hint: "Something you saw or measured yourself, with consent where people are involved" },
  { id: "other", label: "Other", hint: "Anything that does not fit above" },
];

export const VERDICTS: { id: Verdict; label: string; chain: 1 | 2 | 3 }[] = [
  { id: "supported", label: "Supported", chain: 1 },
  { id: "needs-work", label: "Needs work", chain: 2 },
  { id: "not-supported", label: "Not supported", chain: 3 },
];

export type Question = {
  id: string;
  title: string;
  scope: string;
  /** What is out of scope or must not be collected. */
  limits: string;
  createdAt: number;
};

/** The contributor's confirmation, required before any item is added. */
export type Consent = { lawful: boolean; consented: boolean; noPersonal: boolean };

export type Evidence = {
  id: string;
  questionId: string;
  kind: EvidenceKind;
  title: string;
  url: string;
  /** Free text: the note itself, or the contributor's summary of a link or file. */
  note: string;
  /** Text read from a plain-text file (txt, md, csv, json), capped; empty for other files. */
  text: string;
  fileName: string;
  fileSize: number;
  mime: string;
  sourceType: SourceType;
  /** Date of the source itself (YYYY-MM-DD), when known. */
  sourceDate: string;
  /** SHA-256 of the file bytes, or of the canonical record for links and notes. 0x + 64 hex. */
  sha256: string;
  addedAt: number;
  consent: Consent;
};

export type Claim = {
  id: string;
  questionId: string;
  text: string;
  evidenceIds: string[];
  origin: "assistant" | "extractive" | "manual";
  /** Theme the assistant grouped it under. */
  theme: string;
};

export type ClaimCheck = {
  verdict: Verdict | null;
  sourcesOpened: boolean;
  quoteMatches: boolean;
  datesChecked: boolean;
  noPersonalData: boolean;
  note: string;
};

export type BriefRecord = {
  id: string;
  questionId: string;
  markdown: string;
  briefHash: string;
  evidenceRoot: string;
  evidenceCount: number;
  claimCount: number;
  createdAt: number;
  anchor: null | { mode: "chain"; briefId: number; tx: string; block: number } | { mode: "practice"; signature: string; address: string; at: number };
};

export const emptyCheck = (): ClaimCheck => ({ verdict: null, sourcesOpened: false, quoteMatches: false, datesChecked: false, noPersonalData: false, note: "" });

export const newId = () => {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
};

export const LIMITS = {
  questions: 40,
  evidencePerQuestion: 60,
  claimsPerQuestion: 80,
  /** Files are hashed whole; only plain text up to this many characters is kept for the assistant. */
  textChars: 20_000,
  fileBytes: 25 * 1024 * 1024,
  noteChars: 4_000,
  titleChars: 160,
} as const;
