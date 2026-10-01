"""Read-only validation of the scroll copies against their supplied originals."""
from pathlib import Path
import hashlib
import json
import re
import subprocess
import imageio_ffmpeg

project = Path(__file__).resolve().parents[1]
records = json.loads((project / "content/scroll-media-manifest.json").read_text())
results = []
for record in records:
    source = project.parent / record["source"]
    target = project / "public" / record["webPath"].lstrip("/")
    with source.open("rb") as original:
        assert hashlib.file_digest(original, "sha256").hexdigest() == record["sourceSha256"]
    comparison = subprocess.run([
        imageio_ffmpeg.get_ffmpeg_exe(), "-hide_banner", "-threads", "4",
        "-i", str(source), "-threads", "4", "-i", str(target),
        "-lavfi", "ssim", "-an", "-f", "null", "-",
    ], capture_output=True, text=True, check=True)
    score = float(re.findall(r"All:([0-9.]+)", comparison.stderr)[-1])
    results.append({"file": record["source"], "ssim": score, "sourceHashVerified": True})
    print(f"{record['source']}: SSIM {score:.6f}, original unchanged", flush=True)

(project.parent / ".reference-analysis" / "scroll-media-quality.json").write_text(
    json.dumps(results, indent=2), encoding="utf-8"
)
