"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import RemoteControl from "./RemoteControl";
import { claimMedia } from "../lib/media-preload";

// The preloaded copy when ready; otherwise stream it rather than wait.
const tvSource = (url: string) => {
  const source = claimMedia(url);
  return typeof source === "string" ? source : url;
};

type Phase = "off" | "starting" | "on" | "stopping";
type Direction = "forward" | "reverse";
const LAST_FRAME = 3; // 73 frames at 24 fps, including the frame at t = 0.

/** Two paused layers keep the displayed frame while the other decoder starts. */
export default function Television({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const forward = useRef<HTMLVideoElement>(null),
    reverse = useRef<HTMLVideoElement>(null);
  const operation = useRef(0),
    phaseRef = useRef<Phase>("off");
  const visibleRef = useRef<Direction | null>(null);
  const callbacks = useRef(new Map<HTMLVideoElement, number>());
  const metadataListeners = useRef(new Map<HTMLVideoElement, () => void>());
  const startupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [phase, setPhase] = useState<Phase>("off");
  const [visible, setVisible] = useState<Direction | null>(null);
  const [error, setError] = useState("");
  const reveal = (next: Direction | null) => {
    visibleRef.current = next;
    setVisible(next);
  };
  const transition = (next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  };
  const clearPending = () => {
    if (startupTimer.current) clearTimeout(startupTimer.current);
    startupTimer.current = null;
    callbacks.current.forEach((id, video) =>
      video.cancelVideoFrameCallback(id),
    );
    callbacks.current.clear();
    metadataListeners.current.forEach((listener, video) =>
      video.removeEventListener("loadedmetadata", listener),
    );
    metadataListeners.current.clear();
  };

  useLayoutEffect(() => {
    const element = root.current!;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const scale = Math.max(width / 1924, height / 1076);
      // Screen coordinates measured in the supplied final living-room frame.
      const y = (height - 1076 * scale) / 2 + 320 * scale;
      element.style.setProperty("--tv-bottom", `${y + 88 * scale}px`);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!active) {
      operation.current++;
      clearPending();
      forward.current?.pause();
      reverse.current?.pause();
      forward.current?.load();
      reverse.current?.load();
      transition("off");
      reveal(null);
      setError("");
    }
    return () => {
      operation.current++;
      clearPending();
      forward.current?.pause();
      reverse.current?.pause();
    };
  }, [active]);

  const play = (direction: Direction) => {
    clearPending();
    const token = ++operation.current;
    const video = direction === "forward" ? forward.current! : reverse.current!;
    const other = direction === "forward" ? reverse.current! : forward.current!;
    // Match the decoded frame, including when a click interrupts playback.
    const displayed = visibleRef.current;
    const sourceTime =
      displayed === "forward"
        ? forward.current!.currentTime
        : displayed === "reverse"
          ? LAST_FRAME - reverse.current!.currentTime
          : 0;
    const startTime = Math.max(
      0,
      Math.min(
        LAST_FRAME,
        direction === "forward" ? sourceTime : LAST_FRAME - sourceTime,
      ),
    );
    video.pause();
    other.pause();
    setError("");
    transition(direction === "forward" ? "starting" : "stopping");
    const failed = () => {
      if (token !== operation.current) return;
      operation.current++;
      clearPending();
      video.pause();
      reveal(displayed);
      transition(direction === "forward" ? "off" : "on");
      setError(
        "Il video non è disponibile. Premi il telecomando per riprovare.",
      );
    };
    const revealed = () => {
      if (token !== operation.current) return;
      if (startupTimer.current) clearTimeout(startupTimer.current);
      startupTimer.current = null;
      callbacks.current.delete(video);
      reveal(direction);
    };
    startupTimer.current = setTimeout(failed, 12000);
    const begin = () => {
      metadataListeners.current.delete(video);
      if (token !== operation.current) return;
      video.currentTime = startTime;
      if (video.requestVideoFrameCallback) {
        const firstFrame = (
          _now: number,
          metadata: VideoFrameCallbackMetadata,
        ) => {
          if (token !== operation.current) return;
          // A seek may briefly report the decoder's previous frame.
          if (video.seeking || metadata.mediaTime + 1 / 24 < startTime) {
            callbacks.current.set(
              video,
              video.requestVideoFrameCallback(firstFrame),
            );
          } else revealed();
        };
        callbacks.current.set(
          video,
          video.requestVideoFrameCallback(firstFrame),
        );
      }
      void video
        .play()
        .then(() => {
          if (token !== operation.current) return;
          if (!video.requestVideoFrameCallback) revealed();
        })
        .catch(failed);
    };
    if (video.readyState >= 1) begin();
    else {
      metadataListeners.current.set(video, begin);
      video.addEventListener("loadedmetadata", begin, { once: true });
    }
  };

  const ended = (direction: Direction) => {
    if (
      !active ||
      (direction === "forward"
        ? phaseRef.current !== "starting"
        : phaseRef.current !== "stopping")
    )
      return;
    clearPending();
    reveal(direction);
    transition(direction === "forward" ? "on" : "off");
  };
  const label =
    phase === "on"
      ? "Spegni la TV"
      : phase === "starting"
        ? "Accensione…"
        : phase === "stopping"
          ? "Spegnimento…"
          : "Accendi TV";
  return (
    <div ref={root} className="hero-tv" data-active={active} data-phase={phase}>
      <div
        className={`hero-tv-media${visible ? " is-visible" : ""}`}
        aria-hidden="true"
      >
        <video
          ref={forward}
          src={active ? tvSource("/media/11.mp4") : undefined}
          muted
          playsInline
          preload={active ? "auto" : "none"}
          onEnded={() => ended("forward")}
          style={{ opacity: visible === "forward" ? 1 : 0 }}
        />
        <video
          ref={reverse}
          src={active ? tvSource("/media/tv/11-reverse.mp4") : undefined}
          muted
          playsInline
          preload={active ? "auto" : "none"}
          onEnded={() => ended("reverse")}
          style={{ opacity: visible === "reverse" ? 1 : 0 }}
        />
        <div className="hero-shade" />
      </div>
      <RemoteControl
        active={active}
        powered={phase === "on" || phase === "starting"}
        onToggle={() =>
          play(
            phaseRef.current === "on" || phaseRef.current === "starting"
              ? "reverse"
              : "forward",
          )
        }
      />
      <p
        className={error ? "tv-error" : "tv-status"}
        role="status"
        aria-live="polite"
      >
        {active
          ? error ||
            (phase === "on"
              ? "TV accesa"
              : phase === "off"
                ? "TV spenta"
                : label)
          : ""}
      </p>
    </div>
  );
}
