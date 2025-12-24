import pandas as pd

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
    main()