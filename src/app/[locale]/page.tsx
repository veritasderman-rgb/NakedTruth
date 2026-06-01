import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { TrackOnMount } from "@/components/TrackOnMount";
import HomeForm from "./HomeForm";
export const dynamic = 'force-dynamic';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const config = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your-supabase-service-role-key',
    appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  const isConfigured = config.supabaseUrl && config.supabaseAnonKey && config.supabaseServiceKey;

  // Only surface raw env diagnostics outside production — never leak internals to end users.
  const missingVars: string[] = [];
  if (process.env.NODE_ENV !== 'production') {
    if (!config.supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!config.supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    if (!config.supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
    if (!config.appUrl) missingVars.push("NEXT_PUBLIC_APP_URL");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <TrackOnMount event="landing_view" />
      <span className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        {t("badge")}
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight">
        {t("title")}
      </h1>
      <div className="mt-4 space-y-4 text-pretty text-sm text-muted-foreground">
        <p>{t("intro")}</p>
        <p className="text-xs italic bg-accent/30 p-3 rounded-lg border">
          {t("introHint")}
        </p>
      </div>

      <HomeForm isConfigured={!!isConfigured} missingVars={missingVars} />

      <Link
        href="/login"
        className="mt-8 text-xs text-muted-foreground underline hover:text-foreground transition-colors"
      >
        {t("loginLink")}
      </Link>
    </main>
  );
}
