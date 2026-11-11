import type { Metadata } from "next";
import Link from "next/link";
import HomeForm from "./HomeForm";
import CupGlass from "@/components/kink/CupGlass";
import LangSwitch from "@/components/kink/LangSwitch";
import Tip from "@/components/kink/Tip";
import { isDbConfigured } from "@/lib/db";
import { fmt, localePath } from "@/lib/i18n";
import { CUPS, CUP_BY_KEY } from "@/lib/kink";
import { getContent } from "@/lib/kink-content";
import { getLocale } from "@/lib/locale";
import { isAppUrlKnown } from "@/lib/app-url";
import { getQuiz } from "@/lib/quiz-content";
import { premiumPriceLabel } from "@/lib/stripe";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const { ui } = getContent(await getLocale());
  return { title: ui.metaTitle, description: ui.metaDesc, openGraph: { title: ui.metaTitle, description: ui.metaDesc, type: "website" } };
}

// Decorative fill levels for the hero cups.
const HERO = [
  { cup: CUP_BY_KEY.romance, fill: 62 },
  { cup: CUP_BY_KEY.bondage, fill: 48 },
  { cup: CUP_BY_KEY.dominance, fill: 92 },
  { cup: CUP_BY_KEY.sensation, fill: 74 },
  { cup: CUP_BY_KEY.verbal, fill: 30 },
];

export default async function Home() {
  const locale = await getLocale();
  const c = getContent(locale);
  const t = c.ui;
  const q = getQuiz(locale);
  const href = (path: string) => localePath(locale, path);
  const isConfigured = isDbConfigured();

  const missingVars = [];
  if (!isConfigured) missingVars.push("DATABASE_URL");
  if (!isAppUrlKnown()) missingVars.push("NEXT_PUBLIC_APP_URL");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-5 py-6 text-center">
      <div className="mb-8 flex w-full items-center justify-between gap-3">
        <span className="brand-pill">NakedTruth</span>
        <LangSwitch locale={locale} label={t.language} />
      </div>

      <h1 className="text-gradient text-balance text-4xl font-bold leading-tight tracking-tight">{t.homeTitle}</h1>
      <p className="mt-4 text-pretty text-sm text-muted-foreground">{t.homeLead}</p>

      {/* Kinkometr — solo test, shown first */}
      <section className="glass-primary mt-8 w-full overflow-hidden rounded-3xl p-5 text-left">
        <div className="flex items-end justify-between">
          {HERO.map(({ cup, fill }, i) => (
            <CupGlass key={cup.key} id={`h-${cup.key}`} fill={fill} color={cup.color} size={i === 2 ? 78 : i % 2 ? 58 : 46} />
          ))}
        </div>
        <h2 className="mt-5 text-3xl font-bold tracking-tight">{t.kinkTitle}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{fmt(t.kinkLead, { n: CUPS.length })}</p>
        <Link href={href('/kinkometr')} className="btn-glow mt-5 inline-flex w-full items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold">
          {t.kinkCta}
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Link href={href('/kinkometr?mode=bdsm')} className="rounded-xl border border-white/15 px-3 py-2.5 transition-colors hover:bg-white/5">
            <span className="block font-semibold">{c.modes.bdsm.label}</span>
            <span className="text-muted-foreground">{t.bdsmHint}</span>
          </Link>
          <Link href={href('/kinkometr?mode=quick')} className="rounded-xl border border-white/15 px-3 py-2.5 transition-colors hover:bg-white/5">
            <span className="block font-semibold">{c.modes.quick.label}</span>
            <span className="text-muted-foreground">{fmt(t.quickHint, { n: CUPS.length })}</span>
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">{t.kinkFoot}</p>
      </section>

      {/* Couples quiz */}
      <section id="parovy-kviz" className="mt-12 w-full scroll-mt-6">
        <h2 className="text-2xl font-semibold tracking-tight">{q.quizTitle}</h2>
        <div className="mt-3 space-y-4 text-pretty text-sm text-muted-foreground">
          <p>{q.quizLead}</p>
          <p className="glass rounded-lg p-3 text-xs italic">{q.quizNote}</p>
        </div>

        <HomeForm isConfigured={isConfigured} missingVars={missingVars} locale={locale} t={q} premiumPrice={premiumPriceLabel(locale)} />
      </section>

      <div className="mt-12 w-full">
        <Tip locale={locale} t={t} />
      </div>
    </main>
  );
}
