import { algoliaCached } from '@/utils/api';
import { browser } from '#imports';

const idle =
  typeof requestIdleCallback === 'function'
    ? (fn: () => void, timeout: number) => requestIdleCallback(fn, { timeout })
    : (fn: () => void, timeout: number) => setTimeout(fn, timeout);

/** DNS + TLS preconnect in the page head, so Algolia calls skip handshakes. */
function preconnect(): void {
  if (document.querySelector('link[rel="dns-prefetch"][href*="hn.algolia.com"]')) return;
  try {
    for (const rel of ['dns-prefetch', 'preconnect']) {
      const link = document.createElement('link');
      link.rel = rel;
      link.href = 'https://hn.algolia.com';
      (document.head ?? document.documentElement).append(link);
    }
  } catch {
    // head not ready yet — non-critical
  }
}

function warmFirstRows(count: number): number {
  let warmed = 0;
  const seen = new Set<string>();
  for (const row of document.querySelectorAll('tr.athing.submission')) {
    if (!row.id || seen.has(row.id)) continue;
    seen.add(row.id);
    void algoliaCached(`/items/${row.id}`);
    if (++warmed >= count) break;
  }
  return warmed;
}

function warmUsers(count: number): void {
  const users = new Set<string>();
  for (const u of document.querySelectorAll('a.hnuser')) {
    const name = u.textContent?.trim();
    if (name) users.add(name);
    if (users.size >= count) break;
  }
  for (const name of users) void algoliaCached(`/users/${encodeURIComponent(name)}`);
}

export function initPrefetch(page: 'list' | 'item', immediateDataCount = 0): void {
  preconnect();

  if (page === 'item') {
    const id = new URLSearchParams(location.search).get('id');
    if (id) void algoliaCached(`/items/${id}`);
    const author = document.querySelector('a.hnuser')?.textContent?.trim();
    if (author) void algoliaCached(`/users/${encodeURIComponent(author)}`);
    return;
  }

  // Aggressive warm: hit the first rows the moment they exist (via a
  // one-shot, self-disconnecting observer) rather than waiting for idle.
  if (immediateDataCount > 0) {
    if (warmFirstRows(immediateDataCount) > 0) {
      warmUsers(immediateDataCount);
    } else {
      const obs = new MutationObserver(() => {
        if (document.querySelector('tr.athing.submission')) {
          obs.disconnect();
          warmFirstRows(immediateDataCount);
          warmUsers(immediateDataCount);
        }
      });
      obs.observe(document, { childList: true, subtree: true });
      setTimeout(() => obs.disconnect(), 8000);
    }
  }

  // Full warm for the rest of the page when the main thread is free.
  idle(() => {
    warmFirstRows(12);
    warmUsers(12);
  }, 2500);
}
