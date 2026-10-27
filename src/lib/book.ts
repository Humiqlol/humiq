import { encodeFunctionData, type Abi } from "viem";
import { CONTRACTS } from "@/config/contracts";
import { BOOK_ABI } from "@/lib/abi";
import { read, readMany, rpcCall } from "@/lib/client";

/* Browser reads and the three writes the site sends to HumiqEvidenceBook. */

export type ChainBrief = {
  id: number;
  author: string;
  evidenceCount: number;
  claimCount: number;
  signOffCount: number;
  chainBlock: number;
  anchoredAt: number;
  briefHash: string;
  evidenceRoot: string;
};

export type ChainSignOff = { id: number; briefId: number; reviewer: string; verdict: number; chainBlock: number; signedAt: number; checklistHash: string };
export type ChainStamp = { stamper: string; chainBlock: number; stampedAt: number } | null;

const abi = BOOK_ABI as Abi;
const to = () => CONTRACTS.book;

export const anchorCalldata = (briefHash: `0x${string}`, root: `0x${string}`, evidenceCount: number, claimCount: number) =>
  encodeFunctionData({ abi: BOOK_ABI, functionName: "anchorBrief", args: [briefHash, root, evidenceCount, claimCount] });
export const signOffCalldata = (briefId: number, verdict: 1 | 2 | 3, checklistHash: `0x${string}`) =>
  encodeFunctionData({ abi: BOOK_ABI, functionName: "signOff", args: [BigInt(briefId), verdict, checklistHash] });
export const stampCalldata = (hashes: `0x${string}`[]) => encodeFunctionData({ abi: BOOK_ABI, functionName: "stampEvidence", args: [hashes] });

/** Dry run from `from` (reverts surface here, before the wallet opens). */
export async function estimate(from: string, data: string) {
  const gas = await rpcCall<string>("eth_estimateGas", [{ from, to: to(), data }]);
  return Number(BigInt(gas));
}

type RawBrief = { author: string; evidenceCount: number; claimCount: number; signOffCount: number; chainBlock: bigint; anchoredAt: bigint; briefHash: string; evidenceRoot: string };
const toBrief = (id: number, r: RawBrief): ChainBrief => ({
  id,
  author: r.author,
  evidenceCount: Number(r.evidenceCount),
  claimCount: Number(r.claimCount),
  signOffCount: Number(r.signOffCount),
  chainBlock: Number(r.chainBlock),
  anchoredAt: Number(r.anchoredAt),
  briefHash: r.briefHash,
  evidenceRoot: r.evidenceRoot,
});

export async function briefById(id: number): Promise<ChainBrief | null> {
  const [r] = await readMany([{ to: to(), abi, fn: "brief", args: [BigInt(id)] }]);
  return r ? toBrief(id, r as RawBrief) : null;
}

export async function findBrief(author: string, hash: string): Promise<number> {
  return Number(await read<bigint>({ to: to(), abi, fn: "findBrief", args: [author, hash] }));
}

export async function briefsOf(author: string, limit = 20): Promise<ChainBrief[]> {
  const ids = (await read<readonly bigint[]>({ to: to(), abi, fn: "briefsOf", args: [author, 0n, BigInt(limit)] })).map(Number);
  const raw = await readMany(ids.map((id) => ({ to: to(), abi, fn: "brief", args: [BigInt(id)] })));
  return raw.flatMap((r, i) => (r ? [toBrief(ids[i], r as RawBrief)] : []));
}

export async function latestBriefs(limit = 8): Promise<{ total: number; briefs: ChainBrief[] }> {
  const total = Number(await read<bigint>({ to: to(), abi, fn: "briefCount" }));
  const ids: number[] = [];
  for (let id = total; id > 0 && ids.length < limit; id--) ids.push(id);
  const raw = await readMany(ids.map((id) => ({ to: to(), abi, fn: "brief", args: [BigInt(id)] })));
  return { total, briefs: raw.flatMap((r, i) => (r ? [toBrief(ids[i], r as RawBrief)] : [])) };
}

type RawSignOff = { briefId: bigint; reviewer: string; verdict: number; chainBlock: bigint; signedAt: bigint; checklistHash: string };
export async function signOffsOf(briefId: number, limit = 50): Promise<ChainSignOff[]> {
  const ids = (await read<readonly bigint[]>({ to: to(), abi, fn: "signOffsOf", args: [BigInt(briefId), 0n, BigInt(limit)] })).map(Number);
  const raw = await readMany(ids.map((id) => ({ to: to(), abi, fn: "signOffAt", args: [BigInt(id)] })));
  return raw.flatMap((r, i) => {
    if (!r) return [];
    const s = r as RawSignOff;
    return [{ id: ids[i], briefId: Number(s.briefId), reviewer: s.reviewer, verdict: Number(s.verdict), chainBlock: Number(s.chainBlock), signedAt: Number(s.signedAt), checklistHash: s.checklistHash }];
  });
}

export async function stampsOf(hashes: string[]): Promise<ChainStamp[]> {
  const raw = await readMany(hashes.map((h) => ({ to: to(), abi, fn: "stampOf", args: [h] })));
  return raw.map((r) => {
    const s = r as { stamper: string; chainBlock: bigint; stampedAt: bigint } | null;
    if (!s || /^0x0{40}$/i.test(s.stamper)) return null;
    return { stamper: s.stamper, chainBlock: Number(s.chainBlock), stampedAt: Number(s.stampedAt) };
  });
}
