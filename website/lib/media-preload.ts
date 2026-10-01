// Downloads the opening animation once, in order, and serves each file from an
// in-memory blob so scroll seeking never waits on the network again.
type Entry = { blob?: string; promise: Promise<string> };
const entries = new Map<string, Entry>();
let started: Promise<void> | undefined;

/** The blob URL once downloaded, otherwise the network URL. */
export function mediaUrl(url: string) {
  return entries.get(url)?.blob ?? url;
}

/** Resolves when a queued download finishes; undefined if never queued. */
export function whenMediaReady(url: string) {
  return entries.get(url)?.promise;
}

async function download(
  url: string,
  onBytes: (received: number) => void,
) {
  const response = await fetch(url);
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

export type PreloadItem = { url: string; bytes: number };

/**
 * Queues the downloads (two at a time, in the given order) and reports the
 * overall progress from 0 to 1, weighted by size. Files that fail keep their
 * network URL.
 */
export function preloadMedia(
  items: PreloadItem[],
  onProgress: (progress: number) => void,
) {
  if (started) return started;
  const total = items.reduce((sum, item) => sum + item.bytes, 0) || 1;
  const received = items.map(() => 0);
  const report = () =>
    onProgress(Math.min(1, received.reduce((a, b) => a + b, 0) / total));
  const resolvers = new Map<string, (value: string) => void>();
  items.forEach(({ url }) => {
    let resolve!: (value: string) => void;
    const promise = new Promise<string>((r) => (resolve = r));
    entries.set(url, { promise });
    resolvers.set(url, resolve);
  });
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      const { url, bytes } = items[index];
      let result = url;
      try {
        result = await download(url, (count) => {
          received[index] = Math.min(bytes, count);
          report();
        });
        entries.get(url)!.blob = result;
      } catch (error) {
        console.warn("Preload failed", error);
      }
      received[index] = bytes;
      report();
      resolvers.get(url)!(result);
    }
  };
  started = Promise.all([worker(), worker()]).then(() => undefined);
  return started;
}
