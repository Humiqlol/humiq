"use client";

import { useState } from "react";
import { useWallet } from "@/components/wallet/WalletProvider";
import { useWalletModal } from "@/components/wallet/WalletButton";
import { useLocalStore } from "@/components/wallet/useLocalStore";
import { BRAND } from "@/config/brand";
import { bookLive, CONTRACTS } from "@/config/contracts";
import { storageKey } from "@/config/storage";
import { anchorCalldata, estimate, signOffCalldata, stampCalldata } from "@/lib/book";
import { explain, waitForReceipt } from "@/lib/client";

/* Sends the three book writes from the connected wallet, or, before the book is deployed, signs a practice record
   that stays in this browser. One busy flag and one message line for whichever panel uses it. */

export type PracticeRecord = { kind: "anchor" | "signoff" | "stamp"; address: string; signature: string; message: string; at: number };
const EMPTY: PracticeRecord[] = [];

export function useRecorder() {
  const w = useWallet();
  const { open } = useWalletModal();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; tx?: string } | null>(null);
  const [practice, setPractice] = useLocalStore<PracticeRecord[]>(storageKey("practice", "records"), EMPTY);
  const live = bookLive();

  async function ready(): Promise<string | null> {
    if (!w.address) {
      open();
      return null;
    }
    if (live && !w.onRobinhoodChain) {
      await w.switchNetwork();
      return null;
    }
    return w.address;
  }

  async function send(data: string, label: string): Promise<{ tx: string; block: number } | null> {
    const from = await ready();
    if (!from) return null;
    setBusy(true);
    setMsg(null);
    try {
      await estimate(from, data);
      setMsg({ ok: true, text: `${label}: confirm in your wallet.` });
      const tx = await w.sendTransaction({ to: CONTRACTS.book, data });
      setMsg({ ok: true, text: `${label}: sent, waiting for the block…`, tx });
      const r = await waitForReceipt(tx, 180_000);
      if (!r.ok) throw new Error("The transaction reverted.");
      setMsg({ ok: true, text: `${label}: recorded in block ${r.blockNumber.toLocaleString("en-US")}.`, tx });
      w.refreshBalance();
      return { tx, block: r.blockNumber };
    } catch (e) {
      setMsg({ ok: false, text: explain(e) });
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function sign(kind: PracticeRecord["kind"], lines: string[]): Promise<PracticeRecord | null> {
    const from = await ready();
    if (!from) return null;
    setBusy(true);
    setMsg(null);
    try {
      const message = [`${BRAND.name} practice record (nothing is sent to the chain)`, ...lines, `Signed at: ${new Date().toISOString()}`].join("\n");
      const signature = await w.signMessage(message);
      const rec = { kind, address: from, signature, message, at: Date.now() };
      setPractice((l) => [rec, ...l].slice(0, 100));
      setMsg({ ok: true, text: "Practice record signed and kept in this browser. Nothing was published." });
      return rec;
    } catch (e) {
      setMsg({ ok: false, text: explain(e) });
      return null;
    } finally {
      setBusy(false);
    }
  }

  return {
    live,
    busy,
    msg,
    practice,
    address: w.address,
    anchor: (briefHash: `0x${string}`, root: `0x${string}`, evidenceCount: number, claimCount: number) =>
      live ? send(anchorCalldata(briefHash, root, evidenceCount, claimCount), "Anchor") : sign("anchor", [`Action: anchor brief`, `Brief hash: ${briefHash}`, `Evidence root: ${root}`, `Evidence: ${evidenceCount} · Findings: ${claimCount}`]),
    signOff: (briefId: number, verdict: 1 | 2 | 3, checklistHash: `0x${string}`, briefHash: string) =>
      live ? send(signOffCalldata(briefId, verdict, checklistHash), "Sign-off") : sign("signoff", [`Action: review sign-off`, `Brief hash: ${briefHash}`, `Verdict: ${verdict}`, `Checklist hash: ${checklistHash}`]),
    stamp: (hashes: `0x${string}`[]) => (live ? send(stampCalldata(hashes), "Stamp") : sign("stamp", [`Action: stamp evidence`, ...hashes.map((h) => `Fingerprint: ${h}`)])),
  };
}
