'use client';

import { useState } from "react";
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

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleNext = () => {
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

  const handleSubmit = async (finalAnswers: any[]) => {
    setSubmitting(true);
    try {
      await submitAnswers(sessionId, userId, finalAnswers, role);
      window.location.reload();
    } catch (error) {
      console.error(error);
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-end">
          <span className="text-xs font-medium text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
          <span className="text-xs font-medium text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl leading-tight">{currentQuestion.prompt}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion.kind === 'yes_no' && (
              <RadioGroup value={currentValue || ""} onValueChange={setCurrentValue} className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="true" id="yes" />
                  <Label htmlFor="yes" className="flex-grow cursor-pointer">Yes</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                  <RadioGroupItem value="false" id="no" />
                  <Label htmlFor="no" className="flex-grow cursor-pointer">No</Label>
                </div>
              </RadioGroup>
            )}

            {currentQuestion.kind === 'frequency_1_5' && (
              <RadioGroup value={currentValue || ""} onValueChange={setCurrentValue} className="flex flex-col space-y-3">
                {[1, 2, 3, 4, 5].map((val) => (
                  <div key={val} className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-accent cursor-pointer">
                    <RadioGroupItem value={val.toString()} id={`f-${val}`} />
                    <Label htmlFor={`f-${val}`} className="flex-grow cursor-pointer">
                      {val === 1 ? 'Never' : val === 5 ? 'Very Often' : val}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.kind === 'short_answer' && (
              <Textarea
                placeholder="Type your answer here..."
                value={currentValue || ''}
                onChange={(e) => setCurrentValue(e.target.value)}
                className="min-h-[120px]"
              />
            )}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleNext}
              disabled={currentValue === null || (currentQuestion.kind === 'short_answer' && !currentValue.trim()) || submitting}
            >
              {currentIndex < questions.length - 1 ? "Next Question" : (submitting ? "Submitting..." : "Finish Session")}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
