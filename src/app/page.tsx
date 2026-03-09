import { Button } from "@/components/ui/button";

export default function Home() {
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
      <Button className="mt-8 w-full">Start your first session</Button>
    </main>
  );
}
