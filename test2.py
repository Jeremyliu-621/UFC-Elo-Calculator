import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

UFCStats_BaseURL = "http://ufcstats.com/statistics/events/completed?page="
HEADERS = {"User-Agent": "Mozilla/5.0"}

def main():
    # 1) Scrape ALL events
    events_list = []
    current_page_number = 1

    while True:
        soup = get_page_html(current_page_number)
        page_events = parse_page(soup)

        if not page_events:
            break

        events_list.extend(page_events)
        print(
            f"Page {current_page_number}: "
            f"{len(page_events)} events "
            f"(total: {len(events_list)})"
        )

        current_page_number += 1
        time.sleep(1)

    print("Finished scraping events.")
    events_df = pd.DataFrame(events_list)
    events_df.to_csv("ufc_events.csv", index=False)
    print("Saved events to ufc_events.csv")

    # 2) Scrape ALL fights from ALL events
    all_fights = []
    for i, event in enumerate(events_list, start=1):
        event_name = event["event_name"]
        event_url = event["event_url"]

        event_soup = get_event_soup(event_url)
        fights = parse_fights_from_event(event_name, event_url, event_soup)

        all_fights.extend(fights)
        print(f"[{i}/{len(events_list)}] {event_name}: {len(fights)} fights (total fights: {len(all_fights)})")

        time.sleep(1)

    fights_df = pd.DataFrame(all_fights)
    fights_df.to_csv("ufc_fights.csv", index=False)
    print("Saved fights to ufc_fights.csv")

def get_page_html(page_number):
    url = UFCStats_BaseURL + str(page_number)
    response = requests.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    return BeautifulSoup(response.content, "html.parser")

def parse_page(soup):
    # finds all events on a page
    page_events = soup.find_all("a", class_="b-link b-link_style_black")

    events = []
    for event in page_events:
        name = event.get_text(strip=True)
        link = event.get("href")

        # filter out junk / non-event links
        if name and link and "event-details" in link:
            events.append({
                "event_name": name,
                "event_url": link
            })

    return events  # ALWAYS return a list

def get_event_soup(event_url):
    resp = requests.get(event_url, headers=HEADERS, timeout=15)
    resp.raise_for_status()
    return BeautifulSoup(resp.content, "html.parser")

def parse_fights_from_event(event_name, event_url, event_soup):
    """
    Returns a list of fights for one event.
    UFCStats event pages show fights in a table. Each row is one fight.
    """
    fights = []

    tbody = event_soup.find("tbody")
    if not tbody:
        return fights

    rows = tbody.find_all("tr")
    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 10:
            continue

        # Result column usually contains a "W/L" marker for the red corner,
        # but for simplicity we store it as shown, plus both fighters.
        result = cols[0].get_text(strip=True)

        # Fighter names live in column 1 with two <p> tags
        fighter_ps = cols[1].find_all("p")
        if len(fighter_ps) < 2:
            continue
        fighter_1 = fighter_ps[0].get_text(strip=True)
        fighter_2 = fighter_ps[1].get_text(strip=True)

        # Method / round / time are later columns on UFCStats
        method = cols[7].get_text(strip=True)
        round_ = cols[8].get_text(strip=True)
        time_ = cols[9].get_text(strip=True)

        fights.append({
            "event": event_name,
            "event_url": event_url,
            "fighter_1": fighter_1,
            "fighter_2": fighter_2,
            "result": result,
            "method": method,
            "round": round_,
            "time": time_
        })

    return fights

if __name__ == "__main__":
    main()
