import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

UFCStats_BaseURL = "http://ufcstats.com/statistics/events/completed?page="

def main():

    # 1) scrapes all events
    events_list = []
    current_page_number = 1

    while True:
        soup = get_page_html(current_page_number)
        # list of dictionaries with "event_name" and "event_url"
        page_events = parse_page(soup)
        
        if not page_events: # /if page_events == []:
            print(f"no events in page {current_page_number}")
            break
        
        # adds all the page from "current_page_number" to all page_events
        events_list.extend(page_events)
        print(
            f"Page {current_page_number}: "
            f"{len(page_events)} events "
            f"(total: {len(events_list)})"
        )

        # continues to next iteration
        current_page_number += 1
        time.sleep(0.1)

    print(
        "Finished scraping all events on the main page."
        "Created 'event_name' and 'event_url' in events_list"
        )

    

    # 2) 



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

if __name__ == "__main__":
    main()

