"use client"

import { useEffect, useState, useRef } from 'react';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import BlurTextAnimation from "@/components/blur-text-animation";
import { cn } from "@/lib/utils";

interface EloData {
  fighter: string;
  elo: number;
}

interface StatsData {
  fighter: string;
  fights: number;
  wins: number;
  losses: number;
  draws: number;
  ncs: number;
  knockdowns: number;
  strikes: number;
  takedowns: number;
  submissions: number;
}

const LeaderboardRow = ({ rank, name, value }: { rank: number; name: string; value: number | string }) => (
  <div className="flex items-center justify-between py-1.5 px-3 border-b border-gray-700/30 hover:bg-gray-800/20 transition-colors">
    <div className="flex items-center gap-2">
      <span className="text-gray-400 font-light text-xs w-5">#{rank}</span>
      <span className="text-gray-200 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{name}</span>
    </div>
    <span className="text-gray-300 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{value}</span>
  </div>
);

const LeaderboardSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className={cn("relative rounded-[1.25rem] border-[0.75px] border-gray-700/50 p-2")}>
    <GlowingEffect
      spread={20}
      glow={true}
      disabled={false}
      proximity={64}
      inactiveZone={0.7}
      borderWidth={1}
      movementDuration={2}
    />
    <div className="relative flex flex-col overflow-hidden rounded-xl border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm shadow-sm">
      <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 px-3 py-2 border-b border-gray-700/50">
        <h2 className="text-base font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>{title}</h2>
      </div>
      <div className="divide-y divide-gray-700/30">
        {children}
      </div>
    </div>
  </div>
);

export default function Leaderboards() {
  const [eloData, setEloData] = useState<EloData[]>([]);
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleTables, setVisibleTables] = useState<Set<number>>(new Set());
  const tableRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eloRes, statsRes] = await Promise.all([
          fetch('/api/elo'),
          fetch('/api/stats')
        ]);
        
        const elo = await eloRes.json();
        const stats = await statsRes.json();
        
        setEloData(elo.slice(0, 5)); // Top 5
        setStatsData(stats);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Intersection Observer for progressive table reveal
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    tableRefs.current.forEach((ref, index) => {
      if (!ref) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleTables((prev) => new Set([...prev, index]));
            }
          });
        },
        {
          threshold: 0.3,
          rootMargin: '0px 0px -100px 0px',
        }
      );

      observer.observe(ref);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [eloData, statsData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-300 text-sm font-light" style={{ fontFamily: 'var(--font-montserrat)' }}>Loading leaderboards...</div>
      </div>
    );
  }

  // Sort stats for different leaderboards
  const topWins = [...statsData].sort((a, b) => b.wins - a.wins).slice(0, 5);
  const topStrikes = [...statsData].sort((a, b) => b.strikes - a.strikes).slice(0, 5);
  const topTakedowns = [...statsData].sort((a, b) => b.takedowns - a.takedowns).slice(0, 5);
  const topSubmissions = [...statsData].sort((a, b) => b.submissions - a.submissions).slice(0, 5);
  const topKnockdowns = [...statsData].sort((a, b) => b.knockdowns - a.knockdowns).slice(0, 5);

  const leaderboards = [
    { title: "Elo Ratings", data: eloData, render: (fighter: EloData, index: number) => (
      <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.elo.toFixed(2)} />
    )},
    { title: "Most Wins", data: topWins, render: (fighter: StatsData, index: number) => (
      <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.wins} />
    )},
    { title: "Most Strikes", data: topStrikes, render: (fighter: StatsData, index: number) => (
      <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.strikes.toLocaleString()} />
    )},
    { title: "Most Takedowns", data: topTakedowns, render: (fighter: StatsData, index: number) => (
      <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.takedowns} />
    )},
    { title: "Most Submissions", data: topSubmissions, render: (fighter: StatsData, index: number) => (
      <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.submissions} />
    )},
    { title: "Most Knockdowns", data: topKnockdowns, render: (fighter: StatsData, index: number) => (
      <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.knockdowns} />
    )},
  ];

  return (
    <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen">
      <div className="mb-12 w-full">
        <div className="text-center">
          <BlurTextAnimation
            text="UFC Leaderboards"
            fontSize="text-3xl md:text-4xl"
            textColor="text-white"
            fontFamily="font-['Montserrat',_sans-serif]"
            animationDelay={3000}
            className="!min-h-0 !bg-transparent"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {leaderboards.map((leaderboard, index) => (
          <div
            key={index}
            ref={(el) => {
              tableRefs.current[index] = el;
            }}
            className={cn(
              "transition-all duration-1000",
              visibleTables.has(index)
                ? "opacity-100 blur-0 scale-100"
                : "opacity-0 blur-md scale-95"
            )}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <LeaderboardSection title={leaderboard.title}>
              {leaderboard.data.map((fighter, fighterIndex) =>
                leaderboard.render(fighter as any, fighterIndex)
              )}
            </LeaderboardSection>
          </div>
        ))}
      </div>
    </div>
  );
}

