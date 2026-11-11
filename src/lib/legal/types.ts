export type LegalSection = { h: string; p: string[] };
export type LegalDoc = { title: string; lead: string; sections: LegalSection[] };
// {name}, {id}, {address}, {email}, {register}, {vat} are filled from
// src/lib/operator.ts.
export type LegalContent = {
  terms: LegalDoc;
  privacy: LegalDoc;
  updated: string;
  incomplete: string;
  // Shown on de / fr / es pages, which fall back to English.
  fallbackNote?: string;
};
