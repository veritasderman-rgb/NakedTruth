import Link from 'next/link';

// Dark, glowing backdrop shared by all Kinkometr pages.
export default function KinkShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dark min-h-screen bg-background text-foreground"
      style={{
        backgroundImage:
          'radial-gradient(60rem 30rem at 50% -10%, rgba(255,46,166,0.16), transparent 60%), radial-gradient(40rem 24rem at 100% 100%, rgba(0,213,255,0.10), transparent 60%)',
      }}
    >
      <main className="mx-auto w-full max-w-md px-5 py-8">
        <Link href="/" className="mb-6 inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
          NakedTruth · Kinkometr
        </Link>
        {children}
      </main>
    </div>
  );
}
