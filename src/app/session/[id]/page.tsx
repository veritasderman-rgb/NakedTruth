import { getSupabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
export const dynamic = 'force-dynamic';

import QuestionnaireForm from "./QuestionnaireForm";
import InvitePartner from "./InvitePartner";
import ComparisonView from "./ComparisonView";

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  const supabase = getSupabaseAdmin();

  try {
    // 1. Validate session and token
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      console.error("Session lookup error:", sessionError);
      return (
        <div className="p-8 text-center">
          <h1 className="text-xl font-bold">Session not found</h1>
          <p className="text-muted-foreground mt-2">Error: {sessionError?.message || "Unknown error"}</p>
          <p className="text-xs mt-4 text-muted-foreground">ID: {id}</p>
        </div>
      );
    }

    let role: "partner_a" | "partner_b" | null = null;
    if (session.partner_a_access_token === token) {
      role = "partner_a";
    } else if (session.partner_b_access_token === token) {
      role = "partner_b";
    }

    if (!role) {
      return <div className="p-8 text-center">Invalid access token.</div>;
    }

  // 2. Check if this partner already completed
  const isCompletedByMe = role === "partner_a" ? !!session.partner_a_completed_at : !!session.partner_b_completed_at;

  // 3. If both completed, show comparison
  if (session.status === "completed") {
    // Fetch answers and questions
    const { data: questions } = await supabase
      .from("session_questions")
      .select("question_id, questions(*)")
      .eq("session_id", id)
      .order("question_order");

    const { data: answers } = await supabase
      .from("answers")
      .select("*")
      .eq("session_id", id);

    const myUserId = role === "partner_a" ? session.partner_a_user_id : session.partner_b_user_id;
    return <ComparisonView session={session} questions={questions || []} answers={answers || []} myUserId={myUserId} />;
  }

  // 4. If I'm done but partner isn't, show invite/waiting
  if (isCompletedByMe) {
    return <InvitePartner sessionId={id} session={session} role={role} />;
  }

  // 5. Otherwise, show questionnaire
  const { data: sessionQuestions, error: questionsError } = await supabase
    .from("session_questions")
    .select("question_id, questions(*)")
    .eq("session_id", id)
    .order("question_order");

  if (questionsError || !sessionQuestions || sessionQuestions.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold">Questions missing</h1>
        <p className="text-muted-foreground mt-2">Could not fetch questions for this session.</p>
        {questionsError && <p className="text-xs mt-2 text-destructive">{questionsError.message}</p>}
      </div>
    );
  }

  const validQuestions = sessionQuestions
    .map(q => q.questions)
    .filter(Boolean); // Filter out any null questions from join

  if (validQuestions.length === 0) {
    return <div className="p-8 text-center">Questions exist in session but could not be loaded from main table.</div>;
  }

  const userId = role === "partner_a" ? session.partner_a_user_id : session.partner_b_user_id;

  return (
    <QuestionnaireForm
      sessionId={id}
      userId={userId}
      questions={validQuestions}
      role={role}
    />
  );
  } catch (err: any) {
    console.error("Critical rendering error in SessionPage:", err);
    return (
      <div className="p-8 text-center text-destructive">
        <h1 className="text-xl font-bold">Something went wrong</h1>
        <p className="mt-2">{err.message || "A rendering error occurred."}</p>
      </div>
    );
  }
}
