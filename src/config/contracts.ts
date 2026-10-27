import { isAddress } from "@/config/brand";

/*
 * Humiq contract address on Robinhood Chain.
 *   book  HumiqEvidenceBook, no constructor arguments, no owner, does not need the $HUMIQ token,
 *         so it can be deployed before the token launches (from /deploy on localhost).
 * Empty => anchoring, sign-off and stamping in the workspace run in practice mode (a wallet signature kept in
 * this browser, nothing sent). Filled => they send real transactions from the user's wallet and Verify reads the chain.
 * Check a deployment any time: `npm run verify-deployment -- --book <address> --book-tx <tx>`.
 */
const DEPLOYED = {
  book: "",
  /** Block of the HumiqEvidenceBook deployment. */
  bookBlock: 0,
};

/**
 * Local end-to-end tests only: NEXT_PUBLIC_HUMIQ_TEST_CONTRACTS='{"book":"0x…","bookBlock":1}' at build time
 * points a second build at a contract deployed on an anvil chain. Never set it on Vercel.
 */
function testOverride(): typeof DEPLOYED | null {
  const raw = process.env.NEXT_PUBLIC_HUMIQ_TEST_CONTRACTS;
  if (!raw) return null;
  try {
    const v = { ...DEPLOYED, ...(JSON.parse(raw) as Partial<typeof DEPLOYED>) };
    return isAddress(v.book) ? v : null;
  } catch {
    return null;
  }
}

export const CONTRACTS = testOverride() ?? DEPLOYED;

export const bookLive = () => isAddress(CONTRACTS.book);

export const CONTRACT_NAMES = { book: "HumiqEvidenceBook" } as const;

/** Gas measured on a local chain and in the Foundry tests. */
export const GAS = { deploy: 1_190_722, anchor: 191_500, signOff: 227_600, stampFive: 257_500 } as const;
