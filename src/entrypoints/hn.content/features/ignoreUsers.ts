export function applyIgnoreUsers(users: string[]): void {
  const ignored = new Set(users.map((u) => u.toLowerCase()));
  if (!ignored.size) return;

  for (const row of document.querySelectorAll<HTMLTableRowElement>('tr.athing.comtr')) {
    const user = row.querySelector('a.hnuser')?.textContent?.trim().toLowerCase();
    if (!user || !ignored.has(user)) continue;
    row.classList.add('hnn-ignored');
    const togg = row.querySelector('a.togg');
    if (togg && togg.textContent?.includes('–')) (togg as HTMLElement).click();
  }
}
