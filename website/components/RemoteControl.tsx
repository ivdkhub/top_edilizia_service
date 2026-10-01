"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ParallaxCard } from "./ui/parallax-card";
import {
  beginScrollHold,
  isScrollHeld,
  releaseScrollHold,
  releaseScrollHoldAfter,
  setScrollCheckpointDismissed,
} from "../lib/scroll-hold";

/** The same timeline plays backwards when the visitor resumes scrolling. */
export default function RemoteControl({
  active,
  powered,
  onToggle,
}: {
  active: boolean;
  powered: boolean;
  onToggle: () => void;
}) {
  const button = useRef<HTMLButtonElement>(null);
  const entrance = useRef<gsap.core.Timeline | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const available = active && !dismissed;

  useLayoutEffect(() => {
    const element = button.current!;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    gsap.set(element, { yPercent: 120, visibility: "hidden" });
    entrance.current = gsap
      .timeline({
        paused: true,
        onComplete: () => releaseScrollHoldAfter(2000),
        onReverseComplete: () => {
          gsap.set(element, { visibility: "hidden" });
          releaseScrollHold();
        },
      })
      .to(element, {
        yPercent: 0,
        duration: reduced ? 0.01 : 0.8,
        ease: "power3.out",
      });
    return () => {
      entrance.current?.kill();
      releaseScrollHold();
      entrance.current = null;
      gsap.set(element, { clearProps: "transform,visibility" });
    };
  }, []);

  useLayoutEffect(() => {
    if (available) {
      beginScrollHold();
      gsap.set(button.current, { visibility: "visible" });
      entrance.current?.play();
    } else {
      releaseScrollHold();
      entrance.current?.reverse();
    }
  }, [available]);

  useEffect(() => {
    if (!active) {
      setScrollCheckpointDismissed(false);
      setDismissed(false);
    }
  }, [active]);

  useEffect(() => {
    if (!available) return;
    const dismiss = () => {
      if (!isScrollHeld()) {
        // Disable capture immediately, before React renders the exit timeline.
        setScrollCheckpointDismissed(true);
        setDismissed(true);
      }
    };
    const wheel = (event: WheelEvent) => {
      if (event.deltaY || event.deltaX) dismiss();
    };
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']"))
        return;
      if (event.key === " " && target?.closest("button, a")) return;
      if (
        [
          "ArrowDown",
          "ArrowUp",
          "PageDown",
          "PageUp",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      )
        dismiss();
    };
    // Input events avoid mistaking Lenis' remaining inertia for a new scroll.
    window.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("touchmove", dismiss, { passive: true });
    window.addEventListener("keydown", keyboard);
    return () => {
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchmove", dismiss);
      window.removeEventListener("keydown", keyboard);
    };
  }, [available]);

  return (
    <button
      ref={button}
      type="button"
      className="tv-remote"
      data-visible={available}
      aria-label={powered ? "Spegni la TV" : "Accendi TV"}
      aria-pressed={powered}
      aria-hidden={!available}
      tabIndex={available ? 0 : -1}
      onClick={onToggle}
    >
      <ParallaxCard as="span" className="tv-remote-parallax" entrance={false}>
        <span className="tv-remote-image">
          <img
            decoding="async"
            src="/media/telecomando-top.webp"
            alt=""
            width={640}
            height={960}
            draggable={false}
          />
        </span>
      </ParallaxCard>
    </button>
  );
}
