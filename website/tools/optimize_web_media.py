"""Build the lightweight web media: adaptive scroll-video variants, posters,
compressed images and subset WOFF2 fonts. Source clips are never modified.

Variants (chosen at runtime by lib/scroll-scenes.ts):
  hd       1280 px wide       desktop on a normal connection
  sd        960 px wide       tablets, landscape phones, slow connections
  portrait  540x900 crop      portrait phones (crop matches object-position 54%)

Requires: av, imageio-ffmpeg, Pillow, fonttools, brotli.
"""
from pathlib import Path
import json
import subprocess
import av
import imageio_ffmpeg
from PIL import Image
from fontTools import subset

PROJECT = Path(__file__).resolve().parents[1]
PUBLIC = PROJECT / "public"
MEDIA = PUBLIC / "media"
SOURCES = PROJECT.parent
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
SCENES = 10
# Wider than this, a portrait crop would be cut differently than the full frame.
PORTRAIT_ASPECT = 0.6
FOCUS_X = 0.54  # Mobile object-position of .hero-film video.


def inspect(path):
    with av.open(str(path)) as container:
        stream = container.streams.video[0]
        return {
            "width": stream.width,
            "height": stream.height,
            "frames": stream.frames,
            "duration": round(float(stream.duration * stream.time_base), 4),
        }


def even(value):
    return int(round(value / 2)) * 2


def portrait_crop(width, height):
    crop_width = even(height * PORTRAIT_ASPECT)
    return crop_width, height, even((width - crop_width) * FOCUS_X)


def encode(source, target, video_filter, crf, gop=12):
    target.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([
        FFMPEG, "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(source), "-map", "0:v:0", "-an", "-vf", video_filter,
        "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
        # Short closed GOPs keep scroll seeking fast; no B-frames for scrubbing.
        "-g", str(gop), "-keyint_min", str(gop), "-sc_threshold", "0", "-bf", "0",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        str(target),
    ], check=True)


def scroll_videos():
    records = []
    for number in range(1, SCENES + 1):
        source = SOURCES / f"{number}.mp4"
        meta = inspect(source)
        cw, ch, cx = portrait_crop(meta["width"], meta["height"])
        variants = {
            "hd": ("scale=1280:-2", 25),
            "sd": ("scale=960:-2", 27),
            "portrait": (f"crop={cw}:{ch}:{cx}:0,scale=540:900", 26),
        }
        record = {"source": source.name, "sourceMetadata": meta, "variants": {}}
        for name, (video_filter, crf) in variants.items():
            target = MEDIA / "scroll" / name / f"{number}.mp4"
            encode(source, target, video_filter, crf)
            result = inspect(target)
            assert result["frames"] == meta["frames"], (target, result)
            record["variants"][name] = {
                "webPath": f"/media/scroll/{name}/{number}.mp4",
                "bytes": target.stat().st_size,
                **result,
            }
        records.append(record)
        sizes = ", ".join(
            f"{n} {v['bytes'] / 1048576:.1f} MB" for n, v in record["variants"].items()
        )
        print(f"scena {number}: {sizes}", flush=True)
    (PROJECT / "content" / "scroll-media-manifest.json").write_text(
        json.dumps(records, indent=2), encoding="utf-8"
    )


def tv_videos():
    # Forward and reverse TV clips from the same source, lighter 1280 px encode.
    source = SOURCES / "11.mp4"
    frames = inspect(source)["frames"]
    for target, video_filter in (
        (MEDIA / "11.mp4", "scale=1280:-2"),
        (MEDIA / "tv" / "11-reverse.mp4", "reverse,scale=1280:-2"),
    ):
        encode(source, target, video_filter, 24)
        assert inspect(target)["frames"] == frames, target
        print(f"TV {target.name}: {target.stat().st_size / 1048576:.1f} MB", flush=True)


def posters():
    for number in range(1, SCENES + 1):
        with av.open(str(SOURCES / f"{number}.mp4")) as container:
            image = next(container.decode(video=0)).to_image().convert("RGB")
        cw, ch, cx = portrait_crop(*image.size)
        out = MEDIA / "posters"
        (out / "hd").mkdir(parents=True, exist_ok=True)
        (out / "portrait").mkdir(parents=True, exist_ok=True)
        hd = image.resize((1280, round(1280 * image.height / image.width)), Image.LANCZOS)
        hd.save(out / "hd" / f"{number}.webp", "WEBP", quality=72, method=6)
        image.crop((cx, 0, cx + cw, ch)).resize((540, 900), Image.LANCZOS).save(
            out / "portrait" / f"{number}.webp", "WEBP", quality=72, method=6
        )


def fit(image, longest):
    image = image.copy()
    image.thumbnail((longest, longest), Image.LANCZOS)
    return image


def images():
    logo = fit(Image.open(MEDIA / "logo.png"), 360)
    logo.save(MEDIA / "logo.png", optimize=True)
    fit(Image.open(MEDIA / "telecomando-top.png"), 960).save(
        MEDIA / "telecomando-top.webp", "WEBP", quality=86, method=6
    )
    fit(Image.open(MEDIA / "fondamenta.png"), 970).save(
        MEDIA / "fondamenta.webp", "WEBP", quality=82, method=6
    )
    fit(Image.open(MEDIA / "completed.jpg").convert("RGB"), 1600).save(
        MEDIA / "completed.jpg", "JPEG", quality=80, optimize=True, progressive=True
    )
    # Photos keep their names; only re-saved when it actually saves bytes.
    for path in sorted((PUBLIC / "company").iterdir()):
        before = path.stat().st_size
        image = Image.open(path)
        if path.suffix.lower() in (".jpg", ".jpeg"):
            fit(image.convert("RGB"), 1600).save(
                path.with_suffix(".tmp"), "JPEG", quality=80, optimize=True, progressive=True
            )
        elif path.suffix.lower() == ".png":
            fit(image, 1200).save(path.with_suffix(".tmp"), "PNG", optimize=True)
        else:
            continue
        temporary = path.with_suffix(".tmp")
        if temporary.stat().st_size < before:
            temporary.replace(path)
        else:
            temporary.unlink()


# Latin, Latin-1, typographic punctuation, euro sign and common symbols.
UNICODES = "U+0000-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2212"


def fonts():
    for ttf in sorted((PUBLIC / "fonts").glob("*.ttf")):
        options = subset.Options()
        options.flavor = "woff2"
        options.layout_features = ["*"]
        font = subset.load_font(str(ttf), options)
        subsetter = subset.Subsetter(options)
        subsetter.populate(unicodes=subset.parse_unicodes(UNICODES))
        subsetter.subset(font)
        subset.save_font(font, str(ttf.with_suffix(".woff2")), options)


if __name__ == "__main__":
    # fonts() and images() read files that they replace: run them only on
    # the original assets (see git history), not on already optimised ones.
    posters()
    tv_videos()
    scroll_videos()
