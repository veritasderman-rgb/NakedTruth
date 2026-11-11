import Link from "next/link";
import HomeForm from "./HomeForm";
import CupGlass from "@/components/kink/CupGlass";
import { isDbConfigured } from "@/lib/db";
import { CUPS, CUP_BY_KEY, MODES } from "@/lib/kink";

export const dynamic = 'force-dynamic';

// Decorative fill levels for the teaser cups on the landing page.
const TEASER = [
  { cup: CUP_BY_KEY.dominance, fill: 82 },
  { cup: CUP_BY_KEY.bondage, fill: 55 },
  { cup: CUP_BY_KEY.sensation, fill: 96 },
  { cup: CUP_BY_KEY.verbal, fill: 30 },
];

export default function Home() {
  const isConfigured = isDbConfigured();

  const missingVars = [];
  if (!isConfigured) missingVars.push("DATABASE_URL");
  if (!process.env.NEXT_PUBLIC_APP_URL) missingVars.push("NEXT_PUBLIC_APP_URL");

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        NakedTruth · Beta
      </span>
      <h1 className="text-balance text-4xl font-semibold tracking-tight">
        Poznejte se upřímně a bez zábran.
      </h1>
      <p className="mt-4 text-pretty text-sm text-muted-foreground">
        Testy a porovnání pro zvědavé — sám/sama, nebo ve dvou. Anonymně a bez registrace.
      </p>

      {/* Kinkometr — solo test, shown first */}
      <section className="dark mt-8 w-full overflow-hidden rounded-2xl bg-background p-5 text-left text-foreground shadow-lg"
        style={{ backgroundImage: 'radial-gradient(28rem 14rem at 80% -20%, rgba(255,46,166,0.28), transparent 60%), radial-gradient(20rem 12rem at 0% 120%, rgba(0,213,255,0.18), transparent 60%)' }}
      >
        <div className="flex items-end justify-between gap-1">
          {TEASER.map(({ cup, fill }) => (
            <CupGlass key={cup.key} id={`t-${cup.key}`} fill={fill} color={cup.color} size={58} />
          ))}
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Kinkometr</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Jak plné máš poháry? {CUPS.length} oblastí od něhy po BDSM. Zjistíš, co tě láká, co ne — a co zatím nevíš.
          K tomu tipy na aktivity, polohy, místa i kde potkat podobně naladěné.
        </p>
        <Link
          href="/kinkometr"
          className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Naplnit poháry
        </Link>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Link href="/kinkometr?mode=bdsm" className="rounded-md border border-white/15 px-3 py-2 hover:bg-white/5">
            <span className="block font-semibold">{MODES.bdsm.label}</span>
            <span className="text-muted-foreground">Moc, svazování, bolest</span>
          </Link>
          <Link href="/kinkometr?mode=quick" className="rounded-md border border-white/15 px-3 py-2 hover:bg-white/5">
            <span className="block font-semibold">{MODES.quick.label}</span>
            <span className="text-muted-foreground">{CUPS.length} otázek, 2 minuty</span>
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">
          Nejsi si jistý/á? Odpověď „Nevím“ se počítá. S partnerem pak uvidíte jen to, na čem se shodnete.
        </p>
      </section>

      {/* Couples quiz */}
      <section id="parovy-kviz" className="mt-12 w-full scroll-mt-6">
        <h2 className="text-2xl font-semibold tracking-tight">Párový kvíz naslepo</h2>
        <div className="mt-3 space-y-4 text-pretty text-sm text-muted-foreground">
          <p>
            Každý z partnerů odpovídá na stejné otázky soukromě. Odpovědi uvidíte společně až ve chvíli, kdy budete mít oba hotovo.
          </p>
          <p className="text-xs italic bg-accent/30 p-3 rounded-lg border">
            Zvolte si počet otázek i to, jestli to bude spíš o vztahu, nebo se chcete
            poznat i pod peřinou — včetně dominance a submise.
          </p>
        </div>

        <HomeForm isConfigured={isConfigured} missingVars={missingVars} />
      </section>
    </main>
  );
}
