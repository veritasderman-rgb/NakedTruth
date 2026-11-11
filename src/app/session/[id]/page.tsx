import { getSql, isUuid } from "@/lib/db";
import { joinSession } from "../../actions/session";
import Link from "next/link";
import { localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { getQuiz } from "@/lib/quiz-content";
export const dynamic = 'force-dynamic';

import QuestionnaireForm from "./QuestionnaireForm";
import InvitePartner from "./InvitePartner";
import ComparisonView from "./ComparisonView";

function ErrorCard({ title, message, home }: { title: string; message: string; home: { href: string; label: string } }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link href={home.href} className="btn-glow inline-flex items-center justify-center rounded-md px-6 py-3 text-sm font-medium">
          {home.label}
        </Link>
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
  const locale = await getLocale();
  const t = getQuiz(locale);
  const home = { href: localePath(locale, "/"), label: t.backHome };

  if (!token) {
    return <ErrorCard title={t.errTokenTitle} message={t.errTokenText} home={home} />;
  }

  if (!isUuid(id)) {
    return <ErrorCard title={t.errNotFoundTitle} message={t.errNotFoundText} home={home} />;
  }

  try {
    const sql = getSql();
    const [session] = await sql`select * from sessions where id = ${id}`;

    if (!session) {
      return <ErrorCard title={t.errNotFoundTitle} message={t.errNotFoundText} home={home} />;
    }

    // Session questions in order, shaped as { question_id, questions: {...} },
    // with the prompt in the viewer's language (Czech when not translated).
    const loadQuestions = () => sql`
      select sq.question_id,
             to_jsonb(q) || jsonb_build_object('prompt', coalesce(tr.prompt, q.prompt)) as questions
      from session_questions sq
      join questions q on q.id = sq.question_id
      left join question_translations tr on tr.question_id = q.id and tr.locale = ${locale}
      where sq.session_id = ${id}
      order by sq.question_order`;

    let role: "partner_a" | "partner_b" | null = null;
    if (session.partner_a_access_token === token) {
      role = "partner_a";
    } else if (session.partner_b_access_token === token) {
      role = "partner_b";
    }

    if (!role) {
      return <ErrorCard title={t.errInvalidTitle} message={t.errInvalidText} home={home} />;
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
      const questions = await loadQuestions();
      const answers = await sql`
        select question_id, user_id, answer_yes_no, answer_frequency, answer_text
        from answers where session_id = ${id}`;

      const myUserId = role === "partner_a" ? session.partner_a_user_id : session.partner_b_user_id;
      return <ComparisonView session={session} questions={questions} answers={answers} myUserId={myUserId} locale={locale} t={t} />;
    }

    // If I'm done but partner isn't, show invite/waiting
    if (isCompletedByMe) {
      return <InvitePartner sessionId={id} session={session} role={role} tokenB={session.partner_b_access_token} locale={locale} t={t} />;
    }

    // Otherwise, show questionnaire
    const sessionQuestions = await loadQuestions();
    const validQuestions = sessionQuestions.map((q) => q.questions).filter(Boolean);

    if (validQuestions.length === 0) {
      return <ErrorCard title={t.errQuestionsTitle} message={t.errQuestionsText} home={home} />;
    }

    return (
      <QuestionnaireForm
        sessionId={id}
        token={token}
        questions={validQuestions}
        t={t}
        locale={locale}
      />
    );
  } catch (err: any) {
    console.error("Critical rendering error in SessionPage:", err);
    return <ErrorCard title={t.errGenericTitle} message={t.errGenericText} home={home} />;
  }
}
