import type { Metadata } from "next";
import "./globals.css";
import { DEFAULT_LOCALE, LOCALES, localePath } from "@/lib/i18n";
import { getLocale } from "@/lib/locale";
import { appUrl } from "@/lib/app-url";
import SiteFooter from "@/components/SiteFooter";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: "NakedTruth — Poznejte se upřímně",
  description: "Blind-comparison kvíz pro páry. Odpovězte na stejné otázky odděleně a porovnejte výsledky.",
  openGraph: {
    title: "NakedTruth — Poznejte se upřímně",
    description: "Blind-comparison kvíz pro páry. Odpovězte na stejné otázky odděleně a porovnejte výsledky.",
    type: "website",
  },
  // Language versions of the landing page, for search engines.
  alternates: {
    languages: {
      ...Object.fromEntries(LOCALES.map((l) => [l, localePath(l, "/")])),
      "x-default": localePath(DEFAULT_LOCALE, "/"),
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale} className="dark">
      <body>
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
