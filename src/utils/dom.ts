export function $(sel: string, root: ParentNode = document): Element | null {
  return root.querySelector(sel);
}

export function $$(sel: string, root: ParentNode = document): Element[] {
  return [...root.querySelectorAll(sel)];
}

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  children?: (Node | string) | (Node | string)[],
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (children !== undefined && children !== null) {
    if (Array.isArray(children)) node.append(...children);
    else node.append(children);
  }
  return node;
}

export function storyIdFromUrl(): string | null {
  return new URLSearchParams(location.search).get('id');
}

/** Extract the registrable host from a sitestr like "github.com/docker". */
export function hostFromSitestr(site: string): string {
  return site.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }
}
