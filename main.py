import requests
from bs4 import BeautifulSoup
import pandas as pd
import time

UFCStats_BaseURL = "http://ufcstats.com/statistics/events/completed?page="
page = requests.get(UFCStats_BaseURL)

soup = BeautifulSoup(page.content, "html.parser")