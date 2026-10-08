import { algoliaCached, type AlgoliaItem } from '@/utils/api';
import { countComments, pluralComments } from './liveCounts';

const PRE = 'mh:snap:';
const IDX = 'mh:snapidx';
const MAX_SNAPS = 10;
const MAX_BYTES = 180_000;

function index(): string[] {
  try {
    const raw = sessionStorage.getItem(IDX);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveIndex(idx: string[]): void {
  try {
    sessionStorage.setItem(IDX, JSON.stringify(idx));
  } catch {
    // ignore
  }
}

export function isListPage(): boolean {
  return (
    document.querySelector('tr.athing.submission') !== null &&
    document.querySelector('.comment-tree') === null
  );
}

/** Save the current list rows so this page can be re-shown instantly later. */
export function watchForSnapshots(): void {
  window.addEventListener(
    'pagehide',
    () => {
      try {
        if (!isListPage()) return;
        const tbody = document.querySelector('#hnmain > tbody');
        if (!tbody) return;
        const html = tbody.innerHTML;
        if (html.length > MAX_BYTES) return;
        const href = location.href;
        const idx = index().filter((h) => h !== href);
        for (const evicted of idx.splice(MAX_SNAPS - 1)) {
          sessionStorage.removeItem(PRE + evicted);
        }
        idx.push(href);
        sessionStorage.setItem(PRE + href, html);
        saveIndex(idx);
      } catch {
        // sessionStorage full or inaccessible — snapshots are best-effort
      }
    },
    { once: false },
  );
}

/** Show the saved snapshot for this URL instantly (stale-while-revalidate). */
export function restoreSnapshot(): boolean {
  try {
    const html = sessionStorage.getItem(PRE + location.href);
    if (!html) return false;
    const tbody = document.querySelector('#hnmain > tbody');
    if (!tbody) return false;
    tbody.innerHTML = JSON.parse(html) as string;
    return true;
  } catch {
    return false;
  }
}

function updateCommentsLink(id: string, item: AlgoliaItem): void {
  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>(`a[href="item?id=${id}"]`),
  ].filter((a) => /comment/i.test(a.textContent ?? ''));
  const link = links.at(-1);
  if (link) link.textContent = pluralComments(countComments(item));
}

/** Patch restored snapshot scores/counts with warmed Algolia data. */
export function patchSnapshot(): void {
  for (const row of [...document.querySelectorAll('tr.athing.submission')].slice(0, 12)) {
    if (!row.id) continue;
    void algoliaCached<AlgoliaItem>(`/items/${row.id}`).then((item) => {
      if (!item) return;
      const score = document.getElementById(`score_${row.id}`);
      if (score) score.textContent = `${item.points} points`;
      updateCommentsLink(row.id, item);
    });
  }
}
