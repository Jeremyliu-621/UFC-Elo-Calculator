"use client"

import { useEffect, useState, useRef, useMemo } from 'react';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { Search } from 'lucide-react';

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

interface FighterData extends StatsData {
  elo: number;
}

export default function FighterSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFighter, setSelectedFighter] = useState<FighterData | null>(null);
  const [allFighters, setAllFighters] = useState<string[]>([]);
  const [filteredFighters, setFilteredFighters] = useState<string[]>([]);
  const [eloData, setEloData] = useState<EloData[]>([]);
  const [statsData, setStatsData] = useState<StatsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [infoCardHeight, setInfoCardHeight] = useState<number>(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const neighborTableRef = useRef<HTMLDivElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eloRes, statsRes] = await Promise.all([
          fetch('/api/elo'),
          fetch('/api/stats')
        ]);
        
        const elo = await eloRes.json();
        const stats = await statsRes.json();
        
        setEloData(elo);
        setStatsData(stats);
        
        // Get all unique fighter names
        const fighters = Array.from(new Set([...elo.map((f: EloData) => f.fighter), ...stats.map((f: StatsData) => f.fighter)]));
        setAllFighters(fighters.sort());
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFighters([]);
      return;
    }

    const filtered = allFighters.filter(fighter =>
      fighter.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10); // Limit to 10 suggestions
    
    setFilteredFighters(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchQuery, allFighters]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate ranks for all fighters
  const eloRankings = useMemo(() => {
    return [...eloData].sort((a, b) => b.elo - a.elo).map((f, index) => ({
      fighter: f.fighter,
      rank: index + 1
    }));
  }, [eloData]);

  const strikesRankings = useMemo(() => {
    return [...statsData].sort((a, b) => b.strikes - a.strikes).map((f, index) => ({
      fighter: f.fighter,
      rank: index + 1
    }));
  }, [statsData]);

  const takedownsRankings = useMemo(() => {
    return [...statsData].sort((a, b) => b.takedowns - a.takedowns).map((f, index) => ({
      fighter: f.fighter,
      rank: index + 1
    }));
  }, [statsData]);

  const knockdownsRankings = useMemo(() => {
    return [...statsData].sort((a, b) => b.knockdowns - a.knockdowns).map((f, index) => ({
      fighter: f.fighter,
      rank: index + 1
    }));
  }, [statsData]);

  const handleFighterSelect = (fighterName: string) => {
    setSearchQuery(fighterName);
    setShowSuggestions(false);
    
    // Find fighter data
    const elo = eloData.find(f => f.fighter === fighterName);
    const stats = statsData.find(f => f.fighter === fighterName);
    
    if (elo && stats) {
      setSelectedFighter({
        ...stats,
        elo: elo.elo
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim() === '') return;
    
    const exactMatch = allFighters.find(f => 
      f.toLowerCase() === searchQuery.toLowerCase()
    );
    
    if (exactMatch) {
      handleFighterSelect(exactMatch);
    } else if (filteredFighters.length > 0) {
      handleFighterSelect(filteredFighters[0]);
    }
  };

  // Get neighbors (fighters around the selected one) - must be before early returns
  const neighborFighters = useMemo(() => {
    if (!selectedFighter || eloData.length === 0) return [];
    
    const sortedElo = [...eloData].sort((a, b) => b.elo - a.elo);
    const currentIndex = sortedElo.findIndex(f => f.fighter === selectedFighter.fighter);
    
    if (currentIndex === -1) return [];
    
    const neighbors: EloData[] = [];
    const fightersToShow = 100; // Show 50 above, selected, 50 below
    
    // Calculate start and end indices
    let startIndex = Math.max(0, currentIndex - 50);
    let endIndex = Math.min(sortedElo.length - 1, currentIndex + 50);
    
    // Adjust if we're near the top
    if (currentIndex < 50) {
      endIndex = Math.min(sortedElo.length - 1, startIndex + fightersToShow - 1);
    }
    // Adjust if we're near the bottom
    if (currentIndex > sortedElo.length - 51) {
      startIndex = Math.max(0, endIndex - fightersToShow + 1);
    }
    
    // Add fighters
    for (let i = startIndex; i <= endIndex; i++) {
      neighbors.push(sortedElo[i]);
    }
    
    return neighbors;
  }, [selectedFighter, eloData]);

  // Measure info card height and match ranking context
  useEffect(() => {
    if (infoCardRef.current) {
      const height = infoCardRef.current.offsetHeight;
      setInfoCardHeight(height);
    }
  }, [selectedFighter]);

  // Scroll to selected fighter in neighbor table - must be after neighborFighters is defined
  useEffect(() => {
    if (selectedFighter && neighborTableRef.current && neighborFighters.length > 0) {
      const selectedIndex = neighborFighters.findIndex(f => f.fighter === selectedFighter.fighter);
      if (selectedIndex !== -1) {
        const scrollContainer = neighborTableRef.current;
        
        // Wait for DOM to render, then calculate actual row height
        setTimeout(() => {
          const rows = scrollContainer.querySelectorAll('div[class*="border-b"]');
          if (rows.length > 0) {
            const firstRow = rows[0] as HTMLElement;
            const rowHeight = firstRow.offsetHeight;
            const containerHeight = scrollContainer.clientHeight;
            
            // Calculate scroll position to center the selected row
            const scrollPosition = (selectedIndex * rowHeight) - (containerHeight / 2) + (rowHeight / 2);
            
            scrollContainer.scrollTo({
              top: Math.max(0, scrollPosition),
              behavior: 'smooth'
            });
          }
        }, 150);
      }
    }
  }, [selectedFighter, neighborFighters]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-300 text-sm font-light" style={{ fontFamily: 'var(--font-montserrat)' }}>
          Loading fighter data...
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-6 h-[85vh]">
        {/* Left Side - Search */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-full max-w-md" ref={searchRef}>
            <h2 className="text-2xl font-light text-white mb-6 text-center" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Search Fighter
            </h2>
            
            <div className="relative">
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
                <div className="relative flex items-center gap-3 rounded-xl border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm px-4 py-3">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(filteredFighters.length > 0)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    placeholder="Enter fighter name..."
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none font-light text-sm"
                    style={{ fontFamily: 'var(--font-montserrat)' }}
                  />
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && filteredFighters.length > 0 && (
                <div className="absolute z-50 w-full mt-2 rounded-xl border-[0.75px] border-gray-700/30 bg-black/90 backdrop-blur-md shadow-2xl overflow-hidden">
                  {filteredFighters.map((fighter) => (
                    <button
                      key={fighter}
                      onClick={() => handleFighterSelect(fighter)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-800/50 transition-colors border-b border-gray-700/30 last:border-b-0"
                    >
                      <span className="text-gray-200 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        {fighter}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Middle - Fighter Info */}
        <div className="flex flex-col items-center justify-center">
          {selectedFighter ? (
            <div className="w-full max-w-sm">
              <div className={cn("relative rounded-[1.25rem] border-[0.75px] border-gray-700/50 p-4")}>
                <GlowingEffect
                  spread={20}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.7}
                  borderWidth={1}
                  movementDuration={2}
                />
                <div ref={infoCardRef} className="relative flex flex-col overflow-hidden rounded-xl border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm shadow-sm">
                  <div className="bg-gray-800/40 backdrop-blur-md border-b border-gray-700/40 px-4 py-3">
                    <h2 className="text-xl font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
                      {selectedFighter.fighter}
                    </h2>
                  </div>
                  
                  <div className="p-5 space-y-5">
                    {/* Elo Rating */}
                    <div className="border-b border-gray-700/30 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400 font-light text-base" style={{ fontFamily: 'var(--font-montserrat)' }}>
                          Elo Rating
                        </span>
                        <span className="text-white font-light text-2xl" style={{ fontFamily: 'var(--font-montserrat)' }}>
                          {selectedFighter.elo.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-gray-500 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Ranked #{eloRankings.find(r => r.fighter === selectedFighter.fighter)?.rank || 'N/A'}
                      </div>
                    </div>

                    {/* Fight Record */}
                    <div className="space-y-3">
                      <h3 className="text-gray-300 font-light text-base mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Fight Record
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>Fights:</span>
                          <span className="text-gray-200 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedFighter.fights}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>Wins:</span>
                          <span className="text-green-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedFighter.wins}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>Losses:</span>
                          <span className="text-red-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedFighter.losses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>Draws:</span>
                          <span className="text-gray-200 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedFighter.draws}</span>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="space-y-3 pt-3 border-t border-gray-700/30">
                      <h3 className="text-gray-300 font-light text-base mb-3" style={{ fontFamily: 'var(--font-montserrat)' }}>
                        Statistics
                      </h3>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>Strikes:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-200 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedFighter.strikes.toLocaleString()}</span>
                            <span className="text-gray-500 font-light text-xs" style={{ fontFamily: 'var(--font-montserrat)' }}>
                              (#{strikesRankings.find(r => r.fighter === selectedFighter.fighter)?.rank || 'N/A'})
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>Takedowns:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-200 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedFighter.takedowns}</span>
                            <span className="text-gray-500 font-light text-xs" style={{ fontFamily: 'var(--font-montserrat)' }}>
                              (#{takedownsRankings.find(r => r.fighter === selectedFighter.fighter)?.rank || 'N/A'})
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>Submissions:</span>
                          <span className="text-gray-200 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedFighter.submissions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>Knockdowns:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-200 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>{selectedFighter.knockdowns}</span>
                            <span className="text-gray-500 font-light text-xs" style={{ fontFamily: 'var(--font-montserrat)' }}>
                              (#{knockdownsRankings.find(r => r.fighter === selectedFighter.fighter)?.rank || 'N/A'})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Search for a fighter to view their information
              </p>
            </div>
          )}
        </div>

        {/* Right Side - Neighbor Table */}
        <div className="flex flex-col items-center justify-center">
          {selectedFighter && neighborFighters.length > 0 ? (
            <div className="w-full max-w-sm">
              <div className={cn("relative rounded-[1.25rem] border-[0.75px] border-gray-700/50 p-4")}>
                <GlowingEffect
                  spread={20}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.7}
                  borderWidth={1}
                  movementDuration={2}
                />
                <div className="relative flex flex-col overflow-hidden rounded-xl border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm shadow-sm" style={{ height: infoCardHeight > 0 ? `${infoCardHeight}px` : 'auto' }}>
                  <div className="bg-gray-800/40 backdrop-blur-md border-b border-gray-700/40 px-4 py-3">
                    <h2 className="text-xl font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>Ranking Context</h2>
                  </div>
                  <div 
                    ref={neighborTableRef}
                    className="divide-y divide-gray-700/30 flex-1 custom-scrollbar overflow-y-auto" 
                    style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(156, 163, 175, 0.6) rgba(55, 65, 81, 0.4)',
                      WebkitOverflowScrolling: 'touch'
                    }}
                  >
                    {neighborFighters.map((fighter, index) => {
                      const sortedElo = [...eloData].sort((a, b) => b.elo - a.elo);
                      const fighterIndex = sortedElo.findIndex(f => f.fighter === fighter.fighter);
                      const rank = fighterIndex !== -1 ? fighterIndex + 1 : 0;
                      const isSelected = fighter.fighter === selectedFighter.fighter;
                      return (
                        <div
                          key={fighter.fighter}
                          className={cn(
                            "flex items-center justify-between py-2 px-4 border-b border-gray-700/30 hover:bg-gray-800/20 transition-colors",
                            isSelected && "bg-gray-800/40 backdrop-blur-sm"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 font-light text-sm w-12">#{rank}</span>
                            <span className={cn(
                              "font-light text-sm",
                              isSelected ? "text-white" : "text-gray-200"
                            )} style={{ fontFamily: 'var(--font-montserrat)' }}>
                              {fighter.fighter}
                            </span>
                          </div>
                          <span className={cn(
                            "font-light text-sm",
                            isSelected ? "text-white" : "text-gray-300"
                          )} style={{ fontFamily: 'var(--font-montserrat)' }}>
                            {fighter.elo.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 font-light text-sm" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Search for a fighter to see ranking context
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

