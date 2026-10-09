import { browser } from '#imports';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  width: 'narrow' | 'default' | 'wide';
  density: 'comfortable' | 'compact';
  newTab: boolean;
  keyboardNav: boolean;
  newComments: boolean;
  collapseTools: boolean;
  hoverCards: boolean;
  archive: boolean;
  favicons: boolean;
  liveCounts: boolean;
  ignoreUsers: string[];
  blockDomains: string[];
  blockKeywords: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  width: 'default',
  density: 'comfortable',
  newTab: true,
  keyboardNav: true,
  newComments: true,
  collapseTools: true,
  hoverCards: true,
  archive: true,
  favicons: true,
  liveCounts: true,
  ignoreUsers: [],
  blockDomains: [],
  blockKeywords: [],
};

const KEY = 'settings';

function toList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
  return [];
}

function pick<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export async function loadSettings(): Promise<Settings> {
  try {
    const stored = await browser.storage.local.get(KEY);
    const raw = (stored[KEY] ?? {}) as Record<string, unknown>;
    const bool = (v: unknown, fallback: boolean): boolean =>
      typeof v === 'boolean' ? v : fallback;
    const d = DEFAULT_SETTINGS;
    return {
      theme: pick(raw['theme'], ['light', 'dark', 'system'] as const, d.theme),
      width: pick(raw['width'], ['narrow', 'default', 'wide'] as const, d.width),
      density: pick(raw['density'], ['comfortable', 'compact'] as const, d.density),
      newTab: bool(raw['newTab'], d.newTab),
      keyboardNav: bool(raw['keyboardNav'], d.keyboardNav),
      newComments: bool(raw['newComments'], d.newComments),
      collapseTools: bool(raw['collapseTools'], d.collapseTools),
      hoverCards: bool(raw['hoverCards'], d.hoverCards),
      archive: bool(raw['archive'], d.archive),
      favicons: bool(raw['favicons'], d.favicons),
      liveCounts: bool(raw['liveCounts'], d.liveCounts),
      ignoreUsers: toList(raw['ignoreUsers']),
      blockDomains: toList(raw['blockDomains']),
      blockKeywords: toList(raw['blockKeywords']),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings: Settings): Promise<void> {
  await browser.storage.local.set({ [KEY]: settings });
}
