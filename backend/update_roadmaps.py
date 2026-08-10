import re

with open("app/routers/roadmaps.py", "r") as f:
    content = f.read()

content = content.replace(
    "from app.utils.youtube_client import search_youtube_videos",
    "from app.utils.youtube_client import search_youtube_videos, find_module_playlist, match_playlist_video_to_topic"
)

# 1. We replace `for t_idx, topic in enumerate(module.get("topics", [])):`
# with `playlist_catalog = await find_module_playlist(module.get("title", ""))\n{indent}for t_idx, topic...`
# But only if it's followed by YouTube enrichment inside (we don't want to break other loops).
# Actually, it's safer to just replace all `for t_idx, topic in enumerate(module.get("topics", [])):`
# Wait, let's just write a custom parser for this file.

lines = content.split('\n')
new_lines = []

def get_indent(line):
    return len(line) - len(line.lstrip())

i = 0
while i < len(lines):
    line = lines[i]
    if 'for t_idx, topic in enumerate(module.get("topics", [])):' in line or 'for topic in module.get("topics", []):' in line:
        indent = get_indent(line)
        # Check if this loop has YouTube enrichment inside it.
        # We can look ahead a few lines.
        has_yt = False
        for j in range(i, min(i+40, len(lines))):
            if 'if settings.YOUTUBE_API_KEY:' in lines[j] or 'results = await search_youtube_videos' in lines[j]:
                has_yt = True
                break
        
        if has_yt:
            new_lines.append(" " * indent + 'playlist_catalog = await find_module_playlist(module.get("title", ""))')
    
    if 'results = await search_youtube_videos(search_query' in line:
        indent = get_indent(line)
        strict_srcs = line.split("strict_official_sources=")[1].split(")")[0]
        
        # Replace the `results = ...` block with playlist logic
        # We need to skip lines until `await asyncio.sleep(0.1)` or `except`
        
        replacement = f"""{" " * indent}playlist_match = match_playlist_video_to_topic(playlist_catalog, topic['title']) if playlist_catalog else None
{" " * indent}if playlist_match:
{" " * indent}    topic["youtube_video_id"] = playlist_match["video_id"]
{" " * indent}    topic["youtube_video_title"] = playlist_match["video_title"]
{" " * indent}    topic["duration"] = playlist_match["duration_minutes"]
{" " * indent}else:
{" " * indent}    results = await search_youtube_videos(search_query, max_results=1, topic_title=topic['title'], strict_official_sources={strict_srcs})
{" " * indent}    if results:
{" " * indent}        topic["youtube_video_id"] = results[0]["video_id"]
{" " * indent}        topic["youtube_video_title"] = results[0]["video_title"]
{" " * indent}        topic["duration"] = results[0]["duration_minutes"]"""
        
        new_lines.append(replacement)
        
        # Skip the old block
        while i < len(lines) - 1:
            i += 1
            if 'topic["duration"] =' in lines[i]:
                continue
            if 'topic["youtube_video_id"] =' in lines[i]:
                continue
            if 'topic["youtube_video_title"] =' in lines[i]:
                continue
            if 'if results:' in lines[i]:
                continue
            if 'results = await search_youtube_videos' in lines[i]:
                continue
            # We stopped skipping
            new_lines.append(lines[i])
            break
    else:
        new_lines.append(line)
    
    i += 1

with open("app/routers/roadmaps.py", "w") as f:
    f.write('\n'.join(new_lines))

print("Done")
