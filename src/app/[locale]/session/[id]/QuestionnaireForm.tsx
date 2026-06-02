'use client';

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AgeGate, hasAgeConsent } from "@/components/AgeGate";
import { saveAnswer, completeRound } from "@/app/actions/session";
import { track } from "@/lib/analytics";
import type { LocalizedQuestion } from "@/lib/questions";

type ExistingAnswer = {
  question_id: number;
  answer_yes_no: boolean | null;
  answer_frequency: number | null;
  answer_text: string | null;
};

function toValue(a: ExistingAnswer | undefined): string | null {
  if (!a) return null;
  if (a.answer_yes_no !== null) return a.answer_yes_no ? 'true' : 'false';
  if (a.answer_frequency !== null) return a.answer_frequency.toString();
  if (a.answer_text !== null) return a.answer_text;
  return null;
}

export default function QuestionnaireForm({
  sessionId,
  userId,
  questions,
  role,
  existingAnswers,
}: {
  sessionId: string;
  userId: string;
  questions: LocalizedQuestion[];
  role: string;
  existingAnswers: ExistingAnswer[];
}) {
  const t = useTranslations('quiz');
  const tc = useTranslations('common');
  const router = useRouter();

  // Seed answers from anything already saved (resume).
  const initialMap = useMemo(() => {
    const map: Record<number, string> = {};
    for (const q of questions) {
      const v = toValue(existingAnswers.find((a) => a.question_id === q.id));
      if (v !== null) map[q.id] = v;
    }
    return map;
  }, [questions, existingAnswers]);

  const firstUnanswered = useMemo(() => {
    const idx = questions.findIndex((q) => initialMap[q.id] === undefined);
    return idx === -1 ? 0 : idx;
  }, [questions, initialMap]);

  const [answersMap, setAnswersMap] = useState<Record<number, string>>(initialMap);
  const [currentIndex, setCurrentIndex] = useState(firstUnanswered);
  const [currentValue, setCurrentValue] = useState<string | null>(initialMap[questions[firstUnanswered]?.id] ?? null);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;
  const isLastQuestion = currentIndex >= questions.length - 1;
  const canProceed = currentValue !== null && (currentQuestion.kind !== 'short_answer' || currentValue.trim().length > 0);

  const scaleLow = currentQuestion.scaleLow ?? t('scaleLowDefault');
  const scaleHigh = currentQuestion.scaleHigh ?? t('scaleHighDefault');

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setCurrentValue(answersMap[questions[index].id] ?? null);
    setError(null);
  };

  const finish = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await completeRound(sessionId, userId, role);
      track('round_completed', { count: questions.length });
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(t('submitError'));
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (currentValue === null) return;
    setError(null);
    const nextMap = { ...answersMap, [currentQuestion.id]: currentValue };
    setAnswersMap(nextMap);

    // Autosave this answer; non-fatal on failure (we keep local state).
    setSaving(true);
    try {
      await saveAnswer(sessionId, userId, currentQuestion.id, currentQuestion.kind, currentValue);
      track('question_answered', { index: currentIndex });
    } catch (err) {
      console.error(err);
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }

    if (!isLastQuestion) {
      goTo(currentIndex + 1);
    } else {
      await finish();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  // 18+ gate for the answering partner: only when this round contains tier_2
  // (adult) content, and only if not already confirmed. tier_1 rounds skip it.
  const needsAge = useMemo(() => questions.some((q) => q.tier === 'tier_2'), [questions]);
  const [ageChecked, setAgeChecked] = useState(false);
  const [ageOk, setAgeOk] = useState(false);
  useEffect(() => {
    setAgeOk(!needsAge || hasAgeConsent());
    setAgeChecked(true);
  }, [needsAge]);

  if (needsAge && !ageOk) {
    if (!ageChecked) return null; // avoid flashing adult content before the check
    return <AgeGate onConfirm={() => setAgeOk(true)} onCancel={() => router.push('/')} />;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-medium text-muted-foreground">
            {t('progress', { current: currentIndex + 1, total: questions.length })}
          </span>
          <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />

        <Card className="mt-8 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl leading-tight font-semibold">
              {currentQuestion.prompt}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion.kind === 'yes_no' && (
              <RadioGroup value={currentValue || ""} onValueChange={setCurrentValue} className="flex flex-col space-y-3">
                <Label htmlFor="yes" className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors">
                  <RadioGroupItem value="true" id="yes" />
                  <span className="font-medium">{tc('yes')}</span>
                </Label>
                <Label htmlFor="no" className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors">
                  <RadioGroupItem value="false" id="no" />
                  <span className="font-medium">{tc('no')}</span>
                </Label>
              </RadioGroup>
            )}

            {currentQuestion.kind === 'frequency_1_5' && (
              <RadioGroup value={currentValue || ""} onValueChange={setCurrentValue} className="flex flex-col space-y-3">
                {[1, 2, 3, 4, 5].map((val) => (
                  <Label key={val} htmlFor={`f-${val}`} className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors">
                    <RadioGroupItem value={val.toString()} id={`f-${val}`} />
                    <span className="font-medium">
                      {val === 1 ? scaleLow : val === 5 ? scaleHigh : val}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.kind === 'short_answer' && (
              <Textarea
                placeholder={t('answerPlaceholder')}
                value={currentValue || ''}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="min-h-[150px] resize-none"
              />
            )}

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-3">
            {currentIndex > 0 && (
              <Button variant="outline" className="h-12" onClick={handleBack} disabled={submitting}>
                {tc('back')}
              </Button>
            )}
            <Button
              className="flex-1 h-12 text-base"
              onClick={handleNext}
              disabled={!canProceed || submitting || saving}
            >
              {isLastQuestion
                ? (submitting ? t('submitting') : t('finish'))
                : t('next')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
