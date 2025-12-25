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
  const searchRef = useRef<HTMLDivElement>(null);

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
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 h-[85vh]">
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

        {/* Right Side - Fighter Info */}
        <div className="flex flex-col items-center justify-center">
          {selectedFighter ? (
            <div className="w-full max-w-md">
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
                <div className="relative flex flex-col overflow-hidden rounded-xl border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm shadow-sm">
                  <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 px-4 py-3 border-b border-gray-700/50">
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
      </div>
    </div>
  );
}

