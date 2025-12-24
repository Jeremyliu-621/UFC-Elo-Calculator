import pandas as pd

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
    main()