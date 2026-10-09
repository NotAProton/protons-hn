import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: "Proton's hn",
    short_name: "Proton's hn",
    description:
      "A better Hacker News: dark mode, faster loading, favicons, archive links, user hover cards, comment tools, blocklists and keyboard navigation. Works on the real site, so your login, votes and comments all work!",
    homepage_url: 'https://notaproton.is-a.dev/protons-hn/',
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: {
        id: 'protons-hn@notaproton.dev',
        strict_min_version: '115.0',
        data_collection_permissions: {
          required: ['none'],
        },
      },
    },
    host_permissions: [
      'https://news.ycombinator.com/*',
      'https://hn.algolia.com/*',
    ],
  },
});
