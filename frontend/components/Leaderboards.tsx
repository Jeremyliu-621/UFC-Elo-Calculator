"use client"

import { useEffect, useState } from 'react';

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
  <div className="flex items-center justify-between py-3 px-4 border-b border-gray-700/50 hover:bg-gray-800/30 transition-colors">
    <div className="flex items-center gap-4">
      <span className="text-gray-400 font-bold w-8">#{rank}</span>
      <span className="text-gray-200 font-medium">{name}</span>
    </div>
    <span className="text-gray-300 font-semibold">{value}</span>
  </div>
);

const LeaderboardSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-black/40 backdrop-blur-sm rounded-lg border border-gray-700/50 overflow-hidden mb-8">
    <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 px-6 py-4 border-b border-gray-700/50">
      <h2 className="text-2xl font-bold text-white">{title}</h2>
    </div>
    <div className="divide-y divide-gray-700/50">
      {children}
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
        
        setEloData(elo.slice(0, 20)); // Top 20
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
        <div className="text-gray-300 text-xl">Loading leaderboards...</div>
      </div>
    );
  }

  // Sort stats for different leaderboards
  const topWins = [...statsData].sort((a, b) => b.wins - a.wins).slice(0, 20);
  const topStrikes = [...statsData].sort((a, b) => b.strikes - a.strikes).slice(0, 20);
  const topTakedowns = [...statsData].sort((a, b) => b.takedowns - a.takedowns).slice(0, 20);
  const topSubmissions = [...statsData].sort((a, b) => b.submissions - a.submissions).slice(0, 20);

  return (
    <div className="relative z-10 px-4 py-16 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-12 text-center">UFC Leaderboards</h1>
      
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
    </div>
  );
}

