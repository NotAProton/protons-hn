# Proton's hn

A better Hacker News. Dark mode, faster loading, favicons, archive links and a few things I wanted and couldn't find anywhere else.

It runs on the real news.ycombinator.com, so nothing about HN changes. Login, votes, comments and submissions all work the way they always did. Article and comment links open in new tabs. Middle-click, ctrl-click, hide and More behave as before.

Get it at https://notaproton.is-a.dev/protons-hn/

## What's in it

- Light, dark and system themes using HN's own colors. Same density, same layout.
- New comments are marked the second time you open a story.
- Thread tools: collapse all, expand all, jump between top-level threads.
- Ignore users. Their comments collapse the way HN's own toggle does.
- Hide stories by domain or title keyword. It tells you how many it hid.
- Hover a username to see karma and the bio. Results are cached.
- Copy, archive.is and Wayback links on every story.
- Scores and comment counts update on item pages.
- Keyboard shortcuts: `j` and `k` move, `o` or Enter opens the discussion, `l` opens the article, `v` votes, `n` goes to the next page, `/` focuses search.

## Speed

- The script and styles that load on HN come to about 30 KB, or 13 KB compressed. No framework, no polling.
- The theme is applied before the first paint, so dark mode doesn't flash.
- When a list page loads, the story and author data for it is fetched from Algolia. The background page keeps that data between pages, so scores and hover cards are ready when you open a story.
- Leaving a list page saves a copy of it in sessionStorage. Going back shows that copy right away and fills in fresh scores.
- Two host permissions: news.ycombinator.com and hn.algolia.com. The archive links are plain tabs. The extension doesn't fetch from archive.is or the Wayback Machine.

## Building

You need Node 18 or newer and pnpm.

```sh
pnpm install
pnpm dev:firefox        # dev build with reload, runs in Firefox
pnpm build:firefox      # production build to .output/firefox-mv2
pnpm zip:firefox        # package for the store to .output/*.zip
```

## Installing

Every push to main builds and publishes to
[notaproton.is-a.dev/protons-hn](https://notaproton.is-a.dev/protons-hn/)
with GitHub Actions.

- **Firefox:** the download on the site is signed through AMO's unlisted channel, so Firefox installs it with one click and keeps it across restarts. If signing failed for a given release, the page says so. You can then load the unzipped build from `about:debugging` instead.
- **Chrome:** unzip the Chrome build, open `chrome://extensions`, turn on Developer mode, and choose "Load unpacked".

Settings live on the options page (`about:addons`, then Proton's hn, then Preferences) and behind the gear in HN's header.

## Credits

The idea comes from [Harmonic for Hacker News](https://github.com/SimonHalvdansson/Harmonic-HN) by Simon Halvdansson. It is the best HN client I've used, and this extension tries to borrow what I liked about it. Built with [WXT](https://wxt.dev). The colors and layout belong to [Y Combinator](https://news.ycombinator.com).

## License

MIT. See [LICENSE](LICENSE).
