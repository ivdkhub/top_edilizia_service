import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

// A controlled clock covers the fast direction-change race without real waits.
let now = 0;
let nextTimer = 0;
const timers = new Map();
const attributes = new Set();
const exports = {};
vm.runInNewContext(
  ts.transpileModule(
    readFileSync(new URL("../lib/scroll-hold.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText,
  {
    exports,
    window: { scrollY: 5236 },
    document: {
      documentElement: {
        setAttribute: (name) => attributes.add(name),
        removeAttribute: (name) => attributes.delete(name),
      },
    },
    setTimeout: (callback, delay) => {
      const id = ++nextTimer;
      timers.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
  },
);
const advance = (milliseconds) => {
  now += milliseconds;
  for (const [id, timer] of timers) {
    if (timer.at <= now) {
      timers.delete(id);
      timer.callback();
    }
  }
};
const hold = exports;
const unregister = hold.registerScrollCheckpoint(() => 5236);
assert.equal(hold.captureScrollCheckpoint(6000, 5000), true);
assert.equal(hold.scrollHoldPosition(), 5236);
hold.releaseScrollHoldAfter(2000);
advance(1999);
assert.equal(hold.isScrollHeld(), true);
advance(1);
assert.equal(hold.isScrollHeld(), false);

// Remote exits. Rapid up/down crosses the checkpoint before media state settles.
hold.setScrollCheckpointDismissed(true);
assert.equal(hold.captureScrollCheckpoint(5100, 5400), false);
assert.equal(hold.captureScrollCheckpoint(5400, 5100), false);
assert.equal(
  hold.isScrollHeld(),
  false,
  "An invisible remote must never lock scrolling",
);

// Leaving the TV and returning deliberately still enables the two-second pause.
hold.setScrollCheckpointDismissed(false);
hold.captureScrollCheckpoint(4000, 5400);
assert.equal(hold.captureScrollCheckpoint(5400, 4000), true);
hold.setScrollCheckpointDismissed(true);
assert.equal(hold.isScrollHeld(), false);
assert.equal(timers.size, 0, "Exit clears pending timers");
hold.releaseScrollHoldAfter(2000);
assert.equal(
  timers.size,
  0,
  "A stale entrance callback cannot schedule a hold",
);

hold.setScrollCheckpointDismissed(false);
hold.captureScrollCheckpoint(4000, 5400);
hold.captureScrollCheckpoint(5400, 4000);
advance(15000);
assert.equal(
  hold.isScrollHeld(),
  false,
  "Media failure timeout releases scrolling",
);
unregister();
assert.equal(attributes.size, 0);
console.log("Scroll hold regression checks passed.");
