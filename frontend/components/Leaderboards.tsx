"use client"

import { useEffect, useState, useRef } from 'react';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import TablePreview from "@/components/TablePreview";
import CodeDisplay from "@/components/CodeDisplay";
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
  <div className="flex items-center justify-between py-2 px-4 border-b border-gray-700/30 hover:bg-gray-800/20 transition-colors">
    <div className="flex items-center gap-3">
      <span className="text-gray-400 font-light text-sm w-6">#{rank}</span>
      <span className="text-gray-200 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{name}</span>
    </div>
    <span className="text-gray-300 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{value}</span>
  </div>
);

const LeaderboardSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className={cn("relative rounded-[1.25rem] border-[0.75px] border-gray-700/50 p-3")}>
    <GlowingEffect
      spread={20}
      glow={true}
      disabled={false}
      proximity={64}
      inactiveZone={0.7}
      borderWidth={1}
      movementDuration={2}
    />
    <div className="relative flex flex-col overflow-hidden rounded-xl border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm shadow-sm min-h-[240px] group-hover:bg-gray-800/30 transition-all duration-300">
      <div className="bg-gray-800/40 backdrop-blur-md border-b border-gray-700/40 px-4 py-2.5">
        <h2 className="text-base font-light text-white group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'var(--font-montserrat)' }}>{title}</h2>
      </div>
      <div className="divide-y divide-gray-700/30 flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  </div>
);

