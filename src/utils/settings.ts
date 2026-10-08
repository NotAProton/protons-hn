import { browser } from '#imports';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  newComments: boolean;
  collapseTools: boolean;
  favicons: boolean;
  hoverCards: boolean;
  keyboardNav: boolean;
  archive: boolean;
  liveCounts: boolean;
  ignoreUsers: string[];
  blockDomains: string[];
  blockKeywords: string[];
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  newComments: true,
  collapseTools: true,
  favicons: true,
  hoverCards: true,
  keyboardNav: true,
  archive: true,
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

export async function loadSettings(): Promise<Settings> {
  try {
    const stored = await browser.storage.local.get(KEY);
    const raw = (stored[KEY] ?? {}) as Record<string, unknown>;
    const bool = (v: unknown, fallback: boolean): boolean =>
      typeof v === 'boolean' ? v : fallback;
    return {
      theme: raw['theme'] === 'light' || raw['theme'] === 'dark' ? raw['theme'] : 'system',
      newComments: bool(raw['newComments'], DEFAULT_SETTINGS.newComments),
      collapseTools: bool(raw['collapseTools'], DEFAULT_SETTINGS.collapseTools),
      favicons: bool(raw['favicons'], DEFAULT_SETTINGS.favicons),
      hoverCards: bool(raw['hoverCards'], DEFAULT_SETTINGS.hoverCards),
      keyboardNav: bool(raw['keyboardNav'], DEFAULT_SETTINGS.keyboardNav),
      archive: bool(raw['archive'], DEFAULT_SETTINGS.archive),
      liveCounts: bool(raw['liveCounts'], DEFAULT_SETTINGS.liveCounts),
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
