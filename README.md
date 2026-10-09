# Proton's hn

A better Hacker News: dark mode, faster loading, favicons, archive links, user hover cards, comment tools, blocklists and keyboard navigation!

The extension works on the real news.ycombinator.com, so nothing changes about how HN works. Your login, votes, comments and submissions are all native. Article and comment links open in new tabs. Middle-click, ctrl-click, hide and More work exactly as before.

Downloads: https://notaproton.is-a.dev/protons-hn/

## Features

- Light, dark and system themes, built on HN's own colors. Orange header, black text on orange, square corners, the original density.
- New comments are highlighted the second time you open a story.
- Thread tools: collapse all, expand all, jump between top-level threads.
- Ignore users. Their comments collapse the same way HN's own toggle does.
- Hide stories by domain or title keyword, with a count of what was hidden.
- Hover a username for karma and about text, pulled from the Algolia API and cached.
- Copy, archive.is and Wayback links on every story row.
- Scores and comment counts refresh on item pages.
- Keyboard navigation: `j`/`k` move, `o` or Enter opens the discussion, `l` opens the article, `v` votes, `n` goes to the next page, `/` focuses search.

## Fast by design

- About 35 KB total, no framework, no polling, no timers.
- The theme is applied before the first paint, so no flash of the unstyled page, even in dark mode.
- On list pages, story and author data is prefetched from Algolia the moment the first rows appear, and the background page keeps it between pages. Opening a story means the score and hover cards are already loaded.
- Leaving a list page saves it to sessionStorage. Coming back shows that copy instantly, with scores and counts patched from the warmed data.
- Two host permissions: news.ycombinator.com and hn.algolia.com. Archive links open as normal tabs; the extension never fetches anything from those sites.

## Building

You need Node 18+ and pnpm.

```sh
pnpm install
pnpm dev:firefox        # HMR dev against Firefox web-ext
pnpm build:firefox      # production build -> .output/firefox-mv2
pnpm zip:firefox        # store package -> .output/*.zip
```

## Installing

Every push builds and publishes packages at
[notaproton.is-a.dev/protons-hn](https://notaproton.is-a.dev/protons-hn/)
through GitHub Actions.

- **Firefox:** download the signed `.xpi` from
  [the site](https://notaproton.is-a.dev/protons-hn/). It is signed through
  AMO self-distribution (unlisted), so Firefox offers a one-click permanent
  install. If signing failed for a release, the page says so and you can load
  the zip temporarily from `about:debugging` instead.
- **Chrome:** unzip the chrome build, open `chrome://extensions`, enable
  Developer mode, and click "Load unpacked".

Settings are on the options page (`about:addons` → Proton's hn → Preferences)
or the gear in HN's header.

## Credits

This exists because of [Harmonic for Hacker News](https://github.com/SimonHalvdansson/Harmonic-HN)
by Simon Halvdansson, the best HN client I have used. Built with
[WXT](https://wxt.dev). The colors and layout belong to
[news.ycombinator.com](https://news.ycombinator.com), so credit for the look
goes to YC.

## License

MIT, see [LICENSE](LICENSE).
