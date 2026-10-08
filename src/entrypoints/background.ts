import { browser } from '#imports';

/** Tiny persistent in-memory cache for Algolia responses, shared across pages. */
const algoliaCache = new Map<string, unknown>();

export default defineBackground(() => {
  browser.runtime.onMessage.addListener((msg: unknown) => {
    if (
      typeof msg === 'object' &&
      msg !== null &&
      'type' in msg &&
      (msg as { type: string }).type === 'algolia'
    ) {
      const path = (msg as { path?: string }).path ?? '';
      if (algoliaCache.has(path)) {
        return Promise.resolve(algoliaCache.get(path) ?? null);
      }
      return fetch(`https://hn.algolia.com/api/v1${path}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data !== null) {
            algoliaCache.set(path, data);
            trimCache();
          }
          return data;
        })
        .catch(() => null);
    }

    if (
      typeof msg === 'object' &&
      msg !== null &&
      'type' in msg &&
      (msg as { type: string }).type === 'open-options'
    ) {
      void browser.runtime.openOptionsPage();
    }

    return undefined;
  });
});

function trimCache(): void {
  if (algoliaCache.size <= 60) return;
  const it = algoliaCache.keys();
  for (let i = 0; i < 15; i++) {
    const k = it.next();
    if (k.done) break;
    algoliaCache.delete(k.value);
  }
}
