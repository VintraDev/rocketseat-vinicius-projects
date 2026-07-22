import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ResultsPageClient } from "@/components/results/results-page-client";

export const metadata: Metadata = {
  title: "Roast Results | DevRoast",
  description: "Detailed AI roast results for your code submission.",
  openGraph: {
    title: "Roast Results | DevRoast",
    description: "Detailed AI roast results for your code submission.",
    type: "website",
  },
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ roastId: string }>;
}) {
  return (
    <div className="min-h-screen bg-devroast-bg text-devroast-text-primary font-mono">
      <Suspense
        fallback={
          <main className="w-full px-4 sm:px-6 lg:px-20 py-10">
            <div className="w-full border border-devroast-border bg-devroast-surface p-6 sm:p-8">
              <span className="font-mono text-sm text-devroast-green">
                {"// loading_roast"}
              </span>
            </div>
          </main>
        }
      >
        <ResultsPageContent params={params} />
      </Suspense>
    </div>
  );
}

async function ResultsPageContent({
  params,
}: {
  params: Promise<{ roastId: string }>;
}) {
  const { roastId } = await params;

  if (!UUID_REGEX.test(roastId)) {
    notFound();
  }

  return (
    <>
      <nav className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-10 border-b border-devroast-border">
        <Link
          href="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-xl font-bold text-devroast-green">{">"}</span>
          <span className="text-lg font-medium text-devroast-text-primary">
            devroast
          </span>
        </Link>

        <span className="text-[13px] font-normal text-devroast-text-secondary">
          roast: {roastId.slice(0, 8)}
        </span>
      </nav>

      <main className="w-full px-4 sm:px-6 lg:px-20 py-10">
        <ResultsPageClient roastId={roastId} />
      </main>
    </>
  );
}
