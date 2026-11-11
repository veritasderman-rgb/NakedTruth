import type { Metadata } from "next";
import Link from "next/link";
import { matchLevel } from "@/lib/scoring";
import { fmt, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getQuiz } from "@/lib/quiz-content";

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
  const locale = await getLocale();
  const q = getQuiz(locale);
  const ogImage = `/api/og?p=${percent}&m=${match}&t=${total}&l=${locale}`;
  const title = fmt(q.shareMetaTitle, { p: percent, label: q[`level${matchLevel(percent).level}`] });
  const description = total > 0 ? fmt(q.shareMetaDesc, { m: match, t: total }) : q.shareMetaDescEmpty;

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImage, width: 1200, height: 630 }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function SharePage({ searchParams }: { searchParams: SearchParams }) {
  const { percent, match, total } = parseParams(await searchParams);
  const locale = await getLocale();
  const q = getQuiz(locale);
  const label = matchLevel(percent);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <span className="brand-pill mb-6">NakedTruth</span>

      <div className="flex flex-col items-center">
        <p className="text-gradient text-7xl font-extrabold leading-none">{percent}%</p>
        {total > 0 && <p className="mt-2 text-sm text-muted-foreground">{fmt(q.matchIn, { m: match, t: total })}</p>}
        <p className="mt-3 text-lg font-semibold" style={{ color: label.color }}>
          {q[`level${label.level}`]}
        </p>
      </div>

      <div className="mt-10 space-y-4">
        <h1 className="text-balance text-2xl font-semibold tracking-tight">{q.shareHeading}</h1>
        <p className="text-pretty text-sm text-muted-foreground">{q.shareLead}</p>
        <Link href={`${localePath(locale, "/")}#parovy-kviz`} className="btn-glow inline-flex w-full items-center justify-center rounded-md px-6 py-3 text-sm font-medium">
          {q.tryFree}
        </Link>
      </div>
    </main>
  );
}
