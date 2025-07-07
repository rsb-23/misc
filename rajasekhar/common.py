import json
from dataclasses import dataclass
from pathlib import Path
from urllib.request import urlopen

from bs4 import BeautifulSoup

channel_name = "rajasekharmamidanna7918"
channel_url = f"https://www.youtube.com/@{channel_name}"
videos_url = f"https://www.youtube.com/@{channel_name}/videos"

SCRIPT_DIR = Path(__file__).parent
SAVE_SOUP = False


@dataclass
class VideoData:
    id: str
    title: str
    description: list[str]
    publish_date: str


def get_soup(url, *, filename: str):
    html = urlopen(url).read()
    if SAVE_SOUP:
        save_locally(filename, html)
    return BeautifulSoup(html, "lxml")


def get_video_data() -> dict:
    with open(SCRIPT_DIR / "video_data.json", "r") as fr:
        _data = json.load(fr)
    return _data


def save_locally(filename: str, content: str | bytes):
    mode = "w" if isinstance(content, str) else "wb"
    with open(SCRIPT_DIR / filename, mode) as f:
        f.write(content)
