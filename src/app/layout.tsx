import type { ReactNode } from "react";

// The real <html>/<body> shell lives in [locale]/layout.tsx so it can set the
// correct `lang`. This root layout only forwards children, as required by the
// App Router.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
