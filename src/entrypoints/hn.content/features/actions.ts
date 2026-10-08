import { storyIdFromUrl, hostFromSitestr, copyText, el } from '@/utils/dom';

function actionLink(label: string, onClick: (e: MouseEvent) => void): HTMLElement {
  const a = el('a', { href: '#', class: 'hnn-action' }, label);
  a.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  });
  return a;
}

function sep(): HTMLElement {
  return el('span', { class: 'hnn-sep' }, ' | ');
}

async function copyWithFlash(a: HTMLElement, text: string): Promise<void> {
  const ok = await copyText(text);
  const original = 'copy';
  a.textContent = ok ? 'copied' : 'failed';
  setTimeout(() => (a.textContent = original), 800);
}

function buildActions(articleUrl: string | null, hnId: string | null, mode: 'list' | 'item'): DocumentFragment {
  const frag = document.createDocumentFragment();
  const hnUrl = hnId ? `https://news.ycombinator.com/item?id=${hnId}` : null;

  const extras = document.createDocumentFragment();

  extras.append(
    actionLink('copy', (e) => copyWithFlash(e.currentTarget as HTMLElement, articleUrl ?? hnUrl ?? location.href)),
  );

  if (articleUrl) {
    extras.append(sep());
    extras.append(el('a', {
      class: 'hnn-action',
      href: `https://archive.ph/newest/${articleUrl}`,
      target: '_blank',
      rel: 'noopener noreferrer',
      title: 'Open the archive.is version',
    }, 'archive'));

    extras.append(sep());
    extras.append(el('a', {
      class: 'hnn-action',
      href: `https://web.archive.org/web/2/${articleUrl}`,
      target: '_blank',
      rel: 'noopener noreferrer',
      title: 'Open the latest Wayback Machine snapshot',
    }, 'wayback'));
  }

  if (hnUrl) {
    extras.append(sep());
    extras.append(actionLink('hn', (e) => copyWithFlash(e.currentTarget as HTMLElement, hnUrl)));
  }

  if (mode === 'list') {
    // hover-revealed group on list rows; always visible on the item page
    const wrap = el('span', { class: 'hnn-extra' });
    wrap.append(sep(), extras);
    frag.append(wrap);
  } else {
    frag.append(sep(), extras);
  }

  return frag;
}

/** Add copy / archive / wayback actions to story rows on list pages. */
export function addListActions(): void {
  for (const row of document.querySelectorAll('tr.athing.submission')) {
    if (row.querySelector('.hnn-action')) continue;
    const metaRow = row.nextElementSibling as HTMLElement | null;
    const subline = metaRow?.querySelector('.subline');
    if (!subline) continue;
    metaRow?.classList.add('hnn-meta');
    const article = row.querySelector('.titleline a')?.getAttribute('href') ?? null;
    subline.append(buildActions(article, row.id, 'list'));
  }
}

/** Add actions to the story header on item pages. */
export function addItemActions(): void {
  const subline = document.querySelector('table.fatitem .subline');
  if (!subline || subline.querySelector('.hnn-action')) return;
  const id = storyIdFromUrl() ?? document.querySelector('table.fatitem tr.athing')?.id ?? null;
  const article = document.querySelector('table.fatitem .titleline a')?.getAttribute('href') ?? null;
  subline.append(buildActions(article, id, 'item'));
}
