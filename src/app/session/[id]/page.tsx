import { getSupabaseAdmin } from "@/lib/supabase";
import { notFound } from "next/navigation";
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

  // 1. Validate session and token
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*, couple_members!couple_id(*)")
    .eq("id", id)
    .single();

  if (sessionError || !session) {
    return notFound();
  }

  let role: "partner_a" | "partner_b" | null = null;
  if (session.partner_a_access_token === token) {
    role = "partner_a";
  } else if (session.partner_b_access_token === token) {
    role = "partner_b";
  }

  if (!role) {
    return <div>Invalid access token.</div>;
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

    return <ComparisonView session={session} questions={questions || []} answers={answers || []} />;
  }

  // 4. If I'm done but partner isn't, show invite/waiting
  if (isCompletedByMe) {
    return <InvitePartner sessionId={id} session={session} role={role} />;
  }

  // 5. Otherwise, show questionnaire
  const { data: questions } = await supabase
    .from("session_questions")
    .select("question_id, questions(*)")
    .eq("session_id", id)
    .order("question_order");

  const userId = role === "partner_a" ? session.partner_a_user_id : session.partner_b_user_id;

  return (
    <QuestionnaireForm
      sessionId={id}
      userId={userId}
      questions={(questions || []).map(q => q.questions)}
      role={role}
    />
  );
}
