'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startSession } from "./actions/session";

type TierPref = 'vanilla' | 'spicy' | 'mixed';

const QUESTION_COUNTS = [5, 10, 20, 40] as const;
const PREMIUM_PRICE_CZK = 29;

const TIER_OPTIONS: { value: TierPref; label: string; desc: string }[] = [
  { value: 'vanilla', label: 'Vztahy & soužití', desc: 'Každodenní život, komunikace, hodnoty a plány do budoucna' },
  { value: 'spicy', label: 'Pod peřinou', desc: 'Intimita, touhy, fantazie a vše, co se normálně neřekne nahlas' },
  { value: 'mixed', label: 'Namixuj obojí', desc: 'Půlka vztahových, půlka pikantních — nejlepší z obou světů' },
];

// Intensity ceiling for tier_2 (spicy/mixed) questions. Matches the
// `intensity` column on questions (1–3) and the RPC's p_max_intensity.
const INTENSITY_LEVELS: { value: number; label: string; desc: string }[] = [
  { value: 1, label: 'Jemné', desc: 'Spíš náznaky a otevřená komunikace' },
  { value: 2, label: 'Odvážné', desc: 'Konkrétnější touhy a fantazie' },
  { value: 3, label: 'Bez hranic', desc: 'Naplno a bez filtrů' },
];

// Optional theme filter for tier_2 questions. Empty selection = all themes.
// Values match the `theme` column on questions and the RPC's p_themes.
const THEME_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: 'explicit', label: 'Bez obalu', desc: 'Přímé otázky o sexu a touhách' },
  { value: 'fantasy', label: 'Fantazie', desc: 'Tajné představy a zkušenosti' },
  { value: 'bdsm', label: 'Dominance & submise', desc: 'Moc, hranice, role' },
  { value: 'compat', label: 'Sladění', desc: 'Jak vám to spolu sedí' },
];

// Premium thematic packs. `value` matches questions.pack. Unlocked by the
// one-time premium purchase.
const PREMIUM_PACKS: { value: string; label: string; desc: string }[] = [
  { value: 'fantazie_bez_filtru', label: 'Fantazie bez filtrů', desc: 'Nejodvážnější otázky o touhách, fantaziích a hranicích' },
];

export default function HomeForm({ isConfigured, missingVars }: { isConfigured: boolean, missingVars: string[] }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [tierPref, setTierPref] = useState<TierPref>('vanilla');
  const [maxIntensity, setMaxIntensity] = useState<number>(3);
  const [themes, setThemes] = useState<string[]>([]); // empty = all themes
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<{ userId: string } | null>(null);
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
    setLoading(true);
    setError(null);
    try {
      const result = await startSession(
        emailToUse, questionCount, tierPref, maxIntensity, themes, selectedPack ?? undefined
      );
      // On success startSession redirects; only a paywall signal returns here.
      if (result?.paywall) {
        setPaywall({ userId: result.userId });
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "Něco se nepovedlo. Zkontrolujte připojení k databázi.");
      setLoading(false);
    }
  };

  const startCheckout = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(
        data.error === 'stripe_not_configured'
          ? 'Platby zatím nejsou nastavené. Zkuste to prosím později.'
          : 'Platbu se nepodařilo spustit. Zkuste to prosím znovu.'
      );
    } catch {
      setError('Platbu se nepodařilo spustit. Zkuste to prosím znovu.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {!isConfigured && (
        <div className="mt-8 rounded-md bg-yellow-50 p-4 text-left text-xs text-yellow-800 border border-yellow-200">
          <p className="font-bold text-sm">Chybí konfigurace</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            {missingVars.map(v => <li key={v}>{v}</li>)}
          </ul>
          <p className="mt-2">Přidejte tyto proměnné do nastavení projektu na Vercelu.</p>
        </div>
      )}

      {premiumNotice === 'success' && (
        <div className="mt-8 rounded-md bg-green-50 p-3 text-sm text-green-800 border border-green-200">
          Premium odemčeno 🎉 Vyberte balíček a zadejte stejný e-mail, se kterým jste platili.
        </div>
      )}
      {premiumNotice === 'cancelled' && (
        <div className="mt-8 rounded-md bg-muted p-3 text-sm text-muted-foreground border">
          Platba byla zrušena. Můžete to zkusit znovu, kdykoli budete chtít.
        </div>
      )}

      <div className="mt-10 space-y-8">
        {/* Tier preference — hidden in premium mode */}
        {!premiumMode && (
          <div className="space-y-3">
            <label className="text-xs font-medium text-muted-foreground ml-1">Jaké otázky chcete?</label>
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
              <label className="text-xs font-medium text-muted-foreground ml-1">Jak ostré to má být?</label>
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
                Témata <span className="font-normal opacity-70">(nepovinné — nic = vše)</span>
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
            Prémiové balíčky
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {PREMIUM_PRICE_CZK} Kč napořád
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
              Jednorázových {PREMIUM_PRICE_CZK} Kč odemkne všechny prémiové balíčky — napořád, pro tebe i partnera. Vyžaduje e-mail.
            </p>
          )}
        </div>

        {/* Question count */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground ml-1">Kolik otázek?</label>
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
            {questionCount <= 10 ? 'Rychlá ochutnávka' : questionCount === 20 ? 'Ideální porce' : 'Pro ty, co se nebojí jít do hloubky'}
          </p>
        </div>

        {/* Paywall card — shown when a premium pack is chosen but not yet unlocked */}
        {paywall ? (
          <div className="space-y-3 rounded-xl border-2 border-primary/30 bg-primary/5 p-4 text-center">
            <p className="text-sm font-semibold">Odemkni prémiové balíčky</p>
            <p className="text-[11px] text-muted-foreground">
              Jednorázových {PREMIUM_PRICE_CZK} Kč — žádné předplatné. Platí napořád a odemkne všechny balíčky.
            </p>
            <Button className="w-full" onClick={() => startCheckout(paywall.userId)} disabled={loading}>
              {loading ? "Přesměrovávám..." : `Zaplatit ${PREMIUM_PRICE_CZK} Kč`}
            </Button>
            <button
              type="button"
              className="text-[11px] text-muted-foreground underline"
              onClick={() => setPaywall(null)}
              disabled={loading}
            >
              Zpět
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
                  {premiumMode ? 'E-mail (nutný pro Premium)' : 'E-mail (pro zaslání výsledků)'}
                </label>
                <Input
                  type="email"
                  placeholder="vás@email.cz"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isConfigured || loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !isConfigured || !email}>
                {loading ? "Startuji..." : premiumMode ? "Pokračovat" : "Začít s e-mailem"}
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
                    <span className="bg-background px-2 text-muted-foreground">Nebo</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleStart()}
                    disabled={loading || !isConfigured}
                  >
                    {loading ? "Startuji..." : "Začít anonymně"}
                  </Button>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Při anonymním vstupu budete muset odkaz partnerovi poslat ručně. Výsledky se nebudou mít kam uložit pro pozdější přístup.
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
