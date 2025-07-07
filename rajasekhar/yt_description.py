import json
from dataclasses import asdict

from common import SCRIPT_DIR, VideoData, get_soup, get_video_data, videos_url

VIDEO_DATA = get_video_data()


def clean_title(txt: str):
    return txt.rsplit("|", 1)[0].strip()


def get_video_ids() -> list[str]:
    soup = get_soup(videos_url, filename="page.htm")

    scripts = soup.find("body").find_all("script", limit=3)
    for script in scripts:
        json_str = script.string
        if json_str and json_str.startswith("var ytInitialData"):
            _page_data = json.loads(json_str[20:-1])["contents"]
            break
    else:
        raise NotImplementedError

    video_tab = _page_data["twoColumnBrowseResultsRenderer"]["tabs"][1]
    videos = video_tab["tabRenderer"]["content"]["richGridRenderer"]["contents"]
    print(len(videos))
    _video_ids = []
    for video in videos:
        if "richItemRenderer" not in video:
            break
        video = video["richItemRenderer"]["content"]["videoRenderer"]
        _video_ids.append(video["videoId"])
        # print(clean_title(video["title"]["runs"][0]["text"]))

    return _video_ids


def scrape_video_data(video_id: str) -> VideoData:
    """
    Scrapes data from the YouTube video's page whose ID is passed in the URL, and returns a JSON object as a response.
    """

    video_url = "https://www.youtube.com/watch?v=" + video_id
    soup = get_soup(video_url, filename="video.htm")

    script_data = soup.find("body").find("script").string
    if script_data.startswith("var ytInitialPlayerResponse"):
        _video_data = json.loads(script_data[30:-1])["videoDetails"]
    else:
        raise NotImplementedError

    publish_date = soup.find("meta", attrs={"itemprop": "datePublished"}).get("content")

    return VideoData(
        id=_video_data["videoId"],
        title=clean_title(_video_data["title"]),
        description=_video_data["shortDescription"].split("\n\n")[1:-1],
        publish_date=publish_date,
    )


def save_video_data(video_data: dict):
    _sorted_video_data = sorted(video_data.items(), key=lambda vdata: vdata[1]["publish_date"], reverse=True)
    with open(SCRIPT_DIR / "video_data.json", "w") as fw:
        json.dump(dict(_sorted_video_data), fw, indent=2)


def main():
    video_ids = get_video_ids()
    for _video_id in video_ids:
        if _video_id in VIDEO_DATA:
            continue
        x = scrape_video_data(_video_id)
        VIDEO_DATA[_video_id] = asdict(x)

    save_video_data(VIDEO_DATA)
