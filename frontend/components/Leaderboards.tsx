"use client"

import { useEffect, useState } from 'react';
import { GlowingEffect } from "@/components/ui/glowing-effect";
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

  return (
    <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-light text-white mb-6 text-center" style={{ fontFamily: 'var(--font-montserrat)' }}>UFC Leaderboards</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Elo Leaderboard */}
        <LeaderboardSection title="Elo Ratings">
          {eloData.map((fighter, index) => (
            <LeaderboardRow
              key={fighter.fighter}
              rank={index + 1}
              name={fighter.fighter}
              value={fighter.elo.toFixed(2)}
            />
          ))}
        </LeaderboardSection>

        {/* Wins Leaderboard */}
        <LeaderboardSection title="Most Wins">
          {topWins.map((fighter, index) => (
            <LeaderboardRow
              key={fighter.fighter}
              rank={index + 1}
              name={fighter.fighter}
              value={fighter.wins}
            />
          ))}
        </LeaderboardSection>

        {/* Strikes Leaderboard */}
        <LeaderboardSection title="Most Strikes">
          {topStrikes.map((fighter, index) => (
            <LeaderboardRow
              key={fighter.fighter}
              rank={index + 1}
              name={fighter.fighter}
              value={fighter.strikes.toLocaleString()}
            />
          ))}
        </LeaderboardSection>

        {/* Takedowns Leaderboard */}
        <LeaderboardSection title="Most Takedowns">
          {topTakedowns.map((fighter, index) => (
            <LeaderboardRow
              key={fighter.fighter}
              rank={index + 1}
              name={fighter.fighter}
              value={fighter.takedowns}
            />
          ))}
        </LeaderboardSection>

        {/* Submissions Leaderboard */}
        <LeaderboardSection title="Most Submissions">
          {topSubmissions.map((fighter, index) => (
            <LeaderboardRow
              key={fighter.fighter}
              rank={index + 1}
              name={fighter.fighter}
              value={fighter.submissions}
            />
          ))}
        </LeaderboardSection>

        {/* Knockdowns Leaderboard */}
        <LeaderboardSection title="Most Knockdowns">
          {topKnockdowns.map((fighter, index) => (
            <LeaderboardRow
              key={fighter.fighter}
              rank={index + 1}
              name={fighter.fighter}
              value={fighter.knockdowns}
            />
          ))}
        </LeaderboardSection>
      </div>
    </div>
  );
}