const StatsFilter = ({ selectedFilter, onFilterChange }: { selectedFilter: string | null; onFilterChange: (filter: string | null) => void }) => {
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'wins', label: 'Wins' },
    { id: 'strikes', label: 'Strikes' },
    { id: 'takedowns', label: 'Takedowns' },
    { id: 'submissions', label: 'Submissions' },
  ];

  return (
    <div className="flex flex-col space-y-6 justify-center items-center">
      <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
        Filter by Stat
      </h2>
      <div className="space-y-3 w-full">
        {filterOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => {
              if (option.id === 'all') {
                onFilterChange('all');
              } else {
                onFilterChange(selectedFilter === option.id ? 'all' : option.id);
              }
            }}
            className={cn(
              "relative rounded-xl border-[0.75px] border-gray-700/50 p-1.5 transition-all duration-300 cursor-pointer group w-full",
              "hover:scale-105",
              selectedFilter === option.id && "border-gray-700/50"
            )}
          >
            <GlowingEffect
              spread={20}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.7}
              borderWidth={1}
              movementDuration={2}
            />
            <div className={cn(
              "relative flex items-center justify-center rounded-lg border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm px-5 py-2.5 transition-all duration-300",
              selectedFilter === option.id
                ? "bg-gray-800/40 backdrop-blur-md border-gray-700/40"
                : "hover:bg-gray-800/30"
            )}>
              <span className={cn(
                "text-sm font-light transition-colors duration-300",
                selectedFilter === option.id
                  ? "text-white"
                  : "text-gray-300 group-hover:text-white"
              )} style={{ fontFamily: 'var(--font-montserrat)' }}>
                {option.label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default function Leaderboards() {
  const [eloData, setEloData] = useState<EloData[]>([]);
  const [fullEloData, setFullEloData] = useState<EloData[]>([]);
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleTables, setVisibleTables] = useState<Set<number>>(new Set());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{ title: string; data: Array<{ fighter: string; value: number | string }> } | null>(null);
  const [selectedStatFilter, setSelectedStatFilter] = useState<string>('all');
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
        
        setFullEloData(elo);
        setEloData(elo.slice(0, 100)); // Top 100
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

  const handleTableClick = (title: string, fullData: Array<{ fighter: string; value: number | string }>) => {
    setPreviewData({ title, data: fullData });
    setPreviewOpen(true);
  };

  const eloLeaderboard = {
    title: "Elo Ratings", 
    previewData: fullEloData.map(f => ({ fighter: f.fighter, value: f.elo.toFixed(2) })),
    data: fullEloData.slice(0, 100), // Use full data for top 100 
    render: (fighter: EloData, index: number) => (
      <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.elo.toFixed(2)} />
    )
  };

  const statLeaderboards = [
    { 
      title: "Most Wins", 
      previewData: [...statsData].sort((a, b) => b.wins - a.wins).map(f => ({ fighter: f.fighter, value: f.wins })),
      data: topWins, 
      render: (fighter: StatsData, index: number) => (
        <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.wins} />
      )
    },
    { 
      title: "Most Strikes", 
      previewData: [...statsData].sort((a, b) => b.strikes - a.strikes).map(f => ({ fighter: f.fighter, value: f.strikes.toLocaleString() })),
      data: topStrikes, 
      render: (fighter: StatsData, index: number) => (
        <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.strikes.toLocaleString()} />
      )
    },
    { 
      title: "Most Takedowns", 
      previewData: [...statsData].sort((a, b) => b.takedowns - a.takedowns).map(f => ({ fighter: f.fighter, value: f.takedowns })),
      data: topTakedowns, 
      render: (fighter: StatsData, index: number) => (
        <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.takedowns} />
      )
    },
    { 
      title: "Most Submissions", 
      previewData: [...statsData].sort((a, b) => b.submissions - a.submissions).map(f => ({ fighter: f.fighter, value: f.submissions })),
      data: topSubmissions, 
      render: (fighter: StatsData, index: number) => (
        <LeaderboardRow key={fighter.fighter} rank={index + 1} name={fighter.fighter} value={fighter.submissions} />
      )
    },
  ];

  return (
    <>
      {/* Elo Ratings Page */}
      <section id="elo" className="snap-start min-h-screen">
        <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Explanation */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <p className="text-gray-200 font-light text-base leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  This site displays the elo for every fighter in the UFC.
                </p>
                
                <p className="text-gray-100 font-light text-base leading-relaxed" style={{ fontFamily: 'var(--font-montserrat)' }}>
                  The Elo rating system updates after each fight based on the expected outcome versus the actual result. Fighters start at 1000 Elo, and the K-factor of 40 determines how much ratings change per fight.
                </p>
                
                <CodeDisplay 
                  code={`def expected_score(elo_a, elo_b):
    # Returns probability fighter A wins
    return 1 / (1 + 10 ** ((elo_b - elo_a) / 400))

def update_elo(elo_a, elo_b, score_for_a):
    # K factor = 40, Initial Elo = 1000
    expected_a = expected_score(elo_a, elo_b)
    new_elo_a = elo_a + K * (score_for_a - expected_a)
    new_elo_b = elo_b + K * ((1 - score_for_a) - (1 - expected_a))
    return new_elo_a, new_elo_b`}
                  language="python"
                />
              </div>
            </div>

            {/* Right Side - Scrollable Table */}
            <div className="flex flex-col justify-center">
              <div
                ref={(el) => {
                  tableRefs.current[0] = el;
                }}
                className={cn(
                  "transition-all duration-1000 cursor-pointer group",
                  visibleTables.has(0)
                    ? "opacity-100 blur-0 scale-100"
                    : "opacity-0 blur-md scale-95"
                )}
                onClick={() => handleTableClick(eloLeaderboard.title, eloLeaderboard.previewData)}
              >
                <div className={cn("relative rounded-[1.25rem] border-[0.75px] border-gray-700/50 p-3")}>
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
                    <div className="bg-gray-800/40 backdrop-blur-md border-b border-gray-700/40 px-4 py-2.5">
                      <h2 className="text-base font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>Top 100</h2>
                    </div>
                    <div 
                      className="divide-y divide-gray-700/30 h-[450px] custom-scrollbar" 
                      style={{ 
                        overflowY: 'scroll',
                        overflowX: 'hidden',
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(156, 163, 175, 0.6) rgba(55, 65, 81, 0.4)',
                        WebkitOverflowScrolling: 'touch',
                        minHeight: '450px',
                        maxHeight: '450px'
                      }}
                    >
                      {eloLeaderboard.data.slice(0, 100).map((fighter, fighterIndex) =>
                        eloLeaderboard.render(fighter, fighterIndex)
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Page */}
      <section id="stats" className="snap-start min-h-screen">
        <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 items-center">
            {/* Left Side - Filter */}
            <StatsFilter selectedFilter={selectedStatFilter} onFilterChange={setSelectedStatFilter} />
            
            {/* Right Side - Cards or Single Enlarged Table */}
            {selectedStatFilter && selectedStatFilter !== 'all' ? (
              // Single enlarged scrollable table when filter is selected
              <div className="flex flex-col justify-center">
                {(() => {
                  const filterMap: { [key: string]: number } = {
                    'wins': 0,
                    'strikes': 1,
                    'takedowns': 2,
                    'submissions': 3,
                  };
                  const selectedIndex = filterMap[selectedStatFilter];
                  const selectedLeaderboard = statLeaderboards[selectedIndex];
                  
                  if (!selectedLeaderboard) return null;
                  
                  return (
                    <div
                      ref={(el) => {
                        tableRefs.current[selectedIndex + 2] = el;
                      }}
                      className={cn(
                        "transition-all duration-1000 cursor-pointer group",
                        visibleTables.has(selectedIndex + 2)
                          ? "opacity-100 blur-0 scale-100"
                          : "opacity-0 blur-md scale-95"
                      )}
                      onClick={() => handleTableClick(selectedLeaderboard.title, selectedLeaderboard.previewData)}
                    >
                      <div className={cn("relative rounded-[1.25rem] border-[0.75px] border-gray-700/50 p-3")}>
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
                          <div className="bg-gray-800/40 backdrop-blur-md border-b border-gray-700/40 px-4 py-2.5">
                            <h2 className="text-base font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
                              {selectedLeaderboard.title}
                            </h2>
                          </div>
                          <div 
                            className="divide-y divide-gray-700/30 h-[450px] custom-scrollbar" 
                            style={{ 
                              overflowY: 'scroll',
                              overflowX: 'hidden',
                              scrollbarWidth: 'thin',
                              scrollbarColor: 'rgba(156, 163, 175, 0.6) rgba(55, 65, 81, 0.4)',
                              WebkitOverflowScrolling: 'touch',
                              minHeight: '450px',
                              maxHeight: '450px'
                            }}
                          >
                            {selectedLeaderboard.previewData.map((item, index) => (
                              <LeaderboardRow 
                                key={item.fighter} 
                                rank={index + 1} 
                                name={item.fighter} 
                                value={item.value} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              // 2x2 grid when "all" is selected or no filter
              <div className="grid grid-cols-2 gap-4">
                {statLeaderboards.map((leaderboard, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      tableRefs.current[index + 2] = el;
                    }}
                    className={cn(
                      "transition-all duration-1000 cursor-pointer group",
                      visibleTables.has(index + 2)
                        ? "opacity-100 blur-0 scale-100"
                        : "opacity-0 blur-md scale-95",
                      "hover:scale-105"
                    )}
                    style={{
                      transitionDelay: `${index * 100}ms`,
                    }}
                    onClick={() => handleTableClick(leaderboard.title, leaderboard.previewData)}
                  >
                    <LeaderboardSection title={leaderboard.title}>
                      {leaderboard.data.map((fighter, fighterIndex) =>
                        leaderboard.render(fighter as any, fighterIndex)
                      )}
                    </LeaderboardSection>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Preview Modal */}
      {previewData && (
        <TablePreview
          title={previewData.title}
          data={previewData.data}
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setTimeout(() => setPreviewData(null), 300);
          }}
        />
      )}
    </>
  );
}

