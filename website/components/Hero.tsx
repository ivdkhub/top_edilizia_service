"use client";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createScrollScenes } from "../lib/scroll-scenes";
import Television from "./Television";
import { registerScrollCheckpoint } from "../lib/scroll-hold";
gsap.registerPlugin(ScrollTrigger);
const SCENE_COUNT = 10;
const SCROLL_SPAN = (6.5 * SCENE_COUNT) / 9;
const TV_HOLD_SPAN = 1.15;
const captions = [
  {
    label: "TOP EDILIZIA SERVICE · SARONNO",
    title: "Costruiamo il futuro",
    body: "Costruzioni e ristrutturazioni civili e industriali. Esperienza, affidabilità e passione per costruire.",
  },
  {
    label: "QUALITÀ IN OGNI DETTAGLIO",
    title: "Diamo forma alle idee",
    body: "Soluzioni su misura, materiali di qualità e un team qualificato. Dalla progettazione alla realizzazione.",
  },
  {
    label: "I TUOI SPAZI, LA NOSTRA PASSIONE",
    title: "La tua idea prende vita",
    body: "",
  },
];
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [tvActive, setTvActive] = useState(false);
  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const layers = gsap.utils.toArray<HTMLElement>(".hero-film"),
        texts = gsap.utils.toArray<HTMLElement>(".hero-caption");
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const updateCaptions = (sceneProgress: number) => {
        // Preserve the original caption timing across scenes 1–9.
        const progress = (sceneProgress * SCENE_COUNT) / 9;
        texts.forEach((caption, i) => {
          const start = [0, 0.42, 0.73][i],
            end = [0.42, 0.73, 1.1][i],
            fadeIn =
              i === 0 ? 1 : gsap.utils.clamp(0, 1, (progress - start) / 0.027),
            fadeOut = gsap.utils.clamp(0, 1, (end - progress) / 0.027);
          const finalFade = gsap.utils.clamp(
            0,
            1,
            (0.905 - sceneProgress) / 0.025,
          );
          gsap.set(caption, {
            autoAlpha: Math.min(fadeIn, fadeOut) * finalFade,
            y: 12 * (1 - fadeIn),
          });
        });
      };
      let scenes: ReturnType<typeof createScrollScenes> | undefined;
      let checkTelevision: (() => void) | undefined;
      let unregisterCheckpoint: (() => void) | undefined;
      if (reducedMotion) {
        gsap.set(layers, { opacity: 0 });
        gsap.set(layers[SCENE_COUNT - 1], { opacity: 1 });
        layers[SCENE_COUNT - 1].querySelector("video")!.poster =
          "/media/10-final.jpg";
        gsap.set(texts, { autoAlpha: 0 });
        setTvActive(true);
      } else {
        scenes = createScrollScenes(
          layers,
          root.current!.querySelector<HTMLElement>(".hero-media")!,
        );
        const playhead = { progress: 0 };
        let renderedProgress = -1;
        const renderScenes = () => {
          renderedProgress = playhead.progress;
          scenes!.setProgress(playhead.progress);
          updateCaptions(playhead.progress);
        };
        let endingTrigger: ScrollTrigger | undefined;
        let active = false;
        checkTelevision = () => {
          // Refresh can restore a tween value without firing its onUpdate.
          if (renderedProgress !== playhead.progress) renderScenes();
          const next =
            (!endingTrigger ||
              window.scrollY <= endingTrigger.end + window.innerHeight) &&
            playhead.progress >= 0.998 &&
            scenes!.isSceneReady(SCENE_COUNT - 1);
          if (next !== active) {
            active = next;
            setTvActive(next);
          }
        };
        gsap.ticker.add(checkTelevision);
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${window.innerHeight * (SCROLL_SPAN + TV_HOLD_SPAN)}`,
            pin: ".hero-viewport",
            scrub: 0.32,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        timeline.fromTo(
          playhead,
          { progress: 0 },
          {
            progress: 1,
            duration: SCROLL_SPAN,
            ease: "none",
            onUpdate: renderScenes,
          },
        );
        timeline.to({}, { duration: TV_HOLD_SPAN });
        // Keep the TV frame until the unpinned viewport is entirely gone.
        endingTrigger = timeline.scrollTrigger;
        unregisterCheckpoint = registerScrollCheckpoint(
          () =>
            (endingTrigger?.start ?? 0) +
            window.innerHeight * (SCROLL_SPAN + 0.05),
        );
        // Browser scroll restoration can place the page directly in the TV hold.
        // Refresh only after the complete timeline has its final duration.
        endingTrigger?.refresh();
        timeline.progress(endingTrigger?.progress ?? 0);
        renderScenes();
      }
      return () => {
        unregisterCheckpoint?.();
        if (checkTelevision) gsap.ticker.remove(checkTelevision);
        scenes?.destroy();
      };
    }, root);
    return () => context.revert();
  }, []);
  return (
    <section
      ref={root}
      id="home"
      className="hero"
      aria-label="Top Edilizia Service — dalle fondamenta alla realizzazione"
    >
      <div className="hero-viewport">
        <div className="hero-media" aria-hidden="true">
          {Array.from({ length: SCENE_COUNT }, (_, i) => (
            <div
              className="hero-film"
              key={i}
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <video
                muted
                playsInline
                preload="auto"
                poster={`/media/${i + 1}-poster.jpg`}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
        <div className="hero-shade" />
        {captions.map((caption, i) => (
          <div
            key={caption.title}
            className={`hero-caption caption-${i}`}
            style={{
              opacity: i === 0 ? 1 : 0,
              visibility: i === 0 ? "visible" : "hidden",
            }}
          >
            <p className="eyebrow">{caption.label}</p>
            <h1>{caption.title}</h1>
            {caption.body && <p className="hero-description">{caption.body}</p>}
            {i === 2 && (
              <a className="button button-aqua" href="#estimator">
                Richiedi preventivo <span>→</span>
              </a>
            )}
          </div>
        ))}
        <Television active={tvActive} />
      </div>
    </section>
  );
}
