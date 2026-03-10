'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { generateNextSession } from "../../actions/session";

export default function ComparisonView({ session, questions, answers, myUserId }: { session: any, questions: any[], answers: any[], myUserId: string }) {
  const [generating, setGenerating] = useState(false);
  const partnerAId = session.partner_a_user_id;
  const partnerBId = session.partner_b_user_id;

  const handleNextSession = async () => {
    setGenerating(true);
    try {
      await generateNextSession(session.couple_id, myUserId);
    } catch (error) {
      console.error(error);
      setGenerating(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold">Výsledky kola</h1>
        <p className="text-muted-foreground mt-2 text-sm">Podívejte se, kde se shodujete a kde máte odlišné pohledy.</p>

        <Button
          className="mt-8 h-12 px-8 text-base shadow-lg"
          onClick={handleNextSession}
          disabled={generating}
        >
          {generating ? "Generuji další kolo..." : "Generovat další kolo"}
        </Button>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Příští kolo bude obsahovat i peprnější otázky z druhé úrovně!
        </p>
      </header>

      <div className="space-y-6">
        {questions.map((q) => {
          const question = q.questions;
          const ansA = answers.find((a) => a.question_id === question.id && a.user_id === partnerAId);
          const ansB = answers.find((a) => a.question_id === question.id && a.user_id === partnerBId);

          const valA = ansA?.answer_yes_no?.toString() ?? ansA?.answer_frequency ?? ansA?.answer_text;
          const valB = ansB?.answer_yes_no?.toString() ?? ansB?.answer_frequency ?? ansB?.answer_text;

          const isMatch = valA === valB && valA !== null && valA !== undefined;

          return (
            <Card key={question.id} className={`${isMatch ? "border-green-200 bg-green-50/20" : "border-none shadow-sm"}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-medium leading-snug">{question.prompt}</CardTitle>
                  {isMatch && question.kind !== 'short_answer' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Shoda</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 pt-2 border-t border-muted/50">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/70">Partner A</span>
                    <p className="text-sm font-semibold text-foreground/90">{formatValue(valA, question.kind)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground/70">Partner B</span>
                    <p className="text-sm font-semibold text-foreground/90">{formatValue(valB, question.kind)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}

function formatValue(val: any, kind: string) {
  if (val === null || val === undefined) return "Bez odpovědi";
  if (kind === 'yes_no') return val === 'true' ? 'Ano' : 'Ne';
  if (kind === 'frequency_1_5') {
    const n = parseInt(val);
    if (n === 1) return 'Nikdy';
    if (n === 5) return 'Velmi často';
    return `${n}/5`;
  }
  return val;
}
