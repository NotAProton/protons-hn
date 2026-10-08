import type { Settings } from './settings';

type ApiMessage = { type: 'algolia'; path: string } | { type: 'open-options' };

/** Fetch a path on the HN Algolia API, proxied through the background script. */
export async function algolia<T>(path: string): Promise<T | null> {
  try {
    const msg: ApiMessage = { type: 'algolia', path };
    return (await browser.runtime.sendMessage(msg)) as T | null;
  } catch {
    return null;
  }
}

export interface AlgoliaItem {
  id: number;
  points: number;
  title: string;
  url: string | null;
  children: AlgoliaItem[];
}

export interface AlgoliaUser {
  username: string;
  karma: number;
  about: string | null;
  created_at: string;
}

export interface AlgoliaHit {
  objectID: string;
  title: string;
  url: string | null;
  points: number | null;
  num_comments: number;
  created_at: string;
  author: string;
}

const cache = new Map<string, Promise<unknown>>();

/** Deduplicated Algolia request with in-memory cache. */
export function algoliaCached<T>(path: string): Promise<T | null> {
  const existing = cache.get(path);
  if (existing) return existing as Promise<T | null>;
  const p = algolia<T>(path);
  cache.set(path, p);
  return p;
}

export function settingsToListKey(s: Settings): string {
  return JSON.stringify([s.ignoreUsers, s.blockDomains, s.blockKeywords]);
}
