import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

UFCStats_BaseURL = "http://ufcstats.com/statistics/events/completed?page="

def main():

    # 1) scrapes all events
    all_events = []
    current_page_number = 1

    while True:
        soup = get_page_html(current_page_number)
        # list of dictionaries with "event_name" and "event_url"
        page_events = parse_page(soup)
        
        if not page_events: # /if page_events == []:
            print(f"no events in page {current_page_number}")
            break
        
        # adds all the page from "current_page_number" to all page_events
        all_events.extend(page_events)
        print(
            f"Page {current_page_number}: "
            f"{len(page_events)} events "
            f"(total: {len(all_events)})"
        )

        # continues to next iteration
        current_page_number += 1
        time.sleep(0.05)

    print(
        "Finished scraping all events on the main page.",
        "Created 'event_name' and 'event_url' in all_events"
        )
    
    print(all_events[:5])   # first 5 only

    # 2) scrape ALL fights from ALL events within each event's fighter

    all_fights = []

    event_count = len(all_events)
    current_event = 1

    for event in all_events:
        # get 'event_name' and 'event
        event_name = event["event_name"]
        event_url = event["event_url"]

        print(f"parsing fight number ({current_event}) out of ({event_count}) fights")

        event_soup = get_event_soup(event_url)
        fights = parse_fights_from_event(event_name, event_url, event_soup)

        all_fights.extend(fights)
        current_event += 1
        time.sleep(0.005)
        
    print("All fights collected.")

    fights_df = pd.DataFrame(all_fights)
    fights_df.to_csv("all_ufc_fights_new.csv", index=False)
    print("Saved all_fights to all_ufc_fights.csv")

# since the page has multiple pages, needs a function that can parse repeatedly, according to page #
def get_page_html(page_number):
    page = requests.get(UFCStats_BaseURL + str(page_number))
    return BeautifulSoup(page.content, "html.parser")

def parse_page(soup):
    # finds all events on a page
    page_events = soup.find_all("a", class_="b-link b-link_style_black")
    # exits when all events have been exhausted
    events = []
    for event in page_events:
        name = event.get_text(strip=True)
        link = event.get("href")

        # creates a list of dictionaries with "event_name" and "event_url"
        
        events.append({
            "event_name": name,
            "event_url": link
        })

    return events

def get_event_soup(event_url):
    specific_event_soup = requests.get(event_url)
    return BeautifulSoup(specific_event_soup.content, "html.parser")

def parse_fights_from_event(event_name, event_url, event_soup):
    specific_event_fights = []

    # find the table that contains all the fights
    table_body = event_soup.find("tbody")
    if table_body is None:
        print("Can not find fights within a certain event.")
        return specific_event_fights
    
    # each table row is one fight
    fight_rows = table_body.find_all("tr")

    for fight_row in fight_rows:
        row_columns = fight_row.find_all("td")

        # checks for redundant row_columns
        if len(row_columns) < 10:
            print("redundant column in row_column check found.")
            continue

        fighter_1_result = row_columns[0].get_text(strip=True)

        # fighter names
        fighter_1_name, fighter_2_name = sort_two_paragraphs(row_columns[1])

        # fighter KD/STR/TD/SUB
        fighter_1_knockdowns_number, fighter_2_knockdowns_number = sort_two_paragraphs(row_columns[2])
        fighter_1_number_strikes, fighter_2_number_strikes = sort_two_paragraphs(row_columns[3])
        fighter_1_number_takedowns, fighter_2_number_takedowns = sort_two_paragraphs(row_columns[4])
        fighter_1_number_submissions, fighter_2_number_submissions = sort_two_paragraphs(row_columns[5])

        # weightclass
        weightclass = row_columns[6].get_text(" ", strip=True)

        # method + move
        method, move = sort_two_paragraphs(row_columns[7])

        # round + time
        round_that_won = row_columns[8].get_text(strip=True)
        time_elapsed_in_winround = row_columns[9].get_text(strip=True)

        specific_event_fights.append({
            "event": event_name,
            "event_url": event_url,

            "fighter_1_result": fighter_1_result,

            "fighter_1_name": fighter_1_name,
            "fighter_2_name": fighter_2_name,

            "fighter_1_knockdowns_number": fighter_1_knockdowns_number,
            "fighter_2_knockdowns_number": fighter_2_knockdowns_number,

            "fighter_1_number_strikes": fighter_1_number_strikes,
            "fighter_2_number_strikes": fighter_2_number_strikes,

            "fighter_1_number_takedowns": fighter_1_number_takedowns,
            "fighter_2_number_takedowns": fighter_2_number_takedowns,

            "fighter_1_number_submissions": fighter_1_number_submissions,
            "fighter_2_number_submissions": fighter_2_number_submissions,

            "weightclass": weightclass,

            "method": method,
            "move": move,

            "round_that_won": round_that_won,
            "time_elapsed_in_winround": time_elapsed_in_winround
        })

    return specific_event_fights
    
def sort_two_paragraphs(row_column):

    paragraphs = row_column.find_all("p")
    fighter_1_stat = paragraphs[0].get_text(strip=True) if len(paragraphs) > 0 else ""
    fighter_2_stat = paragraphs[1].get_text(strip=True) if len(paragraphs) > 1 else ""
    return fighter_1_stat, fighter_2_stat

if __name__ == "__main__":
    main()

