"""Prepare the new scene and a native-playback reverse copy; preserve sources."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import av
import imageio_ffmpeg

project = Path(__file__).resolve().parents[1]
media = project / "public" / "media"
encoder = imageio_ffmpeg.get_ffmpeg_exe()

def checksum(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()

def inspect(path):
    with av.open(str(path)) as container:
        stream = container.streams.video[0]
        return {
            "width": stream.width, "height": stream.height,
            "fps": float(stream.average_rate), "frames": stream.frames,
            "duration": float(stream.duration * stream.time_base),
            "keyframes": [round(float(p.pts * p.time_base), 5)
                for p in container.demux(stream) if p.is_keyframe and p.pts is not None],
        }

def encode(source, target, reverse=False):
    target.parent.mkdir(parents=True, exist_ok=True)
    command = [encoder, "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(source), "-map", "0:v:0", "-an"]
    if reverse:
        command.extend(["-vf", "reverse"])
    command.extend(["-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-g", "6", "-keyint_min", "6", "-sc_threshold", "0", "-bf", "0",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-threads", "4", str(target)])
    subprocess.run(command, check=True)
    original, result = inspect(source), inspect(target)
    for field in ("width", "height", "fps", "frames", "duration"):
        assert original[field] == result[field], field
    return original, result

hashes = {n: checksum(project.parent / f"{n}.mp4") for n in (10, 11)}
source10 = project.parent / "10.mp4"
target10 = media / "scroll" / "10.mp4"
original10, web10 = encode(source10, target10)
records = json.loads((project / "content/scroll-media-manifest.json").read_text())
records = [record for record in records if record["source"] != "10.mp4"]
records.append({"source": "10.mp4", "sourceSha256": hashes[10],
    "sourceBytes": source10.stat().st_size, "sourceMetadata": original10,
    "webPath": "/media/scroll/10.mp4", "webSha256": checksum(target10),
    "webBytes": target10.stat().st_size, "webMetadata": web10})
(project / "content/scroll-media-manifest.json").write_text(json.dumps(records, indent=2), encoding="utf-8")

source11 = project.parent / "11.mp4"
forward = media / "11.mp4"
shutil.copyfile(source11, forward)
reverse = media / "tv" / "11-reverse.mp4"
original11, reverse11 = encode(source11, reverse, True)

for number in (10, 11):
    with av.open(str(project.parent / f"{number}.mp4")) as container:
        frames = list(container.decode(video=0))
        if number == 10:
            frames[0].to_image().save(media / "10-poster.jpg", quality=92)
            frames[-1].to_image().save(media / "10-final.jpg", quality=92)
        else:
            frames[-1].to_image().save(media / "11-on.jpg", quality=92)
    assert checksum(project.parent / f"{number}.mp4") == hashes[number]
assert checksum(forward) == hashes[11]
(project / "content/tv-media-manifest.json").write_text(json.dumps({
    "source": "11.mp4", "sourceSha256": hashes[11], "metadata": original11,
    "forwardPath": "/media/11.mp4", "forwardExactSourceCopy": True,
    "reversePath": "/media/tv/11-reverse.mp4", "reverseSha256": checksum(reverse),
    "reverseMetadata": reverse11, "sourceMediaUnchanged": True,
}, indent=2), encoding="utf-8")
print(f"10.mp4: {source10.stat().st_size} -> {target10.stat().st_size} bytes")
print(f"11.mp4: original served unchanged; reverse copy {reverse.stat().st_size} bytes")
