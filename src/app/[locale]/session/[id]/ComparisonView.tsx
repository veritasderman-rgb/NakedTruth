'use client';

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generateNextSession } from "@/app/actions/session";
import { createTier2Checkout } from "@/app/actions/billing";
import { track } from "@/lib/analytics";
import { ChevronRight, BarChart3, Share2, Lock } from "lucide-react";
import type { LocalizedQuestion } from "@/lib/questions";

type Answer = {
  question_id: number;
  user_id: string;
  answer_yes_no: boolean | null;
  answer_frequency: number | null;
  answer_text: string | null;
};

function rawValue(a: Answer | undefined): string | null | undefined {
  if (!a) return undefined;
  return a.answer_yes_no?.toString() ?? a.answer_frequency?.toString() ?? a.answer_text;
}

export default function ComparisonView({
  session,
  questions,
  answers,
  partnerAId,
  partnerBId,
  myUserId,
}: {
  session: any;
  questions: LocalizedQuestion[];
  answers: Answer[];
  partnerAId: string;
  partnerBId: string;
  myUserId: string;
}) {
  const t = useTranslations('results');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const formatValue = (val: any, q: LocalizedQuestion): string => {
    if (val === null || val === undefined) return tc('noAnswer');
    if (q.kind === 'yes_no') return val === 'true' ? tc('yes') : tc('no');
    if (q.kind === 'frequency_1_5') {
      const n = parseInt(val);
      if (n === 1) return q.scaleLow ?? '1';
      if (n === 5) return q.scaleHigh ?? '5';
      return `${n}/5`;
    }
    return val;
  };

  const getMatchLabel = (percent: number): { text: string; color: string } => {
    if (percent >= 80) return { text: t('matchHigh'), color: 'text-green-600' };
    if (percent >= 60) return { text: t('matchMed'), color: 'text-emerald-600' };
    if (percent >= 40) return { text: t('matchLow'), color: 'text-amber-600' };
    return { text: t('matchVeryLow'), color: 'text-orange-600' };
  };

  const questionData = questions.map((q) => {
    const ansA = answers.find((a) => a.question_id === q.id && a.user_id === partnerAId);
    const ansB = answers.find((a) => a.question_id === q.id && a.user_id === partnerBId);
    const valA = rawValue(ansA);
    const valB = rawValue(ansB);
    const isMatch = valA === valB && valA !== null && valA !== undefined && q.kind !== 'short_answer';
    return { q, valA, valB, isMatch };
  });

  const comparableQuestions = questionData.filter((d) => d.q.kind !== 'short_answer');
  const matchCount = comparableQuestions.filter((d) => d.isMatch).length;
  const matchPercent = comparableQuestions.length > 0 ? Math.round((matchCount / comparableQuestions.length) * 100) : 0;
  const matchLabel = getMatchLabel(matchPercent);

  const allRevealed = revealedCount >= questions.length;

  useEffect(() => {
    track('reveal_viewed', { matchPercent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (allRevealed && !showSummary) {
      const timer = setTimeout(() => setShowSummary(true), 400);
      return () => clearTimeout(timer);
    }
  }, [allRevealed, showSummary]);

  const handleRevealNext = () => {
    if (revealedCount < questions.length) setRevealedCount((prev) => prev + 1);
  };
  const handleRevealAll = () => setRevealedCount(questions.length);

  const handleNextSession = async () => {
    setGenerating(true);
    try {
      await generateNextSession(session.couple_id, myUserId);
    } catch (error: any) {
      if (error?.digest?.startsWith?.('NEXT_REDIRECT')) throw error;
      console.error(error);
      setGenerating(false);
    }
  };

  const handleUnlockTier2 = async () => {
    setUnlocking(true);
    track('paywall_viewed', { source: 'results' });
    try {
      track('checkout_started', { product: 'tier_2' });
      const res = await createTier2Checkout();
      if (res.ok) {
        window.location.href = res.url;
      } else if (res.reason === 'auth_required') {
        router.push('/login');
      } else {
        setUnlocking(false);
      }
    } catch (err) {
      console.error(err);
      setUnlocking(false);
    }
  };

  const handleShare = async () => {
    const text = t('shareText', { percent: matchPercent, label: matchLabel.text });
    const url = typeof window !== 'undefined' ? window.location.origin : '';
    track('share_clicked', { matchPercent });
    if (navigator.share) {
      try {
        await navigator.share({ title: tc('brand'), text, url });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2 text-sm">{t('subtitle')}</p>

        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('revealed', { revealed: revealedCount, total: questions.length })}</span>
            {!allRevealed && (
              <button onClick={handleRevealAll} className="underline hover:text-foreground transition-colors">
                {t('revealAll')}
              </button>
            )}
          </div>
          <Progress value={(revealedCount / questions.length) * 100} className="h-2" />
        </div>
      </header>

      <div className="space-y-4">
        {questionData.map((item, index) => {
          const isRevealed = index < revealedCount;

          if (!isRevealed) {
            if (index === revealedCount) {
              return (
                <button key={item.q.id} onClick={handleRevealNext} className="w-full group">
                  <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/40 transition-all cursor-pointer">
                    <CardContent className="flex items-center justify-center gap-2 py-8">
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {t('revealQuestion', { number: index + 1 })}
                      </span>
                    </CardContent>
                  </Card>
                </button>
              );
            }
            return null;
          }

          return (
            <div
              key={item.q.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${Math.min(index * 50, 200)}ms`, animationFillMode: 'backwards' }}
            >
              <Card className={`transition-all ${item.isMatch ? "border-green-200 bg-green-50/30" : "border-none shadow-sm"}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                      <CardTitle className="text-base font-medium leading-snug">{item.q.prompt}</CardTitle>
                    </div>
                    {item.isMatch && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none shrink-0">
                        {t('match')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 pt-2 border-t border-muted/50">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/70">{t('partnerA')}</span>
                      <p className="text-sm font-semibold text-foreground/90">{formatValue(item.valA, item.q)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/70">{t('partnerB')}</span>
                      <p className="text-sm font-semibold text-foreground/90">{formatValue(item.valB, item.q)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {allRevealed && (
        <div className={`mt-10 transition-all duration-700 ${showSummary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg">
            <CardContent className="py-8 text-center space-y-4">
              <BarChart3 className="h-8 w-8 mx-auto text-primary" />
              <div>
                <p className="text-5xl font-bold text-primary">{matchPercent}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('matchSummary', { count: matchCount, total: comparableQuestions.length })}
                </p>
              </div>
              <p className={`text-lg font-semibold ${matchLabel.color}`}>{matchLabel.text}</p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button className="flex-1 h-12 text-base shadow-lg" onClick={handleNextSession} disabled={generating}>
                  {generating ? t('generating') : t('nextRound')}
                </Button>
                <Button variant="outline" className="flex-1 h-12 text-base" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('shareResult')}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">{t('nextRoundTeaser')}</p>
            </CardContent>
          </Card>

          {/* tier_2 paywall upsell */}
          <Card className="mt-4 border-2 border-amber-200 bg-amber-50/40">
            <CardContent className="py-6 text-center space-y-3">
              <Lock className="h-6 w-6 mx-auto text-amber-600" />
              <p className="text-base font-semibold">{t('unlockTier2Title')}</p>
              <p className="text-sm text-muted-foreground">{t('unlockTier2Desc')}</p>
              <Button
                variant="outline"
                className="h-11 border-amber-300 text-amber-800 hover:bg-amber-100"
                onClick={handleUnlockTier2}
                disabled={unlocking}
              >
                {unlocking ? t('redirecting') : t('unlockTier2Cta')}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
