/** Shared by the hero checkpoint, Lenis driver and remote entrance timeline. */
let heldAt: number | null = null;
let timer: ReturnType<typeof setTimeout> | undefined;
let checkpoint:
  { position: () => number; consumed: boolean; dismissed: boolean } | undefined;
const listeners = new Set<() => void>();

export const scrollHoldPosition = () => heldAt;
export const isScrollHeld = () => heldAt !== null;

export function subscribeScrollHold(listener: () => void) {
  listeners.add(listener);
  listener();
  return () => {
    listeners.delete(listener);
  };
}

export function releaseScrollHold() {
  clearTimeout(timer);
  timer = undefined;
  if (heldAt === null) return;
  heldAt = null;
  document.documentElement.removeAttribute("data-tv-scroll-hold");
  listeners.forEach((listener) => listener());
}

export function beginScrollHold(position = window.scrollY) {
  if (heldAt !== null) return;
  heldAt = position;
  document.documentElement.setAttribute("data-tv-scroll-hold", "true");
  // A media failure must not trap the visitor before the remote can appear.
  timer = setTimeout(releaseScrollHold, 15000);
  listeners.forEach((listener) => listener());
}

export function releaseScrollHoldAfter(milliseconds: number) {
  if (!isScrollHeld()) return;
  clearTimeout(timer);
  timer = setTimeout(releaseScrollHold, milliseconds);
}

export function registerScrollCheckpoint(position: () => number) {
  const entry = { position, consumed: false, dismissed: false };
  checkpoint = entry;
  return () => {
    if (checkpoint !== entry) return;
    checkpoint = undefined;
    releaseScrollHold();
  };
}

/** A dismissed remote cannot complete another entrance and release a new hold. */
export function setScrollCheckpointDismissed(dismissed: boolean) {
  if (checkpoint) {
    checkpoint.dismissed = dismissed;
    if (dismissed) checkpoint.consumed = true;
  }
  if (dismissed) releaseScrollHold();
}

/** Clamp a fast wheel/touch jump before it can pass the entire TV viewport. */
export function captureScrollCheckpoint(
  current: number,
  previous: number,
  allowCapture = true,
) {
  if (!checkpoint || checkpoint.dismissed || isScrollHeld()) return false;
  const position = checkpoint.position();
  if (current < position - 80) checkpoint.consumed = false;
  if (
    allowCapture &&
    !checkpoint.consumed &&
    current >= position &&
    previous < position
  ) {
    checkpoint.consumed = true;
    beginScrollHold(position);
    return true;
  }
  return false;
}
