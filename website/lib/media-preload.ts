// Downloads the opening animation once, in order, and serves each file from an
// in-memory blob so scroll seeking never waits on the network again.
type Entry = {
  state: "queued" | "loading" | "done";
  blob?: string;
  promise: Promise<string>;
  resolve: (value: string) => void;
  abort?: AbortController;
};
const entries = new Map<string, Entry>();
const queue: string[] = [];
let started: Promise<void> | undefined;

/**
 * The source to play now: the blob when downloaded, the download in flight
 * when it already started. A file still waiting in the queue is taken off it,
 * so the caller streams it from the network at once instead of waiting.
 */
export function claimMedia(url: string): string | Promise<string> {
  const entry = entries.get(url);
  if (!entry) return url;
  if (entry.state === "loading") return entry.promise;
  if (entry.state === "queued") {
    queue.splice(queue.indexOf(url), 1);
    entry.state = "done";
    entry.resolve(url);
  }
  return entry.blob ?? url;
}

/**
 * Gives up on preloading: downloads in flight stop and every file not yet in
 * memory streams from the network when needed, so nothing competes with the
 * scene on screen for a slow connection.
 */
export function streamPendingMedia() {
  queue.splice(0).forEach((url) => {
    const entry = entries.get(url)!;
    entry.state = "done";
    entry.resolve(url);
  });
  entries.forEach((entry) => entry.abort?.abort());
}

async function download(
  url: string,
  signal: AbortSignal,
  onBytes: (received: number) => void,
) {
  const response = await fetch(url, { signal });
  if (!response.ok || !response.body) throw new Error(`${url}: ${response.status}`);
  const reader = response.body.getReader();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    onBytes(received);
  }
  const type = response.headers.get("content-type") || "";
  return URL.createObjectURL(new Blob(chunks, { type }));
}

export type PreloadItem = { url: string; bytes: number; essential?: boolean };

/**
 * Queues the downloads (in the given order, essential files first). Resolves once the
 * essential files are ready, reporting their progress from 0 to 1 weighted by
 * size; the rest keep downloading in the background. Files that fail keep
 * their network URL.
 */
export function preloadMedia(
  items: PreloadItem[],
  onProgress: (progress: number) => void,
) {
  if (started) return started;
  const essential = items.filter((item) => item.essential);
  const total = essential.reduce((sum, item) => sum + item.bytes, 0) || 1;
  const received = new Map(essential.map(({ url }) => [url, 0]));
  const report = () =>
    onProgress(
      Math.min(1, [...received.values()].reduce((a, b) => a + b, 0) / total),
    );
  for (const { url } of items) {
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((r) => (resolve = r));
    entries.set(url, { state: "queued", promise, resolve });
    queue.push(url);
  }
  const sizes = new Map(items.map(({ url, bytes }) => [url, bytes]));
  const worker = async () => {
    for (let url = queue.shift(); url; url = queue.shift()) {
      const entry = entries.get(url)!;
      const bytes = sizes.get(url)!;
      entry.state = "loading";
      entry.abort = new AbortController();
      try {
        entry.blob = await download(url, entry.abort.signal, (count) => {
          if (!received.has(url)) return;
          received.set(url, Math.min(bytes, count));
          report();
        });
      } catch (error) {
        if (!entry.abort.signal.aborted) console.warn("Preload failed", error);
      }
      entry.abort = undefined;
      entry.state = "done";
      entry.resolve(entry.blob ?? url);
    }
  };
  started = Promise.all(
    essential.map(({ url }) =>
      entries.get(url)!.promise.then(() => {
        received.set(url, sizes.get(url)!);
        report();
      }),
    ),
  ).then(() => undefined);
  // The essential files get the whole connection; then two at a time.
  void worker();
  void started.then(worker);
  return started;
}
