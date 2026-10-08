import { loadSettings, saveSettings, type Settings } from '@/utils/settings';

const toggles = [...document.querySelectorAll<HTMLInputElement>('input[data-setting]')].filter(
  (t) => t.dataset['setting'] !== 'search',
);
const theme = document.getElementById('theme') as HTMLSelectElement;
const textareas: Record<keyof Settings, HTMLTextAreaElement | undefined> = {
  ignoreUsers: document.getElementById('ignoreUsers') as HTMLTextAreaElement,
  blockDomains: document.getElementById('blockDomains') as HTMLTextAreaElement,
  blockKeywords: document.getElementById('blockKeywords') as HTMLTextAreaElement,
} as never;
const saved = document.getElementById('saved')!;

function fill(settings: Settings): void {
  for (const t of toggles) {
    const key = t.dataset['setting'] as keyof Settings;
    t.checked = settings[key] === true;
  }
  theme.value = settings.theme;
  for (const [key, ta] of Object.entries(textareas)) {
    if (ta) ta.value = (settings[key as keyof Settings] as string[]).join('\n');
  }
}

function collect(): Settings {
  const out = { ...DEFAULTS };
  for (const t of toggles) {
    const key = t.dataset['setting'];
    if (key && key in out) (out as Record<string, unknown>)[key] = t.checked;
  }
  out.theme = theme.value as Settings['theme'];
  for (const [key, ta] of Object.entries(textareas)) {
    if (ta) {
      out[key as keyof Settings] = ta.value
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean) as never;
    }
  }
  return out;
}

const DEFAULTS = await loadSettings();
const current = await loadSettings();
fill(current);

document.getElementById('save')!.addEventListener('click', async () => {
  await saveSettings(collect());
  saved.classList.add('show');
  setTimeout(() => saved.classList.remove('show'), 1200);
});
