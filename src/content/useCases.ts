/* Four worked examples, each a short story page under /use-cases/<slug>. Fictional scenarios written for this site. */

export type UseCase = {
  slug: "fact-checking" | "supplier-checks" | "recovery-notes" | "dataset-notes";
  kicker: string;
  title: string;
  teaser: string;
  audience: string;
  sections: { h: string; p: string[] }[];
};

export const USE_CASES: UseCase[] = [
  {
    slug: "fact-checking",
    kicker: "Checking a claim that spreads fast",
    title: "Two clips, one bridge. Which one is current?",
    teaser: "A clip says the bridge is closed, another says traffic is moving. Here is how a small newsroom sorted it out with dated evidence.",
    audience: "Newsrooms · community editors",
    sections: [
      {
        h: "The question",
        p: [
          "A regional editor sees two clips of the same river crossing in one morning. One shows barriers, the other shows lorries rolling across. Both are shared thousands of times. Readers ask which one is true today.",
          "The editor opens a research question in the workspace: is the crossing open to freight this week? The scope says public notices, operator statements and footage with a known date. The limits say: no faces, no plate numbers, no names of drivers.",
        ],
      },
      {
        h: "Collecting what can be checked",
        p: [
          "The desk adds the road authority's notice as a link, the operator's statement as a note, and a photo a colleague took at the crossing with permission from the site manager. Each item gets its source type and the date of the source itself, not the date it was found.",
          "The photo is fingerprinted in the browser. Its file never leaves the laptop. The fingerprint is what later lets anyone confirm that the photo in the published piece is the same one that was reviewed.",
        ],
      },
      {
        h: "Letting the assistant sort, not decide",
        p: [
          "The assistant groups the material by shared terms. It quotes a line from the notice about a weight limit and a line from the statement that names a different limit. It flags that the figures differ between items. It does not pick a winner.",
          "The editor keeps both quotes as findings, adds a third one written by hand, and links each to the items it rests on.",
        ],
      },
      {
        h: "A second pair of eyes",
        p: [
          "A colleague who was not involved receives the exported brief and its on-chain id. She opens every source, checks the dates, ticks the checklist and records her verdict from her own wallet: needs work, because the notice is a week older than the statement.",
          "The editor updates the brief, exports it again and anchors the new version. The published piece links to the brief, and readers can see both the reasoning and the record of who reviewed it.",
        ],
      },
    ],
  },
  {
    slug: "supplier-checks",
    kicker: "Looking into a supplier from afar",
    title: "The supplier says all is well. What do the records say?",
    teaser: "A buyer cannot visit a factory this quarter. Public filings, shipping notices and a partner's photos fill part of the gap.",
    audience: "Procurement teams · analysts",
    sections: [
      {
        h: "The question",
        p: [
          "A small importer depends on one parts maker overseas. Deliveries slip, and the supplier's emails stay upbeat. Travel is not possible this quarter. The buyer wants a calmer picture than rumours from a trade chat.",
          "The research question is narrow: has the plant reduced output since summer? The limits exclude anything about individual workers and anything obtained from people without their agreement.",
        ],
      },
      {
        h: "Evidence with a paper trail",
        p: [
          "The team attaches the supplier's own public filings as a dataset, port notices about the shipping line, and photos sent by a logistics partner who agreed to their use. Every item records when the source itself was dated.",
          "Two spreadsheets are hashed in the browser. Their text is kept locally so the assistant can read it; nothing is uploaded.",
        ],
      },
      {
        h: "Findings that point at their sources",
        p: [
          "The assistant pulls the sentences that mention output and lead times and groups them. One theme rests on a single item, and the note says so: a reviewer may want a second source before accepting it.",
          "The buyer writes the final findings in plain words, each with references, and marks one as unresolved instead of guessing.",
        ],
      },
      {
        h: "A brief the finance team can trust",
        p: [
          "The exported brief lists every source with its type, date and fingerprint. The buyer anchors it, and the finance lead signs off after checking the filings. Six months later, when the contract is renegotiated, the team can show exactly what was known and when.",
        ],
      },
    ],
  },
  {
    slug: "recovery-notes",
    kicker: "Reading needs after a flood",
    title: "The road is cut. What does the village need first?",
    teaser: "A volunteer group pulls together public reports and consented field notes to agree on what to send, without exposing anyone.",
    audience: "Volunteer groups · relief coordinators",
    sections: [
      {
        h: "The question",
        p: [
          "After heavy rain, a valley road closes and calls from relatives pile up. A volunteer group has a single truck and wants to load it with what is actually missing, not what is loudest online.",
          "The research question: what are the three most pressing supply needs in the cut-off area this week? The limits are strict: no names, no house numbers, no photos where people can be recognised.",
        ],
      },
      {
        h: "Consent before collection",
        p: [
          "Volunteers who spoke with residents add notes only after the residents agreed. The workspace asks for that confirmation on every item, and it asks whether the note is free of personal data. Public bulletins from the district office go in as links with their publication dates.",
        ],
      },
      {
        h: "Agreeing on what the evidence says",
        p: [
          "The assistant groups mentions of water, medicine and fuel and shows which themes have more than one source behind them. Clean water appears in four independent items; generator fuel in one.",
          "The coordinator writes the findings and keeps a note that fuel needs a second confirmation before it takes truck space.",
        ],
      },
      {
        h: "A record for the next shift",
        p: [
          "The next shift lead reviews the brief, ticks the checklist and signs it off. Because only fingerprints go on chain, nothing about the residents is published. The group can still show donors, later, which evidence the decision rested on.",
        ],
      },
    ],
  },
  {
    slug: "dataset-notes",
    kicker: "Documenting a dataset for AI evaluation",
    title: "Where did this evaluation set come from, exactly?",
    teaser: "A model team keeps a reviewable record of which files went into an evaluation set and who approved them.",
    audience: "AI teams · research labs",
    sections: [
      {
        h: "The question",
        p: [
          "A team builds an evaluation set of street-sign images for a navigation model. Months later someone will ask where each image came from and whether the team had the right to use it. The answer should not depend on someone's memory.",
          "The research question: is every image in version 3 of the set licensed for evaluation use and free of identifiable people?",
        ],
      },
      {
        h: "Fingerprints instead of uploads",
        p: [
          "Each image is fingerprinted in the browser. The license text and the photographer's written agreement are added as notes. Images with recognisable faces are left out of the set before they are ever added.",
          "The team stamps the fingerprints on chain in batches of up to thirty-two, so the existence of each file at that date can be shown later without publishing the files.",
        ],
      },
      {
        h: "Review by someone outside the team",
        p: [
          "A colleague from the legal side reads the exported brief, checks a sample of files against their fingerprints and records a sign-off from her own wallet. Her verdict and the hash of her checklist are on chain; the files are not.",
        ],
      },
      {
        h: "What it does not do",
        p: [
          "The record shows what the team checked and who reviewed it. It does not grant rights, does not replace a license and does not prove the images are correct labels. It makes the paper trail easy to follow.",
        ],
      },
    ],
  },
];

export const caseBySlug = (slug: string) => USE_CASES.find((u) => u.slug === slug) ?? null;
