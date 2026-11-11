import type { CupKey, DynamicCode, FillLevel, FitCode, GroupKey, KinkMode } from '@/lib/kink';

export type CupTips = {
  // What to try when the cup is full. Lists may be empty where they add nothing.
  activities: string[];
  positions: string[];
  places: string[];
  // Something sharper, shown only to people who went deeper and scored high.
  deeper?: string;
  // A gentle, low-stakes way to find out when the cup is unexplored.
  firstStep: string;
};

export type CupText = {
  label: string;
  // Short "who you are" tag used when this is somebody's fullest cup.
  persona: string;
  desc: string;
  // Side labels for directional cups (verbs, lower case).
  give?: string;
  receive?: string;
  // Round one: two mild statements. Round two: three sharper ones; for
  // directional cups deep[0] is the "give" side and deep[1] the "receive" side.
  base: string[];
  deep: string[];
  tips: CupTips;
};

// Plural forms. Czech: [one, few (2-4), many]. Other languages: [one, other].
export type Plural = string[];

// Everything a language needs. Placeholders in braces — {n}, {give}, {price} —
// are filled in by the app and must be kept as they are.
export type KinkContent = {
  groups: Record<GroupKey, { label: string; desc: string }>;
  cups: Record<CupKey, CupText>;
  dating: { name: string; desc: string; cups: CupKey[] }[];
  community: string[];
  safety: { title: string; text: string }[];
  placesNote: string;
  datingNote: string;

  modes: Record<KinkMode, { label: string; desc: string }>;
  // Index = answer value 0..4 (0 = "not for me", 2 = "I don't know", 4 = "yes").
  answers: string[];
  fill: Record<FillLevel, string>;
  // Index = depth level 0..3.
  depth: string[];
  // Index = harmony level 0..3 (0 = far apart).
  harmony: string[];
  dynamic: Record<DynamicCode, string>;
  fit: Record<FitCode, string>;
  ui: Record<string, string>;
  plurals: Record<string, Plural>;
};
