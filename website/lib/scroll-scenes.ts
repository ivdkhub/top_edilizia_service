import gsap from "gsap";
import { claimMedia } from "./media-preload";

const FPS = 24;
const FRAME = 1 / FPS;
const OVERLAP = 0.09;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => value * value * (3 - 2 * value);
// After this wait a scene may appear on its poster instead of holding the
// previous scene frozen while a slow connection is still loading it.
const POSTER_FALLBACK_MS = 700;

type Variant = "hd" | "sd" | "portrait";
type NetworkInformation = { saveData?: boolean; effectiveType?: string };

/** Smallest encode that still looks sharp for this viewport and connection. */
export function pickVariant(): Variant {
  const width = window.innerWidth,
    height = window.innerHeight;
  // Matches the 0.6 crop made by tools/optimize_web_media.py.
  if (width / height <= 0.6) return "portrait";
  const connection = (navigator as { connection?: NetworkInformation })
    .connection;
  const slow =
    connection?.saveData || /(^|-)2g|3g/.test(connection?.effectiveType ?? "");
  return slow || width <= 1024 ? "sd" : "hd";
}

/** Two-scene compositing, bounded prefetch and one outstanding seek per video. */
export function createScrollScenes(
  layers: HTMLElement[],
  surface: HTMLElement,
  { focusPull = true } = {},
) {
  let position = 0;
  let dirty = true;
  let disposed = false;
  let lastInput = performance.now();
  let lastTick = lastInput;
  let lastBlur = "";
  let variant = pickVariant();
  const weights: number[] = layers.map((_, index) => (index === 0 ? 1 : 0));
  const clips = layers.map((layer, index) => ({
    video: layer.querySelector("video")!,
    frameTime: -1,
    callback: 0,
    lastSeek: -Infinity,
    lastUsed: lastInput,
    waitingSince: 0,
    pending: "",
    opacity: index === 0 ? "1" : "0",
  }));
  const schedule = () => {
    if (!disposed) dirty = true;
  };
  const watchFrame = (index: number) => {
    const clip = clips[index];
    if (clip.callback || !clip.video.requestVideoFrameCallback) return;
    clip.callback = clip.video.requestVideoFrameCallback((_, frame) => {
      clip.callback = 0;
      clip.frameTime = frame.mediaTime;
      schedule();
    });
  };
  const loaded = clips.map((clip, index) => () => {
    if (!clip.video.requestVideoFrameCallback)
      clip.frameTime = clip.video.currentTime;
    else watchFrame(index);
    schedule();
  });
  clips.forEach((clip, index) => {
    clip.video.addEventListener("loadeddata", loaded[index]);
    clip.video.addEventListener("seeked", loaded[index]);
  });
  const prepare = (index: number, now: number) => {
    const clip = clips[index];
    if (!clip) return;
    clip.lastUsed = now;
    if (clip.video.getAttribute("src") || clip.pending) return;
    clip.frameTime = -1;
    watchFrame(index);
    clip.video.poster = `/media/posters/${variant === "portrait" ? "portrait" : "hd"}/${index + 1}.webp`;
    const url = `/media/scroll/${variant}/${index + 1}.mp4`;
    const source = claimMedia(url);
    const attach = (src: string) => {
      clip.video.src = src;
      clip.video.load();
      schedule();
    };
    // Already downloading: wait for the blob instead of fetching it twice.
    if (typeof source === "string") attach(source);
    else {
      clip.pending = url;
      void source.then((src) => {
        if (disposed || clip.pending !== url) return;
        clip.pending = "";
        attach(src);
      });
    }
  };
  const targetTime = (index: number) => {
    const duration = clips[index].video.duration;
    if (!Number.isFinite(duration)) return 0;
    const lastFrame = Math.max(0, Math.round(duration * FPS) - 1);
    return Math.round(clamp(position - index) * lastFrame) / FPS;
  };
  const seek = (index: number, now: number) => {
    const clip = clips[index];
    if (clip.video.readyState < 2 || clip.video.seeking) return;
    const target = targetTime(index);
    if (Math.abs(clip.video.currentTime - target) < FRAME * 0.5) return;
    // Keep only the latest target and never restart an unfinished decode.
    if (now - clip.lastSeek < 1000 / FPS) {
      dirty = true;
      return;
    }
    watchFrame(index);
    clip.lastSeek = now;
    clip.video.currentTime = target;
  };
  const release = (index: number) => {
    const clip = clips[index];
    if (clip.callback) {
      clip.video.cancelVideoFrameCallback(clip.callback);
      clip.callback = 0;
    }
    clip.video.pause();
    clip.video.removeAttribute("src");
    clip.video.load();
    clip.frameTime = -1;
    clip.waitingSince = 0;
    clip.pending = "";
  };
  // Rotating a phone switches between the portrait crop and full frames.
  const resize = () => {
    const next = pickVariant();
    if (next === variant) return;
    variant = next;
    clips.forEach((clip, index) => {
      if (clip.video.getAttribute("src") || clip.pending) release(index);
    });
    schedule();
  };
  const tick = () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastTick) / 1000);
    lastTick = now;
    if (!dirty || disposed || document.hidden) return;
    dirty = false;
    const current = Math.min(clips.length - 1, Math.floor(position));
    prepare(current, now);
    seek(current, now);
    // Neighbours wait for the visible scene so they never compete with it
    // for bandwidth on a slow connection.
    const currentReady = clips[current].video.readyState >= 2;
    for (const index of [current + 1, current - 1]) {
      if (!clips[index]) continue;
      if (currentReady || clips[index].video.getAttribute("src"))
        prepare(index, now);
      seek(index, now);
    }
    if (!currentReady) dirty = true;

    const desired = clips.map(() => 0);
    const boundary = Math.round(position);
    if (
      boundary > 0 &&
      boundary < clips.length &&
      Math.abs(position - boundary) < OVERLAP
    ) {
      const mix = ease(clamp((position - boundary + OVERLAP) / (2 * OVERLAP)));
      desired[boundary - 1] = 1 - mix;
      desired[boundary] = mix;
    } else desired[current] = 1;

    // Never fade in an old frame from a previous visit to a clip; a poster is
    // shown only while a slow connection is still loading the clip.
    clips.forEach((clip, index) => {
      const alreadyVisible = weights[index] > 0.002;
      const frameReady =
        clip.frameTime >= 0 &&
        Math.abs(clip.frameTime - targetTime(index)) <= FRAME * 4;
      if (alreadyVisible || frameReady || !desired[index]) {
        clip.waitingSince = 0;
        return;
      }
      clip.waitingSince ||= now;
      if (
        clip.video.readyState >= 2 ||
        now - clip.waitingSince < POSTER_FALLBACK_MS
      ) {
        desired[index] = 0;
        dirty = true;
      }
    });
    const total = desired.reduce((sum, weight) => sum + weight, 0);
    const blend = 1 - Math.exp(-dt / 0.075);
    if (total > 0) {
      weights.forEach((weight, index) => {
        const target = desired[index] / total;
        const next = weight + (target - weight) * blend;
        weights[index] = Math.abs(next - target) < 0.001 ? target : next;
        if (weights[index] !== target) dirty = true;
      });
    }

    // Convert normalized scene weights to alpha-over: no dark dip at 50/50.
    let cumulative = 0;
    weights.forEach((weight, index) => {
      cumulative += weight;
      const alpha = weight > 0.001 ? weight / cumulative : 0;
      const opacity = alpha.toFixed(4);
      if (opacity !== clips[index].opacity) {
        layers[index].style.opacity = opacity;
        layers[index].style.visibility = alpha > 0 ? "visible" : "hidden";
        layers[index].style.willChange = alpha > 0 ? "opacity" : "auto";
        clips[index].opacity = opacity;
      }
    });

    // A subtle focus pull during the dissolve; refocus after the wheel stops.
    const idle = now - lastInput;
    const idleFade = 1 - clamp((idle - 150) / 220);
    const mixStrength = Math.min(1, 2 * (1 - Math.max(...weights)));
    const blur = focusPull ? (mixStrength * idleFade * 1.6).toFixed(2) : "0.00";
    if (blur !== lastBlur) {
      surface.style.filter = Number(blur) > 0.02 ? `blur(${blur}px)` : "none";
      lastBlur = blur;
    }
    if (mixStrength > 0.005 && idleFade > 0) dirty = true;

    clips.forEach((clip, index) => {
      if (
        clip.video.getAttribute("src") &&
        Math.abs(index - current) > 1 &&
        weights[index] < 0.001
      ) {
        // Delay eviction so quick direction changes don't reload a neighbour.
        if (now - clip.lastUsed > 700) release(index);
        else dirty = true;
      }
    });
  };
  document.addEventListener("visibilitychange", schedule);
  window.addEventListener("resize", resize);
  gsap.ticker.add(tick);
  prepare(0, lastInput);

  return {
    isSceneReady(index: number) {
      const clip = clips[index];
      return Boolean(
        clip &&
        weights[index] > 0.995 &&
        !clip.video.seeking &&
        clip.frameTime >= 0 &&
        Math.abs(clip.frameTime - targetTime(index)) <= FRAME * 1.5,
      );
    },
    setProgress(progress: number) {
      const next = Math.min(
        clips.length - 0.001,
        clamp(progress) * clips.length,
      );
      if (Math.abs(next - position) > 0.00001) lastInput = performance.now();
      position = next;
      schedule();
    },
    destroy() {
      disposed = true;
      gsap.ticker.remove(tick);
      document.removeEventListener("visibilitychange", schedule);
      window.removeEventListener("resize", resize);
      clips.forEach((clip, index) => {
        clip.video.removeEventListener("loadeddata", loaded[index]);
        clip.video.removeEventListener("seeked", loaded[index]);
        release(index);
        layers[index].style.opacity = index === 0 ? "1" : "0";
        layers[index].style.visibility = "";
        layers[index].style.willChange = "";
      });
      surface.style.filter = "";
    },
  };
}
