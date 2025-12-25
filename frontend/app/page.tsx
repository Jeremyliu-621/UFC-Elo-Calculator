import Hero from "@/components/Hero";
import Leaderboards from "@/components/Leaderboards";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Leaderboards />
    </div>
  );
}
