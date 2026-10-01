"""Create seek-friendly web copies; never write to the supplied source clips."""
from pathlib import Path
import hashlib
import json
import subprocess
import av
import imageio_ffmpeg

PROJECT = Path(__file__).resolve().parents[1]
OUTPUT = PROJECT / "public" / "media" / "scroll"
OUTPUT.mkdir(parents=True, exist_ok=True)
ENCODER = imageio_ffmpeg.get_ffmpeg_exe()


def sha256(path):
    with path.open("rb") as source:
        return hashlib.file_digest(source, "sha256").hexdigest()


def inspect(path):
    with av.open(str(path)) as container:
        stream = container.streams.video[0]
        return {
            "width": stream.width,
            "height": stream.height,
            "fps": float(stream.average_rate),
            "frames": stream.frames,
            "duration": float(stream.duration * stream.time_base),
            "keyframes": [
                round(float(packet.pts * packet.time_base), 5)
                for packet in container.demux(stream)
                if packet.is_keyframe and packet.pts is not None
            ],
        }


records = []
for number in range(1, 10):
    source = PROJECT.parent / f"{number}.mp4"
    target = OUTPUT / source.name
    original_hash = sha256(source)
    original = inspect(source)
    subprocess.run([
        ENCODER, "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(source), "-map", "0:v:0", "-an",
        "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-g", "6", "-keyint_min", "6", "-sc_threshold", "0", "-bf", "0",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-threads", "4",
        str(target),
    ], check=True)
    optimized = inspect(target)
    assert original_hash == sha256(source), "Source media was changed"
    for attribute in ("width", "height", "fps", "frames"):
        assert original[attribute] == optimized[attribute], attribute
    assert abs(original["duration"] - optimized["duration"]) < 0.001
    records.append({
        "source": source.name,
        "sourceSha256": original_hash,
        "sourceBytes": source.stat().st_size,
        "sourceMetadata": original,
        "webPath": f"/media/scroll/{source.name}",
        "webSha256": sha256(target),
        "webBytes": target.stat().st_size,
        "webMetadata": optimized,
    })
    print(f"{source.name}: {source.stat().st_size} -> {target.stat().st_size} bytes; "
          f"{len(optimized['keyframes'])} keyframes", flush=True)

(PROJECT / "content" / "scroll-media-manifest.json").write_text(
    json.dumps(records, indent=2), encoding="utf-8"
)
