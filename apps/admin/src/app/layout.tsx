import type { Metadata } from "next";
import { getAdminSession } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quizelo · Backoffice",
  robots: { index: false, follow: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  // If no admin session, render bare (login + forbidden pages handle their
  // own chrome). Once authenticated as admin, the sidebar wraps everything.
  const isAdmin = !!session?.user?.isAdmin;

  return (
    <html lang="en">
      <body>
        {isAdmin && session?.user ? (
          <div className="relative z-10 flex min-h-screen">
            <Sidebar userEmail={session.user.email} />
            <main className="flex-1 overflow-x-auto px-8 py-6">{children}</main>
          </div>
        ) : (
          <main className="relative z-10 min-h-screen">{children}</main>
        )}
      </body>
    </html>
  );
}
