import HomeForm from "./HomeForm";

export default function Home() {
  const config = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  const isConfigured = config.supabaseUrl && config.supabaseAnonKey && config.supabaseServiceKey;

  const missingVars = [];
  if (!config.supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!config.supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!config.supabaseServiceKey) missingVars.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!config.appUrl) missingVars.push("NEXT_PUBLIC_APP_URL");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12 text-center">
      <span className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        NakedTruth · Beta
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight">
        Get closer with blind-answer sessions.
      </h1>
      <p className="mt-4 text-pretty text-sm text-muted-foreground">
        Each partner answers the same questions privately. Compare answers only when both are done.
      </p>

      <HomeForm isConfigured={!!isConfigured} missingVars={missingVars} />
    </main>
  );
}
