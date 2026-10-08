import { algoliaCached, type AlgoliaUser } from '@/utils/api';
import { el } from '@/utils/dom';

function buildCard(): HTMLElement {
  const card = el('div', { class: 'hnn-usercard' });
  card.innerHTML =
    '<div class="hnn-uc-head"><a class="hnn-uc-name" href="#"></a><span class="hnn-uc-karma"></span></div>' +
    '<div class="hnn-uc-created"></div><div class="hnn-uc-about"></div>';
  card.addEventListener('mouseenter', () => clearHide());
  card.addEventListener('mouseleave', () => scheduleHide());
  return card;
}

let card: HTMLElement | null = null;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let currentUser: string | null = null;

function ensureCard(): HTMLElement | null {
  if (card) return card;
  if (!document.body) return null;
  card = buildCard();
  document.body.append(card);
  return card;
}

function clearHide(): void {
  if (hideTimer) clearTimeout(hideTimer);
}

function scheduleHide(): void {
  clearHide();
  hideTimer = setTimeout(() => {
    card?.removeAttribute('data-open');
    currentUser = null;
  }, 150);
}

function formatDate(iso: unknown): string | null {
  if (typeof iso !== 'string') return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function initHoverCards(): void {
  document.addEventListener('mouseover', (e) => {
    const target = (e.target as Element | null)?.closest?.('a.hnuser');
    if (!(target instanceof HTMLAnchorElement)) return;
    const user = target.textContent?.trim();
    if (!user) return;

    clearHide();
    currentUser = user;
    show(user, target);
  });

  document.addEventListener('mouseout', (e) => {
    if ((e.target as Element | null)?.closest?.('a.hnuser')) scheduleHide();
  });
}

async function show(user: string, anchor: HTMLAnchorElement): Promise<void> {
  const c = ensureCard();
  if (!c) return;

  c.querySelector('.hnn-uc-name')!.textContent = user;
  c.querySelector('.hnn-uc-name')!.setAttribute('href', `user?id=${user}`);
  c.querySelector('.hnn-uc-karma')!.textContent = '';
  c.querySelector('.hnn-uc-created')!.textContent = '';
  c.querySelector('.hnn-uc-about')!.textContent = '…';

  position(c, anchor);
  c.setAttribute('data-open', '');

  const profile = await algoliaCached<AlgoliaUser>(`/users/${encodeURIComponent(user)}`);
  if (!profile || currentUser !== user) return;

  c.querySelector('.hnn-uc-karma')!.textContent = `${profile.karma.toLocaleString()} karma`;
  const joined = formatDate(profile.created_at);
  c.querySelector('.hnn-uc-created')!.textContent = joined ? `joined ${joined}` : '';
  c.querySelector('.hnn-uc-about')!.textContent = profile.about
    ? stripHtml(profile.about).slice(0, 220)
    : '';
}

function position(cardEl: HTMLElement, anchor: HTMLElement): void {
  const rect = anchor.getBoundingClientRect();
  cardEl.style.visibility = 'hidden';
  cardEl.style.left = '0px';
  cardEl.style.top = '0px';

  requestAnimationFrame(() => {
    if (!document.body) return;
    const w = cardEl.offsetWidth;
    const h = cardEl.offsetHeight;
    let left = rect.left;
    left = Math.min(left, innerWidth - w - 12);
    left = Math.max(8, left);
    let top = rect.bottom + 6;
    if (top + h > innerHeight - 8) top = rect.top - h - 6;
    cardEl.style.left = `${left + scrollX}px`;
    cardEl.style.top = `${Math.max(8, top) + scrollY}px`;
    cardEl.style.visibility = '';
  });
}
