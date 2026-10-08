import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: 'src',
  manifest: {
    name: "Proton's hn",
    short_name: "Proton's hn",
    description:
      'A tasteful, fast modern layer over Hacker News. Faithful to the original, just modern.',
    homepage_url: 'https://notaproton.github.io/protons-hn/',
    permissions: ['storage'],
    browser_specific_settings: {
      gecko: { id: 'protons-hn@notaproton.dev', strict_min_version: '115.0' },
    },
    data_collection_permissions: {
      required: ['none'],
    },
    host_permissions: [
      'https://news.ycombinator.com/*',
      'https://hn.algolia.com/*',
    ],
  },
});
