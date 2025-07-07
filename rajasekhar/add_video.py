from dataclasses import asdict

from yt_description import VIDEO_DATA, save_video_data, scrape_video_data


def add_video(video_id, refresh=False):
    if not refresh and video_id in VIDEO_DATA:
        return "Data already available"

    video_data = scrape_video_data(video_id)
    VIDEO_DATA[video_id] = asdict(video_data)
    save_video_data(VIDEO_DATA)
    return "Data added / refreshed"


if __name__ == "__main__":
    raja_video_id = input("Enter video id: ")
    status = add_video(raja_video_id)
    print(status)
