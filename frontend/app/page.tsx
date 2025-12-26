import Hero from "@/components/Hero";
import Leaderboards from "@/components/Leaderboards";
import FighterSearch from "@/components/FighterSearch";
import Resources from "@/components/Resources";
import DownloadsSocials from "@/components/DownloadsSocials";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="md:snap-start min-h-screen">
        <Hero />
      </section>
      <Leaderboards />
      <section id="search" className="md:snap-start min-h-screen">
        <FighterSearch />
      </section>
      <section id="resources" className="md:snap-start min-h-screen">
        <Resources />
      </section>
      <section id="downloads" className="md:snap-start min-h-screen">
        <DownloadsSocials />
      </section>
    </div>
  );
}
