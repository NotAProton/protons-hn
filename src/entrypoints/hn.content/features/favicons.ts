import { hostFromSitestr } from '@/utils/dom';
import { el } from '@/utils/dom';

export function addFavicons(): void {
  for (const titleline of document.querySelectorAll<HTMLElement>('tr.athing .titleline')) {
    if (titleline.dataset['hnnFavicon']) continue;
    titleline.dataset['hnnFavicon'] = '1';
    const link = titleline.querySelector('a');
    if (!link) continue;

    const site = hostFromSitestr(titleline.querySelector('.sitestr')?.textContent ?? '');
    if (!site) continue;

    const img = el('img', {
      class: 'hnn-favicon',
      loading: 'lazy',
      alt: '',
      width: '14',
      height: '14',
      src: `https://icons.duckduckgo.com/ip3/${site}.ico`,
    });
    img.addEventListener('error', () => img.remove(), { once: true });
    link.before(img, ' ');
  }
}
