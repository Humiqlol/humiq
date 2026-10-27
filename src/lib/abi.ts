import { parseAbi } from "viem";

/*
 * ABIs the site needs. BOOK_ABI mirrors contracts/src/HumiqEvidenceBook.sol (src/lib/abi.test.ts checks it
 * against the compiled artifact so the two cannot drift apart).
 */
export const ERC20_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function owner() view returns (address)",
  "function getOwner() view returns (address)",
]);

export const FEED_ABI = parseAbi([
  "function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)",
]);

/** Pons V2 launch token: points at its bonding curve. */
export const PONS_TOKEN_ABI = parseAbi(["function curve() view returns (address)"]);

/** Pons V2 bonding curve, read side only (price, graduation progress). */
export const PONS_CURVE_ABI = parseAbi([
  "function getReserves() view returns (uint256 quoteReserve, uint256 tokenReserve)",
  "function realQuoteReserve() view returns (uint256)",
  "function graduationThreshold() view returns (uint256)",
  "function graduated() view returns (bool)",
  "function isNativeQuote() view returns (bool)",
]);

export const BOOK_ABI = parseAbi([
  "struct Brief { address author; uint32 evidenceCount; uint32 claimCount; uint32 signOffCount; uint64 chainBlock; uint64 anchoredAt; bytes32 briefHash; bytes32 evidenceRoot; }",
  "struct SignOff { uint256 briefId; address reviewer; uint8 verdict; uint64 chainBlock; uint64 signedAt; bytes32 checklistHash; }",
  "struct Stamp { address stamper; uint64 chainBlock; uint64 stampedAt; }",
  "function anchorBrief(bytes32 briefHash, bytes32 evidenceRoot, uint32 evidenceCount, uint32 claimCount) returns (uint256 id)",
  "function signOff(uint256 briefId, uint8 verdict, bytes32 checklistHash) returns (uint256 id)",
  "function stampEvidence(bytes32[] hashes) returns (uint256 fresh)",
  "function brief(uint256 id) view returns (Brief)",
  "function findBrief(address author, bytes32 briefHash) view returns (uint256)",
  "function briefCountOf(address author) view returns (uint256)",
  "function briefsOf(address author, uint256 offset, uint256 limit) view returns (uint256[])",
  "function signOffAt(uint256 id) view returns (SignOff)",
  "function signOffsOf(uint256 briefId, uint256 offset, uint256 limit) view returns (uint256[])",
  "function signOffBy(uint256 briefId, address reviewer) view returns (uint256)",
  "function reviewCountOf(address reviewer) view returns (uint256)",
  "function reviewsOf(address reviewer, uint256 offset, uint256 limit) view returns (uint256[])",
  "function stampOf(bytes32 evidenceHash) view returns (Stamp)",
  "function chainBlock() view returns (uint64)",
  "function briefCount() view returns (uint256)",
  "function signOffCount() view returns (uint256)",
  "function stampCount() view returns (uint256)",
  "function SUPPORTED() view returns (uint8)",
  "function NEEDS_WORK() view returns (uint8)",
  "function NOT_SUPPORTED() view returns (uint8)",
  "function MAX_PAGE() view returns (uint256)",
  "function MAX_STAMPS() view returns (uint256)",
  "function MAX_COUNT() view returns (uint32)",
  "event BriefAnchored(uint256 indexed id, address indexed author, bytes32 indexed briefHash, bytes32 evidenceRoot, uint32 evidenceCount, uint32 claimCount, uint64 chainBlock)",
  "event SignedOff(uint256 indexed id, uint256 indexed briefId, address indexed reviewer, uint8 verdict, bytes32 checklistHash, uint64 chainBlock)",
  "event EvidenceStamped(bytes32 indexed evidenceHash, address indexed stamper, uint64 chainBlock)",
  "error ZeroHash()",
  "error BadCount()",
  "error AlreadyAnchored(uint256 id)",
  "error UnknownBrief(uint256 id)",
  "error UnknownSignOff(uint256 id)",
  "error BadVerdict()",
  "error SelfReview()",
  "error AlreadySignedOff(uint256 id)",
  "error BadStampList()",
]);

export const ALL_ERRORS = BOOK_ABI.filter((x) => x.type === "error");

/** Plain words for each custom error, shown instead of a selector. */
export const ERROR_WORDS: Record<string, string> = {
  ZeroHash: "A fingerprint is empty. Export the brief again and retry.",
  BadCount: "A brief needs at least one evidence item and one claim (at most 10,000 of each).",
  AlreadyAnchored: "Your wallet already anchored a brief with exactly this fingerprint. Open Verify to see it.",
  UnknownBrief: "No brief exists with that id.",
  UnknownSignOff: "No sign-off exists with that id.",
  BadVerdict: "The verdict must be Supported, Needs work or Not supported.",
  SelfReview: "The author of a brief cannot sign it off. Ask a second person to review it from their own wallet.",
  AlreadySignedOff: "Your wallet already signed off this brief. A sign-off is never edited; a changed view belongs to a new brief.",
  BadStampList: "Stamp between 1 and 32 fingerprints per transaction.",
};
