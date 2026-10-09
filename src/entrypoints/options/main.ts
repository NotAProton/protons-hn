import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from '@/utils/settings';

const toggles = [...document.querySelectorAll<HTMLInputElement>('input[data-setting]')];
const selects = [...document.querySelectorAll<HTMLSelectElement>('select[id]')];
const lists = ['ignoreUsers', 'blockDomains', 'blockKeywords'] as const;
const saved = document.getElementById('saved')!;

function fill(settings: Settings): void {
  for (const t of toggles) {
    const key = t.dataset['setting'] as keyof Settings;
    t.checked = settings[key] === true;
  }
  for (const s of selects) {
    s.value = String(settings[s.id as keyof Settings]);
  }
  for (const key of lists) {
    const ta = document.getElementById(key) as HTMLTextAreaElement;
    ta.value = settings[key].join('\n');
  }
}

function collect(): Settings {
  const out: Settings = { ...DEFAULT_SETTINGS };
  for (const t of toggles) {
    const key = t.dataset['setting'] as keyof Settings;
    (out as unknown as Record<string, boolean>)[key] = t.checked;
  }
  for (const s of selects) {
    (out as unknown as Record<string, string>)[s.id] = s.value;
  }
  for (const key of lists) {
    const ta = document.getElementById(key) as HTMLTextAreaElement;
    out[key] = ta.value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return out;
}

function flashSaved(): void {
  saved.classList.add('show');
  setTimeout(() => saved.classList.remove('show'), 1200);
}

fill(await loadSettings());

document.getElementById('save')!.addEventListener('click', async () => {
  await saveSettings(collect());
  flashSaved();
});

document.getElementById('reset')!.addEventListener('click', async () => {
  if (!confirm('Reset every Proton\'s hn setting to its default?')) return;
  fill({ ...DEFAULT_SETTINGS });
  await saveSettings({ ...DEFAULT_SETTINGS });
  flashSaved();
});
