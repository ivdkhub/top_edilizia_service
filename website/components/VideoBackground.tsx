"use client";
import { useEffect, useRef } from "react";
export default function VideoBackground({
  asset,
  className = "",
  loop = true,
}: {
  asset: number;
  className?: string;
  loop?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let visible = false;
    const sync = () => {
      if (visible && !reduced && !document.hidden) {
        if (!video.getAttribute("src")) {
          video.src = `/media/${asset}.mp4`;
          video.load();
        }
        void video.play().catch(() => {});
      } else video.pause();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "80px", threshold: 0.01 },
    );
    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      video.pause();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [asset]);
  return (
    <video
      ref={ref}
      className={`video-background ${className}`}
      poster={`/media/${asset}-poster.jpg`}
      muted
      playsInline
      autoPlay
      loop={loop}
      preload="none"
      aria-hidden="true"
    />
  );
}
