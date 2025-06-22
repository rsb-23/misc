import yt_description
from common import get_video_data, save_locally


def make_story(title, story) -> str:
    _story = "\n\n".join(x for x in story if len(x)>100)
    return f"\n### {title}\n\n<details>\n<summary>Story</summary>\n{_story}\n</details>\n"


def index_md_content() -> str:
    index_md = "## Raja Mama Stories\n"
    for video_detail in VIDEO_DATA.values():
        index_md += make_story(video_detail["title"], video_detail["description"])
    return index_md


if __name__ == "__main__":
    yt_description.main()
    VIDEO_DATA = get_video_data()
    save_locally("index.md", index_md_content())
