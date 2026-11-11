'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startSession } from "./actions/session";

import { fmt, localePath, type Locale } from "@/lib/i18n";
import { track } from "@/lib/track";
import type { QuizContent } from "@/lib/quiz-content";

type TierPref = 'vanilla' | 'spicy' | 'mixed';

const QUESTION_COUNTS = [5, 10, 20, 40] as const;
// Premium packs are curated finite sets; request the whole pack and let the DB
// clamp + record the actual count.
const FULL_PACK_COUNT = 100;

export default function HomeForm({
  isConfigured,
  missingVars,
  locale,
  t,
  premiumPrice,
}: {
  isConfigured: boolean;
  missingVars: string[];
  locale: Locale;
  t: QuizContent;
  // Formatted one-time premium price for this locale, e.g. "29 Kč".
  premiumPrice: string;
}) {
  const TIER_OPTIONS: { value: TierPref; label: string; desc: string }[] = [
    { value: 'vanilla', label: t.tierVanilla, desc: t.tierVanillaDesc },
    { value: 'spicy', label: t.tierSpicy, desc: t.tierSpicyDesc },
    { value: 'mixed', label: t.tierMixed, desc: t.tierMixedDesc },
  ];

  // Intensity ceiling for tier_2 (spicy/mixed) questions. Matches the
  // `intensity` column on questions (1–3).
  const INTENSITY_LEVELS: { value: number; label: string; desc: string }[] = [
    { value: 1, label: t.int1, desc: t.int1Desc },
    { value: 2, label: t.int2, desc: t.int2Desc },
    { value: 3, label: t.int3, desc: t.int3Desc },
  ];

  // Optional theme filter for tier_2 questions. Empty selection = all themes.
  // Values match the `theme` column on questions.
  const THEME_OPTIONS: { value: string; label: string; desc: string }[] = [
    { value: 'explicit', label: t.themeExplicit, desc: t.themeExplicitDesc },
    { value: 'fantasy', label: t.themeFantasy, desc: t.themeFantasyDesc },
    { value: 'bdsm', label: t.themeBdsm, desc: t.themeBdsmDesc },
    { value: 'compat', label: t.themeCompat, desc: t.themeCompatDesc },
  ];

  // Premium thematic packs. `value` matches questions.pack. Unlocked by the
  // one-time premium purchase.
  const PREMIUM_PACKS: { value: string; label: string; desc: string }[] = [
    { value: 'fantazie_bez_filtru', label: t.packFantasy, desc: t.packFantasyDesc },
  ];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [tierPref, setTierPref] = useState<TierPref>('vanilla');
  const [maxIntensity, setMaxIntensity] = useState<number>(3);
  const [themes, setThemes] = useState<string[]>([]); // empty = all themes
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<{ userId: string } | null>(null);
  const [waiver, setWaiver] = useState(false);
  const [premiumNotice, setPremiumNotice] = useState<'success' | 'cancelled' | null>(null);

  const premiumMode = selectedPack !== null;
  const showSpiceControls = tierPref !== 'vanilla' && !premiumMode;

  // Surface the outcome of a returning Stripe Checkout redirect.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('premium');
    if (p === 'success' || p === 'cancelled') setPremiumNotice(p);
  }, []);

  const toggleTheme = (value: string) =>
    setThemes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );

  const selectTier = (value: TierPref) => {
    setTierPref(value);
    setSelectedPack(null);
    setPaywall(null);
  };

  const selectPack = (value: string) => {
    setSelectedPack((prev) => (prev === value ? null : value));
    setPaywall(null);
  };

  const handleStart = async (emailToUse?: string) => {
    track('quiz_start');
    setLoading(true);
    setError(null);
    try {
      const result = await startSession(
        emailToUse,
        premiumMode ? FULL_PACK_COUNT : questionCount,
        tierPref, maxIntensity, themes, selectedPack ?? undefined
      );
      // On success startSession redirects; only a paywall signal returns here.
      if (result?.paywall) {
        setPaywall({ userId: result.userId });
        setLoading(false);
      }
    } catch (err: any) {
      // A successful start redirects by throwing NEXT_REDIRECT — let it through.
      if (typeof err?.digest === 'string' && err.digest.startsWith('NEXT_REDIRECT')) throw err;
      if (err?.message === 'NEXT_REDIRECT') throw err;
      console.error("Failed to start session:", err);
      setError(t.startError);
      setLoading(false);
    }
  };

  const startCheckout = async (userId: string) => {
    track('premium_buy_click');
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, locale }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error === 'stripe_not_configured' ? t.payUnavailable : t.payFailed);
    } catch {
      setError(t.payFailed);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {!isConfigured && (
        <div className="mt-8 rounded-md bg-yellow-500/10 p-4 text-left text-xs text-yellow-200 border border-yellow-500/40">
          <p className="font-bold text-sm">{t.cfgMissing}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {missingVars.map(v => <li key={v}>{v}</li>)}
          </ul>
          <p className="mt-2">{t.cfgMissingHint}</p>
        </div>
      )}

      {premiumNotice === 'success' && (
        <div className="mt-8 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-200 border border-emerald-500/40">
          {t.premiumSuccess}
        </div>
      )}
      {premiumNotice === 'cancelled' && (
        <div className="mt-8 rounded-md bg-muted p-3 text-sm text-muted-foreground border">
          {t.premiumCancelled}
        </div>
      )}

      <div className="mt-10 space-y-8">
        {/* Tier preference — hidden in premium mode */}
        {!premiumMode && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">{t.whichQuestions}</label>
            <div className="grid gap-2">
              {TIER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectTier(opt.value)}
                  className={`group relative rounded-xl border-2 p-3 text-left transition-all ${
                    tierPref === opt.value
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-muted hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      tierPref === opt.value ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    }`}>
                      {tierPref === opt.value && (
                        <span className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <span className={`text-sm font-semibold ${tierPref === opt.value ? 'text-primary' : ''}`}>
                        {opt.label}
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Spice controls — only relevant when tier_2 questions are involved */}
        {showSpiceControls && (
          <div className="space-y-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
            {/* Intensity ceiling */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground ml-1">{t.howSpicy}</label>
              <div className="grid grid-cols-3 gap-2">
                {INTENSITY_LEVELS.map((lvl) => (
                  <button
                    key={lvl.value}
                    type="button"
                    aria-pressed={maxIntensity === lvl.value}
                    onClick={() => setMaxIntensity(lvl.value)}
                    className={`rounded-xl border-2 py-2.5 text-center text-sm font-semibold transition-all ${
                      maxIntensity === lvl.value
                        ? 'border-primary bg-primary/10 text-primary shadow-sm'
                        : 'border-muted text-muted-foreground hover:border-muted-foreground/30'
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                {INTENSITY_LEVELS.find((l) => l.value === maxIntensity)?.desc}
              </p>
            </div>

            {/* Theme filter */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-muted-foreground ml-1">
                {t.themes} <span className="font-normal opacity-70">{t.themesHint}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {THEME_OPTIONS.map((t) => {
                  const active = themes.includes(t.value);
                  return (
                    <button
                      key={t.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleTheme(t.value)}
                      className={`rounded-xl border-2 p-2.5 text-left transition-all ${
                        active
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-muted hover:border-muted-foreground/30'
                      }`}
                    >
                      <span className={`block text-sm font-semibold ${active ? 'text-primary' : ''}`}>{t.label}</span>
                      <span className="block text-[10px] text-muted-foreground leading-snug mt-0.5">{t.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Premium packs */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground ml-1 flex items-center gap-2">
            {t.premiumPacks}
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {fmt(t.priceForever, { price: premiumPrice })}
            </span>
          </label>
          <div className="grid gap-2">
            {PREMIUM_PACKS.map((p) => {
              const active = selectedPack === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => selectPack(p.value)}
                  className={`group relative rounded-xl border-2 p-3 text-left transition-all ${
                    active ? 'border-primary bg-primary/5 shadow-sm' : 'border-dashed border-muted-foreground/30 hover:border-muted-foreground/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className={`text-sm font-semibold ${active ? 'text-primary' : ''}`}>{p.label}</span>
                      <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{p.desc}</p>
                    </div>
                    <span className="shrink-0 text-xs">{active ? '✓' : '🔒'}</span>
                  </div>
                </button>
              );
            })}
          </div>
          {premiumMode && (
            <p className="text-[10px] text-muted-foreground ml-1">
              {fmt(t.premiumNote, { price: premiumPrice })}
            </p>
          )}
        </div>

        {/* Question count — packs use their whole curated set, so hide this */}
        {!premiumMode && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">{t.howMany}</label>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNTS.map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`rounded-xl border-2 py-3 text-center font-semibold transition-all ${
                    questionCount === count
                      ? 'border-primary bg-primary/5 text-primary shadow-sm'
                      : 'border-muted text-muted-foreground hover:border-muted-foreground/30'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {questionCount <= 10 ? t.countFew : questionCount === 20 ? t.countMid : t.countMany}
            </p>
          </div>
        )}

        {/* Paywall card — shown when a premium pack is chosen but not yet unlocked */}
        {paywall ? (
          <div className="space-y-3 rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-sm font-semibold">{t.paywallTitle}</p>
            <p className="text-[11px] text-muted-foreground">
              {fmt(t.paywallText, { price: premiumPrice })}
            </p>
            <label className="flex cursor-pointer items-start gap-2 text-left text-[11px] text-muted-foreground">
              <input type="checkbox" checked={waiver} onChange={(e) => setWaiver(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />
              <span>
                {t.waiver}{' '}
                <a href={localePath(locale, '/podminky')} target="_blank" rel="noopener" className="underline">
                  {t.termsLink}
                </a>
              </span>
            </label>
            <Button className="w-full" onClick={() => startCheckout(paywall.userId)} disabled={loading || !waiver}>
              {loading ? t.redirecting : fmt(t.pay, { price: premiumPrice })}
            </Button>
            <button
              type="button"
              className="text-[11px] text-muted-foreground underline"
              onClick={() => setPaywall(null)}
              disabled={loading}
            >
              {t.back}
            </button>
          </div>
        ) : (
          <>
            {/* Email form */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleStart(email); }}
              className="space-y-3"
            >
              <div className="space-y-1 text-left">
                <label className="text-xs font-medium text-muted-foreground ml-1">
                  {premiumMode ? t.emailLabelPremium : t.emailLabel}
                </label>
                <Input
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isConfigured || loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !isConfigured || !email}>
                {loading ? t.starting : premiumMode ? t.continue : t.startEmail}
              </Button>
            </form>

            {/* Anonymous start — not available for premium (entitlement needs an account) */}
            {!premiumMode && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="rounded-full bg-background px-2 text-muted-foreground">{t.or}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStart()}
                    disabled={loading || !isConfigured}
                  >
                    {loading ? t.starting : t.startAnon}
                  </Button>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {t.anonNote}
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
