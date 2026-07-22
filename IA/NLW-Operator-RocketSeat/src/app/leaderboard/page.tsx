import type { Metadata } from "next";
import Link from "next/link";
import { LeaderboardFullSection } from "@/components/leaderboard/leaderboard-full-section";

// ============================================
// Metadata for SEO (Server-side)
// ============================================
export const metadata: Metadata = {
  title: "Shame Leaderboard | DevRoast",
  description: "The most roasted code on the internet.",
  openGraph: {
    title: "Shame Leaderboard | DevRoast",
    description: "The most roasted code on the internet.",
    type: "website",
  },
};

// ============================================
// Leaderboard Page (Server Component)
// ============================================
export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-devroast-bg text-devroast-text-primary font-mono">
      <nav className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-10 border-b border-devroast-border">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl font-bold text-devroast-green">{">"}</span>
            <span className="text-lg font-medium text-devroast-text-primary">
              devroast
            </span>
          </Link>
        </div>
        <div className="flex items-center">
          <span className="text-[13px] font-normal text-devroast-text-secondary">
            leaderboard
          </span>
        </div>
      </nav>

      <main className="w-full px-4 sm:px-6 lg:px-20 py-10">
        <div className="w-full flex flex-col gap-10">
          <section className="flex flex-col gap-4 w-full">
            <div className="flex items-center gap-3">
              <span className="text-[32px] font-bold text-devroast-green leading-none">
                {">"}
              </span>
              <h1 className="text-[28px] font-bold text-devroast-text-primary leading-none">
                shame_leaderboard
              </h1>
            </div>
            <p className="text-sm font-normal text-devroast-text-secondary font-[IBM_Plex_Mono]">
              {"// the most roasted code on the internet"}
            </p>
          </section>

          <section className="flex flex-col gap-5 w-full">
            <LeaderboardFullSection />
          </section>
        </div>
      </main>
    </div>
  );
}
