/*
 * Optional AI for the Research Assistant: groups the attached evidence into themes and drafts claims. Off unless
 * OPENROUTER_API_KEY is set on the server (see README). Without it the assistant runs the built-in extractive method
 * and says so. The key never reaches the browser. Every claim the model returns must carry a quote that appears
 * word for word in the evidence it cites; claims that fail the check are dropped before the browser sees them.
 *
 * MODEL: default model id; OPENROUTER_MODEL overrides it. Whatever the id, the server reads the provider's price list
 * and refuses to call a model priced above the ceiling below, or at all when the price list cannot be read.
 */
export const AI = {
  endpoint: "https://openrouter.ai/api/v1/chat/completions",
  catalog: "https://openrouter.ai/api/v1/models",
  model: "qwen/qwen3-30b-a3b-instruct-2507",
  /** USD per one million tokens. */
  maxPromptPerMillion: 1,
  maxCompletionPerMillion: 4,
  maxTokens: 1_200,
  /** Requests per network per 10 minutes. */
  perIpPer10Min: 8,
  /** Site-wide paid calls per hour unless AI_HOURLY_LIMIT says otherwise. */
  defaultHourly: 60,
  timeoutMs: 30_000,
} as const;

/** What the browser may send: up to this many evidence items, each excerpt capped. */
export const ASSIST_LIMITS = { items: 24, excerptChars: 3_000, questionChars: 600, bodyBytes: 90_000 } as const;
