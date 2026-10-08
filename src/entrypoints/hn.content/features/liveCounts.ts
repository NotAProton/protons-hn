import { algolia, type AlgoliaItem } from '@/utils/api';
import { storyIdFromUrl } from '@/utils/dom';

export function countComments(item: AlgoliaItem): number {
  return item.children.reduce((sum, child) => sum + 1 + countComments(child), 0);
}

export function pluralComments(n: number): string {
  return `${n} comment${n === 1 ? '' : 's'}`;
}

export async function updateCounts(): Promise<void> {
  const id = storyIdFromUrl();
  if (!id) return;

  const item = await algolia<AlgoliaItem>(`/items/${id}`);
  if (!item) return;

  const score = document.getElementById(`score_${id}`);
  if (score) score.textContent = `${item.points} points`;

  const commentsLinks = [
    ...document.querySelectorAll<HTMLAnchorElement>('table.fatitem .subline a'),
  ].filter(
    (a) =>
      a.getAttribute('href') === `item?id=${id}` &&
      /comment/i.test(a.textContent ?? ''),
  );
  const commentsLink = commentsLinks.at(-1);
  if (commentsLink) {
    commentsLink.textContent = pluralComments(countComments(item));
  }
}
