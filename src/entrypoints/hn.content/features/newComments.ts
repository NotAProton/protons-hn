import { browser } from '#imports';
import { storyIdFromUrl } from '@/utils/dom';

const MAX_SEEN = 1500;

export async function highlightNewComments(): Promise<number> {
  const storyId = storyIdFromUrl();
  if (!storyId) return 0;

  const key = `seen:${storyId}`;
  let prevIds: string[] = [];
  try {
    const stored = await browser.storage.local.get(key);
    prevIds = Array.isArray(stored[key]) ? (stored[key] as string[]) : [];
  } catch {
    return 0;
  }

  const comments = [...document.querySelectorAll<HTMLTableRowElement>('tr.athing.comtr')];
  let newCount = 0;

  if (prevIds.length > 0) {
    const prev = new Set(prevIds);
    for (const row of comments) {
      if (!prev.has(row.id)) {
        row.classList.add('hnn-new');
        newCount++;
      }
    }
  }

  const keep = comments.map((c) => c.id).slice(-MAX_SEEN);
  try {
    await browser.storage.local.set({ [key]: keep });
  } catch {
    // storage full or unavailable — highlighting still works this visit
  }

  return newCount;
}
