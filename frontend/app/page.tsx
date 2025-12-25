import Hero from "@/components/Hero";
import Leaderboards from "@/components/Leaderboards";
import FighterSearch from "@/components/FighterSearch";
import Resources from "@/components/Resources";
import FooterSection from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="snap-start min-h-screen">
        <Hero />
      </section>
      <Leaderboards />
      <section id="search" className="snap-start min-h-screen">
        <FighterSearch />
      </section>
      <section id="resources" className="snap-start min-h-screen">
        <Resources />
      </section>
      <section className="snap-start">
        <FooterSection />
      </section>
    </div>
  );
}
