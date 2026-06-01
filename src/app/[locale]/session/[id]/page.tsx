import { getSupabaseAdmin } from "@/lib/supabase";
import { localizeQuestions } from "@/lib/questions";
import { joinSession } from "@/app/actions/session";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
export const dynamic = 'force-dynamic';

import QuestionnaireForm from "./QuestionnaireForm";
import InvitePartner from "./InvitePartner";
import ComparisonView from "./ComparisonView";

async function ErrorCard({ title, message, showHome = true }: { title: string; message: string; showHome?: boolean }) {
  const t = await getTranslations("common");
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        {showHome && (
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t("backHome")}
          </Link>
        )}
      </div>
    </main>
  );
}

export default async function SessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; locale: string }>;
  searchParams: Promise<{ token: string }>;
}) {
  const { id, locale } = await params;
  const { token } = await searchParams;
  setRequestLocale(locale);
  const te = await getTranslations("errors");

  if (!token) {
    return <ErrorCard title={te("missingTokenTitle")} message={te("missingTokenMsg")} />;
  }

  const supabase = getSupabaseAdmin();

  try {
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      return <ErrorCard title={te("sessionNotFoundTitle")} message={te("sessionNotFoundMsg")} />;
    }

    let role: "partner_a" | "partner_b" | null = null;
    if (session.partner_a_access_token === token) {
      role = "partner_a";
    } else if (session.partner_b_access_token === token) {
      role = "partner_b";
    }

    if (!role) {
      return <ErrorCard title={te("invalidTokenTitle")} message={te("invalidTokenMsg")} />;
    }

    // If Partner B accessing for the first time and is anonymous
    let userId = role === "partner_a" ? session.partner_a_user_id : session.partner_b_user_id;
    if (role === "partner_b" && !userId) {
      const res = await joinSession(id);
      userId = res.userId;
    }

    const isCompletedByMe = role === "partner_a" ? !!session.partner_a_completed_at : !!session.partner_b_completed_at;

    // If both completed, show comparison
    if (session.status === "completed") {
      const { data: sq } = await supabase
        .from("session_questions")
        .select("question_id, questions(*)")
        .eq("session_id", id)
        .order("question_order");

      const { data: answers } = await supabase
        .from("answers")
        .select("*")
        .eq("session_id", id);

      const rawQuestions = (sq || []).map((r: any) => r.questions).filter(Boolean);
      const questions = await localizeQuestions(supabase, rawQuestions, locale);

      return (
        <ComparisonView
          session={session}
          questions={questions}
          answers={answers || []}
          partnerAId={session.partner_a_user_id}
          partnerBId={session.partner_b_user_id}
          myUserId={userId}
        />
      );
    }

    // If I'm done but partner isn't, show invite/waiting
    if (isCompletedByMe) {
      return <InvitePartner sessionId={id} session={session} role={role} tokenB={session.partner_b_access_token} />;
    }

    // Otherwise, show questionnaire
    const { data: sessionQuestions, error: questionsError } = await supabase
      .from("session_questions")
      .select("question_id, questions(*)")
      .eq("session_id", id)
      .order("question_order");

    if (questionsError) {
      return <ErrorCard title={te("loadTitle")} message={te("loadMsg")} />;
    }

    const rawQuestions = (sessionQuestions || []).map((q: any) => q.questions).filter(Boolean);

    if (rawQuestions.length === 0) {
      return <ErrorCard title={te("noQuestionsTitle")} message={te("noQuestionsMsg")} />;
    }

    const questions = await localizeQuestions(supabase, rawQuestions, locale);

    // Load any answers this user already saved (autosave / resume).
    const { data: existing } = await supabase
      .from("answers")
      .select("question_id, answer_yes_no, answer_frequency, answer_text")
      .eq("session_id", id)
      .eq("user_id", userId);

    return (
      <QuestionnaireForm
        sessionId={id}
        userId={userId}
        questions={questions}
        role={role}
        existingAnswers={existing || []}
      />
    );
  } catch (err: any) {
    console.error("Critical rendering error in SessionPage:", err);
    return <ErrorCard title={te("criticalTitle")} message={te("criticalMsg")} />;
  }
}
