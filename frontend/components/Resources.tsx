"use client"

import { useState } from 'react';
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { Download, Github } from 'lucide-react';
import Link from 'next/link';

const eloCode = `import pandas as pd

INITIAL_ELO = 1000
K = 40

def main():
    # load and clean dataframe
    df = pd.read_csv("all_ufc_fights.csv")
    df = df.rename(columns={
        "fighter_1_name": "fighter_1",
        "fighter_2_name": "fighter_2",
        "fighter_1_result": "result"
    })

    # Add elo columns to df
    df["fighter_1_elo_start"] = 0.0
    df["fighter_2_elo_start"] = 0.0
    df["fighter_1_elo_end"] = 0.0
    df["fighter_2_elo_end"] = 0.0

    # remember fighter elo
    elo = {}

    for i, row in df.iterrows():
        fighter_1 = row["fighter_1"]
        fighter_2 = row["fighter_2"]

        # initializes new fighter's elo
        if fighter_1 not in elo:
            elo[fighter_1] = INITIAL_ELO
        if fighter_2 not in elo:
            elo[fighter_2] = INITIAL_ELO
        
        # 1) saves starting elo before a specific fight
        fighter_1_starting_elo = elo[fighter_1]
        fighter_2_starting_elo = elo[fighter_2]

        df.at[i, "fighter_1_elo_start"] = fighter_1_starting_elo
        df.at[i, "fighter_2_elo_start"] = fighter_2_starting_elo

        # 2) updates elo
        if row["result"] == "win":
            score_for_1 = 1.0
        elif row["result"] == "loss":
            score_for_1 = 0.0
        elif row["result"] == "drawdraw" or row["result"] == "ncnc":
            score_for_1 = 0.5
        else:
            score_for_1 = None
        
        if score_for_1 is None:
            fighter_1_ending_elo, fighter_2_ending_elo = fighter_1_starting_elo, fighter_2_starting_elo
        else:
            fighter_1_ending_elo, fighter_2_ending_elo = update_elo(fighter_1_starting_elo, fighter_2_starting_elo, score_for_1)

        # 3) saves ending elo
        df.at[i, "fighter_1_elo_end"] = fighter_1_ending_elo
        df.at[i, "fighter_2_elo_end"] = fighter_2_ending_elo

        elo[fighter_1] = fighter_1_ending_elo
        elo[fighter_2] = fighter_2_ending_elo

    # 4) save outputs
    df.to_csv("ufc_fights_with_elo.csv", index=False)
    print("Saved.")
    print("Created ufc_fights_with_elo.csv")

    elo_table = pd.DataFrame(
        sorted(elo.items(), key=lambda x: x[1], reverse=True),
        columns=["Fighter", "Elo Rating"]
    )
    elo_table.to_csv("current_fighters_elo.csv", index=False)

def expected_score_for_a_calculator(elo_a, elo_b):
    # returns the probability that fighter 'a' will win
    return 1 / (1 + 10 ** ((elo_b - elo_a) / 400))

def update_elo(elo_a, elo_b, score_for_a):
    """
    score_a:
    1.0 = fighter_1 wins
    0.0 = fighter_1 loses
    0.5 = draw
    """
    expected_outcome_a = expected_score_for_a_calculator(elo_a, elo_b)
    new_elo_a = elo_a + (K * (score_for_a - expected_outcome_a))
    new_elo_b = elo_b + K * ((1-score_for_a) - (1-expected_outcome_a))
    return round(new_elo_a, 2), round(new_elo_b, 2)

if __name__ == "__main__":
    main()`;

const statsCode = `import pandas as pd

def main():
    # load and clean dataframe
    df = pd.read_csv("ufc_fights_with_elo.csv")
    df = df.rename(columns={
        "fighter_1_name": "fighter_1",
        "fighter_2_name": "fighter_2",
        "fighter_1_result": "result"
    })

    # remember fighter stats
    stats = {}

    for i, row in df.iterrows():
        fighter_1 = row["fighter_1"]
        fighter_2 = row["fighter_2"]

        # initializes new fighter's elo
        for fighter in (fighter_1, fighter_2):
            if fighter not in stats:
                stats[fighter] = {
                    "fights": 0,
                    "wins": 0,
                    "losses": 0,
                    "draws": 0,
                    "ncs": 0,
                    "knockdowns": 0,
                    "strikes": 0,
                    "takedowns": 0,
                    "submissions": 0,
                }
        
        stats[fighter_1]["fights"] += 1
        stats[fighter_2]["fights"] += 1

        result = row["result"]

        if result == "win":
            stats[fighter_1]["wins"] += 1
            stats[fighter_2]["losses"] += 1
        elif result == "loss":
            stats[fighter_1]["losses"] += 1
            stats[fighter_2]["wins"] += 1
        elif result == "draw":
            stats[fighter_1]["draws"] += 1
            stats[fighter_2]["draws"] += 1
        else:  # nc
            stats[fighter_1]["ncs"] += 1
            stats[fighter_2]["ncs"] += 1

        stats[fighter_1]["knockdowns"] += to_int(row["fighter_1_knockdowns_number"])
        stats[fighter_2]["knockdowns"] += to_int(row["fighter_2_knockdowns_number"])

        stats[fighter_1]["strikes"] += to_int(row["fighter_1_number_strikes"])
        stats[fighter_2]["strikes"] += to_int(row["fighter_2_number_strikes"])

        stats[fighter_1]["takedowns"] += to_int(row["fighter_1_number_takedowns"])
        stats[fighter_2]["takedowns"] += to_int(row["fighter_2_number_takedowns"])

        stats[fighter_1]["submissions"] += to_int(row["fighter_1_number_submissions"])
        stats[fighter_2]["submissions"] += to_int(row["fighter_2_number_submissions"])

    # 4) save outputs
    stats_df = pd.DataFrame.from_dict(stats, orient="index").reset_index()
    stats_df = stats_df.rename(columns={"index": "fighter"})
    stats_df.to_csv("fighter_stats.csv", index=False)
    print("Created fighter_stats.csv")

def to_int(x):
    x = str(x).strip()
    if x in ("", "--", "nan", "None"):
        return 0
    return int(x)

if __name__ == "__main__":
    main()`;

