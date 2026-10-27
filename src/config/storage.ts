/*
 * Browser storage keys. Deliberately neutral (not the brand name), so renaming the project never
 * orphans what visitors' browsers already hold: research questions, evidence, reviews, practice records, the wallet choice.
 */
const PREFIX = "hq1";
export const storageKey = (...parts: string[]) => [PREFIX, ...parts].join(".");
