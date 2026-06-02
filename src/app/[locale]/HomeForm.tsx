'use client';

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgeGate } from "@/components/AgeGate";
import { track } from "@/lib/analytics";
import { startSession } from "@/app/actions/session";
import { createTier2Checkout } from "@/app/actions/billing";
import { PAYWALL_ERROR } from "@/lib/constants";

type TierPref = 'vanilla' | 'spicy' | 'mixed';

const QUESTION_COUNTS = [5, 10, 20, 40] as const;
const TIER_VALUES: TierPref[] = ['vanilla', 'spicy', 'mixed'];
const THEME_KEYS = ['explicit', 'bdsm', 'fantasy', 'compat'] as const;

export default function HomeForm({ isConfigured, missingVars }: { isConfigured: boolean, missingVars: string[] }) {
  const t = useTranslations('home');
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [tierPref, setTierPref] = useState<TierPref>('vanilla');
  const [maxIntensity, setMaxIntensity] = useState<number>(2);
  const [themes, setThemes] = useState<string[]>([...THEME_KEYS]);
  const [pendingStart, setPendingStart] = useState<{ email?: string } | null>(null);

  const tierLabels: Record<TierPref, { label: string; desc: string }> = {
    vanilla: { label: t('tierVanillaLabel'), desc: t('tierVanillaDesc') },
    spicy: { label: t('tierSpicyLabel'), desc: t('tierSpicyDesc') },
    mixed: { label: t('tierMixedLabel'), desc: t('tierMixedDesc') },
  };

  const requiresAge = tierPref === 'spicy' || tierPref === 'mixed';

  const runStart = async (emailToUse?: string) => {
    setLoading(true);
    setError(null);
    try {
      const themesToSend = requiresAge && themes.length > 0 ? themes : undefined;
      track('config_selected', { tier: tierPref, count: questionCount, withEmail: !!emailToUse, intensity: requiresAge ? maxIntensity : undefined });
      await startSession(emailToUse, questionCount, tierPref, requiresAge ? maxIntensity : 3, themesToSend);
    } catch (err: any) {
      // Next.js redirect throws — let it bubble.
      if (err?.digest?.startsWith?.('NEXT_REDIRECT')) throw err;

      // tier_2 requested without entitlement → send to checkout (or login).
      if (err?.message === PAYWALL_ERROR) {
        track('paywall_viewed', { source: 'home' });
        const res = await createTier2Checkout();
        if (res.ok) {
          window.location.href = res.url;
          return;
        }
        if (res.reason === 'auth_required') {
          router.push('/login');
          return;
        }
      }

      console.error("Failed to start session:", err);
      setError(err.message || t('genericError'));
      setLoading(false);
    }
  };

  const handleStart = (emailToUse?: string) => {
    // Spicy/mixed needs 18+ confirmation first (package E).
    if (requiresAge) {
      setPendingStart({ email: emailToUse });
      return;
    }
    runStart(emailToUse);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {!isConfigured && missingVars.length > 0 && (
        <div className="mt-8 rounded-md bg-yellow-50 p-4 text-left text-xs text-yellow-800 border border-yellow-200">
          <p className="font-bold text-sm">{t('configMissingTitle')}</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {missingVars.map(v => <li key={v}>{v}</li>)}
          </ul>
          <p className="mt-2">{t('configMissingHint')}</p>
        </div>
      )}

      <div className="mt-10 space-y-8">
        {/* Tier preference */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground ml-1">{t('tierQuestion')}</label>
          <div className="grid gap-2">
            {TIER_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTierPref(value)}
                className={`group relative rounded-xl border-2 p-3 text-left transition-all ${
                  tierPref === value
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    tierPref === value ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                  }`}>
                    {tierPref === value && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${tierPref === value ? 'text-primary' : ''}`}>
                        {tierLabels[value].label}
                      </span>
                      {value !== 'vanilla' && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700">
                          {t('premiumBadge')}
                        </span>
                      )}
                    </span>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{tierLabels[value].desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {requiresAge && (
            <p className="text-[10px] text-muted-foreground ml-1">{t('ageNotice')}</p>
          )}
        </div>

        {/* Spice configurator — only for tier_2 (spicy/mixed) */}
        {requiresAge && (
          <div className="space-y-4 rounded-xl border-2 border-amber-200 bg-amber-50/40 p-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">{t('intensityQuestion')}</label>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setMaxIntensity(lvl)}
                    className={`rounded-lg border-2 py-2 text-xs font-semibold transition-all ${
                      maxIntensity === lvl
                        ? 'border-amber-500 bg-amber-100 text-amber-800'
                        : 'border-muted text-muted-foreground hover:border-amber-300'
                    }`}
                  >
                    {t(`intensity${lvl}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground ml-1">{t('themesQuestion')}</label>
              <div className="grid grid-cols-2 gap-2">
                {THEME_KEYS.map((key) => {
                  const active = themes.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setThemes(active ? themes.filter((x) => x !== key) : [...themes, key])}
                      className={`rounded-lg border-2 px-2 py-2 text-xs font-medium text-left transition-all ${
                        active
                          ? 'border-amber-500 bg-amber-100 text-amber-800'
                          : 'border-muted text-muted-foreground hover:border-amber-300'
                      }`}
                    >
                      {t(`theme_${key}`)}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground ml-1">{t('themesHint')}</p>
            </div>
          </div>
        )}

        {/* Question count */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground ml-1">{t('countQuestion')}</label>
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
            {questionCount <= 10 ? t('countHintShort') : questionCount === 20 ? t('countHintMedium') : t('countHintLong')}
          </p>
        </div>

        {/* Email form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleStart(email); }}
          className="space-y-3"
        >
          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-muted-foreground ml-1">{t('emailLabel')}</label>
            <Input
              type="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isConfigured || loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !isConfigured || !email}>
            {loading ? t('starting') : t('startWithEmail')}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">{t('or')}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleStart()}
            disabled={loading || !isConfigured}
          >
            {loading ? t('starting') : t('startAnonymous')}
          </Button>
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {t('anonymousNote')}
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {pendingStart && (
        <AgeGate
          onConfirm={() => {
            const p = pendingStart;
            setPendingStart(null);
            runStart(p.email);
          }}
          onCancel={() => setPendingStart(null)}
        />
      )}
    </div>
  );
}
