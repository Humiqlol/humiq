# Humiq — Research. Evidence. Human judgment. AI assistance.

**Human Insight. Sharper Intelligence.** Humiq is a research and evidence workspace on Robinhood Chain: scoped
research questions, an evidence library fingerprinted in your browser, an assistant that only quotes your evidence,
human verification for every finding, exportable briefs, and a small on-chain evidence book for anchors, reviewer
sign-offs and evidence stamps.

## The problem

Research usually ends as a document full of claims next to a folder of sources that nobody can line up later. Which
report did that figure come from? Did anyone open the link? Was the file in the brief the same one that was checked?
AI tools make drafting faster, and also make it easier to state things no source supports.

## The solution

- **Research Hub** — one question at a time, with a scope and limits on what must not be collected.
- **Evidence Library** — links, notes and files with source type and source date. Files are hashed with SHA-256 in
  the browser and never uploaded. Every item asks three confirmations: lawfully obtained, consented where people are
  involved, no personal data.
- **Research Assistant** — groups the attached evidence into themes and drafts findings linked to their sources.
  Without a model key it is extractive (it only quotes your evidence). With a key, every finding the model returns
  must carry a word-for-word quote from the evidence it cites, or it is dropped.
- **Human Verification** — a checklist and a verdict per finding; a review desk for someone else's brief.
- **Intelligence Briefs** — Markdown export (and print to PDF) with numbered findings, verdicts and a reference list
  with every fingerprint and an evidence root.
- **Evidence book** — `HumiqEvidenceBook` records a brief's keccak-256 hash and evidence root, independent reviewer
  sign-offs (never by the author) and first-seen evidence stamps. Only hashes, counts and verdict numbers.

## How it works

1. Open `/platform`. The workspace lives in your browser (localStorage); there is no account and no upload.
2. Confirm the contribution rules on `/report`, open a question, add evidence.
3. Run the assistant, keep the findings you agree with, write your own, and review each one.
4. Export the brief. Anchor its fingerprint from your wallet; share the file and the brief id with a reviewer.
5. The reviewer loads the file in the review desk, the site checks it against the chain, and they record a verdict
   from their own wallet. Anyone can verify a brief file on the Chain record view.
Until the contract address is set, anchors, sign-offs and stamps run in practice mode (a wallet signature kept
locally, nothing sent).

## What you can try

Live now: the whole workspace, live Robinhood Chain figures (block, gas, Chainlink ETH/USD), the contribution rules,
the token notice and four worked use cases. Coming later (planned, not live): the evidence book once the owner deploys
it, the Human Insight Network (contributors who opt in), a Contributor Workspace for teams, and $HUMIQ utility
(research credits, premium workspace access, API access). Nothing here pays or promises rewards.

## Run it locally

Requires Node 20+.

```sh
npm install
npm run build
npm start          # http://localhost:5760
npm test           # unit tests (fingerprints, evidence root, extractive assistant, brief export, model-answer check, relay, verify-deployment logic)
npm run typecheck
```

Environment variables (all optional; set them in your shell or your host's dashboard, never commit them):

| Name | Purpose |
| --- | --- |
| `ROBINHOOD_RPC_URL` | Server-side Robinhood Chain RPC (default: public endpoints) |
| `NEXT_PUBLIC_ROBINHOOD_RPC_URL` | Browser Robinhood Chain RPC (default: public endpoints) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Enables WalletConnect (project id from cloud.reown.com) |
| `OPENROUTER_API_KEY` | Optional model for the research assistant (key starts with `sk-or-v1-`) |
| `OPENROUTER_MODEL` / `AI_HOURLY_LIMIT` | Model id override (price ceiling still applies) / paid runs per hour |
| `KV_REST_API_URL` + `KV_REST_API_TOKEN` | Shared rate-limit store for the relay and the assistant route |
| `TRUST_PROXY_HEADERS` | `1` behind a trusted proxy that sets client IP headers |

Without any of them the site works fully; the assistant then runs its extractive method and says so.

### Contracts

```sh
cd contracts && ./setup.sh             # fetches forge-std into contracts/lib
forge test --no-match-path 'test/fork/*'   # unit, fuzz and invariant tests
forge test --match-path 'test/fork/*' --fork-url https://robinhood.drpc.org --evm-version cancun
forge build --force && cd .. && npm run contracts:artifacts -- --check
```

### Verify a deployment

```sh
npm run verify-deployment -- --book <address> --book-tx <creation tx>
```

It checks the chain id, that the runtime code equals this build, and that the creation input is exactly this build
(no constructor arguments).

## Network

Robinhood Chain mainnet, chain id 4663 (0x1237), native ETH, explorer https://robinhoodchain.blockscout.com. The site
adds the network to your wallet on connect.

## Project layout

```
src/app/                 routes (/, /platform, /report, /token-policy, /terms, /use-cases/[slug]; API: /api/chain, /api/rpc, /api/assist)
src/components/platform/ workspace: questions, evidence, assistant, verification, briefs, chain record
src/components/home/     home page parts
src/lib/research/        fingerprints, evidence root, extractive assistant, brief export and parser (tested)
src/lib/book.ts          reads and writes of HumiqEvidenceBook
src/config/              brand.ts (name, CA, launchpad), contracts.ts, assets.ts, ai.ts, wallets.ts
contracts/               HumiqEvidenceBook + tests (Foundry)
scripts/                 artifact export and verify-deployment
```

## Contracts and token

- `HumiqEvidenceBook` — no constructor arguments; no owner, no admin, no fee, no payable function, no upgrade.
  Address: not deployed yet.
- `$HUMIQ` — launches on Pons (Robinhood Chain). Contract address: TBA (published on the token notice first).

## Security and status

The contract is small and fully tested (unit, fuzz, invariant, Robinhood Chain fork, browser end-to-end on a local
chain). It holds no funds and stores hashes only. The code has not been independently reviewed yet. An anchor proves a
file existed unchanged at a block; it never proves that a brief is true. Contribute only lawfully obtained, consented
material and keep personal data out of everything you add. Nothing here is financial advice.

## Contributing

Issues and pull requests are welcome. Download the ZIP or fork the repository, run the tests above, and keep the copy
honest: planned features stay labelled as planned.

## License

MIT, see `LICENSE`.
