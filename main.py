import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

UFCStats_BaseURL = "http://ufcstats.com/statistics/events/completed?page="

def main():
    events_list = []
    current_page_number = 1
    has_more_pages = True
    while has_more_pages:
        soup = get_page_html(current_page_number)
        print(page(soup))
        has_more_pages = False

def page(soup):
    # finds all events on a page
    page_events = soup.find_all("a", class_="b-link b-link_style_black")
    # exits when all events have been exhausted
    if not page_events:
        return False
    else:
        for event in page_events:
            print(event)


# since the page has multiple pages, needs a function that can parse repeatedly, according to page #
def get_page_html(page_number):
    page = requests.get(UFCStats_BaseURL + str(page_number))
    
    return BeautifulSoup(page.content, "html.parser")

main()

