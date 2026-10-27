import { BRAND, CHAIN, LAUNCHPAD, TOKEN } from "@/config/brand";
import { CONTRACT_NAMES } from "@/config/contracts";

/*
 * Questions shown on the home page and the token notice, and sent as FAQPage structured data with the same wording.
 * Token answers follow TOKEN.isLive, so publishing the CA in brand.ts updates them.
 */
export type Faq = { q: string; a: string };

export function faqs(): Faq[] {
  const token = TOKEN.isLive
    ? `${BRAND.symbol} trades on ${LAUNCHPAD.name}, the ${CHAIN.name} launchpad. The contract address sits in the navbar, the footer and the token notice; compare it there before you buy, and never spend more than you can afford to lose.`
    : `${BRAND.symbol} has not launched yet. It will launch on ${LAUNCHPAD.name}, the ${CHAIN.name} launchpad, and the contract address will then appear in the navbar, the footer and the token notice. Until that happens, any address presented as ${BRAND.symbol} is not ours.`;
  return [
    {
      q: `What is ${BRAND.name}?`,
      a: `${BRAND.name} is a research and evidence workspace on ${CHAIN.name}. You write a research question with a clear scope, attach the evidence you lawfully hold, let an assistant group it into themes and draft findings, review every finding yourself, and export a brief whose sources are listed with their fingerprints.`,
    },
    {
      q: `How does ${BRAND.name} work today?`,
      a: `The workspace runs in your browser. Questions, evidence, findings and reviews are kept in this browser's storage. Files are fingerprinted locally with SHA-256 and never uploaded. When you are ready, you can anchor the brief's fingerprint on ${CHAIN.name} from your own wallet, and a second person can record a review verdict on it.`,
    },
    {
      q: "Does the assistant make things up?",
      a: "It is built not to. Without a model key the assistant is extractive: it only quotes sentences from your evidence and links each one to its source. When the site has a model configured, every finding the model returns must carry a quote that appears word for word in the evidence it cites, or it is dropped before you see it. A person still decides what stays.",
    },
    {
      q: "Does an anchored brief mean the brief is true?",
      a: `No. An anchor proves that a wallet recorded this exact brief fingerprint at a given block, so later copies can be checked for changes. A review sign-off proves that another wallet recorded a verdict. Neither one proves the content is correct; that is what reading the evidence is for.`,
    },
    {
      q: "What may I contribute?",
      a: "Only material you obtained lawfully and may share: your own observations, public records, documents you own or have permission to use. Where people are involved, you need their consent. The workspace asks you to confirm this before every item, and the contribution rules page explains it in full.",
    },
    {
      q: "Is any personal data stored on chain?",
      a: `No. ${CONTRACT_NAMES.book} stores 32-byte fingerprints, counts, a verdict number and the sending wallet address, nothing else. Do not put names, phone numbers or other personal details into notes you plan to stamp: a short text can be guessed from its fingerprint by trying candidates.`,
    },
    {
      q: "Who can see my evidence?",
      a: "Nobody but you, unless you share the exported brief or the files yourself. The site has no account system and no upload. If the site operator configures the optional assistant, only the excerpts you choose to send for one run leave your browser, and they are not stored by the site.",
    },
    {
      q: "How does a reviewer sign off?",
      a: `The author shares the exported brief and its on-chain id. The reviewer opens the Review desk, loads the brief file, checks that its fingerprint matches the chain, works through the checklist for each finding and records a verdict from their own wallet. The contract refuses a sign-off from the author's own wallet and accepts one per reviewer per brief.`,
    },
    {
      q: "What are the verification stages?",
      a: "Draft, sourced, self-checked, anchored and signed off. They describe what has been done to a brief, not who you are. A stage is never an identity check or a guarantee of accuracy.",
    },
    {
      q: `How do I buy ${BRAND.symbol}?`,
      a: token,
    },
    {
      q: `What is ${BRAND.symbol} for?`,
      a: `Its uses are planned, not live: research credits, premium workspace access and API access once those services exist. Today ${BRAND.symbol} unlocks nothing on the site; every feature works without it. Nothing here promises a price, a return or a reward.`,
    },
    {
      q: "What are the risks?",
      a: `Tokens can lose all their value. Transactions on ${CHAIN.name} are public and final. The contract has no owner and cannot be paused or changed, which also means mistakes cannot be undone. The code has not been independently reviewed yet. Browser storage can be cleared, so export your briefs.`,
    },
  ];
}
