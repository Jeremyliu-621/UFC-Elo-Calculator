import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

UFCStats_BaseURL = "http://ufcstats.com/statistics/events/completed?page="

def main():

    # 1) scrapes all events
    events_list = []
    current_page_number = 1

    # while True:
    soup = get_page_html(current_page_number)
    page_events = parse_page(soup)
    
    print(page_events)

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
        events.append({
            "event_name": name,
            "event_url": link
        })

    return events

if __name__ == "__main__":
    main()

