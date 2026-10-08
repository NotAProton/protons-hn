# Proton's hn

A tasteful, fast modern layer over Hacker News — Firefox-first, faithful to the
original, just modern. Inspired by the feel of [Harmonic for Hacker
News](https://github.com/SimonHalvdansson/Harmonic-HN) and the speed philosophy
of McMaster-Carr: everything instant, nothing flashy, zero layout shift.

**Download:** https://notaproton.github.io/protons-hn/

## What it does

The extension does **not** replace HN — it restyles and augments the real site,
so login, voting, commenting, favoriting, and submitting all work natively and
never break. Article and comment links open in new tabs by default; everything
else (middle-click, ctrl-click, hide, More) behaves exactly as on HN.

### Features

- **Theming** — light / dark / follow-system, mapped onto HN's real palette
  (`#ff6600` accent preserved, black-on-orange header, square corners, no
  card chrome — faithful density first), sticky header, comment indent guides
- **Domain favicons** — grayscale, from the DuckDuckGo favicon service; if the
  service is unreachable the row simply has no icon
- **Copy / archive / wayback / hn** — quick actions on every story row and the
  item header. `archive` opens the archive.is version, `wayback` the latest
  Wayback Machine snapshot, `copy` and `hn` copy the article / discussion URL
- **New comment highlighting** — comments you haven't seen yet on a story you
  have visited are tinted; remembered per device
- **Thread tools** — collapse all, expand all, jump between top-level threads
- **Comment navigation keys** — `n`/`p` next/prev top-level thread, `x`
  collapse all, `e` expand all, `j`/`k` browse comments
- **Ignore users** — comments from ignored users auto-collapse, native HN style
- **Blocklist** — hide stories by domain or title keyword, with a hidden-count
  notice above the More link
- **User hover cards** — karma and profile preview on username hover, cached
  and prefetched through the Algolia API, sanitized text only
- **Search** — HN's own footer search form, always visible; `/` scrolls to it
  and focuses it
- **Live counts** — score and comment count refresh from Algolia on item pages
- **Keyboard navigation on lists** — `j`/`k` move, `o`/`Enter` open discussion
  (new tab), `l` open article (new tab), `v` vote, `n` next page, `r` rescan,
  `/` search
- **⚙ Settings button** in the header opens the options page

### Performance rules

- Vanilla TypeScript, no framework, no runtime dependencies
- Injected at `document_start` with a **sync settings mirror** (localStorage):
  no state is awaited before features run; the resolved theme is applied as a
  data attribute before first paint — no flash of unstyled content
- **Preconnect** to hn.algolia.com injected in the page head (no DNS+TLS on
  the first data call)
- **Prefetching**: list pages race the document down — the moment the first
  story rows appear, Algolia item + author data is warmed (a one-shot,
  self-disconnecting observer; no idle gate). The persistent background page
  keeps this cache across navigations, so live counts and hover cards are
  instant on arrival
- **Stale-while-revalidate snapshots**: each list page is snapshotted to
  sessionStorage on unload (10 most recent); revisits render instantly and
  scores/counts are patched from warmed Algolia data
- CSS-first styling: nothing decorative is applied before first paint
- HN pages themselves send `private; max-age=0` with no validators, so
  HTTP-cache warming of pages is a no-op — data prefetching is the lever that
  matters (same reason article links can't be prefetched: cross-origin pages
  are partitioned out of our cache and not fetchable without blanket host
  permissions)
- Event delegation, no MutationObserver polling (one bounded, self-disconnecting
  warm observer), no timers
- Host permissions: only `news.ycombinator.com` and `hn.algolia.com`; archive
  links open as regular tabs — no fetching from the extension
- Headless/no-storage environments degrade gracefully at every step

### Link behavior

Article links and comment-count links on list rows get `target="_blank"` —
front page browsing stays put by default; the list never navigates away.
Middle-click, ctrl-click, and every other HN link behave exactly as native.

## Building

Requires Node 18+ and pnpm.

```sh
pnpm install
pnpm dev:firefox        # HMR dev against Firefox web-ext
pnpm build:firefox      # production build -> .output/firefox-mv2
pnpm zip:firefox        # store package -> .output/*.zip
```

## Installing

Every push builds and publishes fresh packages to
[the site](https://notaproton.github.io/protons-hn/) via GitHub Actions.

- **Firefox (temporary load):** `about:debugging#/runtime/this-firefox` →
  "Load Temporary Add-on…" → pick any file in the unzipped
  `firefox-mv2/` build. Temporary loads are removed when Firefox closes.
- **Firefox (persistent):** Firefox requires AMO-signed extensions. We sign
  an unlisted build via AMO self-distribution and publish the `.xpi` on the
  site; once signed, installing is one click.
- **Chrome/Chromium:** unzip the chrome-mv3 build →
  `chrome://extensions` → Developer mode → "Load unpacked".

Settings live on the options page (`about:addons` → Proton's hn →
Preferences), or the ⚙ gear in the HN topbar.

## Credits

Inspired by [Harmonic for Hacker News](https://github.com/SimonHalvdansson/Harmonic-HN)
by Simon Halvdansson. Built with [WXT](https://wxt.dev). Palette and layout
belong to [news.ycombinator.com](https://news.ycombinator.com) — all design
credit to YC.

## License

MIT — see [LICENSE](LICENSE).
