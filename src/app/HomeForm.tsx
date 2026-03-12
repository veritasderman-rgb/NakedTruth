'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { startSession } from "./actions/session";

type TierPref = 'vanilla' | 'spicy' | 'mixed';

const QUESTION_COUNTS = [5, 10, 20, 40] as const;

const TIER_OPTIONS: { value: TierPref; label: string; desc: string }[] = [
  { value: 'vanilla', label: 'Vztahy & soužití', desc: 'Každodenní život, komunikace, hodnoty a plány do budoucna' },
  { value: 'spicy', label: 'Pod peřinou', desc: 'Intimita, touhy, fantazie a vše, co se normálně neřekne nahlas' },
  { value: 'mixed', label: 'Namixuj obojí', desc: 'Půlka vztahových, půlka pikantních — nejlepší z obou světů' },
];

export default function HomeForm({ isConfigured, missingVars }: { isConfigured: boolean, missingVars: string[] }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [tierPref, setTierPref] = useState<TierPref>('vanilla');

  const handleStart = async (emailToUse?: string) => {
    setLoading(true);
    setError(null);
    try {
      await startSession(emailToUse, questionCount, tierPref);
    } catch (err: any) {
      console.error("Failed to start session:", err);
      setError(err.message || "Něco se nepovedlo. Zkontrolujte připojení k databázi.");
      setLoading(false);
    }
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

      <div className="mt-10 space-y-8">
        {/* Tier preference */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-muted-foreground ml-1">Jaké otázky chcete?</label>
          <div className="grid gap-2">
            {TIER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTierPref(opt.value)}
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

        {/* Email form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleStart(email); }}
          className="space-y-3"
        >
          <div className="space-y-1 text-left">
            <label className="text-xs font-medium text-muted-foreground ml-1">E-mail (pro zaslání výsledků)</label>
            <Input
              type="email"
              placeholder="vás@email.cz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!isConfigured || loading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !isConfigured || !email}>
            {loading ? "Startuji..." : "Začít s e-mailem"}
          </Button>
        </form>

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

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
