"use client";

import { useCallback, useMemo } from "react";
import { useLocalStore } from "@/components/wallet/useLocalStore";
import { storageKey } from "@/config/storage";
import { LIMITS, newId, type BriefRecord, type Claim, type ClaimCheck, type Evidence, type Question } from "@/lib/research/types";

/* The workspace state, all in this browser's localStorage. Every list is capped (LIMITS) so storage never fills up. */

const K = {
  questions: storageKey("research", "questions"),
  evidence: storageKey("research", "evidence"),
  claims: storageKey("research", "claims"),
  checks: storageKey("research", "checks"),
  briefs: storageKey("research", "briefs"),
  active: storageKey("research", "active"),
  activity: storageKey("research", "activity"),
};

export type Activity = { at: number; text: string };

const EMPTY_Q: Question[] = [];
const EMPTY_E: Evidence[] = [];
const EMPTY_C: Claim[] = [];
const EMPTY_CK: Record<string, ClaimCheck> = {};
const EMPTY_B: BriefRecord[] = [];
const EMPTY_A: Activity[] = [];

export function useResearch() {
  const [questions, setQuestions] = useLocalStore<Question[]>(K.questions, EMPTY_Q);
  const [evidence, setEvidence] = useLocalStore<Evidence[]>(K.evidence, EMPTY_E);
  const [claims, setClaims] = useLocalStore<Claim[]>(K.claims, EMPTY_C);
  const [checks, setChecks] = useLocalStore<Record<string, ClaimCheck>>(K.checks, EMPTY_CK);
  const [briefs, setBriefs] = useLocalStore<BriefRecord[]>(K.briefs, EMPTY_B);
  const [activeId, setActiveId] = useLocalStore<string>(K.active, "");
  const [activity, setActivity] = useLocalStore<Activity[]>(K.activity, EMPTY_A);

  const active = useMemo(() => questions.find((q) => q.id === activeId) ?? questions[0] ?? null, [questions, activeId]);
  const qEvidence = useMemo(() => (active ? evidence.filter((e) => e.questionId === active.id) : []), [evidence, active]);
  const qClaims = useMemo(() => (active ? claims.filter((c) => c.questionId === active.id) : []), [claims, active]);
  const qBriefs = useMemo(() => (active ? briefs.filter((b) => b.questionId === active.id) : []), [briefs, active]);

  const log = useCallback((text: string) => setActivity((a) => [{ at: Date.now(), text }, ...a].slice(0, 200)), [setActivity]);

  const addQuestion = useCallback(
    (q: Omit<Question, "id" | "createdAt">) => {
      const item: Question = { ...q, id: newId(), createdAt: Date.now() };
      setQuestions((list) => [item, ...list].slice(0, LIMITS.questions));
      setActiveId(item.id);
      log(`Question opened: ${q.title}`);
      return item;
    },
    [setQuestions, setActiveId, log],
  );
  const updateQuestion = useCallback((id: string, patch: Partial<Question>) => setQuestions((list) => list.map((q) => (q.id === id ? { ...q, ...patch } : q))), [setQuestions]);
  const removeQuestion = useCallback(
    (id: string) => {
      const claimIds = new Set(claims.filter((c) => c.questionId === id).map((c) => c.id));
      setQuestions((l) => l.filter((q) => q.id !== id));
      setEvidence((l) => l.filter((e) => e.questionId !== id));
      setClaims((l) => l.filter((c) => c.questionId !== id));
      setBriefs((l) => l.filter((b) => b.questionId !== id));
      setChecks((m) => Object.fromEntries(Object.entries(m).filter(([k]) => !claimIds.has(k))));
      log("Question deleted with its evidence, findings and briefs");
    },
    [claims, setQuestions, setEvidence, setClaims, setBriefs, setChecks, log],
  );

  const addEvidence = useCallback(
    (e: Evidence) => {
      setEvidence((l) => [e, ...l]);
      log(`Evidence added: ${e.title}`);
    },
    [setEvidence, log],
  );
  const removeEvidence = useCallback(
    (id: string) => {
      setEvidence((l) => l.filter((e) => e.id !== id));
      setClaims((l) => l.map((c) => ({ ...c, evidenceIds: c.evidenceIds.filter((x) => x !== id) })));
      log("Evidence removed and unlinked from findings");
    },
    [setEvidence, setClaims, log],
  );

  const addClaims = useCallback(
    (list: Omit<Claim, "id">[]) => {
      setClaims((l) => [...l, ...list.map((c) => ({ ...c, id: newId() }))].slice(-LIMITS.claimsPerQuestion * LIMITS.questions));
      log(`${list.length} finding${list.length === 1 ? "" : "s"} added`);
    },
    [setClaims, log],
  );
  const updateClaim = useCallback((id: string, patch: Partial<Claim>) => setClaims((l) => l.map((c) => (c.id === id ? { ...c, ...patch } : c))), [setClaims]);
  const removeClaim = useCallback(
    (id: string) => {
      setClaims((l) => l.filter((c) => c.id !== id));
      setChecks((m) => {
        const n = { ...m };
        delete n[id];
        return n;
      });
    },
    [setClaims, setChecks],
  );
  const setCheck = useCallback((id: string, ck: ClaimCheck) => setChecks((m) => ({ ...m, [id]: ck })), [setChecks]);

  const saveBrief = useCallback(
    (b: BriefRecord) => {
      setBriefs((l) => [b, ...l.filter((x) => x.id !== b.id)].slice(0, 60));
      log(`Brief exported (${b.briefHash.slice(0, 10)}…)`);
    },
    [setBriefs, log],
  );
  const updateBrief = useCallback((id: string, patch: Partial<BriefRecord>) => setBriefs((l) => l.map((b) => (b.id === id ? { ...b, ...patch } : b))), [setBriefs]);

  return {
    questions,
    evidence,
    claims,
    checks,
    briefs,
    activity,
    active,
    qEvidence,
    qClaims,
    qBriefs,
    setActiveId,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addEvidence,
    removeEvidence,
    addClaims,
    updateClaim,
    removeClaim,
    setCheck,
    saveBrief,
    updateBrief,
    log,
  };
}

export type Research = ReturnType<typeof useResearch>;

/** Verification stage of a question's work (V0–V4), from local state and the latest brief's anchor. */
export function stageOf(claims: Claim[], checks: Record<string, ClaimCheck>, brief: BriefRecord | undefined, signedOff: boolean): number {
  if (claims.length === 0) return 0;
  if (!claims.every((c) => c.evidenceIds.length > 0)) return 0;
  const reviewed = claims.every((c) => checks[c.id]?.verdict);
  if (!reviewed) return 1;
  if (!brief?.anchor) return 2;
  return signedOff ? 4 : 3;
}
