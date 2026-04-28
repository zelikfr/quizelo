import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MatchScreen } from "@/components/match/MatchScreen";

interface MatchPageProps {
  params: Promise<{ locale: string; matchId: string }>;
}

export default async function MatchPage({ params }: MatchPageProps) {
  const { locale, matchId } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/${locale}/auth/login?from=/${locale}/match/${matchId}`);
  }

  // The actual state lives over the WS — this page is just the client-side mount point.
  return <MatchScreen matchId={matchId} />;
}
