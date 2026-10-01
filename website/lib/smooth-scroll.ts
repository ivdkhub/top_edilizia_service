import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  captureScrollCheckpoint,
  isScrollHeld,
  scrollHoldPosition,
  subscribeScrollHold,
} from "./scroll-hold";

// One animation clock for scrolling and ScrollTrigger; touch remains native.
export function createSmoothScroll() {
  const scroll = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    wheelMultiplier: 0.7,
    smoothWheel: true,
    syncTouch: false,
    respectReducedMotion: true,
    prevent: (node) => node.matches('[role="dialog"]'),
    virtualScroll: ({ event, deltaX, deltaY }) =>
      !event.ctrlKey && !event.shiftKey && Math.abs(deltaY) >= Math.abs(deltaX),
  });
  const tick = () => {
    // A stopped driver is valid only while the TV pause or a modal owns it.
    // Reconcile after interrupted transitions, cleanup and development refreshes.
    if (
      scroll.isStopped &&
      !isScrollHeld() &&
      !document.body.hasAttribute("data-scroll-locked")
    )
      scroll.start();
    scroll.raf(performance.now());
  };
  let previous = window.scrollY;
  let positioning = false;
  const freezeAt = (top: number) => {
    positioning = true;
    scroll.stop(); // Resets the animated target and discards existing inertia.
    scroll.scrollTo(top, { immediate: true, force: true });
    previous = top;
    positioning = false;
    ScrollTrigger.update();
  };
  const update = () => {
    if (positioning) return;
    const held = scrollHoldPosition();
    if (held !== null) {
      if (Math.abs(window.scrollY - held) > 0.5) freezeAt(held);
      else ScrollTrigger.update();
      return;
    }
    const current = window.scrollY;
    if (captureScrollCheckpoint(current, previous, !scroll.userData.navigation))
      return;
    previous = current;
    ScrollTrigger.update();
  };
  const resize = () => scroll.resize();
  let pendingAnchor: { top: number; immediate: boolean } | null = null;
  const navigate = (top: number, immediate: boolean) => {
    scroll.scrollTo(top, {
      immediate,
      duration: 0.85,
      lerp: 0,
      easing: (progress) => 1 - Math.pow(1 - progress, 3),
      userData: { navigation: true },
    });
  };
  const syncModalLock = () => {
    if (document.body.hasAttribute("data-scroll-locked") || isScrollHeld())
      scroll.stop();
    else {
      scroll.start();
      if (pendingAnchor) {
        const destination = pendingAnchor;
        pendingAnchor = null;
        navigate(destination.top, destination.immediate);
      }
    }
  };
  const modalObserver = new MutationObserver(syncModalLock);
  modalObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-scroll-locked"],
  });
  syncModalLock();
  const unsubscribeHold = subscribeScrollHold(() => {
    const held = scrollHoldPosition();
    if (held !== null) freezeAt(held);
    else {
      previous = window.scrollY;
      syncModalLock();
    }
  });
  const blockGesture = (event: Event) => {
    if (!isScrollHeld()) return;
    if (event.cancelable) event.preventDefault();
    event.stopImmediatePropagation();
  };
  const blockKey = (event: KeyboardEvent) => {
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
      blockGesture(event);
  };
  window.addEventListener("wheel", blockGesture, {
    capture: true,
    passive: false,
  });
  window.addEventListener("touchmove", blockGesture, {
    capture: true,
    passive: false,
  });
  window.addEventListener("keydown", blockKey, true);
  window.addEventListener("scroll", update, { passive: true });
  scroll.on("scroll", update);
  gsap.ticker.add(tick);
  ScrollTrigger.addEventListener("refresh", resize);

  return {
    scrollTo(top: number, immediate: boolean) {
      if (isScrollHeld()) return; // Discard navigation too; do not queue it.
      // A dialog link closes the modal before its destination can scroll.
      if (document.body.hasAttribute("data-scroll-locked"))
        pendingAnchor = { top, immediate };
      else navigate(top, immediate);
    },
    destroy() {
      pendingAnchor = null;
      modalObserver.disconnect();
      unsubscribeHold();
      window.removeEventListener("wheel", blockGesture, true);
      window.removeEventListener("touchmove", blockGesture, true);
      window.removeEventListener("keydown", blockKey, true);
      window.removeEventListener("scroll", update);
      ScrollTrigger.removeEventListener("refresh", resize);
      gsap.ticker.remove(tick);
      scroll.off("scroll", update);
      scroll.destroy();
    },
  };
}
