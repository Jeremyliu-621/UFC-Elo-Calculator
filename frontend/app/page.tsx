import Hero from "@/components/Hero";
import Leaderboards from "@/components/Leaderboards";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="snap-start min-h-screen">
        <Hero />
      </section>
      <section className="snap-start min-h-screen">
        <Leaderboards />
      </section>
    </div>
  );
}
