import "../styles/globals.css";
import type { ReactNode } from "react";
import { TopNav } from "../components/layout/top-nav";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
          <TopNav />
          {children}
        </main>
      </body>
    </html>
  );
}
