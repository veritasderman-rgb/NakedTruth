'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { saveKinkProfile } from '../actions/kink';
import {
  ANSWER_OPTIONS,
  CUP_BY_KEY,
  GROUPS,
  MISSING_MAX,
  MODES,
  cupsFor,
  deepCandidates,
  deepQuestionsFor,
  questionsFor,
  scoreAnswers,
  type CupKey,
  type KinkMode,
  type KinkQuestion,
} from '@/lib/kink';

type Stage = 'intro' | 'round1' | 'offer' | 'round2' | 'finish';

// How many cups are pre-selected for the deeper round.
const DEEP_PRESELECT = 5;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
        active ? 'border-primary bg-primary/15 text-primary' : 'border-muted text-muted-foreground hover:border-muted-foreground/50'
      }`}
    >
      {children}
    </button>
  );
}

export default function KinkTest({
  initialMode,
  lockedMode,
  inviteToken,
  isConfigured,
}: {
  initialMode: KinkMode;
  lockedMode: boolean;
  inviteToken: string | null;
  isConfigured: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<KinkMode>(initialMode);
  const [adult, setAdult] = useState(false);
  const [single, setSingle] = useState<boolean | null>(null);
  const [lowDesire, setLowDesire] = useState<boolean | null>(null);
  const [stage, setStage] = useState<Stage>('intro');
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [deepCups, setDeepCups] = useState<CupKey[]>([]);
  const [missing, setMissing] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const round1 = useMemo(() => questionsFor(mode), [mode]);
  const round2 = useMemo(() => deepQuestionsFor(deepCups), [deepCups]);
  const candidates = useMemo(() => {
    if (stage !== 'offer') return [];
    const scored = scoreAnswers(mode, answers);
    return scored ? deepCandidates(scored.cups) : [];
  }, [stage, mode, answers]);

  const submit = async () => {
    setSaving(true);
    setError(null);
    try {
      // Only send deeper answers for cups that are still selected.
      const keep = new Set([...round1, ...round2].map((q) => q.id));
      const clean = Object.fromEntries(Object.entries(answers).filter(([id]) => keep.has(id)));
      const { id, partnerToken } = await saveKinkProfile(mode, clean, {
        inviteToken,
        context: { single: single === true, lowDesire: lowDesire === true },
        missing,
      });
      router.push(partnerToken ? `/kinkometr/porovnani/${id}/${partnerToken}` : `/kinkometr/vysledek/${id}`);
    } catch (err: any) {
      console.error('Failed to save kink profile:', err);
      setError('Výsledek se nepodařilo uložit. Zkuste to prosím znovu.');
      setSaving(false);
    }
  };

  const answer = (questions: KinkQuestion[], value: number) => {
    const q = questions[index];
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }
    setIndex(0);
    if (stage === 'round1') {
      const scored = scoreAnswers(mode, next);
      const cand = scored ? deepCandidates(scored.cups) : [];
      setDeepCups(cand.slice(0, DEEP_PRESELECT));
      setStage(cand.length > 0 ? 'offer' : 'finish');
    } else {
      setStage('finish');
    }
  };

  // ---------- Intro ----------
  if (stage === 'intro') {
    const cups = cupsFor(mode);
    return (
      <div className="space-y-7">
        <div className="space-y-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight">
            {inviteToken ? 'Partner/ka tě zve k porovnání pohárů' : 'Jak plné máš poháry?'}
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">
            {inviteToken
              ? 'Odpověz na stejné otázky. Hned potom uvidíte jen to, na čem se shodnete: poháry, které chcete oba, a ty, kde aspoň jeden váhá. Co jeden z vás nechce, zůstane skryté — a nikdo se nedozví, kdo to byl.'
              : 'Každá oblast — od něhy po BDSM — je jeden pohár. První kolo je krátké a mírné. U pohárů, které tě zaujmou, pak můžeš jít hlouběji. Na konci dostaneš tipy na aktivity, polohy, místa i kde potkat podobně naladěné lidi.'}
          </p>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm">
          <p className="font-semibold">Nevíš? To je taky odpověď.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            U každé otázky můžeš zvolit „Nevím“ — takový pohár označíme jako neprozkoumaný a poradíme, jak to
            v klidu zjistit. A když ti něco nic neříká, je to stejně dobrý výsledek jako plný pohár.
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

        <div className="space-y-2">
          {GROUPS.filter((g) => cups.some((c) => c.group === g.key)).map((g) => (
            <div key={g.key}>
              <p className="text-[11px] font-medium text-muted-foreground">{g.label}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {cups.filter((c) => c.group === g.key).map((c) => (
                  <span key={c.key} className="rounded-full border px-2 py-0.5 text-[11px]" style={{ borderColor: `${c.color}88`, color: c.color }}>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="ml-1 text-xs font-medium text-muted-foreground">
            O tobě <span className="font-normal opacity-70">(nepovinné — jen přizpůsobí texty)</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip active={single === false} onClick={() => setSingle(single === false ? null : false)}>Mám partnera/ku</Chip>
            <Chip active={single === true} onClick={() => setSingle(single === true ? null : true)}>Jsem sám/sama</Chip>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip active={lowDesire === false} onClick={() => setLowDesire(lowDesire === false ? null : false)}>Sex je pro mě důležitý</Chip>
            <Chip active={lowDesire === true} onClick={() => setLowDesire(lowDesire === true ? null : true)}>Sex pro mě moc důležitý není</Chip>
          </div>
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

        <Button className="w-full" size="lg" disabled={!adult || !isConfigured} onClick={() => setStage('round1')}>
          Začít ({round1.length} otázek)
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          Anonymně, bez registrace. {single === true ? 'Otázky mluví o partnerovi — představ si někoho, s kým by ti bylo dobře.' : 'Výsledek uvidí jen ten, kdo má tvůj soukromý odkaz.'}
        </p>
      </div>
    );
  }

  // ---------- Offer: go deeper? ----------
  if (stage === 'offer') {
    const toggle = (key: CupKey) =>
      setDeepCups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">První kolo hotovo</p>
          <h2 className="text-balance text-2xl font-semibold tracking-tight">Chceš jít u některých pohárů hlouběji?</h2>
          <p className="text-sm text-muted-foreground">
            Tyhle tě zaujaly. Druhé kolo má ostřejší otázky a zjistí i to, na které straně chceš být.
            Vyber, co tě zajímá — nebo to přeskoč.
          </p>
        </div>

        <div className="grid gap-2">
          {candidates.map((key) => {
            const cup = CUP_BY_KEY[key];
            const active = deepCups.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(key)}
                className="flex items-center justify-between gap-3 rounded-xl border-2 p-3 text-left transition-all"
                style={{ borderColor: active ? cup.color : 'hsl(var(--muted))', backgroundColor: active ? `${cup.color}18` : undefined }}
              >
                <span>
                  <span className="block text-sm font-semibold" style={{ color: cup.color }}>{cup.label}</span>
                  <span className="block text-[11px] text-muted-foreground">{cup.desc}</span>
                </span>
                <span aria-hidden className="text-sm">{active ? '✓' : '+'}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <Button className="w-full" size="lg" disabled={deepCups.length === 0} onClick={() => { setIndex(0); setStage('round2'); }}>
            Jít hlouběji ({deepCups.length * 3} otázek)
          </Button>
          <Button variant="outline" className="w-full" onClick={() => { setDeepCups([]); setStage('finish'); }}>
            Přeskočit, stačí mi to
          </Button>
        </div>
      </div>
    );
  }

  // ---------- Finish: anything missing? ----------
  if (stage === 'finish') {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-balance text-2xl font-semibold tracking-tight">Chybí ti tu něco?</h2>
          <p className="text-sm text-muted-foreground">
            Žádný test nepokryje všechno. Jestli tě vzrušuje něco, na co jsme se nezeptali, napiš si to sem —
            uvidíš to jen ty u svého výsledku. Nepovinné.
          </p>
        </div>
        <textarea
          value={missing}
          onChange={(e) => setMissing(e.target.value.slice(0, MISSING_MAX))}
          rows={3}
          placeholder="Třeba: vůně, hlas, konkrétní fantazie…"
          className="w-full rounded-xl border bg-transparent p-3 text-sm outline-none focus:border-primary"
        />
        <Button className="w-full" size="lg" disabled={saving} onClick={submit}>
          {saving ? 'Plním poháry…' : 'Ukázat moje poháry'}
        </Button>
        {error && <p className="rounded-md bg-destructive/20 p-3 text-sm text-red-200">{error}</p>}
      </div>
    );
  }

  // ---------- Questions (round 1 or 2) ----------
  const questions = stage === 'round1' ? round1 : round2;
  const q = questions[index];
  const cup = CUP_BY_KEY[q.cup];
  const progress = Math.round((index / questions.length) * 100);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {stage === 'round2' ? 'Hlouběji · ' : ''}
            <span data-testid="counter">{index + 1} / {questions.length}</span>
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
              onClick={() => answer(questions, opt.value)}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                selected ? 'border-primary bg-primary/15 text-primary' : 'border-muted hover:border-muted-foreground/50'
              } ${opt.value === 2 ? 'border-dashed' : ''}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="text-xs text-muted-foreground underline disabled:opacity-40"
        disabled={index === 0}
        onClick={() => setIndex(index - 1)}
      >
        ← Zpět
      </button>
    </div>
  );
}
