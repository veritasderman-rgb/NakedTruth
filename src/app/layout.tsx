import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NakedTruth — Poznejte se upřímně",
  description: "Blind-comparison kvíz pro páry. Odpovězte na stejné otázky odděleně a porovnejte výsledky.",
  openGraph: {
    title: "NakedTruth — Poznejte se upřímně",
    description: "Blind-comparison kvíz pro páry. Odpovězte na stejné otázky odděleně a porovnejte výsledky.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs">
      <body>{children}</body>
    </html>
  );
}
