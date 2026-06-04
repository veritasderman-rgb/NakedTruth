import type { Metadata } from "next";
import Link from "next/link";
import { matchLabel } from "@/lib/scoring";

export const dynamic = "force-dynamic";

// Public, privacy-safe results landing. It only ever receives aggregate
// numbers (percent / match / total) — never any answer content — so it is safe
// to share openly. Its job is to render a tempting OG card and funnel the
// viewer into starting their own quiz.
type SearchParams = Promise<{ p?: string; m?: string; t?: string }>;

function parseParams(sp: { p?: string; m?: string; t?: string }) {
  const clamp = (raw: string | undefined, max: number) => {
    const n = Number.parseInt(raw ?? "", 10);
    return Number.isNaN(n) ? 0 : Math.max(0, Math.min(max, n));
  };
  return { percent: clamp(sp.p, 100), match: clamp(sp.m, 9999), total: clamp(sp.t, 9999) };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { percent, match, total } = parseParams(await searchParams);
  const ogImage = `/api/og?p=${percent}&m=${match}&t=${total}`;
  const title = `Naše shoda je ${percent}% — ${matchLabel(percent).text}`;
  const description = total > 0
    ? `Shodli jsme se v ${match} z ${total} otázek. Zvládnete to líp? Zkuste NakedTruth.`
    : "Blind-comparison kvíz pro páry. Zkuste NakedTruth.";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function SharePage({ searchParams }: { searchParams: SearchParams }) {
  const { percent, match, total } = parseParams(await searchParams);
  const label = matchLabel(percent);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-6 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        NakedTruth
      </span>

      <div className="flex flex-col items-center">
        <p className="text-7xl font-extrabold text-primary leading-none">{percent}%</p>
        {total > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            Shoda v {match} z {total} otázek
          </p>
        )}
        <p className="mt-3 text-lg font-semibold" style={{ color: label.color }}>
          {label.text}
        </p>
      </div>

      <div className="mt-10 space-y-4">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">
          A jak si stojíte vy dva?
        </h1>
        <p className="text-pretty text-sm text-muted-foreground">
          Každý z vás odpoví na stejné otázky soukromě. Odpovědi uvidíte společně až ve chvíli, kdy budete mít oba hotovo.
        </p>
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Vyzkoušet zdarma
        </Link>
      </div>
    </main>
  );
}
