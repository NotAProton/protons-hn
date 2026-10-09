import './style.css';
import { browser } from '#imports';
import { loadSettings, type Settings } from '@/utils/settings';
import { applyBlocklist } from './features/blocklist';
import { addFavicons } from './features/favicons';
import { addListActions, addItemActions } from './features/actions';
import { highlightNewComments } from './features/newComments';
import { addThreadTools } from './features/collapse';
import { applyIgnoreUsers } from './features/ignoreUsers';
import { updateCounts } from './features/liveCounts';
import { initHoverCards } from './features/hoverCards';
import { initKeyboardNav } from './features/keyboard';
import { initPrefetch } from './features/prefetch';
import { isListPage, patchSnapshot, restoreSnapshot, watchForSnapshots } from './features/snapshot';

const MIRROR_KEY = 'mh:theme';

function setThemeAttr(dark: boolean): void {
  document.documentElement.dataset['hnTheme'] = dark ? 'dark' : 'light';
  try {
    localStorage.setItem(MIRROR_KEY, dark ? 'dark' : 'light');
  } catch {
    // private mode etc — mirror is only a paint-time optimization
  }
}

function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  if (theme !== 'system') {
    setThemeAttr(theme === 'dark');
    return;
  }
  const mm = matchMedia('(prefers-color-scheme: dark)');
  const set = () => setThemeAttr(mm.matches);
  set();
  mm.addEventListener('change', set);
}

function applyLayout(settings: Settings): void {
  document.documentElement.dataset['hnWidth'] = settings.width;
  document.documentElement.dataset['hnDensity'] = settings.density;
}

/** Article and comment links open in a new tab. Middle and ctrl click are untouched. */
function openInNewTab(): void {
  for (const a of document.querySelectorAll<HTMLAnchorElement>('.titleline a, .subline a[href^="item?id="]')) {
    a.setAttribute('target', '_blank');
  }
}

const SETTINGS_MIRROR = 'mh:settings';

/** Synchronous settings mirror — features boot with zero storage await. */
function readSettingsMirror(): Settings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_MIRROR);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Settings;
    if (parsed && 'theme' in parsed && typeof parsed.theme === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeSettingsMirror(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_MIRROR, JSON.stringify(settings));
  } catch {
    // non-critical
  }
}

function addSettingsButton(): void {
  const loginTd = document.querySelector<HTMLElement>('#hnmain > tbody > tr:first-child td:nth-child(3)');
  if (!loginTd || document.getElementById('hnn-gear')) return;
  const gear = document.createElement('a');
  gear.id = 'hnn-gear';
  gear.href = '#';
  gear.textContent = '⚙';
  gear.title = "Proton's hn settings";
  gear.setAttribute('aria-label', "Proton's hn settings");
  gear.addEventListener('click', (e) => {
    e.preventDefault();
    void browser.runtime.sendMessage({ type: 'open-options' });
  });
  const pagetop = loginTd.querySelector('.pagetop');
  if (pagetop) pagetop.append(document.createTextNode(' | '), gear);
  else loginTd.append(document.createTextNode(' | '), gear);
}

/** Runs at document_start: no DOM needed, zero awaits. */
function bootNow(settings: Settings): void {
  if (settings.keyboardNav) initKeyboardNav();
  if (settings.hoverCards) initHoverCards();
  watchForSnapshots();

  // DOM isn't parsed at document_start — route by URL
  const isItemPage = location.pathname === '/item';

  // list pages race the document down: warm the first rows as soon as
  // streaming puts them on the page (immediateDataCount: 3)
  if (!isItemPage) initPrefetch('list', 3);
  else initPrefetch('item');
}

/** Runs at DOMContentLoaded: DOM-dependent decoration, still zero async. */
function bootDom(settings: Settings): void {
  addSettingsButton();

  const isItemPage = document.querySelector('.comment-tree') !== null;
  const isListPage = !isItemPage && document.querySelector('tr.athing.submission') !== null;

  if (isListPage) {
    const restored = restoreSnapshot();
    if (settings.favicons) addFavicons();

    if (settings.newTab) openInNewTab();

    if (settings.archive) addListActions();
    if (restored) patchSnapshot();
    // blocklist runs after decoration so hidden rows never get decorated
    applyBlocklist(settings);
  }

  if (isItemPage) {
    if (settings.collapseTools) addThreadTools();
    if (settings.archive) addItemActions();
    tightenIndents();
    if (settings.ignoreUsers.length) applyIgnoreUsers(settings.ignoreUsers);
    if (settings.newComments) void highlightNewComments();
    if (settings.liveCounts) void updateCounts();
  }
}

function tightenIndents(): void {
  for (const ind of document.querySelectorAll('td.ind')) {
    const steps = Number(ind.getAttribute('indent') ?? '0');
    const img = ind.querySelector('img');
    if (img) img.setAttribute('width', String(20 * steps));
  }
}

export default defineContentScript({
  matches: ['https://news.ycombinator.com/*'],
  runAt: 'document_start',

  main() {
    // 1. Paint-safe theme, synchronously, before first paint.
    let mirror: string | null = null;
    try {
      mirror = localStorage.getItem(MIRROR_KEY);
    } catch {
      mirror = null;
    }
    if (mirror === 'light' || mirror === 'dark') {
      document.documentElement.dataset['hnTheme'] = mirror;
    }

    // 2. DOM-timing plumbing: register the DOM-ready trigger before any
    //    async work so features never miss the DOMContentLoaded race.
    let domReady = document.readyState !== 'loading';
    let pending: Settings | null = null;
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        domReady = true;
        if (pending) {
          const s = pending;
          pending = null;
          bootDom(s);
        }
      },
      { once: true },
    );

    // 3. Synchronous boot from the settings mirror, then reconcile for real.
    const m = readSettingsMirror();
    if (m) {
      applyTheme(m.theme);
      try {
        bootNow(m);
      } catch (e) {
        console.error('[modern-hn] bootNow', e);
      }
    }

    void (async () => {
      const settings = await loadSettings();
      writeSettingsMirror(settings);
      applyTheme(settings.theme);
      applyLayout(settings);
      try {
        bootNow(settings);
      } catch (e) {
        console.error('[modern-hn] bootNow', e);
      }
      if (domReady) bootDom(settings);
      else pending = settings;
    })();
  },
});
