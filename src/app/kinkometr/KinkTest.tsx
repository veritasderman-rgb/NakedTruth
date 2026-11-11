'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { saveKinkProfile } from '../actions/kink';
import { fmt, localePath, type Locale } from '@/lib/i18n';
import {
  ANSWER_VALUES,
  CUP_BY_KEY,
  GROUP_KEYS,
  MISSING_MAX,
  MODE_KEYS,
  MODE_MINUTES,
  UNSURE_VALUE,
  cupsFor,
  deepCandidates,
  deepQuestionsFor,
  questionsFor,
  scoreAnswers,
  type CupKey,
  type GroupKey,
  type KinkMode,
  type KinkQuestion,
} from '@/lib/kink';

// The slice of the locale content the test needs in the browser.
export type TestContent = {
  ui: Record<string, string>;
  groups: Record<GroupKey, { label: string; desc: string }>;
  modes: Record<KinkMode, { label: string; desc: string }>;
  answers: string[];
  cups: Record<CupKey, { label: string; desc: string; base: string[]; deep: string[] }>;
};

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
  locale,
  content,
  initialMode,
  lockedMode,
  inviteToken,
  isConfigured,
}: {
  locale: Locale;
  content: TestContent;
  initialMode: KinkMode;
  lockedMode: boolean;
  inviteToken: string | null;
  isConfigured: boolean;
}) {
  const router = useRouter();
  const t = content.ui;
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
      router.push(localePath(locale, partnerToken ? `/kinkometr/porovnani/${id}/${partnerToken}` : `/kinkometr/vysledek/${id}`));
    } catch (err: any) {
      console.error('Failed to save kink profile:', err);
      setError(t.saveError);
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
            {inviteToken ? t.introTitleInvite : t.introTitle}
          </h1>
          <p className="text-pretty text-sm text-muted-foreground">{inviteToken ? t.introLeadInvite : t.introLead}</p>
        </div>

        <div className="glass rounded-xl p-4 text-sm">
          <p className="font-semibold">{t.unsureTitle}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t.unsureText}</p>
        </div>

        {!lockedMode && (
          <div className="space-y-2">
            <p className="ml-1 text-xs font-medium text-muted-foreground">{t.pickTest}</p>
            {MODE_KEYS.map((m) => (
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
                  <span className={`text-sm font-semibold ${mode === m ? 'text-primary' : ''}`}>{content.modes[m].label}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{fmt(t.minutes, { n: MODE_MINUTES[m] })}</span>
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{fmt(content.modes[m].desc, { n: cupsFor(m).length })}</span>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {GROUP_KEYS.filter((g) => cups.some((c) => c.group === g)).map((g) => (
            <div key={g}>
              <p className="text-[11px] font-medium text-muted-foreground">{content.groups[g].label}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {cups.filter((c) => c.group === g).map((c) => (
                  <span key={c.key} className="rounded-full border px-2 py-0.5 text-[11px]" style={{ borderColor: `${c.color}88`, color: c.color }}>
                    {content.cups[c.key].label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="ml-1 text-xs font-medium text-muted-foreground">
            {t.aboutYou} <span className="font-normal opacity-70">{t.aboutYouHint}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Chip active={single === false} onClick={() => setSingle(single === false ? null : false)}>{t.hasPartner}</Chip>
            <Chip active={single === true} onClick={() => setSingle(single === true ? null : true)}>{t.isSingle}</Chip>
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip active={lowDesire === false} onClick={() => setLowDesire(lowDesire === false ? null : false)}>{t.sexImportant}</Chip>
            <Chip active={lowDesire === true} onClick={() => setLowDesire(lowDesire === true ? null : true)}>{t.sexNotImportant}</Chip>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input
            type="checkbox"
            checked={adult}
            onChange={(e) => setAdult(e.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]"
          />
          <span>{t.adult}</span>
        </label>

        {!isConfigured && (
          <p className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-3 text-xs text-yellow-200">
            {t.dbMissing}
          </p>
        )}

        <Button className="w-full" size="lg" disabled={!adult || !isConfigured} onClick={() => setStage('round1')}>
          {fmt(t.start, { n: round1.length })}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          {t.footAnon} {single === true ? t.footSingle : t.footPrivate}
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
          <p className="text-[11px] text-muted-foreground">{t.round1Done}</p>
          <h2 className="text-balance text-2xl font-semibold tracking-tight">{t.offerTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.offerLead}</p>
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
                  <span className="block text-sm font-semibold" style={{ color: cup.color }}>{content.cups[key].label}</span>
                  <span className="block text-[11px] text-muted-foreground">{content.cups[key].desc}</span>
                </span>
                <span aria-hidden className="text-sm">{active ? '✓' : '+'}</span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <Button className="w-full" size="lg" disabled={deepCups.length === 0} onClick={() => { setIndex(0); setStage('round2'); }}>
            {fmt(t.goDeeper, { n: deepCups.length * 3 })}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => { setDeepCups([]); setStage('finish'); }}>
            {t.skip}
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
          <h2 className="text-balance text-2xl font-semibold tracking-tight">{t.missingTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.missingLead}</p>
        </div>
        <textarea
          value={missing}
          onChange={(e) => setMissing(e.target.value.slice(0, MISSING_MAX))}
          rows={3}
          placeholder={t.missingPlaceholder}
          className="w-full rounded-xl border bg-transparent p-3 text-sm outline-none focus:border-primary"
        />
        <Button className="w-full" size="lg" disabled={saving} onClick={submit}>
          {saving ? t.saving : t.showCups}
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
            {stage === 'round2' ? `${t.deeper} · ` : ''}
            <span data-testid="counter">{index + 1} / {questions.length}</span>
          </span>
          <span data-testid="cup" style={{ color: cup.color }}>{content.cups[q.cup].label}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: cup.color, boxShadow: `0 0 10px ${cup.color}` }}
          />
        </div>
      </div>

      <h2 key={q.id} className="animate-in fade-in min-h-[5.5rem] text-balance text-xl font-semibold leading-snug">
        {content.cups[q.cup][q.round][q.index]}
      </h2>

      <div className="grid gap-2">
        {ANSWER_VALUES.map((value) => {
          const selected = answers[q.id] === value;
          return (
            <button
              key={value}
              type="button"
              data-value={value}
              onClick={() => answer(questions, value)}
              className={`rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ${
                selected ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.03] hover:border-white/40'
              } ${value === UNSURE_VALUE ? 'border-dashed' : ''}`}
            >
              {content.answers[value]}
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
        {t.back}
      </button>
    </div>
  );
}
