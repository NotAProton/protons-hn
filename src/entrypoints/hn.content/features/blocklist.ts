import type { Settings } from '@/utils/settings';
import { hostFromSitestr } from '@/utils/dom';
import { el, $ } from '@/utils/dom';

function matchesDomain(domain: string, blocked: string[]): boolean {
  return blocked.some((d) => domain === d || domain.startsWith(`${d}.`) || domain.startsWith(`${d}/`));
}

function hideStoryRow(row: Element): void {
  (row as HTMLElement).style.display = 'none';
  const meta = row.nextElementSibling as HTMLElement | null;
  if (meta) meta.style.display = 'none';
  const spacer = meta?.nextElementSibling as HTMLElement | null;
  if (spacer?.classList.contains('spacer')) spacer.style.display = 'none';
}

export function applyBlocklist(settings: Settings): void {
  const domains = settings.blockDomains.map((d) => d.toLowerCase().replace(/^www\./, ''));
  const keywords = settings.blockKeywords.map((k) => k.toLowerCase());
  if (!domains.length && !keywords.length) return;

  let hidden = 0;
  for (const row of document.querySelectorAll('tr.athing.submission')) {
    const title = $('.titleline', row)?.textContent?.toLowerCase() ?? '';
    const site = hostFromSitestr($('.sitestr', row)?.textContent ?? '').toLowerCase();
    const blocked =
      (domains.length > 0 && site.length > 0 && matchesDomain(site, domains)) ||
      (keywords.length > 0 && keywords.some((k) => title.includes(k)));
    if (blocked) {
      hideStoryRow(row);
      hidden++;
    }
  }

  if (hidden > 0) {
    const moreLink = document.querySelector('a.morelink')?.closest('tr');
    const note = el('tr', { class: 'hnn-note' });
    const td = el('td', { colspan: '3' });
    td.append(`${hidden} ${hidden === 1 ? 'story' : 'stories'} hidden by your filters`);
    note.append(td);
    moreLink?.insertAdjacentElement('beforebegin', note);
  }
}
