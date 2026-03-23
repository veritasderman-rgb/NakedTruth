'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generateNextSession } from "../../actions/session";
import { ChevronRight, BarChart3, Share2 } from "lucide-react";

function parseScaleLabels(prompt: string): { low: string; high: string; cleanPrompt: string } {
  const match = prompt.match(/\(1\s*=\s*(.+?),\s*5\s*=\s*(.+?)\)\s*$/);
  if (match) {
    return { low: match[1].trim(), high: match[2].trim(), cleanPrompt: prompt.replace(match[0], '').trim() };
  }
  return { low: 'Nikdy', high: 'Velmi často', cleanPrompt: prompt };
}

function formatValue(val: any, kind: string, labels?: { low: string; high: string } | null) {
  if (val === null || val === undefined) return "Bez odpovědi";
  if (kind === 'yes_no') return val === 'true' ? 'Ano' : 'Ne';
  if (kind === 'frequency_1_5') {
    const n = parseInt(val);
    const low = labels?.low ?? 'Nikdy';
    const high = labels?.high ?? 'Velmi často';
    if (n === 1) return low;
    if (n === 5) return high;
    return `${n}/5`;
  }
  return val;
}

function getMatchLabel(percent: number): { text: string; color: string } {
  if (percent >= 80) return { text: 'Jste na stejné vlně', color: 'text-green-600' };
  if (percent >= 60) return { text: 'Solidní základ, je na čem stavět', color: 'text-emerald-600' };
  if (percent >= 40) return { text: 'Máte o čem mluvit', color: 'text-amber-600' };
  return { text: 'Překvapení čeká — na to se podívejte', color: 'text-orange-600' };
}

export default function ComparisonView({ session, questions, answers, myUserId }: { session: any, questions: any[], answers: any[], myUserId: string }) {
  const [generating, setGenerating] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const partnerAId = session.partner_a_user_id;
  const partnerBId = session.partner_b_user_id;

  // Compute match stats
  const questionData = questions.map((q) => {
    const question = q.questions;
    const ansA = answers.find((a: any) => a.question_id === question.id && a.user_id === partnerAId);
    const ansB = answers.find((a: any) => a.question_id === question.id && a.user_id === partnerBId);
    const valA = ansA?.answer_yes_no?.toString() ?? ansA?.answer_frequency?.toString() ?? ansA?.answer_text;
    const valB = ansB?.answer_yes_no?.toString() ?? ansB?.answer_frequency?.toString() ?? ansB?.answer_text;
    const isMatch = valA === valB && valA !== null && valA !== undefined && question.kind !== 'short_answer';
    const labels = question.kind === 'frequency_1_5' ? parseScaleLabels(question.prompt) : null;
    const displayPrompt = labels ? labels.cleanPrompt : question.prompt;
    return { question, valA, valB, isMatch, labels, displayPrompt };
  });

  const comparableQuestions = questionData.filter(q => q.question.kind !== 'short_answer');
  const matchCount = comparableQuestions.filter(q => q.isMatch).length;
  const matchPercent = comparableQuestions.length > 0 ? Math.round((matchCount / comparableQuestions.length) * 100) : 0;
  const matchLabel = getMatchLabel(matchPercent);

  const allRevealed = revealedCount >= questions.length;

  // Show summary after all revealed
  useEffect(() => {
    if (allRevealed && !showSummary) {
      const timer = setTimeout(() => setShowSummary(true), 400);
      return () => clearTimeout(timer);
    }
  }, [allRevealed, showSummary]);

  const handleRevealNext = () => {
    if (revealedCount < questions.length) {
      setRevealedCount(prev => prev + 1);
    }
  };

  const handleRevealAll = () => {
    setRevealedCount(questions.length);
  };

  const handleNextSession = async () => {
    setGenerating(true);
    try {
      await generateNextSession(session.couple_id, myUserId);
    } catch (error) {
      console.error(error);
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    const text = `NakedTruth: Naše shoda je ${matchPercent}% — ${matchLabel.text}! Zkuste to taky:`;
    const url = typeof window !== 'undefined' ? window.location.origin : '';

    if (navigator.share) {
      try {
        await navigator.share({ title: 'NakedTruth', text, url });
      } catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      {/* Header with score teaser */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Výsledky kola</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Odhalujte odpovědi jednu po druhé a porovnejte, kde se shodujete.
        </p>

        {/* Progress bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Odhaleno {revealedCount} z {questions.length}</span>
            {!allRevealed && (
              <button onClick={handleRevealAll} className="underline hover:text-foreground transition-colors">
                Odhalit vše
              </button>
            )}
          </div>
          <Progress value={(revealedCount / questions.length) * 100} className="h-2" />
        </div>
      </header>

      {/* Questions - progressive reveal */}
      <div className="space-y-4">
        {questionData.map((item, index) => {
          const isRevealed = index < revealedCount;

          if (!isRevealed) {
            // Show the "reveal next" button only on the first hidden card
            if (index === revealedCount) {
              return (
                <button
                  key={item.question.id}
                  onClick={handleRevealNext}
                  className="w-full group"
                >
                  <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/40 transition-all cursor-pointer">
                    <CardContent className="flex items-center justify-center gap-2 py-8">
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        Odhalit otázku {index + 1}
                      </span>
                    </CardContent>
                  </Card>
                </button>
              );
            }
            return null; // Hide remaining unrevealed cards
          }

          return (
            <div
              key={item.question.id}
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
                      <CardTitle className="text-base font-medium leading-snug">{item.displayPrompt}</CardTitle>
                    </div>
                    {item.isMatch && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none shrink-0">
                        Shoda
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6 pt-2 border-t border-muted/50">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/70">Partner A</span>
                      <p className="text-sm font-semibold text-foreground/90">{formatValue(item.valA, item.question.kind, item.labels)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/70">Partner B</span>
                      <p className="text-sm font-semibold text-foreground/90">{formatValue(item.valB, item.question.kind, item.labels)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Summary card — appears after all revealed */}
      {allRevealed && (
        <div className={`mt-10 transition-all duration-700 ${showSummary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg">
            <CardContent className="py-8 text-center space-y-4">
              <BarChart3 className="h-8 w-8 mx-auto text-primary" />
              <div>
                <p className="text-5xl font-bold text-primary">{matchPercent}%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Shoda v {matchCount} z {comparableQuestions.length} otázek
                </p>
              </div>
              <p className={`text-lg font-semibold ${matchLabel.color}`}>
                {matchLabel.text}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  className="flex-1 h-12 text-base shadow-lg"
                  onClick={handleNextSession}
                  disabled={generating}
                >
                  {generating ? "Generuji..." : "Další kolo"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-base"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Sdílet výsledek
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Příští kolo bude obsahovat i peprnější otázky z druhé úrovně!
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
