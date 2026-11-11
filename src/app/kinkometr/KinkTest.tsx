'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { saveKinkProfile } from '../actions/kink';
import { ANSWER_OPTIONS, CUP_BY_KEY, CUPS, MODES, questionsFor, type KinkMode } from '@/lib/kink';

export default function KinkTest({
  initialMode,
  lockedMode,
  partnerId,
  isConfigured,
}: {
  initialMode: KinkMode;
  lockedMode: boolean;
  partnerId: string | null;
  isConfigured: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<KinkMode>(initialMode);
  const [adult, setAdult] = useState(false);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const questions = useMemo(() => questionsFor(mode), [mode]);

  const finish = async (all: Record<string, number>) => {
    setSaving(true);
    setError(null);
    try {
      const { id } = await saveKinkProfile(mode, all, partnerId ?? undefined);
      router.push(
        partnerId ? `/kinkometr/porovnani/${id}/${partnerId}` : `/kinkometr/vysledek/${id}`
      );
    } catch (err: any) {
      console.error('Failed to save kink profile:', err);
      setError('Výsledek se nepodařilo uložit. Zkuste to prosím znovu.');
      setSaving(false);
    }
  };

  const answer = (value: number) => {
    if (saving) return;
    const q = questions[index];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (index + 1 < questions.length) setIndex(index + 1);
    else finish(next);
  };

  // ---------- Intro ----------
  if (!started) {
    return (
      <div className="space-y-7">
        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight">
            {partnerId ? 'Partner/ka tě zve k porovnání pohárů' : 'Jak plné máš poháry?'}
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            {partnerId
              ? 'Odpověz na stejné otázky. Hned potom uvidíte, které poháry máte plné oba, kde se doplňujete a o čem si promluvit. Partner/ka uvidí tvoje poháry, ne jednotlivé odpovědi.'
              : 'Každá oblast — od něhy po BDSM — je jeden pohár. Podle odpovědí se naplní a ty uvidíš, co tě láká, co ne a co stojí za prozkoumání. K tomu tipy na aktivity, polohy, místa i kde potkat podobně naladěné lidi.'}
          </p>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
          <p className="font-semibold">Nevíš? To je taky odpověď.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Spousta lidí si není jistá, co by se jim líbilo. U každé otázky můžeš zvolit „Nevím“ —
            takový pohár označíme jako neprozkoumaný a poradíme, jak to v klidu zjistit.
          </p>
        </div>

        {!lockedMode && (
          <div className="space-y-2">
            <p className="ml-1 text-xs font-medium text-muted-foreground">Vyber si test</p>
            {(Object.keys(MODES) as KinkMode[]).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => setMode(m)}
                className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                  mode === m ? 'border-primary bg-primary/10' : 'border-muted hover:border-muted-foreground/40'
                }`}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className={`text-sm font-semibold ${mode === m ? 'text-primary' : ''}`}>{MODES[m].label}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">~{MODES[m].minutes} min</span>
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{MODES[m].desc}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {CUPS.filter((c) => (mode === 'bdsm' ? c.bdsm : true)).map((c) => (
            <span
              key={c.key}
              className="rounded-full border px-2 py-0.5 text-[11px]"
              style={{ borderColor: `${c.color}88`, color: c.color }}
            >
              {c.label}
            </span>
          ))}
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={adult}
            onChange={(e) => setAdult(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
          />
          <span>Je mi 18 nebo víc a chci vidět otevřený obsah o sexu.</span>
        </label>

        {!isConfigured && (
          <p className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200">
            Chybí konfigurace databáze (DATABASE_URL) — výsledek nepůjde uložit.
          </p>
        )}

        <Button className="w-full" size="lg" disabled={!adult || !isConfigured} onClick={() => setStarted(true)}>
          Začít ({questions.length} otázek)
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          Anonymně, bez registrace. Výsledek uvidí jen ten, kdo má odkaz.
        </p>
      </div>
    );
  }

  // ---------- Test ----------
  const q = questions[index];
  const cup = CUP_BY_KEY[q.cup];
  const progress = Math.round((index / questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {index + 1} / {questions.length}
          </span>
          <span style={{ color: cup.color }}>{cup.label}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: cup.color, boxShadow: `0 0 10px ${cup.color}` }}
          />
        </div>
      </div>

      <h2 key={q.id} className="animate-in fade-in min-h-[5.5rem] text-balance text-xl font-semibold leading-snug">
        {q.text}
      </h2>

      <div className="grid gap-2">
        {ANSWER_OPTIONS.map((opt) => {
          const selected = answers[q.id] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={saving}
              onClick={() => answer(opt.value)}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all disabled:opacity-50 ${
                selected ? 'border-primary bg-primary/15 text-primary' : 'border-muted hover:border-muted-foreground/50'
              } ${opt.value === 2 ? 'border-dashed' : ''}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          className="text-xs text-muted-foreground underline disabled:opacity-40"
          disabled={index === 0 || saving}
          onClick={() => setIndex(index - 1)}
        >
          ← Zpět
        </button>
        {saving && <span className="text-xs text-muted-foreground">Plním poháry…</span>}
      </div>

      {error && (
        <div className="space-y-2 rounded-md bg-destructive/20 p-3 text-sm text-red-200">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={() => finish(answers)}>
            Zkusit znovu
          </Button>
        </div>
      )}
    </div>
  );
}
