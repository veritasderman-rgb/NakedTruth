import { getSupabaseAdmin } from "@/lib/supabase";
import { joinSession } from "../../actions/session";
import Link from "next/link";
export const dynamic = 'force-dynamic';

import QuestionnaireForm from "./QuestionnaireForm";
import InvitePartner from "./InvitePartner";
import ComparisonView from "./ComparisonView";

function ErrorCard({ title, message, showHome = true }: { title: string; message: string; showHome?: boolean }) {
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
            Zpět na úvod
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
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!token) {
    return <ErrorCard title="Chybí přístupový token" message="Odkaz je neúplný. Zkontrolujte, že jste zkopírovali celý odkaz od partnera." />;
  }

  const supabase = getSupabaseAdmin();

  try {
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      return <ErrorCard title="Relace nenalezena" message="Tato relace neexistuje nebo vypršela. Zkuste vytvořit novou." />;
    }

    let role: "partner_a" | "partner_b" | null = null;
    if (session.partner_a_access_token === token) {
      role = "partner_a";
    } else if (session.partner_b_access_token === token) {
      role = "partner_b";
    }

    if (!role) {
      return <ErrorCard title="Neplatný token" message="Přístupový token je neplatný. Požádejte partnera o nový odkaz." />;
    }

    // If Partner B accessing for the first time and is anonymous
    let userId = role === "partner_a" ? session.partner_a_user_id : session.partner_b_user_id;
    if (role === "partner_b" && !userId) {
      const res = await joinSession(id);
      userId = res.userId;
    }

    // Check if this partner already completed
    const isCompletedByMe = role === "partner_a" ? !!session.partner_a_completed_at : !!session.partner_b_completed_at;

    // If both completed, show comparison
    if (session.status === "completed") {
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
      return <ErrorCard title="Chyba načítání" message="Nepodařilo se načíst otázky. Zkuste obnovit stránku." />;
    }

    const validQuestions = (sessionQuestions || [])
      .map(q => q.questions)
      .filter(Boolean);

    if (validQuestions.length === 0) {
      return <ErrorCard title="Otázky chybí" message="Pro tuto relaci se nepodařilo načíst žádné otázky." />;
    }

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
    return <ErrorCard title="Něco se pokazilo" message="Zkuste obnovit stránku nebo vytvořit novou relaci." />;
  }
}
