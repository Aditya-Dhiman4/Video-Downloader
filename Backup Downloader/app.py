from videoDownloader import vid_downloader

language = input('Enter the language or type of the channel: ')

vid_or_aud = int(input('1. Just Video | or | 2. Just Video and Audio (Type 1 or 2)\n'))

# Paste video urls in here formatted as a string
video_urls = []

print("Enter URL's:\n")

while True:
    url = input()

    #if user pressed Enter without a value, break out of loop
    if url == '':
        break
    else:
        if "&list" in url:
            vidLink, sep, playlist = url.partition("&list")
            url = vidLink
        video_urls.append(url + '\n')

print(video_urls)

download = vid_downloader(language, f"C:/Users/User/OneDrive/Psych2go/{language}/", video_urls, vid_or_aud)

download.video_or_audio(vid_or_aud)

info = download.get_vid_info()