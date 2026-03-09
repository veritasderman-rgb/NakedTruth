import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NakedTruth",
  description: "Blind-comparison questionnaires for couples",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
