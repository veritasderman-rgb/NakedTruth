'use client';

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitAnswers } from "../../actions/session";

export default function QuestionnaireForm({ sessionId, userId, questions, role }: { sessionId: string, userId: string, questions: any[], role: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [currentValue, setCurrentValue] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const parseScaleLabels = useCallback((prompt: string): { low: string; high: string; cleanPrompt: string } => {
    const match = prompt.match(/\(1\s*=\s*(.+?),\s*5\s*=\s*(.+?)\)\s*$/);
    if (match) {
      return {
        low: match[1].trim(),
        high: match[2].trim(),
        cleanPrompt: prompt.replace(match[0], '').trim(),
      };
    }
    return { low: 'Nikdy', high: 'Velmi často', cleanPrompt: prompt };
  }, []);

  const scaleLabels = currentQuestion.kind === 'frequency_1_5'
    ? parseScaleLabels(currentQuestion.prompt)
    : null;

  const handleNext = () => {
    setError(null);
    const newAnswers = [...answers, {
      questionId: currentQuestion.id,
      kind: currentQuestion.kind,
      value: currentValue
    }];

    if (currentIndex < questions.length - 1) {
      setAnswers(newAnswers);
      setCurrentIndex(currentIndex + 1);
      setCurrentValue(null);
    } else {
      handleSubmit(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setError(null);
      const prevAnswer = answers[answers.length - 1];
      setCurrentValue(prevAnswer?.value ?? null);
      setAnswers(answers.slice(0, -1));
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async (finalAnswers: any[]) => {
    setSubmitting(true);
    setError(null);
    try {
      await submitAnswers(sessionId, userId, finalAnswers, role);
      window.location.reload();
    } catch (err: any) {
      console.error(err);
      setError("Nepodařilo se odeslat odpovědi. Zkuste to znovu.");
      setSubmitting(false);
    }
  };

  const isLastQuestion = currentIndex >= questions.length - 1;
  const canProceed = currentValue !== null && (currentQuestion.kind !== 'short_answer' || currentValue.trim().length > 0);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-medium text-muted-foreground">Otázka {currentIndex + 1} z {questions.length}</span>
          <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />

        <Card className="mt-8 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl leading-tight font-semibold">
              {scaleLabels ? scaleLabels.cleanPrompt : currentQuestion.prompt}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion.kind === 'yes_no' && (
              <RadioGroup value={currentValue || ""} onValueChange={setCurrentValue} className="flex flex-col space-y-3">
                <Label htmlFor="yes" className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors">
                  <RadioGroupItem value="true" id="yes" />
                  <span className="font-medium">Ano</span>
                </Label>
                <Label htmlFor="no" className="flex items-center space-x-2 rounded-lg border p-4 hover:bg-accent cursor-pointer transition-colors">
                  <RadioGroupItem value="false" id="no" />
                  <span className="font-medium">Ne</span>
                </Label>
              </RadioGroup>
            )}

            {currentQuestion.kind === 'frequency_1_5' && (
              <RadioGroup value={currentValue || ""} onValueChange={setCurrentValue} className="flex flex-col space-y-3">
                {[1, 2, 3, 4, 5].map((val) => (
                  <Label key={val} htmlFor={`f-${val}`} className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer transition-colors">
                    <RadioGroupItem value={val.toString()} id={`f-${val}`} />
                    <span className="font-medium">
                      {val === 1 ? scaleLabels!.low : val === 5 ? scaleLabels!.high : val}
                    </span>
                  </Label>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.kind === 'short_answer' && (
              <Textarea
                placeholder="Napište svou odpověď..."
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
              <Button
                variant="outline"
                className="h-12"
                onClick={handleBack}
                disabled={submitting}
              >
                Zpět
              </Button>
            )}
            <Button
              className="flex-1 h-12 text-base"
              onClick={handleNext}
              disabled={!canProceed || submitting}
            >
              {isLastQuestion
                ? (submitting ? "Odesílám..." : "Dokončit kolo")
                : "Další otázka"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
