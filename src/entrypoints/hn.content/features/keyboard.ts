import { jumpThread, collapseAll, expandAll, newCommentTarget } from './collapse';

interface RowGroup {
  row: HTMLElement;
  meta: HTMLElement | null;
  linkEl: HTMLAnchorElement | null; // comments link
  articleEl: HTMLAnchorElement | null;
  voteEl: HTMLElement | null;
}

function pageType(): 'list' | 'item' | null {
  if (document.querySelector('.comment-tree')) return 'item';
  if (document.querySelector('tr.athing.submission')) return 'list';
  return null;
}

function listRows(): RowGroup[] {
  const groups: RowGroup[] = [];
  for (const row of document.querySelectorAll<HTMLElement>('tr.athing.submission')) {
    if ((row.style.display ?? '') === 'none') continue;
    const meta = row.nextElementSibling as HTMLElement | null;
    if (meta && (meta.style.display ?? '') === 'none') continue;
    groups.push({
      row,
      meta,
      linkEl: meta?.querySelector<HTMLAnchorElement>('a[href="item?id=' + row.id + '"]') ?? null,
      articleEl: row.querySelector<HTMLAnchorElement>('.titleline a'),
      voteEl: document.getElementById(`up_${row.id}`),
    });
  }
  return groups;
}

function commentRows(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('tr.athing.comtr')].filter(
    (r) => (r.style.display ?? '') !== 'none',
  );
}

function paint(groups: RowGroup[], idx: number, prev: number): void {
  const un = (i: number) => {
    const g = groups[i];
    if (!g) return;
    g.row.classList.remove('hnn-focus');
    g.meta?.classList.remove('hnn-focus');
  };
  un(prev);
  const g = groups[idx];
  if (!g) return;
  g.row.classList.add('hnn-focus');
  g.meta?.classList.add('hnn-focus');
  g.row.scrollIntoView({ block: 'center' });
}

export function initKeyboardNav(): void {
  let groups: RowGroup[] = [];
  let idx = -1;
  let currentPage: 'list' | 'item' | null = null;
  let pageDirty = true;

  addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as Element | null;
    if (t?.closest?.('input, textarea, select, [contenteditable]')) return;
    if (e.key.length !== 1 && e.key !== 'Enter' && e.key !== 'Escape') return;

    const k = e.key;

    if (k === '/') {
      const input = document.querySelector<HTMLInputElement>("form[action*='algolia'] input[name='q']");
      if (input) {
        e.preventDefault();
        input.scrollIntoView({ block: 'center' });
        input.focus();
      }
      return;
    }

    if (pageDirty) {
      currentPage = pageType();
      groups = currentPage === 'list' ? listRows() : [];
      idx = -1;
      pageDirty = false;
    }

    if (currentPage === 'list') {
      if (k === 'j' || k === 'k') {
        e.preventDefault();
        if (!groups.length) return;
        const prev = idx;
        idx = k === 'j' ? Math.min(idx + 1, groups.length - 1) : Math.max(idx - 1, 0);
        if (groups[idx]) paint(groups, idx, prev);
      } else if (!groups[idx]) {
        return;
      } else if (k === 'o' || k === 'Enter') {
        // both open in a new tab (targets are set at boot)
        groups[idx]!.linkEl?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      } else if (k === 'l') {
        groups[idx]!.articleEl?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      } else if (k === 'v') {
        groups[idx]!.voteEl?.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      } else if (k === 'n') {
        document.querySelector<HTMLAnchorElement>('a.morelink')?.click();
      } else if (k === 'r') {
        pageDirty = true;
      }
      return;
    }

    if (currentPage !== 'item') return;

    // ---- item page ----
    if (k === 'n') {
      e.preventDefault();
      const nt = newCommentTarget();
      if (nt) nt.scrollIntoView({ block: 'start' });
      else jumpThread(1);
    } else if (k === 'p') {
      e.preventDefault();
      jumpThread(-1);
    } else if (k === 'x') {
      collapseAll();
    } else if (k === 'e') {
      expandAll();
    } else if (k === 'j' || k === 'k') {
      e.preventDefault();
      const rows = commentRows();
      if (!rows.length) return;
      const mid = scrollY + innerHeight / 2;
      let next: HTMLElement | undefined;
      if (k === 'j') {
        next = rows.find((r) => r.getBoundingClientRect().top + scrollY > mid);
      } else {
        for (let i = rows.length - 1; i >= 0; i--) {
          const r = rows[i];
          if (r && r.getBoundingClientRect().top + scrollY < mid - 60) {
            next = r;
            break;
          }
        }
      }
      if (next) {
        next.scrollIntoView({ block: 'center' });
        next.classList.add('hnn-jumpflash');
        setTimeout(() => next.classList.remove('hnn-jumpflash'), 600);
      }
    }
  });

  // page content may change after boot (snapshot restore, blocklist)
  document.addEventListener('DOMContentLoaded', () => (pageDirty = true));
  addEventListener('load', () => (pageDirty = true));
}