const csvFiles = [
  { name: "Current Fighters Elo", file: "current_fighters_elo.csv" },
  { name: "Fighter Statistics", file: "fighter_stats.csv" },
  { name: "All UFC Fights", file: "all_ufc_fights.csv" },
  { name: "UFC Fights with Elo", file: "ufc_fights_with_elo.csv" },
];

export default function Resources() {
  const [activeCode, setActiveCode] = useState<'elo' | 'stats'>('elo');

  return (
    <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 mx-auto">
        {/* Left Side - Controls and Downloads */}
        <div className="flex flex-col space-y-6">
          {/* Source Code Title */}
          <h2 className="text-2xl font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
            Source Code
          </h2>

          {/* GitHub Link */}
          <Link
            href="https://github.com/Jeremyliu-621"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-xl border-[0.75px] border-gray-700/50 p-1.5 transition-all duration-300 cursor-pointer hover:scale-105 w-full"
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
              "relative flex items-center justify-center gap-3 rounded-lg border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm px-6 py-3 transition-all duration-300",
              "hover:bg-gray-800/30"
            )}>
              <Github className="size-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
              <span className="text-base font-light text-gray-300 group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'var(--font-montserrat)' }}>
                View on GitHub
              </span>
            </div>
          </Link>
          
          {/* Code Tabs */}
          <div className="flex gap-4">
            <button
              onClick={() => setActiveCode('elo')}
              className={cn(
                "relative rounded-xl border-[0.75px] border-gray-700/50 p-1.5 transition-all duration-300 cursor-pointer group flex-1",
                "hover:scale-105",
                activeCode === 'elo' && "border-gray-700/50"
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
                activeCode === 'elo'
                  ? "bg-gray-800/40 backdrop-blur-md border-gray-700/40"
                  : "hover:bg-gray-800/30"
              )}>
                <span className={cn(
                  "text-sm font-light transition-colors duration-300",
                  activeCode === 'elo'
                    ? "text-white"
                    : "text-gray-300 group-hover:text-white"
                )} style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Elo Calculator
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveCode('stats')}
              className={cn(
                "relative rounded-xl border-[0.75px] border-gray-700/50 p-1.5 transition-all duration-300 cursor-pointer group flex-1",
                "hover:scale-105",
                activeCode === 'stats' && "border-gray-700/50"
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
                activeCode === 'stats'
                  ? "bg-gray-800/40 backdrop-blur-md border-gray-700/40"
                  : "hover:bg-gray-800/30"
              )}>
                <span className={cn(
                  "text-sm font-light transition-colors duration-300",
                  activeCode === 'stats'
                    ? "text-white"
                    : "text-gray-300 group-hover:text-white"
                )} style={{ fontFamily: 'var(--font-montserrat)' }}>
                  Stats Calculator
                </span>
              </div>
            </button>
          </div>

          {/* CSV Downloads Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-light text-white" style={{ fontFamily: 'var(--font-montserrat)' }}>
              Download Data as CSV
            </h3>
            
            <div className="space-y-3">
              {csvFiles.map((csv) => (
                <a
                  key={csv.file}
                  href={`/${csv.file}`}
                  download
                  className="group relative rounded-xl border-[0.75px] border-gray-700/50 p-1.5 transition-all duration-300 cursor-pointer hover:scale-105 w-full"
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
                    "relative flex items-center justify-center gap-3 rounded-lg border-[0.75px] border-gray-700/30 bg-black/40 backdrop-blur-sm px-5 py-3 transition-all duration-300",
                    "hover:bg-gray-800/30"
                  )}>
                    <Download className="size-5 text-gray-300 group-hover:text-white transition-colors duration-300" />
                    <span className="text-sm font-light text-gray-300 group-hover:text-white transition-colors duration-300" style={{ fontFamily: 'var(--font-montserrat)' }}>
                      {csv.name}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Scrollable Code Display */}
        <div className="flex flex-col w-full">
          <div className="relative rounded-xl border-[0.75px] border-gray-700/50 bg-gray-900/60 backdrop-blur-sm overflow-hidden h-[80vh] flex flex-col w-full" style={{ minWidth: 0 }}>
            {/* Jupyter notebook style header */}
            <div className="bg-gray-800/80 px-4 py-2 border-b border-gray-700/50 flex items-center gap-2 flex-shrink-0">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/60"></div>
              </div>
              <span className="text-xs text-gray-400 font-light ml-2" style={{ fontFamily: 'var(--font-montserrat)' }}>
                python
              </span>
            </div>
            
            {/* Scrollable Code content */}
            <div className="flex-1 overflow-y-auto overflow-x-auto custom-scrollbar p-4" style={{ minWidth: 0, width: '100%', maxWidth: '100%' }}>
              <pre className="text-sm text-gray-200 font-mono leading-relaxed whitespace-pre" style={{ display: 'block', margin: 0 }}>
                <code style={{ display: 'block', minWidth: 'max-content' }}>{activeCode === 'elo' ? eloCode : statsCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

