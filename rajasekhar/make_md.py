import yt_description
from common import get_video_data, save_locally

STORY_FORMAT = """
### [{title}](https://youtu.be/{video_id})

<details name="story">
<summary>Story</summary>
{story}
</details>
"""


def make_story(video_data: dict) -> str:
    def part_of_story(sentence) -> bool:
        if "description" in sentence and "reads" in sentence:
            print(">>", video_data["title"])
            print(sentence)
            return False
        return True

    story = video_data["description"]
    if not story:
        return ""
    _story = "\n<br><br>".join(str(x) for x in story if part_of_story(x))
    return STORY_FORMAT.format(video_id=video_data["id"], title=video_data["title"], story=_story)


def index_md_content() -> str:
    index_md = "## Raja Mama Stories\n"
    for video_detail in VIDEO_DATA.values():
        index_md += make_story(video_detail)
    return index_md


if __name__ == "__main__":
    yt_description.main()
    VIDEO_DATA = get_video_data()
    save_locally("index.md", index_md_content())
