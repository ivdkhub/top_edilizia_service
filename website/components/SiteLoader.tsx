"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import manifest from "../content/scroll-media-manifest.json";
import {
  preloadMedia,
  streamPendingMedia,
  type PreloadItem,
} from "../lib/media-preload";
import { pickVariant } from "../lib/scroll-scenes";

// Offered when a slow connection keeps the visitor waiting this long.
const SKIP_AFTER_MS = 7000;

// The loader waits for the first scene only; the rest of the film keeps
// downloading behind the page, in the order the visitor reaches it.
function introAssets(): PreloadItem[] {
  const variant = pickVariant();
  return [
    ...manifest.map((scene, index) => ({
      url: scene.variants[variant].webPath,
      bytes: scene.variants[variant].bytes,
      essential: index === 0,
    })),
    { url: "/media/telecomando-top.webp", bytes: 28_874 },
    { url: "/media/11.mp4", bytes: 404_990 },
    { url: "/media/tv/11-reverse.mp4", bytes: 394_656 },
  ];
}

/** Holds the page until the opening scene is downloaded, then fades away. */
export default function SiteLoader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "leaving" | "gone">(
    "loading",
  );
  const [canSkip, setCanSkip] = useState(false);
  const finish = useRef(() => {});

  // Runs before the hero mounts its scenes, so they reuse these downloads.
  useLayoutEffect(() => {
    document.body.setAttribute("data-scroll-locked", "");
    // The film starts at its first frame unless a link targets a section.
    if (!location.hash) window.scrollTo(0, 0);
    let finished = false;
    finish.current = () => {
      if (finished) return;
      finished = true;
      setProgress(1);
      setPhase("leaving");
    };
    const skipTimer = setTimeout(() => setCanSkip(true), SKIP_AFTER_MS);
    void Promise.all([
      preloadMedia(introAssets(), setProgress),
      document.fonts.ready,
    ]).then(() => finish.current());
    return () => clearTimeout(skipTimer);
  }, []);

  useEffect(() => {
    if (phase !== "leaving") return;
    document.body.removeAttribute("data-scroll-locked");
    // Measure the pin only after the smooth scroll's mutation observer has
    // restored the scrollbar (it runs first, being queued by the attribute
    // change), or the hero keeps the wider scrollbar-less width. A microtask
    // also runs in a background tab, where animation frames are paused.
    void Promise.resolve().then(() => ScrollTrigger.refresh());
    const timer = setTimeout(() => setPhase("gone"), 700);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase === "gone") return null;
  const percent = Math.round(progress * 100);
  return (
    <div
      className={`site-loader${phase === "leaving" ? " is-leaving" : ""}`}
      role="status"
      aria-live="polite"
      aria-label={`Caricamento del sito: ${percent}%`}
    >
      <picture className="site-loader-backdrop">
        <source
          media="(max-aspect-ratio: 3/5)"
          srcSet="/media/posters/portrait/1.webp"
        />
        <img src="/media/posters/hd/1.webp" alt="" />
      </picture>
      <div className="site-loader-content">
        <img
          className="site-loader-logo"
          src="/media/logo.png"
          alt="Top Edilizia Service"
          width={120}
          height={85}
        />
        <p className="site-loader-label">Prepariamo il cantiere</p>
        <p className="site-loader-percent" aria-hidden="true">
          {percent}
          <span>%</span>
        </p>
        <div className="site-loader-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${progress})` }} />
        </div>
        <button
          type="button"
          className="site-loader-skip"
          data-visible={canSkip && phase === "loading"}
          tabIndex={canSkip ? 0 : -1}
          onClick={() => {
            // Play what is still downloading straight from the network.
            streamPendingMedia();
            finish.current();
          }}
        >
          Connessione lenta? Entra subito
        </button>
      </div>
    </div>
  );
}
