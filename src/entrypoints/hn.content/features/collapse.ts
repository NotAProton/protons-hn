import { el } from '@/utils/dom';

function toggState(togg: Element): 'open' | 'closed' {
  return togg.textContent?.includes('–') ? 'open' : 'closed';
}

export function collapseAll(): void {
  for (const togg of document.querySelectorAll('a.togg')) {
    if (toggState(togg) === 'open') (togg as HTMLElement).click();
  }
}

export function expandAll(): void {
  for (const togg of document.querySelectorAll('a.togg')) {
    if (toggState(togg) === 'closed') (togg as HTMLElement).click();
  }
}

function topLevelComments(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>('tr.athing.comtr')].filter(
    (row) => row.querySelector('td.ind')?.getAttribute('indent') === '0',
  );
}

export function jumpThread(direction: 1 | -1): void {
  const rows = topLevelComments();
  if (!rows.length) return;
  const mid = scrollY + innerHeight / 2;

  let target: HTMLElement | undefined;
  if (direction > 0) {
    target = rows.find((r) => r.getBoundingClientRect().top + scrollY > mid);
  } else {
    for (let i = rows.length - 1; i >= 0; i--) {
      const r = rows[i];
      if (r && r.getBoundingClientRect().top + scrollY < mid - 60) {
        target = r;
        break;
      }
    }
  }
  if (!target) return;
  target.scrollIntoView({ block: 'start', behavior: 'instant' as ScrollBehavior });
  target.classList.add('hnn-jumpflash');
  setTimeout(() => target.classList.remove('hnn-jumpflash'), 600);
}

export function newCommentTarget(): HTMLElement | null {
  const mid = scrollY + innerHeight / 2;
  return (
    [...document.querySelectorAll<HTMLElement>('tr.athing.comtr.hnn-new')].find(
      (r) => r.getBoundingClientRect().top + scrollY > mid,
    ) ?? null
  );
}

export function addThreadTools(): void {
  if (document.querySelector('.hnn-threadbar')) return;
  const fatitem = document.querySelector('table.fatitem');
  if (!fatitem) return;

  const bar = el('div', { class: 'hnn-threadbar' });
  const btn = (label: string, fn: () => void) => {
    const a = el('a', { href: '#', class: 'hnn-action' }, label);
    a.addEventListener('click', (e) => {
      e.preventDefault();
      fn();
    });
    return a;
  };

  bar.append(
    btn('collapse all', collapseAll),
    ' · ',
    btn('expand all', expandAll),
    ' · ',
    btn('next thread', () => jumpThread(1)),
    ' · ',
    btn('prev thread', () => jumpThread(-1)),
  );

  fatitem.insertAdjacentElement('afterend', bar);
}
