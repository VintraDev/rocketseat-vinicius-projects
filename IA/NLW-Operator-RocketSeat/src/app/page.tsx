import { HomeLeaderboardSection } from "@/components/home/home-leaderboard-section";
import { HomeMetricsSection } from "@/components/home/home-metrics-section";
import { HomePage } from "@/components/home/home-page";

export default function Page() {
  return (
    <HomePage
      metrics={<HomeMetricsSection />}
      leaderboard={<HomeLeaderboardSection />}
    />
  );
}
